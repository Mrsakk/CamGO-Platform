import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Compass, X, Save, Loader2 } from "lucide-react";
import { adminApi } from "@/lib/api/admin";
import { categoriesApi } from "@/lib/api/categories";
import { toast } from "@/store/toastStore";
const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name_en: "",
    name_km: "",
    icon: "",
    description_en: "",
    description_km: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const res = await categoriesApi.getAll();
      if (res.data) setCategories(res.data);
    } catch (err) {
      toast.error("Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchCategories();
  }, []);
  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name_en: "",
      name_km: "",
      icon: "compass",
      description_en: "",
      description_km: ""
    });
    setIsModalOpen(true);
  };
  const openEditModal = (c) => {
    setEditingCategory(c);
    setFormData({
      name_en: c.name_en,
      name_km: c.name_km || "",
      icon: c.icon || "",
      description_en: c.description_en || "",
      description_km: c.description_km || ""
    });
    setIsModalOpen(true);
  };
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    try {
      await adminApi.deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success("Category deleted");
    } catch (err) {
      toast.error("Failed to delete category");
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (editingCategory) {
        await adminApi.updateCategory(editingCategory.id, formData);
        toast.success("Category updated");
      } else {
        await adminApi.createCategory(formData);
        toast.success("Category created");
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save category");
    } finally {
      setIsSubmitting(false);
    }
  };
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-stone-900 dark:text-white">
            Travel Categories
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Manage travel styles and taxonomy for attractions
          </p>
        </div>

        <button
    onClick={openCreateModal}
    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs shadow-md transition-colors flex items-center gap-1.5"
  >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? <div className="col-span-3 p-8 text-center text-stone-400">Loading categories...</div> : categories.map((cat) => <div
    key={cat.id}
    className="bg-white dark:bg-stone-100 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col justify-between space-y-4"
  >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <Compass className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300">
                    {cat.destinations_count || 0} destinations
                  </span>
                </div>

                <h3 className="font-bold text-base text-stone-900 dark:text-white">
                  {cat.name_en}
                </h3>
                <span className="text-xs text-amber-600 block mt-0.5">{cat.name_km}</span>

                <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 line-clamp-3">
                  {cat.description_en}
                </p>
              </div>

              <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-end gap-2">
                <button
    onClick={() => openEditModal(cat)}
    className="p-1.5 rounded-lg text-stone-400 hover:text-amber-600 hover:bg-stone-100 dark:hover:bg-stone-800"
  >
                  <Edit className="w-4 h-4" />
                </button>
                <button
    onClick={() => handleDelete(cat.id, cat.name_en)}
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
          <div className="bg-white dark:bg-stone-100 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200 dark:border-stone-800 relative">
            <button
    onClick={() => setIsModalOpen(false)}
    className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-700"
  >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-4">
              {editingCategory ? "Edit Category" : "Add New Category"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase mb-1 text-stone-700 dark:text-stone-700">
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
                <label className="block text-xs font-semibold uppercase mb-1 text-stone-700 dark:text-stone-700">
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

              <div>
                <label className="block text-xs font-semibold uppercase mb-1 text-stone-700 dark:text-stone-700">
                  Description (English)
                </label>
                <textarea
    rows={2}
    value={formData.description_en}
    onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-300 bg-white dark:bg-stone-800 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
  />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase mb-1 text-stone-700 dark:text-stone-700">
                  Description (Khmer)
                </label>
                <textarea
    rows={2}
    value={formData.description_km}
    onChange={(e) => setFormData({ ...formData, description_km: e.target.value })}
    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-300 bg-white dark:bg-stone-800 text-xs sm:text-sm focus:outline-none focus:border-amber-500 font-khmer"
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
                  <span>Save Category</span>
                </button>
              </div>
            </form>
          </div>
        </div>}
    </div>;
};
export {
  AdminCategoriesPage
};
