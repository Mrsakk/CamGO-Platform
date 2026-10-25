import { useState } from "react";
import { Plus, Edit, Trash2, Calendar, X, Save, Loader2, MapPin, Sparkles, Search } from "lucide-react";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { provincesApi } from "@/lib/api/provinces";
import { queryKeys } from "@/lib/queryKeys";
import { useDebounce } from "@/lib/useDebounce";
import { toast } from "@/store/toastStore";
import { getImageUrl } from "@/lib/utils";

const AdminEventsPage = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  // 1. Cached Provinces (24 hours)
  const { data: provinces = [] } = useQuery({
    queryKey: queryKeys.provinces.all(),
    queryFn: async () => {
      const res = await provincesApi.getAll();
      return res?.data || [];
    },
    staleTime: 1000 * 60 * 60 * 24,
  });

  // 2. Events Query with keepPreviousData
  const eventFilters = {
    per_page: 50,
    search: debouncedSearch.trim() || undefined,
  };

  const { data: eventsRes, isLoading } = useQuery({
    queryKey: queryKeys.events.list(eventFilters),
    queryFn: () => adminApi.getEvents(eventFilters),
    placeholderData: keepPreviousData,
  });

  const events = eventsRes?.data?.items || (Array.isArray(eventsRes?.data) ? eventsRes.data : []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  // Open Create Modal
  const openCreateModal = () => {
    setEditingEvent(null);
    setFormData({
      title_en: "",
      title_km: "",
      province_id: "",
      location_name_en: "",
      location_name_km: "",
      start_date: new Date().toISOString().substring(0, 10),
      end_date: "",
      description_en: "",
      description_km: "",
      is_published: true,
      is_featured: false,
    });
    setImageFile(null);
    setImagePreview(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal with Real DB Data
  const openEditModal = (evt) => {
    setEditingEvent(evt);
    const startDateVal = evt.start_date_date || (evt.start_date ? evt.start_date.substring(0, 10) : "");
    const endDateVal = evt.end_date_date || (evt.end_date ? evt.end_date.substring(0, 10) : "");

    setFormData({
      title_en: evt.title_en || "",
      title_km: evt.title_km || "",
      province_id: evt.province?.id || evt.province_id || "",
      location_name_en: evt.location_name_en || "",
      location_name_km: evt.location_name_km || "",
      start_date: startDateVal,
      end_date: endDateVal,
      description_en: evt.description_en || "",
      description_km: evt.description_km || "",
      is_published: evt.is_published ?? true,
      is_featured: evt.is_featured ?? false,
    });
    setImageFile(null);
    setImagePreview(evt.cover_image || evt.image_url || null);
    setIsModalOpen(true);
  };

  // Delete Event
  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete event "${title}"?`)) return;
    try {
      await adminApi.deleteEvent(id);
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all() });
      toast.success("Event deleted from database");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete event");
    }
  };

  // Save Event
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const data = new FormData();

      data.append("title_en", formData.title_en);
      data.append("title_km", formData.title_km);
      if (formData.province_id) data.append("province_id", formData.province_id);
      if (formData.location_name_en) data.append("location_name_en", formData.location_name_en);
      if (formData.location_name_km) data.append("location_name_km", formData.location_name_km);
      data.append("start_date", formData.start_date);
      if (formData.end_date) data.append("end_date", formData.end_date);
      data.append("description_en", formData.description_en);
      data.append("description_km", formData.description_km);
      data.append("is_published", formData.is_published ? "1" : "0");
      data.append("is_featured", formData.is_featured ? "1" : "0");

      if (imageFile) {
        data.append("cover_image", imageFile);
      }

      if (editingEvent) {
        await adminApi.updateEvent(editingEvent.id, data);
        toast.success("Event updated successfully");
      } else {
        await adminApi.createEvent(data);
        toast.success("Event created successfully");
      }
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all() });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save event");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 dark:text-white">
            Festivals & Events
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Manage cultural celebrations, dates, venues, and banners from database
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs w-48 sm:w-60 focus:outline-none focus:border-amber-500"
            />
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </form>

          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs shadow-md transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white dark:bg-stone-850 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 dark:bg-stone-800/60 text-stone-500 uppercase tracking-wider font-bold border-b border-stone-200 dark:border-stone-800">
              <tr>
                <th className="p-4">Event & Title</th>
                <th className="p-4">Province & Venue</th>
                <th className="p-4">Date Range</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-700 dark:text-stone-300">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-stone-400">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                      <span>Loading events from database...</span>
                    </div>
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-stone-400">
                    No events found in database.
                  </td>
                </tr>
              ) : (
                events.map((evt) => {
                  const rawCover = evt.cover_image || evt.image_url;
                  const cover = rawCover ? getImageUrl(rawCover) : null;
                  const provinceName = evt.province ? (evt.province.name_en || evt.province.name_km) : null;
                  const venue = evt.location_name_en || evt.location_name_km || evt.location;
                  const startDateStr = evt.start_date_date || (evt.start_date ? evt.start_date.substring(0, 10) : "—");
                  const endDateStr = evt.end_date_date || (evt.end_date ? evt.end_date.substring(0, 10) : null);

                  return (
                    <tr key={evt.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition-colors">
                      {/* 1. Cover & Title */}
                      <td className="p-4 font-bold text-stone-900 dark:text-stone-100">
                        <div className="flex items-center gap-3">
                          {cover ? (
                            <img
                              src={cover}
                              alt={evt.title_en}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=120&q=80";
                              }}
                              className="w-14 h-10 rounded-lg object-cover bg-stone-200 dark:bg-stone-700 shrink-0 border border-stone-200/60 dark:border-stone-700"
                            />
                          ) : (
                            <div className="w-14 h-10 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-400 flex items-center justify-center shrink-0 border border-stone-200/60 dark:border-stone-700">
                              <Calendar className="w-4 h-4" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="block truncate max-w-xs">{evt.title_en}</span>
                            <span className="block text-small text-amber-600 dark:text-amber-400 font-normal truncate max-w-xs font-khmer">
                              {evt.title_km}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2. Province & Venue */}
                      <td className="p-4 text-stone-600 dark:text-stone-400">
                        <div className="space-y-0.5">
                          {provinceName && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-semibold text-[11px]">
                              <MapPin className="w-3 h-3 text-amber-500" />
                              <span>{provinceName}</span>
                            </span>
                          )}
                          <span className="block text-[11px] text-stone-500 truncate max-w-[200px]">
                            {venue || "—"}
                          </span>
                        </div>
                      </td>

                      {/* 3. Dates */}
                      <td className="p-4 font-semibold text-stone-800 dark:text-stone-200">
                        <div className="space-y-0.5">
                          <span className="block text-amber-700 dark:text-amber-400">
                            {startDateStr}
                            {endDateStr && ` → ${endDateStr}`}
                          </span>
                          {evt.start_time && (
                            <span className="block text-[11px] text-stone-400 font-normal">
                              {evt.start_time}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 4. Status */}
                      <td className="p-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                              evt.is_published
                                ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/50"
                                : "bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400"
                            }`}
                          >
                            {evt.is_published ? "Published" : "Draft"}
                          </span>

                          {evt.is_featured && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
                              <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                              <span>Featured</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 5. Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(evt)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-amber-600 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                            title="Edit Event"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(evt.id, evt.title_en)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                            title="Delete Event"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 dark:border-stone-800 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-4">
              {editingEvent ? "Edit Event" : "Add New Event"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Titles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1 text-stone-700 dark:text-stone-300">
                    Title (EN) *
                  </label>
                  <input
                    type="text"
                    value={formData.title_en}
                    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                    placeholder="e.g. Angkor Half Marathon"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1 text-stone-700 dark:text-stone-300">
                    Title (KM) *
                  </label>
                  <input
                    type="text"
                    value={formData.title_km}
                    onChange={(e) => setFormData({ ...formData, title_km: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs sm:text-sm focus:outline-none focus:border-amber-500 font-khmer"
                    placeholder="ឧ. ការរត់ប្រណាំងម៉ារ៉ាតុងអង្គរ"
                    required
                  />
                </div>
              </div>

              {/* Province & Venue */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1 text-stone-700 dark:text-stone-300">
                    Province
                  </label>
                  <select
                    value={formData.province_id}
                    onChange={(e) => setFormData({ ...formData, province_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                  >
                    <option value="">— Select Province —</option>
                    {provinces.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name_en} ({p.name_km})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase mb-1 text-stone-700 dark:text-stone-300">
                    Venue (EN)
                  </label>
                  <input
                    type="text"
                    value={formData.location_name_en}
                    onChange={(e) => setFormData({ ...formData, location_name_en: e.target.value })}
                    placeholder="e.g. Angkor Wat Esplanade"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase mb-1 text-stone-700 dark:text-stone-300">
                    Venue (KM)
                  </label>
                  <input
                    type="text"
                    value={formData.location_name_km}
                    onChange={(e) => setFormData({ ...formData, location_name_km: e.target.value })}
                    placeholder="ឧ. បរិវេណមុខប្រាសាទអង្គរវត្ត"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs sm:text-sm focus:outline-none focus:border-amber-500 font-khmer"
                  />
                </div>
              </div>

              {/* Start & End Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1 text-stone-700 dark:text-stone-300">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1 text-stone-700 dark:text-stone-300">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div>
                <label className="block text-xs font-semibold uppercase mb-1 text-stone-700 dark:text-stone-300">
                  Description (English) *
                </label>
                <textarea
                  rows={2}
                  value={formData.description_en}
                  onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase mb-1 text-stone-700 dark:text-stone-300">
                  Description (Khmer) *
                </label>
                <textarea
                  rows={2}
                  value={formData.description_km}
                  onChange={(e) => setFormData({ ...formData, description_km: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs sm:text-sm focus:outline-none focus:border-amber-500 font-khmer"
                  required
                />
              </div>

              {/* Image Upload & Preview */}
              <div>
                <label className="block text-xs font-semibold uppercase mb-1 text-stone-700 dark:text-stone-300">
                  Event Cover Photo
                </label>
                {imagePreview && (
                  <div className="mb-2 flex items-center gap-3">
                    <img
                      src={imagePreview}
                      alt="Cover Preview"
                      className="w-20 h-14 rounded-xl object-cover border border-stone-300 dark:border-stone-700"
                    />
                    <span className="text-[11px] text-stone-500">Current cover image from database</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setImageFile(file);
                    if (file) {
                      setImagePreview(URL.createObjectURL(file));
                    }
                  }}
                  className="text-xs text-stone-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-amber-500 file:text-stone-950 hover:file:bg-amber-600"
                />
              </div>

              {/* Toggles: is_published & is_featured */}
              <div className="flex items-center gap-6 pt-2 border-t border-stone-200 dark:border-stone-800">
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-800 dark:text-stone-200">
                  <input
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 border-stone-300"
                  />
                  <span>Publish to Public Portal</span>
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-800 dark:text-stone-200">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 border-stone-300"
                  />
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Featured Event</span>
                  </span>
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save to Database</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export { AdminEventsPage };
