import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  BarChart3,
  FileSpreadsheet,
  Printer,
  Download,
  Calendar,
  Building,
  TrendingUp,
  PhoneCall,
  Send,
  Mail,
  Compass,
  CheckCircle,
  ExternalLink,
  RefreshCw,
  Search,
} from "lucide-react";
import api from "@/lib/axios";
import { toast } from "@/store/toastStore";

import { useDebounce } from "@/lib/useDebounce";

export const AdminBusinessReportsPage = () => {
  const { t, i18n } = useTranslation();
  const isKm = i18n.language === "km";

  const currentYearMonth = new Date().toISOString().slice(0, 7); // e.g. "2026-10"
  const [selectedMonth, setSelectedMonth] = useState(currentYearMonth);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [businessSearch, setBusinessSearch] = useState("");
  const debouncedBusinessSearch = useDebounce(businessSearch, 300);

  // Fetch overall stats (shares cache with AdminBusinessDashboardPage)
  const {
    data: statsData,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ["admin", "business", "stats"],
    queryFn: async () => {
      const res = await api.get("/admin/business/stats");
      return res.data;
    },
  });

  // Fetch business list for dropdown
  const { data: businessesData } = useQuery({
    queryKey: ["admin", "businesses", "selector", debouncedBusinessSearch],
    queryFn: async () => {
      const res = await api.get("/admin/business/businesses", {
        params: { per_page: 50, search: debouncedBusinessSearch },
      });
      return res.data;
    },
  });

  const rawBusinesses =
    businessesData?.data?.items ||
    businessesData?.items ||
    (Array.isArray(businessesData?.data) ? businessesData.data : []);
  const businesses = Array.isArray(rawBusinesses) ? rawBusinesses : [];
  const stats = statsData?.data || statsData || {};
  const overview = stats?.overview || stats?.totals || {};
  const channelCounts = stats?.channels || {};
  const topBusinesses = stats?.top_businesses || [];

  const handleDownloadCsv = () => {
    if (!selectedBusinessId) {
      toast.error(isKm ? "សូមជ្រើសរើសអាជីវកម្មជាមុនសិន" : "Please select a business first");
      return;
    }
    const url = `/admin/business/businesses/${selectedBusinessId}/report?month=${selectedMonth}&format=csv`;

    // Fetch as blob with auth header
    api
      .get(url, { responseType: "blob" })
      .then((response) => {
        const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = blobUrl;
        link.setAttribute("download", `business-report-${selectedBusinessId}-${selectedMonth}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success(isKm ? "បានទាញយករបាយការណ៍ CSV" : "Downloaded CSV report");
      })
      .catch((err) => {
        toast.error(isKm ? "ការទាញយករបាយការណ៍បរាជ័យ" : "Report download failed");
      });
  };

  const handlePrintHtml = () => {
    if (!selectedBusinessId) {
      toast.error(isKm ? "សូមជ្រើសរើសអាជីវកម្មជាមុនសិន" : "Please select a business first");
      return;
    }
    api
      .get(`/admin/business/businesses/${selectedBusinessId}/report?month=${selectedMonth}&format=html`)
      .then((res) => {
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          printWindow.document.write(res.data);
          printWindow.document.close();
        }
      })
      .catch(() => {
        toast.error("Failed to render printable report");
      });
  };

  return (
    <div className="mx-auto max-w-[1280px] space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-700 dark:text-brand-300">
          Business analytics
        </p>
        <h1 className="mt-1 text-2xl text-forest dark:text-cream">Analytics & reports</h1>
        <p className="mt-1 text-sm text-muted dark:text-stone-400">
          Monitor directory performance and export owner-ready monthly reports.
        </p>
      </div>

      {/* Top Level Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="portal-surface p-5">
          <p className="text-xs uppercase font-medium text-stone-500 dark:text-stone-400">
            {isKm ? "ទំនាក់ទំនងសរុប (៣០ ថ្ងៃ)" : "Contacts (30 Days)"}
          </p>
          <p className="text-3xl font-extrabold text-stone-900 dark:text-white mt-2">
            {overview.contacts_30d?.toLocaleString() ?? 0}
          </p>
          <p className="text-xs text-stone-400 mt-1">
            {isKm ? `${overview.contacts_7d ?? 0} ក្នុង ៧ ថ្ងៃចុងក្រោយ` : `${overview.contacts_7d ?? 0} in last 7 days`}
          </p>
        </div>

        <div className="portal-surface p-5">
          <p className="text-xs uppercase font-medium text-stone-500 dark:text-stone-400">
            {isKm ? "អាជីវកម្មបានអនុម័ត" : "Approved Businesses"}
          </p>
          <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
            {overview.approved_businesses?.toLocaleString() ?? 0}
          </p>
          <p className="text-xs text-stone-400 mt-1">
            {isKm ? `នៃអាជីវកម្មសរុប ${overview.total_businesses ?? 0}` : `of ${overview.total_businesses ?? 0} total`}
          </p>
        </div>

        <div className="portal-surface p-5">
          <p className="text-xs uppercase font-medium text-stone-500 dark:text-stone-400">
            {isKm ? "អាជីវកម្មបានផ្ទៀងផ្ទាត់ (Verified)" : "Verified Businesses"}
          </p>
          <p className="text-3xl font-extrabold text-amber-500 mt-2">
            {overview.verified_businesses?.toLocaleString() ?? 0}
          </p>
          <p className="text-xs text-stone-400 mt-1">
            {isKm ? "មានឯកសារ KYC ត្រឹមត្រូវ" : "With approved KYC"}
          </p>
        </div>

        <div className="portal-surface p-5">
          <p className="text-xs uppercase font-medium text-stone-500 dark:text-stone-400">
            {isKm ? "មតិវាយតម្លៃសរុប" : "Total Reviews"}
          </p>
          <p className="text-3xl font-extrabold text-stone-900 dark:text-white mt-2">
            {overview.total_reviews?.toLocaleString() ?? 0}
          </p>
          <p className="text-xs text-stone-400 mt-1">
            {isKm ? `${overview.pending_reviews ?? 0} រង់ចាំការអនុម័ត` : `${overview.pending_reviews ?? 0} pending review`}
          </p>
        </div>
      </div>

      {/* Monthly Business Report Export Section */}
      <div className="portal-surface p-6">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-700 dark:text-amber-300 mb-3">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            {isKm ? "ការទាញយករបាយការណ៍ប្រចាំខែសម្រាប់ម្ចាស់អាជីវកម្ម" : "Owner Monthly Performance Report"}
          </div>
          <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-2">
            {isKm ? "បង្កើតរបាយការណ៍ទំនាក់ទំនងប្រចាំខែ" : "Generate Monthly Contact Report"}
          </h2>
          <p className="text-sm text-stone-600 dark:text-stone-300 mb-6">
            {isKm
              ? "ជ្រើសរើសអាជីវកម្ម និងខែដែលចង់បាន ដើម្បីទាញយកទិន្នន័យជាទម្រង់ CSV ឬបោះពុម្ពជាទម្រង់ Printable Report ស្អាតបាតសម្រាប់ផ្ញើជូនម្ចាស់អាជីវកម្មតាមតេឡេក្រាម ឬអ៊ីមែល។"
              : "Select a business and month to export detailed contact metrics, views, channel distribution, and tourist engagement. Available in CSV format or clean Printable Report."}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {/* Business Selector */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5">
                {isKm ? "ជ្រើសរើសអាជីវកម្ម *" : "Select Business *"}
              </label>
              <select
                value={selectedBusinessId}
                onChange={(e) => setSelectedBusinessId(e.target.value)}
                className="portal-input px-3.5"
              >
                <option value="">
                  {isKm ? "-- ជ្រើសរើសអាជីវកម្ម --" : "-- Select a business --"}
                </option>
                {businesses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name_km} ({b.name_en}) - {b.province?.name_km || ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Month Picker */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5">
                {isKm ? "ខែរបាយការណ៍" : "Report Month"}
              </label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="portal-input px-3.5"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleDownloadCsv}
              disabled={!selectedBusinessId}
              className="inline-flex items-center gap-2 rounded-control bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-premium transition hover:bg-emerald-700 disabled:opacity-40"
            >
              <Download className="w-4 h-4" />
              {isKm ? "ទាញយក CSV" : "Download CSV"}
            </button>
            <button
              onClick={handlePrintHtml}
              disabled={!selectedBusinessId}
              className="inline-flex items-center gap-2 rounded-control bg-brand-500 px-5 py-2.5 text-sm font-semibold text-forest shadow-gold transition hover:bg-brand-400 disabled:opacity-40"
            >
              <Printer className="w-4 h-4" />
              {isKm ? "មើលរបាយការណ៍ / បោះពុម្ព (HTML/PDF)" : "Printable Report (HTML/PDF)"}
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Channel Breakdown & Top 10 Businesses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Channel Breakdown */}
        <div className="portal-surface p-6">
          <h3 className="text-base font-bold text-stone-900 dark:text-white mb-4 flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-amber-500" />
            {isKm ? "ការទំនាក់ទំនងតាមបណ្តាញនីមួយៗ (៣០ ថ្ងៃ)" : "Contacts by Channel (30 Days)"}
          </h3>

          <div className="space-y-3">
            {[
              { key: "phone", label: isKm ? "ការហៅទូរស័ព្ទ" : "Phone Call", icon: PhoneCall, color: "bg-blue-500" },
              { key: "telegram", label: "Telegram", icon: Send, color: "bg-sky-500" },
              { key: "whatsapp", label: "WhatsApp", icon: PhoneCall, color: "bg-emerald-500" },
              { key: "messenger", label: "Facebook Messenger", icon: Send, color: "bg-indigo-500" },
              { key: "email", label: isKm ? "អ៊ីមែល" : "Email", icon: Mail, color: "bg-rose-500" },
              { key: "directions", label: isKm ? "ការស្វែងរកទិសដៅ" : "Directions", icon: Compass, color: "bg-amber-500" },
            ].map((channel) => {
              const count = channelCounts[channel.key] || 0;
              const total = overview.contacts_30d || 1;
              const percent = Math.min(100, Math.round((count / (total || 1)) * 100));

              return (
                <div key={channel.key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                      <channel.icon className="w-3.5 h-3.5 text-stone-400" />
                      {channel.label}
                    </span>
                    <span className="text-stone-900 dark:text-white font-bold">
                      {count.toLocaleString()} ({percent}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${channel.color} transition-all duration-500`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top 10 Businesses */}
        <div className="portal-surface p-6">
          <h3 className="text-base font-bold text-stone-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-500" />
            {isKm ? "អាជីវកម្មដែលមានទំនាក់ទំនងច្រើនជាងគេ" : "Top Contacted Businesses"}
          </h3>

          {topBusinesses.length === 0 ? (
            <p className="text-sm text-stone-400 py-6 text-center">
              {isKm ? "មិនទាន់មានទិន្នន័យគ្រប់គ្រាន់" : "No contact events recorded yet"}
            </p>
          ) : (
            <div className="divide-y divide-stone-100 dark:divide-stone-800">
              {topBusinesses.map((b, idx) => (
                <div key={b.id || idx} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </span>
                    <div className="truncate">
                      <p className="text-sm font-semibold text-stone-900 dark:text-white truncate">
                        {isKm ? b.name_km : b.name_en}
                      </p>
                      <p className="text-xs text-stone-400">
                        {b.category_name || b.province_name || ""}
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs shrink-0">
                    {b.contacts_count || b.events_count || 0} {isKm ? "ទំនាក់ទំនង" : "contacts"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
