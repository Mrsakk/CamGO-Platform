import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, Save, Loader2 } from "lucide-react";
import { adminApi } from "@/lib/api/admin";
import { toast } from "@/store/toastStore";
const AdminBannersPage = () => {
  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState({
    title_en: "",
    title_km: "",
    subtitle_en: "",
    subtitle_km: "",
    link_url: "",
    order: "0",
    is_active: true
  });
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fetchBanners = async () => {
    try {
      setIsLoading(true);
      const res = await adminApi.getBanners();
      const list = res?.data?.items || (Array.isArray(res?.data) ? res.data : []);
      setBanners(list);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load banners");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchBanners();
  }, []);
  const openCreateModal = () => {
    setEditingBanner(null);
    setFormData({
      title_en: "",
      title_km: "",
      subtitle_en: "",
      subtitle_km: "",
      link_url: "",
      order: "0",
      is_active: true
    });
    setImageFile(null);
    setIsModalOpen(true);
  };
  const openEditModal = (b) => {
    setEditingBanner(b);
    setFormData({
      title_en: b.title_en || "",
      title_km: b.title_km || "",
      subtitle_en: b.subtitle_en || "",
      subtitle_km: b.subtitle_km || "",
      link_url: b.link_url || "",
      order: String(b.order || 0),
      is_active: b.is_active
    });
    setImageFile(null);
    setIsModalOpen(true);
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this banner?")) return;
    try {
      await adminApi.deleteBanner(id);
      setBanners((prev) => prev.filter((b) => b.id !== id));
      toast.success("Banner deleted");
    } catch (err) {
      toast.error("Failed to delete banner");
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const data = new FormData();
      data.append("title_en", formData.title_en);
      data.append("title_km", formData.title_km);
      data.append("subtitle_en", formData.subtitle_en);
      data.append("subtitle_km", formData.subtitle_km);
      data.append("link_url", formData.link_url);
      data.append("order", formData.order);
      data.append("is_active", formData.is_active ? "1" : "0");
      if (imageFile) {
        data.append("image", imageFile);
      }
      if (editingBanner) {
        await adminApi.updateBanner(editingBanner.id, data);
        toast.success("Banner updated");
      } else {
        await adminApi.createBanner(data);
        toast.success("Banner created");
      }
      setIsModalOpen(false);
      fetchBanners();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save banner");
    } finally {
      setIsSubmitting(false);
    }
  };
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-stone-900 dark:text-white">
            Hero Banners & Slides
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Manage homepage sliders and promotional campaign banners
          </p>
        </div>

        <button
    onClick={openCreateModal}
    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs shadow-md transition-colors flex items-center gap-1.5"
  >
          <Plus className="w-4 h-4" />
          <span>Add Banner</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? <div className="col-span-3 p-8 text-center text-stone-400">Loading banners...</div> : banners.map((b) => <div
    key={b.id}
    className="bg-white dark:bg-stone-100 rounded-3xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col justify-between"
  >
              <div className="aspect-[16/9] overflow-hidden bg-stone-100 dark:bg-stone-800 relative">
                <img
    src={b.image_url || "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=600&q=80"}
    alt="banner"
    className="w-full h-full object-cover"
  />
                <span
    className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-small font-bold ${b.is_active ? "bg-emerald-600 text-white" : "bg-stone-800/80 text-stone-300"}`}
  >
                  {b.is_active ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="p-4 space-y-2">
                <h4 className="font-bold text-sm text-stone-900 dark:text-white">
                  {b.title_en || "Untitled Banner"}
                </h4>
                <p className="text-xs text-stone-500">{b.subtitle_en}</p>
                {b.link_url && <span className="text-small text-teal-600 block truncate">
                    Link: {b.link_url}
                  </span>}
              </div>

              <div className="p-4 pt-0 border-t border-stone-100 dark:border-stone-800 flex items-center justify-end gap-1 mt-2">
                <button
    onClick={() => openEditModal(b)}
    className="p-1.5 rounded-lg text-stone-400 hover:text-amber-600 hover:bg-stone-100 dark:hover:bg-stone-800"
  >
                  <Edit className="w-4 h-4" />
                </button>
                <button
    onClick={() => handleDelete(b.id)}
    className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
  >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>)}
      </div>

      {
    /* Modal */
  }
      {isModalOpen && <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-100 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 dark:border-stone-800 relative">
            <button
    onClick={() => setIsModalOpen(false)}
    className="absolute top-5 right-5 text-stone-400 hover:text-stone-700"
  >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-4">
              {editingBanner ? "Edit Banner" : "Add Banner"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-700 uppercase mb-1">
                  Title (EN)
                </label>
                <input
    type="text"
    value={formData.title_en}
    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-300 bg-white dark:bg-stone-800 text-xs focus:outline-none focus:border-amber-500"
  />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-700 uppercase mb-1">
                  Title (KM)
                </label>
                <input
    type="text"
    value={formData.title_km}
    onChange={(e) => setFormData({ ...formData, title_km: e.target.value })}
    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-300 bg-white dark:bg-stone-800 text-xs focus:outline-none focus:border-amber-500 font-khmer"
  />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-700 uppercase mb-1">
                  Link URL
                </label>
                <input
    type="text"
    value={formData.link_url}
    onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
    placeholder="/destinations/angkor-wat"
    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-300 bg-white dark:bg-stone-800 text-xs focus:outline-none focus:border-amber-500"
  />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-700 uppercase mb-1">
                  Banner Image
                </label>
                <input
    type="file"
    accept="image/*"
    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
    className="text-xs text-stone-500 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-amber-500 file:text-stone-950"
  />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
    type="button"
    onClick={() => setIsModalOpen(false)}
    className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-semibold"
  >
                  Cancel
                </button>
                <button
    type="submit"
    disabled={isSubmitting}
    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
  >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save</span>
                </button>
              </div>
            </form>
          </div>
        </div>}
    </div>;
};
export {
  AdminBannersPage
};
