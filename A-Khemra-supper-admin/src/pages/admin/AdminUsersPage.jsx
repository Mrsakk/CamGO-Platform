import { useState } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { queryKeys } from "@/lib/queryKeys";
import { useDebounce } from "@/lib/useDebounce";
import { toast } from "@/store/toastStore";
import { getImageUrl } from "@/lib/utils";

const AdminUsersPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);

  const userFilters = {
    search: debouncedSearch.trim() || void 0,
    role: roleFilter || void 0,
    page,
    per_page: 15,
  };

  const { data: res, isLoading } = useQuery({
    queryKey: queryKeys.users.list(userFilters),
    queryFn: () => adminApi.getUsers(userFilters),
    placeholderData: keepPreviousData,
  });

  const users = res?.data ? (Array.isArray(res.data) ? res.data : res.data.items || []) : [];
  const meta = res?.meta || null;
  const availableRoles = res?.roles && Array.isArray(res.roles) && res.roles.length > 0
    ? res.roles
    : [
        "Super Admin",
        "Content Manager",
        "Moderator",
        "Tourist",
        "Business Owner"
      ];

  const handleRoleChange = async (userId, newRole) => {
    try {
      const resp = await adminApi.updateUserRole(userId, newRole);
      if (resp.data) {
        queryClient.invalidateQueries({ queryKey: queryKeys.users.all() });
        toast.success(`User role updated to ${newRole}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update user role");
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      const resp = await adminApi.toggleUserStatus(userId);
      if (resp.data) {
        queryClient.invalidateQueries({ queryKey: queryKeys.users.all() });
        toast.success("User status updated");
      }
    } catch (err) {
      toast.error("Failed to toggle status");
    }
  };
  return <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-stone-900 dark:text-white">
          User Accounts & Roles
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Manage registered tourists, content managers, moderators, and assign roles
        </p>
      </div>

      {
    /* Filter Bar */
  }
      <div className="bg-white dark:bg-stone-100 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
    type="text"
    value={search}
    onChange={(e) => {
      setSearch(e.target.value);
      setPage(1);
    }}
    placeholder="Search user name or email..."
    className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-300 focus:outline-none focus:border-amber-500"
  />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="py-2 px-3 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-300 focus:outline-none focus:border-amber-500"
        >
          <option value="">All Roles</option>
          {availableRoles.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-stone-100 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 dark:bg-stone-800/60 text-stone-500 uppercase tracking-wider font-bold border-b border-stone-200 dark:border-stone-800">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Country</th>
                <th className="p-4">Role Assignment</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-700 dark:text-stone-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-stone-400">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-stone-400">
                    No users found matching search
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const currentRole = u.roles?.[0] || availableRoles[0] || "Tourist";
                  return (
                    <tr key={u.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {u.avatar ? (
                            <img
                              src={getImageUrl(u.avatar)}
                              alt={u.name}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || "User")}&background=c2410c&color=fff&bold=true`;
                              }}
                              className="w-9 h-9 rounded-full object-cover border border-amber-500"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-teal-800 text-white font-bold text-xs flex items-center justify-center">
                              {(u.name || u.email || "U").charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-stone-900 dark:text-stone-900 block">
                              {u.name}
                            </span>
                            <span className="text-small text-stone-400">{u.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 text-stone-500 font-mono text-small">
                        {u.phone || "—"}
                      </td>

                      <td className="p-4 font-medium">{u.country || "—"}</td>

                      <td className="p-4">
                        <select
                          value={currentRole}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-300 focus:outline-none focus:border-amber-500"
                        >
                          {availableRoles.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="p-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(u.id)}
                          className={`px-2.5 py-1 rounded-full text-small font-bold transition-colors ${u.is_active ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300" : "bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300"}`}
                        >
                          {u.is_active ? "Active" : "Deactivated"}
                        </button>
                      </td>

                      <td className="p-4 text-stone-400 text-small">
                        {u.created_at?.substring(0, 10)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {meta && meta.last_page > 1 && <div className="p-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500">
            <span>
              Showing {users.length} of {meta.total} users
            </span>
            <div className="flex items-center gap-1">
              <button
    disabled={page <= 1}
    onClick={() => setPage((p) => p - 1)}
    className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-800 disabled:opacity-40"
  >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 font-semibold">
                Page {page} of {meta.last_page}
              </span>
              <button
    disabled={page >= meta.last_page}
    onClick={() => setPage((p) => p + 1)}
    className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-800 disabled:opacity-40"
  >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>}
      </div>
    </div>;
};
export {
  AdminUsersPage
};
