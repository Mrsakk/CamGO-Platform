import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { queryKeys } from "@/lib/queryKeys";

const AdminAuditLogsPage = () => {
  const [page, setPage] = useState(1);

  const { data: res, isLoading } = useQuery({
    queryKey: queryKeys.auditLogs.list({ page, per_page: 20 }),
    queryFn: () => adminApi.getAuditLogs({ page, per_page: 20 }),
    placeholderData: keepPreviousData,
  });

  const logs = res?.data?.items || (Array.isArray(res?.data) ? res.data : []);
  const meta = res?.meta || null;

  return <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-stone-900 dark:text-white">
          Security & Audit Logs
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Complete chronological activity trail of administrative actions, edits, and deletions
        </p>
      </div>

      <div className="bg-white dark:bg-stone-100 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 dark:bg-stone-800/60 text-stone-500 uppercase tracking-wider font-bold border-b border-stone-200 dark:border-stone-800">
              <tr>
                <th className="p-4">Staff Member</th>
                <th className="p-4">Action</th>
                <th className="p-4">Module / Entity</th>
                <th className="p-4">Details</th>
                <th className="p-4">IP Address</th>
                <th className="p-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-700 dark:text-stone-700">
              {isLoading ? <tr>
                  <td colSpan={6} className="p-8 text-center text-stone-400">Loading audit history...</td>
                </tr> : logs.length === 0 ? <tr>
                  <td colSpan={6} className="p-8 text-center text-stone-400">No audit logs recorded yet</td>
                </tr> : logs.map((log) => <tr key={log.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30">
                    <td className="p-4 font-bold text-stone-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-500 text-small font-bold flex items-center justify-center">
                          {log.user?.name?.charAt(0) || "A"}
                        </div>
                        <span>{log.user?.name || "System / Admin"}</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <span
    className={`px-2 py-0.5 rounded-full text-small font-bold ${log.action === "created" ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300" : log.action === "updated" ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300" : "bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300"}`}
  >
                        {log.action}
                      </span>
                    </td>

                    <td className="p-4 font-mono text-small text-teal-600">
                      {log.auditable_type ? log.auditable_type.split("\\").pop() : "System"} #{log.auditable_id}
                    </td>

                    <td className="p-4 text-stone-500 max-w-xs truncate" title={log.new_values ? JSON.stringify(log.new_values) : ""}>
                      {log.description || (log.new_values ? (typeof log.new_values === "object" ? JSON.stringify(log.new_values) : String(log.new_values)) : "-")}
                    </td>

                    <td className="p-4 font-mono text-small text-stone-400">
                      {log.ip_address || "-"}
                    </td>

                    <td className="p-4 text-stone-400 text-small" title={log.created_at_raw || ""}>
                      {log.created_at || (log.created_at_raw ? log.created_at_raw.substring(0, 19).replace("T", " ") : "-")}
                    </td>
                  </tr>)}
            </tbody>
          </table>
        </div>

        {meta && meta.last_page > 1 && <div className="p-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500">
            <span>
              Showing {logs.length} of {meta.total} audit records
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
  AdminAuditLogsPage
};
