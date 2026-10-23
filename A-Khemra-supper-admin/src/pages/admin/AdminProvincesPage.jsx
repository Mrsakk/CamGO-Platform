import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, MapPin, X, Save, Loader2 } from "lucide-react";
import { adminApi } from "@/lib/api/admin";
import { provincesApi } from "@/lib/api/provinces";
import { toast } from "@/store/toastStore";
const AdminProvincesPage = () => {
  const [provinces, setProvinces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProvince, setEditingProvince] = useState(null);
  const [formData, setFormData] = useState({
    name_en: "",
    name_km: "",
    capital: "",
    area_km2: "",
    population: "",
    latitude: "",
    longitude: "",
    description_en: "",
    description_km: ""
  });
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fetchProvinces = async () => {
    try {
      setIsLoading(true);
      const res = await provincesApi.getAll();
      if (res.data) setProvinces(res.data);
    } catch (err) {
      toast.error("Failed to load provinces");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchProvinces();
  }, []);
  const openCreateModal = () => {
    setEditingProvince(null);
    setFormData({
      name_en: "",
      name_km: "",
      capital: "",
      area_km2: "",
      population: "",
      latitude: "12.5657",
      longitude: "104.9910",
      description_en: "",
      description_km: ""
    });
    setImageFile(null);
    setIsModalOpen(true);
  };
  const openEditModal = (p) => {
    setEditingProvince(p);
    setFormData({
      name_en: p.name_en,
      name_km: p.name_km || "",
      capital: p.capital || "",
      area_km2: String(p.area_km2 || ""),
      population: String(p.population || ""),
      latitude: String(p.latitude || ""),
      longitude: String(p.longitude || ""),
      description_en: p.description_en || "",
      description_km: p.description_km || ""
    });
    setImageFile(null);
    setIsModalOpen(true);
  };
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete province "${name}"?`)) return;
    try {
      await adminApi.deleteProvince(id);
      setProvinces((prev) => prev.filter((p) => p.id !== id));
      toast.success("Province deleted");
    } catch (err) {
      toast.error("Failed to delete province");
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const data = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        data.append(key, val);
      });
      if (imageFile) {
        data.append("image", imageFile);
      }
      if (editingProvince) {
        await adminApi.updateProvince(editingProvince.id, data);
        toast.success("Province updated");
      } else {
        await adminApi.createProvince(data);
        toast.success("Province created");
      }
      setIsModalOpen(false);
      fetchProvinces();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save province");
    } finally {
      setIsSubmitting(false);
    }
  };
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-stone-900 dark:text-white">
            Provinces of Cambodia
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Manage all 25 provinces and municipalities, provincial capitals, and facts
          </p>
        </div>

        <button
    onClick={openCreateModal}
    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs shadow-md transition-colors flex items-center gap-1.5"
  >
          <Plus className="w-4 h-4" />
          <span>Add Province</span>
        </button>
      </div>

      <div className="bg-white dark:bg-stone-100 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 dark:bg-stone-800/60 text-stone-500 uppercase tracking-wider font-bold border-b border-stone-200 dark:border-stone-800">
              <tr>
                <th className="p-4">Province</th>
                <th className="p-4">Capital</th>
                <th className="p-4">Area (km²)</th>
                <th className="p-4">Population</th>
                <th className="p-4">Destinations</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-700 dark:text-stone-700">
              {isLoading ? <tr>
                  <td colSpan={6} className="p-8 text-center text-stone-400">
                    Loading provinces...
                  </td>
                </tr> : provinces.map((prov) => <tr key={prov.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30">
                    <td className="p-4 font-bold text-stone-900 dark:text-stone-900">
                      <div className="flex items-center gap-3">
                        {prov.image_url ? <img
    src={prov.image_url}
    alt={prov.name_en}
    className="w-10 h-8 rounded-lg object-cover"
  /> : <div className="w-10 h-8 rounded-lg bg-teal-800/40 text-teal-400 flex items-center justify-center">
                            <MapPin className="w-4 h-4" />
                          </div>}
                        <div>
                          <span>{prov.name_en}</span>
                          <span className="block text-small text-amber-600 font-normal">
                            {prov.name_km}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">{prov.capital || "\u2014"}</td>
                    <td className="p-4">{prov.area_km2?.toLocaleString() || "\u2014"}</td>
                    <td className="p-4">{prov.population?.toLocaleString() || "\u2014"}</td>
                    <td className="p-4 font-bold text-amber-500">
                      {prov.destinations_count || 0} places
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
    onClick={() => openEditModal(prov)}
    className="p-1.5 rounded-lg text-stone-400 hover:text-amber-600 hover:bg-stone-100 dark:hover:bg-stone-800"
  >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
    onClick={() => handleDelete(prov.id, prov.name_en)}
    className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
  >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>)}
            </tbody>
          </table>
        </div>
      </div>

      {
    /* Modal */
  }
      {isModalOpen && <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-100 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 dark:border-stone-800 relative max-h-[90vh] overflow-y-auto">
            <button
    onClick={() => setIsModalOpen(false)}
    className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-700"
  >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-4">
              {editingProvince ? "Edit Province" : "Add New Province"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-700 uppercase mb-1">
                    Name (EN) *
                  </label>
                  <input
    type="text"
    value={formData.name_en}
    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-300 bg-white dark:bg-stone-800 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
    required
  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-700 uppercase mb-1">
                    Name (KM) *
                  </label>
                  <input
    type="text"
    value={formData.name_km}
    onChange={(e) => setFormData({ ...formData, name_km: e.target.value })}
    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-300 bg-white dark:bg-stone-800 text-xs sm:text-sm focus:outline-none focus:border-amber-500 font-khmer"
    required
  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-700 uppercase mb-1">
                    Capital
                  </label>
                  <input
    type="text"
    value={formData.capital}
    onChange={(e) => setFormData({ ...formData, capital: e.target.value })}
    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-300 bg-white dark:bg-stone-800 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-700 uppercase mb-1">
                    Area (km²)
                  </label>
                  <input
    type="number"
    value={formData.area_km2}
    onChange={(e) => setFormData({ ...formData, area_km2: e.target.value })}
    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-300 bg-white dark:bg-stone-800 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-700 uppercase mb-1">
                    Population
                  </label>
                  <input
    type="number"
    value={formData.population}
    onChange={(e) => setFormData({ ...formData, population: e.target.value })}
    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-300 bg-white dark:bg-stone-800 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-700 uppercase mb-1">
                    Latitude
                  </label>
                  <input
    type="text"
    value={formData.latitude}
    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-300 bg-white dark:bg-stone-800 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-700 uppercase mb-1">
                    Longitude
                  </label>
                  <input
    type="text"
    value={formData.longitude}
    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-300 bg-white dark:bg-stone-800 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-700 uppercase mb-1">
                  Description (English)
                </label>
                <textarea
    rows={3}
    value={formData.description_en}
    onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-300 bg-white dark:bg-stone-800 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
  />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-700 uppercase mb-1">
                  Description (Khmer)
                </label>
                <textarea
    rows={3}
    value={formData.description_km}
    onChange={(e) => setFormData({ ...formData, description_km: e.target.value })}
    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-300 bg-white dark:bg-stone-800 text-xs sm:text-sm focus:outline-none focus:border-amber-500 font-khmer"
  />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-700 uppercase mb-1">
                  Cover Photo
                </label>
                <input
    type="file"
    accept="image/*"
    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
    className="text-xs text-stone-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-amber-500 file:text-stone-950 hover:file:bg-amber-600"
  />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
    type="button"
    onClick={() => setIsModalOpen(false)}
    className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-300 text-xs font-semibold"
  >
                  Cancel
                </button>
                <button
    type="submit"
    disabled={isSubmitting}
    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
  >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Province</span>
                </button>
              </div>
            </form>
          </div>
        </div>}
    </div>;
};
export {
  AdminProvincesPage
};
