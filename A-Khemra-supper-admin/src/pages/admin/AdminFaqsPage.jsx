import { useState } from "react";
import { Plus, Edit, Trash2, X, Save, Loader2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { queryKeys } from "@/lib/queryKeys";
import { toast } from "@/store/toastStore";

const AdminFaqsPage = () => {
  const queryClient = useQueryClient();

  const { data: faqsRes, isLoading } = useQuery({
    queryKey: queryKeys.faqs.all(),
    queryFn: () => adminApi.getFaqs(),
  });

  const faqs = faqsRes?.data?.items || (Array.isArray(faqsRes?.data) ? faqsRes.data : []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [formData, setFormData] = useState({
    question_en: "",
    question_km: "",
    answer_en: "",
    answer_km: "",
    category: "general",
    order: "0"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openCreateModal = () => {
    setEditingFaq(null);
    setFormData({
      question_en: "",
      question_km: "",
      answer_en: "",
      answer_km: "",
      category: "general",
      order: "0"
    });
    setIsModalOpen(true);
  };
  const openEditModal = (f) => {
    setEditingFaq(f);
    setFormData({
      question_en: f.question_en,
      question_km: f.question_km || "",
      answer_en: f.answer_en,
      answer_km: f.answer_km || "",
      category: f.category || "general",
      order: String(f.order || 0)
    });
    setIsModalOpen(true);
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this FAQ entry?")) return;
    try {
      await adminApi.deleteFaq(id);
      queryClient.invalidateQueries({ queryKey: queryKeys.faqs.all() });
      toast.success("FAQ deleted");
    } catch (err) {
      toast.error("Failed to delete FAQ");
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const payload = {
        ...formData,
        order: parseInt(formData.order, 10) || 0
      };
      if (editingFaq) {
        await adminApi.updateFaq(editingFaq.id, payload);
        toast.success("FAQ updated");
      } else {
        await adminApi.createFaq(payload);
        toast.success("FAQ created");
      }
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: queryKeys.faqs.all() });
    } catch (err) {
      toast.error("Failed to save FAQ");
    } finally {
      setIsSubmitting(false);
    }
  };
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-stone-900 dark:text-white">
            Frequently Asked Questions
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Manage tourist FAQs regarding tickets, weather, etiquette, and visas
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs shadow-md transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add FAQ</span>
        </button>
      </div>

      <div className="bg-white dark:bg-stone-100 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm divide-y divide-stone-100 dark:divide-stone-800">
        {isLoading ? (
          <div className="p-8 text-center text-stone-400">Loading FAQs from database...</div>
        ) : faqs.length === 0 ? (
          <div className="p-8 text-center text-stone-400">No FAQs found in database. Click "Add FAQ" to create one.</div>
        ) : (
          faqs.map((faq) => (
            <div key={faq.id} className="p-5 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-small font-bold uppercase tracking-wider text-amber-500">
                  {faq.category || "General"}
                </span>
                <h4 className="font-bold text-sm text-stone-900 dark:text-white">
                  {faq.question_en}
                </h4>
                <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2">
                  {faq.answer_en}
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
    onClick={() => openEditModal(faq)}
    className="p-1.5 rounded-lg text-stone-400 hover:text-amber-600 hover:bg-stone-100 dark:hover:bg-stone-800"
  >
                  <Edit className="w-4 h-4" />
                </button>
                <button
    onClick={() => handleDelete(faq.id)}
    className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
  >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {
    /* Modal */
  }
      {isModalOpen && <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-100 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 dark:border-stone-800 relative">
            <button
    onClick={() => setIsModalOpen(false)}
    className="absolute top-5 right-5 text-stone-400 hover:text-stone-700"
  >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-4">
              {editingFaq ? "Edit FAQ" : "Add FAQ"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-700 uppercase mb-1">
                  Question (English) *
                </label>
                <input
    type="text"
    value={formData.question_en}
    onChange={(e) => setFormData({ ...formData, question_en: e.target.value })}
    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-300 bg-white dark:bg-stone-800 text-xs focus:outline-none focus:border-amber-500"
    required
  />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-700 uppercase mb-1">
                  Question (Khmer) *
                </label>
                <input
    type="text"
    value={formData.question_km}
    onChange={(e) => setFormData({ ...formData, question_km: e.target.value })}
    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-300 bg-white dark:bg-stone-800 text-xs focus:outline-none focus:border-amber-500 font-khmer"
    required
  />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-700 uppercase mb-1">
                  Answer (English) *
                </label>
                <textarea
    rows={3}
    value={formData.answer_en}
    onChange={(e) => setFormData({ ...formData, answer_en: e.target.value })}
    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-300 bg-white dark:bg-stone-800 text-xs focus:outline-none focus:border-amber-500"
    required
  />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-700 uppercase mb-1">
                  Answer (Khmer) *
                </label>
                <textarea
    rows={3}
    value={formData.answer_km}
    onChange={(e) => setFormData({ ...formData, answer_km: e.target.value })}
    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-300 bg-white dark:bg-stone-800 text-xs focus:outline-none focus:border-amber-500 font-khmer"
    required
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
  AdminFaqsPage
};
