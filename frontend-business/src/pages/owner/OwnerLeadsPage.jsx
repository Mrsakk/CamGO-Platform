import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Download,
  Loader2,
  MessageSquare,
  Phone,
  RefreshCw,
  Send,
  Target,
  Users,
} from "lucide-react";
import api from "@/lib/ownerApi";
import { QueryError } from "@/components/common/QueryError";
import { toast } from "@/store/toastStore";
import { useAuthStore } from "@/store/authStore";

const statuses = [
  { key: "new", km: "ថ្មី", en: "New", color: "bg-sky-500/10 text-sky-600 border-sky-500/20" },
  { key: "contacted", km: "បានទាក់ទង", en: "Contacted", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  { key: "qualified", km: "មានសក្តានុពល", en: "Qualified", color: "bg-violet-500/10 text-violet-600 border-violet-500/20" },
  { key: "won", km: "ទទួលបាន", en: "Won", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  { key: "lost", km: "បាត់បង់", en: "Lost", color: "bg-stone-500/10 text-stone-500 border-stone-500/20" },
];

const channelMeta = {
  phone: { km: "ទូរស័ព្ទ", en: "Phone", icon: Phone },
  telegram: { km: "Telegram", en: "Telegram", icon: Send },
  whatsapp: { km: "WhatsApp", en: "WhatsApp", icon: MessageSquare },
  messenger: { km: "Messenger", en: "Messenger", icon: MessageSquare },
  email: { km: "អ៊ីមែល", en: "Email", icon: MessageSquare },
  website: { km: "គេហទំព័រ", en: "Website", icon: Target },
};

const formatDate = (value, isKm) => {
  if (!value) return "—";
  return new Date(value).toLocaleString(isKm ? "km-KH" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const OwnerLeadsPage = () => {
  const { i18n } = useTranslation();
  const isKm = i18n.language === "km";
  const queryClient = useQueryClient();
  const { hasBusinessCapability } = useAuthStore();
  const canManage = hasBusinessCapability("leads.manage");

  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [editingLead, setEditingLead] = useState(null);
  const [editForm, setEditForm] = useState({ status: "new", note: "" });

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ["owner-leads", statusFilter, page],
    queryFn: async () => {
      const params = { page, per_page: 15 };
      if (statusFilter !== "all") params.status = statusFilter;
      const res = await api.get("/business/me/leads", { params });
      return res.data;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["owner-lead-stats"],
    queryFn: async () => {
      const res = await api.get("/business/me/leads/stats?days=90");
      return res.data?.data || res.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      const res = await api.put(`/business/me/leads/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success(isKm ? "បានធ្វើបច្ចុប្បន្នភាពអតិថិជន!" : "Lead updated successfully!");
      setEditingLead(null);
      queryClient.invalidateQueries({ queryKey: ["owner-leads"] });
      queryClient.invalidateQueries({ queryKey: ["owner-lead-stats"] });
      queryClient.invalidateQueries({ queryKey: ["owner-stats"] });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
        (isKm ? "មិនអាចធ្វើបច្ចុប្បន្នភាពបានទេ" : "Could not update lead")
      );
    },
  });

  const leads = Array.isArray(data?.data) ? data.data : [];
  const meta = data?.meta || {};

  const exportMutation = useMutation({
    mutationFn: async () => {
      const params = {};
      if (statusFilter !== "all") params.status = statusFilter;
      return api.get("/business/me/leads/export", { params, responseType: "blob" });
    },
    onSuccess: (response) => {
      const disposition = response.headers?.["content-disposition"] || "";
      const filename = disposition.match(/filename="?([^";]+)"?/i)?.[1] || "leads.csv";
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success(isKm ? "បាននាំចេញអតិថិជនដោយជោគជ័យ!" : "Leads exported successfully!");
    },
    onError: async (error) => {
      let message = isKm ? "មិនអាចនាំចេញអតិថិជនបានទេ" : "Could not export leads";
      const payload = error.response?.data;
      if (payload instanceof Blob) {
        try {
          const parsed = JSON.parse(await payload.text());
          message = parsed.message || message;
        } catch {
          // Keep the fallback message for non-JSON responses.
        }
      } else if (payload?.message) {
        message = payload.message;
      }
      toast.error(message);
    },
  });

  const openLead = (lead) => {
    setEditingLead(lead);
    setEditForm({ status: lead.status || "new", note: lead.note || "" });
  };

  const statCards = [
    {
      label: isKm ? "អតិថិជនសរុប" : "Total leads",
      value: stats?.total || 0,
      icon: Users,
      color: "text-sky-600 bg-sky-500/10",
    },
    {
      label: isKm ? "ថ្មីត្រូវតាមដាន" : "New to follow up",
      value: stats?.new || 0,
      icon: MessageSquare,
      color: "text-amber-600 bg-amber-500/10",
    },
    {
      label: isKm ? "មានសក្តានុពល" : "Qualified",
      value: stats?.qualified || 0,
      icon: Target,
      color: "text-violet-600 bg-violet-500/10",
    },
    {
      label: isKm ? "អត្រាបំប្លែង" : "Conversion rate",
      value: `${stats?.conversion_rate || 0}%`,
      icon: CheckCircle2,
      color: "text-emerald-600 bg-emerald-500/10",
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">


      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="p-4 rounded-2xl bg-white dark:bg-stone-850 border border-stone-200/80 dark:border-stone-800 shadow-sm">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="mt-3 text-2xl font-extrabold text-stone-900 dark:text-white">{card.value}</div>
              <div className="text-xs text-stone-500">{card.label}</div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => {
            setStatusFilter("all");
            setPage(1);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${statusFilter === "all"
            ? "bg-stone-900 dark:bg-white text-white dark:text-stone-900 border-transparent"
            : "bg-white dark:bg-stone-850 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400"
            }`}
        >
          {isKm ? "ទាំងអស់" : "All"}
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-stone-850 border border-stone-200 dark:border-stone-800 text-xs font-bold text-stone-700 dark:text-stone-300"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
            {isKm ? "ផ្ទុកឡើងវិញ" : "Refresh"}
          </button>
          <button
            onClick={() => exportMutation.mutate()}
            disabled={exportMutation.isPending}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold disabled:opacity-50"
          >
            {exportMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {isKm ? "នាំចេញ CSV" : "Export CSV"}
          </button>
        </div>
        {statuses.map((status) => (
          <button
            key={status.key}
            onClick={() => {
              setStatusFilter(status.key);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${statusFilter === status.key
              ? "bg-amber-500 text-stone-950 border-amber-500"
              : "bg-white dark:bg-stone-850 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400"
              }`}
          >
            {isKm ? status.km : status.en}
          </button>
        ))}
      </div>

      {isError ? (
        <QueryError onRetry={refetch} isRetrying={isFetching} />
      ) : isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-stone-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          {isKm ? "កំពុងផ្ទុកអតិថិជន..." : "Loading leads..."}
        </div>
      ) : leads.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-850 p-12 text-center space-y-3">
          <MessageSquare className="w-10 h-10 text-stone-300 dark:text-stone-600 mx-auto" />
          <h3 className="font-bold text-stone-900 dark:text-white">
            {isKm ? "មិនមានអតិថិជនទេ" : "No leads yet"}
          </h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            {isKm
              ? "នៅពេលភ្ញៀវចុចទូរស័ព្ទ ឬផ្ញើសារពីទំព័រអាជីវកម្ម ពួកគេនឹងបង្ហាញនៅទីនេះដោយស្វ័យប្រវត្តិ។"
              : "When visitors tap call or message on your public profile, they will appear here automatically."}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-stone-850 border border-stone-200/80 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="divide-y divide-stone-100 dark:divide-stone-800">
            {leads.map((lead) => {
              const channel = channelMeta[lead.primary_channel] || channelMeta.website;
              const Icon = channel.icon;
              const status = statuses.find((item) => item.key === lead.status) || statuses[0];
              return (
                <div key={lead.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-stone-600 dark:text-stone-300" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-stone-900 dark:text-white">
                          {isKm ? channel.km : channel.en}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${status.color}`}>
                          {isKm ? status.km : status.en}
                        </span>
                      </div>
                      <div className="text-xs text-stone-500 mt-1 flex flex-wrap items-center gap-3">
                        <span>
                          {isKm ? "ទាក់ទង" : "Contacts"}: <strong>{lead.contact_count}</strong>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(lead.last_contact_at, isKm)}
                        </span>
                        {lead.locale ? (
                          <span className="uppercase text-[10px] font-bold text-stone-400">{lead.locale}</span>
                        ) : null}
                      </div>
                      {lead.note ? (
                        <p className="mt-1 text-xs text-stone-400 line-clamp-1">{lead.note}</p>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:justify-end">
                    <span className="text-[10px] text-stone-400 hidden sm:inline">
                      #{lead.id}
                    </span>
                    {canManage && (
                      <button
                        onClick={() => openLead(lead)}
                        className="px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-amber-500 hover:text-stone-950 text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5 transition"
                      >
                        {isKm ? "គ្រប់គ្រង" : "Manage"}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between px-5 py-3 border-t border-stone-100 dark:border-stone-800 text-xs">
            <span className="text-stone-500">
              {isKm ? `សរុប ${meta.total || 0} នាក់` : `${meta.total || 0} leads`}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                className="px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 disabled:opacity-40 font-semibold"
              >
                {isKm ? "មុន" : "Prev"}
              </button>
              <span className="text-stone-500">
                {meta.current_page || 1} / {meta.last_page || 1}
              </span>
              <button
                disabled={!meta.has_more_pages}
                onClick={() => setPage((value) => value + 1)}
                className="px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 disabled:opacity-40 font-semibold"
              >
                {isKm ? "បន្ទាប់" : "Next"}
              </button>
            </div>
          </div>
        </div>
      )}

      {editingLead && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-stone-850 rounded-3xl p-6 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-5">
            <div>
              <h3 className="font-extrabold text-lg text-stone-900 dark:text-white">
                {isKm ? "គ្រប់គ្រងអតិថិជន" : "Manage Lead"}
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                {isKm ? "កំណត់ដំណាក់កាល និងកត់ត្រាកំណត់សម្គាល់របស់អ្នក។" : "Set the pipeline stage and record your follow-up notes."}
              </p>
            </div>

            <label className="block space-y-1.5">
              <span className="text-xs font-bold text-stone-500 uppercase">
                {isKm ? "ដំណាក់កាល" : "Stage"}
              </span>
              <select
                value={editForm.status}
                onChange={(event) => setEditForm({ ...editForm, status: event.target.value })}
                className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 px-3.5 py-2.5 text-sm"
              >
                {statuses.map((status) => (
                  <option key={status.key} value={status.key}>
                    {isKm ? status.km : status.en}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-bold text-stone-500 uppercase">
                {isKm ? "កំណត់សម្គាល់" : "Private note"}
              </span>
              <textarea
                rows={4}
                value={editForm.note}
                onChange={(event) => setEditForm({ ...editForm, note: event.target.value })}
                placeholder={isKm ? "ឧ. បានទូរស័ព្ទហើយ ត្រូវផ្ញើតម្លៃនៅថ្ងៃស្អែក..." : "E.g. Called already, send pricing tomorrow..."}
                className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 px-3.5 py-2.5 text-sm"
              />
            </label>

            <div className="flex justify-end gap-3 pt-3 border-t border-stone-200 dark:border-stone-800">
              <button
                onClick={() => setEditingLead(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-stone-500"
              >
                {isKm ? "បិទ" : "Cancel"}
              </button>
              <button
                onClick={() =>
                  updateMutation.mutate({
                    id: editingLead.id,
                    payload: { status: editForm.status, note: editForm.note.trim() || null },
                  })
                }
                disabled={updateMutation.isPending}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs flex items-center gap-2 disabled:opacity-50"
              >
                {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {isKm ? "រក្សាទុក" : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
