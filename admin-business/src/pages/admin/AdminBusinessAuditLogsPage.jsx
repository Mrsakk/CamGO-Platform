import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  User,
  Clock,
  Eye,
  FileCode,
  CheckCircle,
  X,
} from "lucide-react";
import api from "@/lib/axios";

export const AdminBusinessAuditLogsPage = () => {
  const { t, i18n } = useTranslation();
  const isKm = i18n.language === "km";

  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState("");
  const [selectedLog, setSelectedLog] = useState(null);

  const {
    data: logsData,
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["admin", "audit-logs", page, actionFilter],
    queryFn: async () => {
      const params = { page, per_page: 20 };
      if (actionFilter) params.action = actionFilter;
      const res = await api.get("/admin/business/audit-logs", { params });
      return res.data;
    },
    placeholderData: keepPreviousData,
  });

  const payload = logsData?.data || logsData || {};
  const rawLogs = payload?.items || (Array.isArray(payload) ? payload : []);
  const logs = Array.isArray(rawLogs) ? rawLogs : [];
  const meta = payload?.meta || logsData?.meta || {};

  return (
    <div className="mx-auto max-w-[1280px] space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-700 dark:text-brand-300">
          Accountability
        </p>
        <h1 className="mt-1 text-2xl text-forest dark:text-cream">Audit logs</h1>
        <p className="mt-1 text-sm text-muted dark:text-stone-400">
          Trace every staff action across the business directory.
        </p>
      </div>

      {/* Filters */}
      <div className="portal-surface flex flex-wrap items-center gap-3 p-4">
        <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">
          {isKm ? "ចម្រាញ់តាមសកម្មភាព:" : "Filter by Action:"}
        </label>
        <select
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-control border border-line bg-paper px-3 py-2 text-sm text-forest outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-stone-900 dark:text-stone-200"
        >
          <option value="">{isKm ? "គ្រប់សកម្មភាពទាំងអស់" : "All Actions"}</option>
          <option value="business_created">business_created</option>
          <option value="business_updated">business_updated</option>
          <option value="business_status_changed">business_status_changed</option>
          <option value="business_verified">business_verified</option>
          <option value="business_unverified">business_unverified</option>
          <option value="business_deleted">business_deleted</option>
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="portal-surface overflow-hidden">
        {isLoading && logs.length === 0 ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-500 mb-3" />
            <p className="text-sm text-stone-500 dark:text-stone-400">
              {isKm ? "កំពុងផ្ទុកកំណត់ត្រា..." : "Loading audit trail..."}
            </p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center">
            <ShieldCheck className="w-12 h-12 mx-auto text-stone-300 dark:text-stone-600 mb-3" />
            <p className="text-base font-medium text-stone-700 dark:text-stone-300">
              {isKm ? "មិនមានកំណត់ត្រាសវនកម្មនៅឡើយទេ" : "No audit records found"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-stone-600 dark:text-stone-300">
              <thead className="bg-stone-50 dark:bg-stone-800/60 text-xs uppercase font-medium text-stone-500 dark:text-stone-400 border-b border-stone-200 dark:border-stone-800">
                <tr>
                  <th className="px-6 py-3.5">{isKm ? "កាលបរិច្ឆេទ & ម៉ោង" : "Timestamp"}</th>
                  <th className="px-6 py-3.5">{isKm ? "អ្នកប្រើប្រាស់" : "Staff User"}</th>
                  <th className="px-6 py-3.5">{isKm ? "សកម្មភាព" : "Action"}</th>
                  <th className="px-6 py-3.5">{isKm ? "វត្ថុ / គោលដៅ" : "Subject ID"}</th>
                  <th className="px-6 py-3.5 text-right">{isKm ? "ព័ត៌មានលម្អិត" : "Details"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800 font-mono text-xs">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/40 transition">
                    <td className="px-6 py-4 text-stone-500 dark:text-stone-400 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-sans text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xs font-bold">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-medium text-stone-900 dark:text-white">
                          {log.user?.name || (isKm ? "ប្រព័ន្ធស្វ័យប្រវត្ត" : "System")}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 font-semibold text-stone-700 dark:text-stone-300">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-stone-500">
                      {log.auditable_type ? `${log.auditable_type.split("\\").pop()} #${log.auditable_id}` : `#${log.auditable_id}`}
                    </td>
                    <td className="px-6 py-4 text-right font-sans">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs transition"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-500" />
                        {isKm ? "មើលទិន្នន័យ" : "View Diff"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta.last_page > 1 && (
          <div className="p-4 bg-stone-50 dark:bg-stone-800/50 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs">
            <span className="text-stone-500">
              {isKm ? `ទំព័រ ${meta.current_page} នៃ ${meta.last_page}` : `Page ${meta.current_page} of ${meta.last_page}`}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 rounded border border-stone-300 dark:border-stone-700 disabled:opacity-50"
              >
                {isKm ? "ថយក្រោយ" : "Previous"}
              </button>
              <button
                disabled={page >= meta.last_page}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded border border-stone-300 dark:border-stone-700 disabled:opacity-50"
              >
                {isKm ? "បន្ទាប់" : "Next"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Diff / Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-stone-850 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 dark:border-stone-800 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
              <div>
                <h3 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
                  <FileCode className="w-5 h-5 text-amber-500" />
                  {selectedLog.action}
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  {new Date(selectedLog.created_at).toLocaleString()} by {selectedLog.user?.name || "System"}
                </p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 overflow-y-auto space-y-4 flex-1 pr-1">
              {/* Old Values */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-rose-500 mb-1">
                  {isKm ? "ទិន្នន័យមុន (Old Values / Before)" : "Before (Old Values)"}
                </label>
                <pre className="p-3 bg-stone-900 text-rose-300 rounded-lg text-xs font-mono overflow-x-auto whitespace-pre-wrap max-h-48">
                  {JSON.stringify(selectedLog.old_values || {}, null, 2)}
                </pre>
              </div>

              {/* New Values */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-emerald-500 mb-1">
                  {isKm ? "ទិន្នន័យថ្មី (New Values / After)" : "After (New Values)"}
                </label>
                <pre className="p-3 bg-stone-900 text-emerald-300 rounded-lg text-xs font-mono overflow-x-auto whitespace-pre-wrap max-h-48">
                  {JSON.stringify(selectedLog.new_values || {}, null, 2)}
                </pre>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex justify-end mt-4">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-sm font-medium hover:bg-stone-200 transition"
              >
                {isKm ? "បិទ" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
