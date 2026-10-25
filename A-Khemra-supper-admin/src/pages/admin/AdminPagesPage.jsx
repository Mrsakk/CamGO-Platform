import { useState } from "react";
import {
  Layers, Users, Plus, Edit, Trash2, X, Save, Loader2,
  Upload, CheckCircle2, Eye, EyeOff, User
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { queryKeys } from "@/lib/queryKeys";
import { toast } from "@/store/toastStore";

const AdminPagesPage = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("pages"); // "pages" | "team"

  // 1. Static Pages Query
  const { data: pagesRes, isLoading: isLoadingPages } = useQuery({
    queryKey: queryKeys.pages.all(),
    queryFn: () => adminApi.getPages(),
  });

  const pages = pagesRes?.data?.items || (Array.isArray(pagesRes?.data) ? pagesRes.data : []);

  // 2. Team Members Query
  const { data: teamRes, isLoading: isLoadingTeam } = useQuery({
    queryKey: ["admin", "team-members"],
    queryFn: () => adminApi.getTeamMembers(),
  });

  const teamMembers = teamRes?.data?.items || (Array.isArray(teamRes?.data) ? teamRes.data : []);

  // Static Pages State
  const [isPageModalOpen, setIsPageModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [pageFormData, setPageFormData] = useState({
    title_en: "",
    title_km: "",
    content_en: "",
    content_km: "",
  });
  const [isSubmittingPage, setIsSubmittingPage] = useState(false);

  // Team Members State
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [teamFormData, setTeamFormData] = useState({
    name_en: "",
    name_km: "",
    role_en: "",
    role_km: "",
    order: 0,
    is_published: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmittingTeam, setIsSubmittingTeam] = useState(false);

  // Page Modal Handlers
  const openEditPageModal = (p) => {
    setEditingPage(p);
    setPageFormData({
      title_en: p.title_en || "",
      title_km: p.title_km || "",
      content_en: p.content_en || "",
      content_km: p.content_km || "",
    });
    setIsPageModalOpen(true);
  };

  const handlePageSubmit = async (e) => {
    e.preventDefault();
    if (!editingPage) return;
    try {
      setIsSubmittingPage(true);
      await adminApi.updatePage(editingPage.id, pageFormData);
      toast.success("Page content updated");
      setIsPageModalOpen(false);
      queryClient.invalidateQueries({ queryKey: queryKeys.pages.all() });
    } catch (err) {
      toast.error("Failed to update page");
    } finally {
      setIsSubmittingPage(false);
    }
  };

  // Team Member Modal Handlers
  const openCreateTeamModal = () => {
    setEditingMember(null);
    setTeamFormData({
      name_en: "",
      name_km: "",
      role_en: "",
      role_km: "",
      order: teamMembers.length + 1,
      is_published: true,
    });
    setImageFile(null);
    setImagePreview(null);
    setIsTeamModalOpen(true);
  };

  const openEditTeamModal = (m) => {
    setEditingMember(m);
    setTeamFormData({
      name_en: m.name_en || "",
      name_km: m.name_km || "",
      role_en: m.role_en || "",
      role_km: m.role_km || "",
      order: m.order ?? 0,
      is_published: m.is_published ?? true,
    });
    setImageFile(null);
    setImagePreview(m.image || m.image_url || null);
    setIsTeamModalOpen(true);
  };

  const handleDeleteTeamMember = async (id, name) => {
    if (!window.confirm(`Delete team member "${name}"?`)) return;
    try {
      await adminApi.deleteTeamMember(id);
      queryClient.invalidateQueries({ queryKey: ["admin", "team-members"] });
      toast.success("Team member deleted");
    } catch (err) {
      toast.error("Failed to delete team member");
    }
  };

  const handleTeamSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmittingTeam(true);
      const data = new FormData();
      data.append("name_en", teamFormData.name_en);
      if (teamFormData.name_km) data.append("name_km", teamFormData.name_km);
      data.append("role_en", teamFormData.role_en);
      if (teamFormData.role_km) data.append("role_km", teamFormData.role_km);
      data.append("order", String(teamFormData.order));
      data.append("is_published", teamFormData.is_published ? "1" : "0");

      if (imageFile) {
        data.append("image", imageFile);
      }

      if (editingMember) {
        await adminApi.updateTeamMember(editingMember.id, data);
        toast.success("Team member updated");
      } else {
        await adminApi.createTeamMember(data);
        toast.success("Team member added");
      }

      setIsTeamModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin", "team-members"] });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save team member");
    } finally {
      setIsSubmittingTeam(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 dark:text-white">
            Pages & Content Management
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Manage static informational texts and "Our Team" profiles for the About page
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 w-fit">
          <button
            onClick={() => setActiveTab("pages")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "pages"
                ? "bg-white dark:bg-stone-900 text-stone-950 dark:text-stone-100 shadow-sm"
                : "text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
            }`}
          >
            <Layers className="w-4 h-4 text-amber-500" />
            <span>Static Pages</span>
          </button>

          <button
            onClick={() => setActiveTab("team")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "team"
                ? "bg-white dark:bg-stone-900 text-stone-950 dark:text-stone-100 shadow-sm"
                : "text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
            }`}
          >
            <Users className="w-4 h-4 text-amber-500" />
            <span>Our Team Members ({teamMembers.length})</span>
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: STATIC PAGES (ABOUT, TERMS, PRIVACY)                           */}
      {/* ===================================================================== */}
      {activeTab === "pages" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {isLoadingPages ? (
            <div className="col-span-3 p-8 text-center text-stone-400">Loading pages...</div>
          ) : (
            pages.map((p) => (
              <div
                key={p.id}
                className="bg-white dark:bg-stone-850 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-3">
                    <Layers className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-stone-900 dark:text-white">{p.title_en}</h3>
                  <span className="text-xs text-amber-600 font-khmer block mb-2">{p.title_km}</span>
                  <span className="text-[11px] font-mono text-stone-400 block mb-2">/{p.slug}</span>
                  <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-3 leading-relaxed">
                    {p.content_en}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-end">
                  <button
                    onClick={() => openEditPageModal(p)}
                    className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5 text-amber-500" />
                    <span>Edit Content</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: OUR TEAM MEMBERS                                               */}
      {/* ===================================================================== */}
      {activeTab === "team" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-white">
                Our Team Profiles (About Page)
              </h2>
              <p className="text-xs text-stone-500">
                These profiles are displayed directly in the "Our Team" section of the About Us page
              </p>
            </div>

            <button
              onClick={openCreateTeamModal}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs shadow-md transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Team Member</span>
            </button>
          </div>

          <div className="bg-white dark:bg-stone-850 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 dark:bg-stone-800/60 text-stone-500 uppercase tracking-wider font-bold border-b border-stone-200 dark:border-stone-800">
                  <tr>
                    <th className="p-4">Member</th>
                    <th className="p-4">Role / Title</th>
                    <th className="p-4">Display Order</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-700 dark:text-stone-300">
                  {isLoadingTeam ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-stone-400">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                          <span>Loading team members...</span>
                        </div>
                      </td>
                    </tr>
                  ) : teamMembers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-stone-400">
                        No team members yet. Click "Add Team Member" to create one.
                      </td>
                    </tr>
                  ) : (
                    teamMembers.map((m) => {
                      const avatar = m.image || m.image_url;
                      return (
                        <tr key={m.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition-colors">
                          {/* Member Photo & Name */}
                          <td className="p-4 font-bold text-stone-900 dark:text-stone-100">
                            <div className="flex items-center gap-3">
                              {avatar ? (
                                <img
                                  src={avatar}
                                  alt={m.name_en}
                                  className="w-11 h-11 rounded-full object-cover bg-stone-200 dark:bg-stone-700 border border-stone-200 dark:border-stone-700 shrink-0"
                                />
                              ) : (
                                <div className="w-11 h-11 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-400 flex items-center justify-center border border-stone-200 dark:border-stone-700 shrink-0">
                                  <User className="w-5 h-5" />
                                </div>
                              )}
                              <div>
                                <span className="block text-sm">{m.name_en}</span>
                                <span className="block text-xs text-amber-600 dark:text-amber-400 font-normal font-khmer">
                                  {m.name_km || "—"}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Role */}
                          <td className="p-4">
                            <span className="block font-semibold text-stone-800 dark:text-stone-200">
                              {m.role_en}
                            </span>
                            <span className="block text-[11px] text-stone-500 dark:text-stone-400 font-khmer">
                              {m.role_km || "—"}
                            </span>
                          </td>

                          {/* Order */}
                          <td className="p-4">
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-mono text-[11px] font-semibold">
                              #{m.order}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                m.is_published
                                  ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/50"
                                  : "bg-stone-200 dark:bg-stone-800 text-stone-500"
                              }`}
                            >
                              {m.is_published ? "Published" : "Hidden"}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditTeamModal(m)}
                                className="p-1.5 rounded-lg text-stone-400 hover:text-amber-600 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                                title="Edit Member"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteTeamMember(m.id, m.name_en)}
                                className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                                title="Delete Member"
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
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 1: EDIT STATIC PAGE                                             */}
      {/* ===================================================================== */}
      {isPageModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 dark:border-stone-800 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsPageModalOpen(false)}
              className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-4">
              Edit {editingPage?.title_en}
            </h3>

            <form onSubmit={handlePageSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1 text-stone-700 dark:text-stone-300">
                    Title (EN)
                  </label>
                  <input
                    type="text"
                    value={pageFormData.title_en}
                    onChange={(e) => setPageFormData({ ...pageFormData, title_en: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1 text-stone-700 dark:text-stone-300">
                    Title (KM)
                  </label>
                  <input
                    type="text"
                    value={pageFormData.title_km}
                    onChange={(e) => setPageFormData({ ...pageFormData, title_km: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs sm:text-sm focus:outline-none focus:border-amber-500 font-khmer"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase mb-1 text-stone-700 dark:text-stone-300">
                  Content (English)
                </label>
                <textarea
                  rows={7}
                  value={pageFormData.content_en}
                  onChange={(e) => setPageFormData({ ...pageFormData, content_en: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs leading-relaxed focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase mb-1 text-stone-700 dark:text-stone-300">
                  Content (Khmer)
                </label>
                <textarea
                  rows={7}
                  value={pageFormData.content_km}
                  onChange={(e) => setPageFormData({ ...pageFormData, content_km: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs leading-relaxed focus:outline-none focus:border-amber-500 font-khmer"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsPageModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPage}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                >
                  {isSubmittingPage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Page</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: ADD / EDIT TEAM MEMBER                                       */}
      {/* ===================================================================== */}
      {isTeamModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 dark:border-stone-800 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsTeamModalOpen(false)}
              className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-4">
              {editingMember ? "Edit Team Member" : "Add Team Member"}
            </h3>

            <form onSubmit={handleTeamSubmit} className="space-y-4">
              {/* Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1 text-stone-700 dark:text-stone-300">
                    Name (EN) *
                  </label>
                  <input
                    type="text"
                    value={teamFormData.name_en}
                    onChange={(e) => setTeamFormData({ ...teamFormData, name_en: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                    placeholder="e.g. Vannak Sambath"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1 text-stone-700 dark:text-stone-300">
                    Name (KM)
                  </label>
                  <input
                    type="text"
                    value={teamFormData.name_km}
                    onChange={(e) => setTeamFormData({ ...teamFormData, name_km: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs sm:text-sm focus:outline-none focus:border-amber-500 font-khmer"
                    placeholder="ឧ. វណ្ណៈ សម្បត្តិ"
                  />
                </div>
              </div>

              {/* Roles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1 text-stone-700 dark:text-stone-300">
                    Role (EN) *
                  </label>
                  <input
                    type="text"
                    value={teamFormData.role_en}
                    onChange={(e) => setTeamFormData({ ...teamFormData, role_en: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                    placeholder="e.g. Lead Heritage Architect"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1 text-stone-700 dark:text-stone-300">
                    Role (KM)
                  </label>
                  <input
                    type="text"
                    value={teamFormData.role_km}
                    onChange={(e) => setTeamFormData({ ...teamFormData, role_km: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs sm:text-sm focus:outline-none focus:border-amber-500 font-khmer"
                    placeholder="ឧ. ស្ថាបត្យករអភិរក្ស"
                  />
                </div>
              </div>

              {/* Photo Upload & Preview */}
              <div>
                <label className="block text-xs font-semibold uppercase mb-1 text-stone-700 dark:text-stone-300">
                  Profile Photo (Avatar)
                </label>
                {imagePreview && (
                  <div className="mb-2 flex items-center gap-3">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-14 h-14 rounded-full object-cover border border-stone-300 dark:border-stone-700"
                    />
                    <span className="text-[11px] text-stone-500">Current photo preview</span>
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

              {/* Order & Publish */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center pt-2">
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1 text-stone-700 dark:text-stone-300">
                    Display Order (Rank)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={teamFormData.order}
                    onChange={(e) => setTeamFormData({ ...teamFormData, order: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="sm:pt-5">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-800 dark:text-stone-200">
                    <input
                      type="checkbox"
                      checked={teamFormData.is_published}
                      onChange={(e) => setTeamFormData({ ...teamFormData, is_published: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 border-stone-300"
                    />
                    <span>Publish on About Page</span>
                  </label>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsTeamModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTeam}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                >
                  {isSubmittingTeam ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Member</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export { AdminPagesPage };
