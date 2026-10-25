import { useState } from "react";
import { Plus, Edit, Trash2, FileText, X, Save, Loader2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { queryKeys } from "@/lib/queryKeys";
import { toast } from "@/store/toastStore";

const AdminBlogPage = () => {
  const queryClient = useQueryClient();

  const { data: postsRes, isLoading } = useQuery({
    queryKey: queryKeys.blog.list(),
    queryFn: () => adminApi.getBlogPosts(),
  });

  const posts = postsRes?.data?.items || (Array.isArray(postsRes?.data) ? postsRes.data : []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({
    title_en: "",
    title_km: "",
    excerpt_en: "",
    excerpt_km: "",
    content_en: "",
    content_km: "",
    status: "published",
    tags: "Guide, Tips"
  });
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openCreateModal = () => {
    setEditingPost(null);
    setFormData({
      title_en: "",
      title_km: "",
      excerpt_en: "",
      excerpt_km: "",
      content_en: "",
      content_km: "",
      status: "published",
      tags: "Guide, Tips"
    });
    setImageFile(null);
    setIsModalOpen(true);
  };
  const openEditModal = (p) => {
    setEditingPost(p);
    setFormData({
      title_en: p.title_en,
      title_km: p.title_km || "",
      excerpt_en: p.excerpt_en || "",
      excerpt_km: p.excerpt_km || "",
      content_en: p.content_en,
      content_km: p.content_km || "",
      status: p.status || "published",
      tags: p.tags?.join(", ") || ""
    });
    setImageFile(null);
    setIsModalOpen(true);
  };
  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete article "${title}"?`)) return;
    try {
      await adminApi.deleteBlogPost(id);
      queryClient.invalidateQueries({ queryKey: queryKeys.blog.all() });
      toast.success("Article deleted");
    } catch (err) {
      toast.error("Failed to delete post");
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const data = new FormData();
      data.append("title_en", formData.title_en);
      data.append("title_km", formData.title_km);
      data.append("excerpt_en", formData.excerpt_en);
      data.append("excerpt_km", formData.excerpt_km);
      data.append("content_en", formData.content_en);
      data.append("content_km", formData.content_km);
      data.append("status", formData.status);
      const cleanTags = formData.tags.split(",").map((t) => t.trim()).filter(Boolean);
      cleanTags.forEach((t, i) => data.append(`tags[${i}]`, t));
      if (imageFile) {
        data.append("image", imageFile);
      }
      if (editingPost) {
        await adminApi.updateBlogPost(editingPost.id, data);
        toast.success("Article updated");
      } else {
        await adminApi.createBlogPost(data);
        toast.success("Article created");
      }
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: queryKeys.blog.all() });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save post");
    } finally {
      setIsSubmitting(false);
    }
  };
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-stone-900 dark:text-white">
            Travel Blog & Articles
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Manage Cambodian guides, itineraries, and cultural articles
          </p>
        </div>

        <button
    onClick={openCreateModal}
    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs shadow-md transition-colors flex items-center gap-1.5"
  >
          <Plus className="w-4 h-4" />
          <span>Write Article</span>
        </button>
      </div>

      <div className="bg-white dark:bg-stone-100 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 dark:bg-stone-800/60 text-stone-500 uppercase tracking-wider font-bold border-b border-stone-200 dark:border-stone-800">
              <tr>
                <th className="p-4">Article</th>
                <th className="p-4">Tags</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-700 dark:text-stone-700">
              {isLoading ? <tr>
                  <td colSpan={5} className="p-8 text-center text-stone-400">Loading articles...</td>
                </tr> : posts.map((post) => <tr key={post.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30">
                    <td className="p-4 font-bold text-stone-900 dark:text-stone-900">
                      <div className="flex items-center gap-3">
                        {post.cover_image || post.image_url ? <img
    src={post.cover_image || post.image_url}
    alt={post.title_en}
    className="w-12 h-9 rounded-lg object-cover bg-stone-200"
  /> : <div className="w-12 h-9 rounded-lg bg-teal-800/40 text-teal-400 flex items-center justify-center">
                            <FileText className="w-4 h-4" />
                          </div>}
                        <div>
                          <span className="block truncate max-w-sm">{post.title_en}</span>
                          <span className="text-small text-amber-600 font-normal">
                            {post.title_km}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      {post.tags?.map((tag, i) => <span
    key={i}
    className="mr-1 px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-small"
  >
                          #{tag}
                        </span>)}
                    </td>

                    <td className="p-4">
                      <span
    className={`px-2 py-0.5 rounded-full text-small font-bold ${post.status === "published" ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300" : "bg-stone-200 dark:bg-stone-800 text-stone-500"}`}
  >
                        {post.status}
                      </span>
                    </td>

                    <td className="p-4 text-stone-400 text-small">
                      {post.published_at?.substring(0, 10)}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
    onClick={() => openEditModal(post)}
    className="p-1.5 rounded-lg text-stone-400 hover:text-amber-600 hover:bg-stone-100 dark:hover:bg-stone-800"
  >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
    onClick={() => handleDelete(post.id, post.title_en)}
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
          <div className="bg-white dark:bg-stone-100 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 dark:border-stone-800 relative max-h-[90vh] overflow-y-auto">
            <button
    onClick={() => setIsModalOpen(false)}
    className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-700"
  >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-4">
              {editingPost ? "Edit Article" : "Write New Article"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1 text-stone-700 dark:text-stone-700">
                    Title (EN) *
                  </label>
                  <input
    type="text"
    value={formData.title_en}
    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-300 bg-white dark:bg-stone-800 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
    required
  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1 text-stone-700 dark:text-stone-700">
                    Title (KM) *
                  </label>
                  <input
    type="text"
    value={formData.title_km}
    onChange={(e) => setFormData({ ...formData, title_km: e.target.value })}
    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-300 bg-white dark:bg-stone-800 text-xs sm:text-sm focus:outline-none focus:border-amber-500 font-khmer"
    required
  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase mb-1 text-stone-700 dark:text-stone-700">
                  Tags (comma separated)
                </label>
                <input
    type="text"
    value={formData.tags}
    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
    placeholder="Itinerary, Angkor, Food, Tips"
    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-300 bg-white dark:bg-stone-800 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
  />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase mb-1 text-stone-700 dark:text-stone-700">
                  Content (English) *
                </label>
                <textarea
    rows={6}
    value={formData.content_en}
    onChange={(e) => setFormData({ ...formData, content_en: e.target.value })}
    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-300 bg-white dark:bg-stone-800 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
    required
  />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase mb-1 text-stone-700 dark:text-stone-700">
                  Content (Khmer) *
                </label>
                <textarea
    rows={6}
    value={formData.content_km}
    onChange={(e) => setFormData({ ...formData, content_km: e.target.value })}
    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-300 bg-white dark:bg-stone-800 text-xs sm:text-sm focus:outline-none focus:border-amber-500 font-khmer"
    required
  />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase mb-1 text-stone-700 dark:text-stone-700">
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
                  <span>Save Article</span>
                </button>
              </div>
            </form>
          </div>
        </div>}
    </div>;
};
export {
  AdminBlogPage
};
