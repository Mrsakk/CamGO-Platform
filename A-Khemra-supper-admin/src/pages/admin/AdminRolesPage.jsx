import { useState } from "react";
import { Shield, Check, Users, Key, Edit, X, Save, Search, Sparkles } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { queryKeys } from "@/lib/queryKeys";
import { toast } from "@/store/toastStore";

const AdminRolesPage = () => {
  const queryClient = useQueryClient();

  const { data: rolesRes, isLoading } = useQuery({
    queryKey: queryKeys.roles(),
    queryFn: () => adminApi.getRoles(),
  });

  const roles = rolesRes?.data?.roles || (Array.isArray(rolesRes?.data) ? rolesRes.data : []);
  const allPermissions = rolesRes?.data?.all_permissions || [];

  // Edit Permissions Modal State
  const [editingRole, setEditingRole] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [permissionSearch, setPermissionSearch] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const openEditModal = (role) => {
    setEditingRole(role);
    // role.permissions is an array of permission names (strings) or objects
    const currentPerms = (role.permissions || []).map((p) =>
      typeof p === "string" ? p : p.name
    );
    setSelectedPermissions(currentPerms);
    setPermissionSearch("");
  };

  const togglePermission = (permName) => {
    setSelectedPermissions((prev) =>
      prev.includes(permName)
        ? prev.filter((p) => p !== permName)
        : [...prev, permName]
    );
  };

  const handleSavePermissions = async () => {
    if (!editingRole) return;
    try {
      setIsSaving(true);
      await adminApi.syncRolePermissions(editingRole.name, selectedPermissions);
      toast.success(`Permissions updated for role "${editingRole.name}"`);
      setEditingRole(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.roles() });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update permissions");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredPermissions = allPermissions.filter((p) =>
    p.toLowerCase().includes(permissionSearch.toLowerCase().trim())
  );

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
              Access Control Framework
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white mt-1">
            Roles & Permissions
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Fine-grained RBAC policies managed via Spatie Laravel-Permission
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-2xl bg-white dark:bg-stone-100 border border-stone-200 dark:border-stone-800 text-xs font-mono font-bold text-stone-700 dark:text-stone-700 shadow-sm">
            {roles.length} ROLES CONFIGURED
          </div>
          <div className="px-3.5 py-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs font-mono font-bold text-amber-600 dark:text-amber-400 shadow-sm">
            {allPermissions.length} TOTAL PERMISSIONS
          </div>
        </div>
      </div>

      {/* 2. Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-stone-100 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm animate-pulse space-y-4 h-64"
            >
              <div className="h-10 w-10 bg-stone-200 dark:bg-stone-800 rounded-xl" />
              <div className="h-6 w-32 bg-stone-300 dark:bg-stone-300 rounded-lg" />
              <div className="h-4 w-48 bg-stone-200 dark:bg-stone-800 rounded" />
            </div>
          ))
        ) : roles.length === 0 ? (
          <div className="col-span-3 p-12 text-center text-stone-400 bg-white dark:bg-stone-100 rounded-3xl border border-stone-200 dark:border-stone-800">
            No access roles discovered.
          </div>
        ) : (
          roles.map((r) => {
            const perms = r.permissions || [];
            return (
              <div
                key={r.id || r.name}
                className="bg-white dark:bg-stone-100 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-4">
                  {/* Top Role Header */}
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center">
                      <Shield className="w-5 h-5" />
                    </div>

                    <div className="flex items-center gap-2 text-small font-mono">
                      <span className="px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-700 border border-stone-200 dark:border-stone-300">
                        Guard: {r.guard_name || "web"}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 font-bold flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{r.users_count || 0}</span>
                      </span>
                    </div>
                  </div>

                  {/* Role Title */}
                  <div>
                    <h3 className="font-bold text-lg text-stone-900 dark:text-white capitalize">
                      {r.name.replace(/_/g, " ")}
                    </h3>
                    <p className="text-xs text-stone-400 mt-0.5">
                      {perms.length} {perms.length === 1 ? "capability" : "capabilities"} active
                    </p>
                  </div>

                  {/* Included Permissions Badges */}
                  <div className="pt-2 border-t border-stone-100 dark:border-stone-800 space-y-2">
                    <span className="block text-small font-bold uppercase tracking-wider text-stone-400">
                      Active Permissions
                    </span>

                    <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1">
                      {perms.length > 0 ? (
                        perms.map((p, idx) => {
                          const permName = typeof p === "string" ? p : p.name;
                          return (
                            <span
                              key={permName || idx}
                              className="px-2 py-0.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 text-small font-medium flex items-center gap-1 border border-teal-500/20"
                            >
                              <Check className="w-3 h-3 text-teal-600 dark:text-teal-400 shrink-0" />
                              <span className="font-mono">{permName}</span>
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-xs text-stone-400 italic">
                          No specific permissions assigned.
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Edit Button */}
                <div className="pt-3 border-t border-stone-100 dark:border-stone-800">
                  <button
                    type="button"
                    onClick={() => openEditModal(r)}
                    className="w-full py-2 px-4 rounded-xl border border-stone-200 dark:border-stone-300 hover:border-amber-500 hover:bg-amber-500/10 text-stone-700 dark:text-stone-700 hover:text-amber-600 dark:hover:text-amber-400 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Manage Role Permissions</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 3. Manage Permissions Modal */}
      {editingRole && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-100 border border-amber-500/30 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col justify-between shadow-2xl overflow-hidden animate-fade-in">
            {/* Modal Header */}
            <div className="p-6 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  <Key className="w-3.5 h-3.5" />
                  <span>Configure Permissions</span>
                </div>
                <h2 className="text-xl font-black text-stone-900 dark:text-white capitalize mt-0.5">
                  Role: {editingRole.name.replace(/_/g, " ")}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setEditingRole(null)}
                aria-label="Close modal"
                className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-600 dark:hover:text-stone-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body & Search */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={permissionSearch}
                  onChange={(e) => setPermissionSearch(e.target.value)}
                  placeholder="Filter permissions..."
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-300 focus:outline-none focus:border-amber-500 font-sans"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>
                  {selectedPermissions.length} of {allPermissions.length} selected
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPermissions([...allPermissions])}
                    className="text-amber-600 dark:text-amber-400 hover:underline font-bold cursor-pointer"
                  >
                    Select All
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => setSelectedPermissions([])}
                    className="text-stone-400 hover:text-rose-500 hover:underline cursor-pointer"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              {/* Permissions Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 max-h-80 overflow-y-auto pr-1">
                {filteredPermissions.map((perm) => {
                  const isChecked = selectedPermissions.includes(perm);
                  return (
                    <label
                      key={perm}
                      className={`p-2.5 rounded-xl border text-xs font-mono flex items-center gap-2.5 cursor-pointer transition-all ${
                        isChecked
                          ? "bg-amber-500/10 border-amber-500/40 text-amber-900 dark:text-amber-200 font-bold"
                          : "bg-stone-50 dark:bg-stone-800/50 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:border-amber-500/30"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => togglePermission(perm)}
                        className="rounded border-stone-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                      />
                      <span className="truncate">{perm}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-6 border-t border-stone-200 dark:border-stone-800 flex items-center justify-end gap-3 bg-stone-50/50 dark:bg-stone-100/50">
              <button
                type="button"
                onClick={() => setEditingRole(null)}
                className="px-5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-300 text-xs font-bold text-stone-600 dark:text-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSavePermissions}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? "Saving..." : "Save Permissions"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { AdminRolesPage };
