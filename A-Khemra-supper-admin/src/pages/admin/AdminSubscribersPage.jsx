import { useState } from "react";
import { Download, Trash2, Mail } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { queryKeys } from "@/lib/queryKeys";
import { toast } from "@/store/toastStore";

const AdminSubscribersPage = () => {
  const queryClient = useQueryClient();
  const [isExporting, setIsExporting] = useState(false);

  const { data: subsRes, isLoading } = useQuery({
    queryKey: queryKeys.subscribers.all(),
    queryFn: () => adminApi.getSubscribers(),
  });

  const subscribers = subsRes?.data?.items || (Array.isArray(subsRes?.data) ? subsRes.data : []);

  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      const blob = await adminApi.exportSubscribersCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `camgo_subscribers_${(/* @__PURE__ */ new Date()).toISOString().substring(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success("Subscriber list exported as CSV");
    } catch (err) {
      toast.error("Failed to export CSV");
    } finally {
      setIsExporting(false);
    }
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Delete subscriber?")) return;
    try {
      await adminApi.deleteSubscriber(id);
      queryClient.invalidateQueries({ queryKey: queryKeys.subscribers.all() });
      toast.success("Subscriber removed");
    } catch (err) {
      toast.error("Failed to remove subscriber");
    }
  };
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-stone-900 dark:text-white">
            Newsletter Subscribers
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Registered travelers receiving tourism updates and promotional guides
          </p>
        </div>

        <button
    onClick={handleExportCsv}
    disabled={isExporting || subscribers.length === 0}
    className="px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5"
  >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      <div className="bg-white dark:bg-stone-100 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 dark:bg-stone-800/60 text-stone-500 uppercase tracking-wider font-bold border-b border-stone-200 dark:border-stone-800">
              <tr>
                <th className="p-4">Email</th>
                <th className="p-4">Status</th>
                <th className="p-4">Subscribed Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-700 dark:text-stone-700">
              {isLoading ? <tr>
                  <td colSpan={4} className="p-8 text-center text-stone-400">Loading subscribers...</td>
                </tr> : subscribers.length === 0 ? <tr>
                  <td colSpan={4} className="p-8 text-center text-stone-400">No subscribers yet</td>
                </tr> : subscribers.map((s) => <tr key={s.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30">
                    <td className="p-4 font-bold text-stone-900 dark:text-white flex items-center gap-2">
                      <Mail className="w-4 h-4 text-teal-600" />
                      <span>{s.email}</span>
                    </td>

                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-small font-bold">
                        {s.is_active ? "Active" : "Unsubscribed"}
                      </span>
                    </td>

                    <td className="p-4 text-stone-400">
                      {s.created_at?.substring(0, 10)}
                    </td>

                    <td className="p-4 text-right">
                      <button
    onClick={() => handleDelete(s.id)}
    className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
  >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>;
};
export {
  AdminSubscribersPage
};
