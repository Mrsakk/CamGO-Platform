import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Tag,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  X,
  Check,
  Building,
  Layers,
  Sparkles,
} from "lucide-react";
import api from "@/lib/axios";
import { toast } from "@/store/toastStore";

export const AdminBusinessCategoriesPage = () => {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const isKm = i18n.language === "km";

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name_km: "",
    name_en: "",
    slug: "",
    icon: "tag",
    sort_order: 0,
  });

  // Fetch categories
  const {
    data: categoriesData,
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: async () => {
      const res = await api.get("/admin/business/categories");
      return res.data;
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  const rawCategories = categoriesData?.data || (Array.isArray(categoriesData) ? categoriesData : []);
  const categories = Array.isArray(rawCategories) ? rawCategories : [];

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name_km: "",
      name_en: "",
      slug: "",
      icon: "tag",
      sort_order: categories.length + 1,
    });
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name_km: cat.name_km,
      name_en: cat.name_en,
      slug: cat.slug,
      icon: cat.icon || "tag",
      sort_order: cat.sort_order || 0,
    });
    setModalOpen(true);
  };

  // Save mutation (Create or Update)
  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      if (editingCategory) {
        return await api.put(`/admin/business/categories/${editingCategory.id}`, payload);
      } else {
        return await api.post("/admin/business/categories", payload);
      }
    },
    onSuccess: () => {
      toast.success(
        editingCategory
          ? (isKm ? "បានកែប្រែប្រភេទទិន្នន័យ" : "Category updated")
          : (isKm ? "បានបង្កើតប្រភេទថ្មី" : "Category created")
      );
      queryClient.invalidateQueries(["admin", "categories"]);
      queryClient.invalidateQueries(["categories"]);
      setModalOpen(false);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to save category");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/admin/business/categories/${id}`);
    },
    onSuccess: () => {
      toast.success(isKm ? "បានលុបប្រភេទ" : "Category deleted");
      queryClient.invalidateQueries(["admin", "categories"]);
      queryClient.invalidateQueries(["categories"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Cannot delete category in use");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name_km || !formData.name_en) {
      toast.error(isKm ? "សូមបញ្ចូលឈ្មោះទាំងខ្មែរ និងអង់គ្លេស" : "Please provide both Khmer and English names");
      return;
    }
    saveMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-700 dark:text-brand-300">
            Directory setup
          </p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl text-forest dark:text-cream">
            <Layers className="h-5 w-5 text-brand-600" />
            {isKm ? "ការគ្រប់គ្រងប្រភេទអាជីវកម្ម" : "Business Categories"}
          </h1>
          <p className="mt-1 text-sm text-muted dark:text-stone-400">
            {isKm
              ? "គ្រប់គ្រងបញ្ជីប្រភេទសម្រាប់ចាត់ថ្នាក់អាជីវកម្មក្នុងប្រព័ន្ធ"
              : "Manage directory categories, icons, and display order."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 rounded-control border border-line bg-cream px-3 py-2 text-sm text-forest transition hover:border-brand-300 hover:bg-brand-50 dark:border-white/10 dark:bg-white/5 dark:text-stone-300 dark:hover:bg-white/10"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin text-brand-600" : ""}`} />
            {isKm ? "ផ្ទុកឡើងវិញ" : "Refresh"}
          </button>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-control bg-brand-500 px-4 py-2 text-sm font-semibold text-forest shadow-gold transition hover:bg-brand-400"
          >
            <Plus className="w-4 h-4" />
            {isKm ? "បន្ថែមប្រភេទថ្មី" : "Add Category"}
          </button>
        </div>
      </div>

      {/* Categories Table */}
      <div className="portal-surface overflow-hidden">
        {isLoading && categories.length === 0 ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-500 mb-3" />
            <p className="text-sm text-stone-500 dark:text-stone-400">
              {isKm ? "កំពុងផ្ទុកទិន្នន័យ..." : "Loading categories..."}
            </p>
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center">
            <Tag className="w-12 h-12 mx-auto text-stone-300 dark:text-stone-600 mb-3" />
            <p className="text-base font-medium text-stone-700 dark:text-stone-300">
              {isKm ? "មិនមានប្រភេទនៅឡើយទេ" : "No categories found"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-stone-600 dark:text-stone-300">
              <thead className="bg-stone-50 dark:bg-stone-800/60 text-xs uppercase font-medium text-stone-500 dark:text-stone-400 border-b border-stone-200 dark:border-stone-800">
                <tr>
                  <th className="px-6 py-3.5">{isKm ? "លំដាប់" : "Order"}</th>
                  <th className="px-6 py-3.5">{isKm ? "រូបតំណាង" : "Icon"}</th>
                  <th className="px-6 py-3.5">{isKm ? "ឈ្មោះ (ខ្មែរ)" : "Name (KM)"}</th>
                  <th className="px-6 py-3.5">{isKm ? "ឈ្មោះ (អង់គ្លេស)" : "Name (EN)"}</th>
                  <th className="px-6 py-3.5">Slug</th>
                  <th className="px-6 py-3.5 text-center">{isKm ? "ចំនួនអាជីវកម្ម" : "Businesses"}</th>
                  <th className="px-6 py-3.5 text-right">{isKm ? "សកម្មភាព" : "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/40 transition">
                    <td className="px-6 py-4 font-mono text-xs text-stone-400">
                      {cat.sort_order}
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-mono text-xs font-semibold">
                        {cat.icon || "tag"}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-stone-900 dark:text-white">
                      {cat.name_km}
                    </td>
                    <td className="px-6 py-4 text-stone-700 dark:text-stone-300">
                      {cat.name_en}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-stone-400">
                      {cat.slug}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                        <Building className="w-3 h-3 text-stone-400" />
                        {cat.businesses_count ?? 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(isKm ? "តើអ្នកចង់លុបប្រភេទនេះមែនទេ?" : "Delete category?")) {
                              deleteMutation.mutate(cat.id);
                            }
                          }}
                          disabled={cat.businesses_count > 0}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-stone-400"
                          title={cat.businesses_count > 0 ? "Cannot delete category with businesses" : "Delete"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="portal-surface w-full max-w-md p-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
              <h3 className="text-lg font-bold text-stone-900 dark:text-white">
                {editingCategory
                  ? (isKm ? "កែប្រែប្រភេទអាជីវកម្ម" : "Edit Category")
                  : (isKm ? "បន្ថែមប្រភេទអាជីវកម្មថ្មី" : "New Category")}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1">
                  {isKm ? "ឈ្មោះជាភាសាខ្មែរ *" : "Khmer Name *"}
                </label>
                <input
                  type="text"
                  required
                  value={formData.name_km}
                  onChange={(e) => setFormData({ ...formData, name_km: e.target.value })}
                  placeholder="ឧ. សណ្ឋាគារ និងផ្ទះសំណាក់"
                  className="portal-input px-3.5"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1">
                  {isKm ? "ឈ្មោះជាភាសាអង់គ្លេស *" : "English Name *"}
                </label>
                <input
                  type="text"
                  required
                  value={formData.name_en}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                  placeholder="e.g. Accommodation"
                  className="portal-input px-3.5"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1">
                  Slug (URL identifier)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="auto-generated-if-blank"
                  className="portal-input px-3.5 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1">
                    {isKm ? "រូបតំណាង Icon" : "Icon Key"}
                  </label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="hotel, coffee, bus, gift..."
                    className="portal-input px-3.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1">
                    {isKm ? "លំដាប់តម្រៀប" : "Sort Order"}
                  </label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                    className="portal-input px-3.5"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100 dark:border-stone-800 mt-6">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-control border border-line bg-cream px-4 py-2 text-sm font-semibold text-forest transition hover:border-brand-300 hover:bg-brand-50 dark:border-white/10 dark:bg-white/5 dark:text-stone-300 dark:hover:bg-white/10"
                >
                  {isKm ? "បោះបង់" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="rounded-control bg-brand-500 px-4 py-2 text-sm font-semibold text-forest shadow-gold transition hover:bg-brand-400 disabled:opacity-50"
                >
                  {saveMutation.isPending ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    isKm ? "រក្សាទុក" : "Save Category"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
