import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Users,
  Compass,
  Star,
  Clock,
  TrendingUp,
  MapPin,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ShieldAlert,
  Activity
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import { adminApi } from "@/lib/api/admin";
import { toast } from "@/store/toastStore";
const AdminDashboardPage = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [chartDays, setChartDays] = useState(30);
  const [chartData, setChartData] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [topDestinations, setTopDestinations] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [statsRes, chartRes, reviewsRes, destRes, auditRes] = await Promise.allSettled([
        adminApi.getStats(),
        adminApi.getUserRegistrations(chartDays),
        adminApi.getReviews({ status: "pending", per_page: 5 }),
        adminApi.getDestinations({ sort_by: "top_rated", per_page: 5 }),
        adminApi.getAuditLogs({ per_page: 6 })
      ]);

      if (statsRes.status === "fulfilled" && statsRes.value) {
        const payload = statsRes.value.data || statsRes.value;
        if (payload && typeof payload === "object") {
          const counters = payload.counters || payload;
          setStats((prev) => ({ ...prev, ...payload, ...counters }));
        }
      }

      if (chartRes.status === "fulfilled" && chartRes.value) {
        const rawChart = chartRes.value.data || chartRes.value;
        setChartData(Array.isArray(rawChart) ? rawChart : rawChart.items || []);
      }
      if (reviewsRes.status === "fulfilled" && reviewsRes.value) {
        const rawRev = reviewsRes.value.data || reviewsRes.value;
        setPendingReviews(Array.isArray(rawRev) ? rawRev : rawRev.items || []);
      }
      if (destRes.status === "fulfilled" && destRes.value) {
        const rawDest = destRes.value.data || destRes.value;
        setTopDestinations(Array.isArray(rawDest) ? rawDest : rawDest.items || []);
      }
      if (auditRes.status === "fulfilled" && auditRes.value) {
        const rawAudit = auditRes.value.data || auditRes.value;
        setAuditLogs(Array.isArray(rawAudit) ? rawAudit : rawAudit.items || []);
      }
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchDashboardData();
  }, [chartDays]);
  const handleApproveReview = async (id) => {
    try {
      await adminApi.approveReview(id);
      setPendingReviews((prev) => prev.filter((r) => r.id !== id));
      toast.success("Review approved and published");
    } catch (err) {
      toast.error("Failed to approve review");
    }
  };
  const handleRejectReview = async (id) => {
    try {
      await adminApi.rejectReview(id);
      setPendingReviews((prev) => prev.filter((r) => r.id !== id));
      toast.info("Review rejected");
    } catch (err) {
      toast.error("Failed to reject review");
    }
  };
  if (isLoading || !stats) {
    return <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 rounded-full border-4 border-amber-500 border-t-transparent animate-spin mb-4" />
        <p className="text-sm font-semibold text-stone-500">Loading Admin Dashboard...</p>
      </div>;
  }
  return <div className="space-y-8">
      {
    /* Title */
  }
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white tracking-tight">
          Tourism Platform Overview
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
          Monitor tourist engagement, review approvals, destination directory, and platform metrics
        </p>
      </div>

      {
    /* 1. KEY STATS CARDS */
  }
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {
    /* Total Users */
  }
        <div className="p-5 rounded-2xl bg-white dark:bg-stone-100 border border-stone-200 dark:border-stone-800 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Total Users
            </span>
            <div className="text-2xl font-black text-stone-900 dark:text-white">
              {stats.total_users.toLocaleString()}
            </div>
            <span className="text-small text-teal-600 font-medium">Registered tourists & staff</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {
    /* Total Destinations */
  }
        <div className="p-5 rounded-2xl bg-white dark:bg-stone-100 border border-stone-200 dark:border-stone-800 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Destinations
            </span>
            <div className="text-2xl font-black text-stone-900 dark:text-white">
              {stats.total_destinations.toLocaleString()}
            </div>
            <span className="text-small text-amber-600 font-medium">Across 25 provinces</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center">
            <Compass className="w-6 h-6" />
          </div>
        </div>

        {
    /* Total Reviews */
  }
        <div className="p-5 rounded-2xl bg-white dark:bg-stone-100 border border-stone-200 dark:border-stone-800 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Tourist Reviews
            </span>
            <div className="text-2xl font-black text-stone-900 dark:text-white">
              {stats.total_reviews.toLocaleString()}
            </div>
            <span className="text-small text-emerald-600 font-medium">Approved & published</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
            <Star className="w-6 h-6" />
          </div>
        </div>

        {
    /* Pending Reviews Moderation Alert */
  }
        <div className="p-5 rounded-2xl bg-white dark:bg-stone-100 border border-stone-200 dark:border-stone-800 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Pending Reviews
            </span>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {stats.pending_reviews}
            </div>
            <Link
    to="/admin/reviews"
    className="text-small text-amber-600 hover:underline font-semibold flex items-center gap-1"
  >
              <span>Moderate now</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {
    /* 2. REGISTRATIONS CHART & PENDING MODERATION */
  }
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {
    /* User Registration Trend Chart (2 Cols) */
  }
        <div className="lg:col-span-2 bg-white dark:bg-stone-100 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-stone-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-500" />
                <span>Tourist Registrations Growth</span>
              </h3>
              <p className="text-xs text-stone-500">New user signups over time</p>
            </div>

            {
    /* Timeframe toggle */
  }
            <div className="flex bg-stone-100 dark:bg-stone-800 rounded-xl p-1 text-xs font-bold">
              <button
    onClick={() => setChartDays(7)}
    className={`px-3 py-1 rounded-lg transition-colors ${chartDays === 7 ? "bg-amber-500 text-stone-950 shadow-sm" : "text-stone-500"}`}
  >
                7 Days
              </button>
              <button
    onClick={() => setChartDays(30)}
    className={`px-3 py-1 rounded-lg transition-colors ${chartDays === 30 ? "bg-amber-500 text-stone-950 shadow-sm" : "text-stone-500"}`}
  >
                30 Days
              </button>
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="date" stroke="#888888" fontSize={11} />
                <YAxis stroke="#888888" fontSize={11} allowDecimals={false} />
                <Tooltip
    contentStyle={{
      backgroundColor: "#1c1917",
      borderColor: "#292524",
      borderRadius: "0.75rem",
      color: "#fff",
      fontSize: "12px"
    }}
  />
                <Line
    type="monotone"
    dataKey="count"
    stroke="#D4A017"
    strokeWidth={3}
    dot={{ r: 4, fill: "#0F766E" }}
    activeDot={{ r: 6 }}
  />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {
    /* Pending Reviews Moderation Quick Widget (1 Col) */
  }
        <div className="bg-white dark:bg-stone-100 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <h3 className="font-bold text-base text-stone-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-500" />
                <span>Pending Reviews</span>
              </h3>
              <Link to="/admin/reviews" className="text-xs text-teal-600 dark:text-teal-400 hover:underline">
                View all ({stats.pending_reviews})
              </Link>
            </div>

            <div className="divide-y divide-stone-100 dark:divide-stone-800 mt-2">
              {pendingReviews.length === 0 ? <div className="py-8 text-center text-xs text-stone-400">
                  No reviews awaiting moderation!
                </div> : pendingReviews.map((rev) => <div key={rev.id} className="py-3 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900 dark:text-stone-900 truncate max-w-[140px]">
                        {rev.user?.name || "Tourist"}
                      </span>
                      <span className="text-amber-500 font-bold">★ {rev.rating}</span>
                    </div>
                    <p className="text-stone-500 dark:text-stone-400 line-clamp-2 italic">
                      "{rev.comment}"
                    </p>
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
    onClick={() => handleApproveReview(rev.id)}
    className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-small hover:bg-emerald-200 transition-colors flex items-center gap-1"
  >
                        <CheckCircle className="w-3 h-3" />
                        <span>Approve</span>
                      </button>
                      <button
    onClick={() => handleRejectReview(rev.id)}
    className="px-2.5 py-1 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 font-bold text-small hover:bg-red-200 transition-colors flex items-center gap-1"
  >
                        <XCircle className="w-3 h-3" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>)}
            </div>
          </div>

          <Link
    to="/admin/reviews"
    className="w-full py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 text-center text-xs font-bold transition-colors"
  >
            Open Full Reviews Table
          </Link>
        </div>
      </div>

      {
    /* 3. TOP DESTINATIONS & RECENT AUDIT LOGS */
  }
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {
    /* Top Destinations */
  }
        <div className="bg-white dark:bg-stone-100 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
            <h3 className="font-bold text-base text-stone-900 dark:text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-teal-600" />
              <span>Highest Rated Attractions</span>
            </h3>
            <Link to="/admin/destinations" className="text-xs text-teal-600 dark:text-teal-400 hover:underline">
              Manage All
            </Link>
          </div>

          <div className="divide-y divide-stone-100 dark:divide-stone-800">
            {topDestinations.map((dest, idx) => <div key={dest.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-5 font-bold text-stone-400">{idx + 1}</span>
                  {dest.cover_image && <img
    src={dest.cover_image}
    alt={dest.name_en}
    className="w-10 h-10 rounded-xl object-cover"
  />}
                  <div className="min-w-0">
                    <span className="font-bold text-stone-900 dark:text-stone-900 block truncate">
                      {dest.name_en}
                    </span>
                    <span className="text-small text-stone-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-amber-500" />
                      {dest.province?.name_en}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-bold text-amber-500 text-sm">
                    ★ {Number(dest.rating_avg ?? dest.avg_rating ?? 0).toFixed(1)}
                  </span>
                  <span className="block text-small text-stone-400">
                    {dest.rating_count ?? dest.reviews_count ?? 0} reviews
                  </span>
                </div>
              </div>)}
          </div>
        </div>

        {
    /* Recent Audit Logs */
  }
        <div className="bg-white dark:bg-stone-100 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
            <h3 className="font-bold text-base text-stone-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-500" />
              <span>Admin Activity & Audit Log</span>
            </h3>
            <Link to="/admin/audit-logs" className="text-xs text-teal-600 dark:text-teal-400 hover:underline">
              Full Log
            </Link>
          </div>

          <div className="divide-y divide-stone-100 dark:divide-stone-800">
            {auditLogs.length === 0 ? <div className="py-8 text-center text-xs text-stone-400">No recent activity logs</div> : auditLogs.map((log) => <div key={log.id} className="py-2.5 text-xs flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="font-semibold text-stone-800 dark:text-stone-700 block truncate">
                      {log.user?.name || "Admin"} — <span className="text-amber-500">{log.action}</span>
                    </span>
                    <span className="text-small text-stone-400">
                      {log.description || log.auditable_type}
                    </span>
                  </div>
                  <span className="text-small text-stone-400 shrink-0">
                    {log.created_at?.substring(11, 16)}
                  </span>
                </div>)}
          </div>
        </div>
      </div>
    </div>;
};
export {
  AdminDashboardPage
};
