import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Compass,
  Sparkles,
  Star,
  MapPin,
  Quote,
  ShieldCheck,
  Search,
  Filter
} from "lucide-react";
import { RatingStars } from "@/components/common/RatingStars";
import { adminApi } from "@/lib/api/admin";
import { toast } from "@/store/toastStore";

const AdminReviewsPage = ({ initialTab = "destinations" }) => {
  // Main view: 'destinations' | 'testimonials'
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Destination Reviews State
  const [reviews, setReviews] = useState([]);
  const [meta, setMeta] = useState(null);
  const [counts, setCounts] = useState({ all: 0, pending: 0, approved: 0, rejected: 0 });
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Website Testimonials State ("Loved by Explorers Worldwide")
  const [testimonials, setTestimonials] = useState([]);
  const [testMeta, setTestMeta] = useState(null);
  const [testCounts, setTestCounts] = useState({ all: 0, pending: 0, approved: 0, rejected: 0 });
  const [testStatus, setTestStatus] = useState("");
  const [testPage, setTestPage] = useState(1);
  const [testSearch, setTestSearch] = useState("");
  const [isTestLoading, setIsTestLoading] = useState(true);

  // Fetch Destination Reviews
  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const res = await adminApi.getReviews({
        status: status || void 0,
        page,
        per_page: 15
      });
      const list = res?.data?.items || (Array.isArray(res?.data) ? res.data : []);
      setReviews(list);
      if (res?.data?.meta) setMeta(res.data.meta);
      else if (res?.meta) setMeta(res.meta);
      if (res?.data?.counts) setCounts(res.data.counts);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load destination reviews");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Website Testimonials
  const fetchTestimonials = async () => {
    try {
      setIsTestLoading(true);
      const res = await adminApi.getTestimonials({
        status: testStatus || void 0,
        search: testSearch.trim() || void 0,
        page: testPage,
        per_page: 15
      });
      const list = res?.data?.items || (Array.isArray(res?.data) ? res.data : []);
      setTestimonials(list);
      if (res?.data?.meta) setTestMeta(res.data.meta);
      if (res?.data?.counts) setTestCounts(res.data.counts);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load website testimonials");
    } finally {
      setIsTestLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "destinations") {
      fetchReviews();
    } else {
      fetchTestimonials();
    }
  }, [activeTab, status, page, testStatus, testPage]);

  // Destination Review Actions
  const handleApproveReview = async (id) => {
    try {
      await adminApi.approveReview(id);
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "approved" } : r))
      );
      toast.success("Review approved and published");
    } catch (err) {
      toast.error("Failed to approve review");
    }
  };

  const handleRejectReview = async (id) => {
    try {
      await adminApi.rejectReview(id);
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "rejected" } : r))
      );
      toast.info("Review rejected");
    } catch (err) {
      toast.error("Failed to reject review");
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm("Delete this review permanently?")) return;
    try {
      await adminApi.deleteReview(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      toast.success("Review deleted");
    } catch (err) {
      toast.error("Failed to delete review");
    }
  };

  // Testimonial Actions
  const handleApproveTestimonial = async (id) => {
    try {
      await adminApi.approveTestimonial(id);
      setTestimonials((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: "approved" } : t))
      );
      setTestCounts((c) => ({
        ...c,
        pending: Math.max(0, c.pending - 1),
        approved: c.approved + 1
      }));
      toast.success("Testimonial approved! It is now live on the homepage marquee.");
    } catch (err) {
      toast.error("Failed to approve testimonial");
    }
  };

  const handleRejectTestimonial = async (id) => {
    try {
      await adminApi.rejectTestimonial(id);
      setTestimonials((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: "rejected" } : t))
      );
      setTestCounts((c) => ({
        ...c,
        pending: Math.max(0, c.pending - 1),
        rejected: c.rejected + 1
      }));
      toast.info("Testimonial rejected from public display.");
    } catch (err) {
      toast.error("Failed to reject testimonial");
    }
  };

  const handleDeleteTestimonial = async (id) => {
    if (!window.confirm("Permanently delete this website testimonial?")) return;
    try {
      await adminApi.deleteTestimonial(id);
      setTestimonials((prev) => prev.filter((t) => t.id !== id));
      toast.success("Testimonial deleted successfully.");
    } catch (err) {
      toast.error("Failed to delete testimonial");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-stone-900 dark:text-white">
          Reviews & Testimonials Moderation
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Moderate tourist destination reviews and manage website testimonials displayed on "Loved by Explorers Worldwide".
        </p>
      </div>

      {/* Primary Category Switcher (Tabs) */}
      <div className="flex border-b border-stone-200 dark:border-stone-800 gap-8">
        <button
          type="button"
          onClick={() => setActiveTab("destinations")}
          className={`pb-3.5 -mb-[2px] transition-all flex items-center gap-2 text-xs font-bold border-b-2 cursor-pointer ${
            activeTab === "destinations"
              ? "border-amber-500 text-amber-600 dark:text-amber-400 font-extrabold"
              : "border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-200"
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Destination Reviews</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("testimonials")}
          className={`pb-3.5 -mb-[2px] transition-all flex items-center gap-2 text-xs font-bold border-b-2 cursor-pointer relative ${
            activeTab === "testimonials"
              ? "border-laterite-600 text-laterite-600 dark:text-laterite-400 font-extrabold"
              : "border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-200"
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Website Reviews (Loved by Explorers Worldwide)</span>
          {testCounts.pending > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
              {testCounts.pending} new
            </span>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* VIEW A: WEBSITE TESTIMONIALS (LOVED BY EXPLORERS WORLDWIDE)               */}
      {/* ========================================================================= */}
      {activeTab === "testimonials" && (
        <div className="space-y-5">
          {/* Top Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
              <span className="text-[11px] uppercase tracking-wider text-stone-500 dark:text-stone-400 font-bold block">
                Total Reviews
              </span>
              <p className="text-2xl font-black text-stone-900 dark:text-white mt-1">
                {testCounts.all}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
              <span className="text-[11px] uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold block">
                Pending Moderation
              </span>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                {testCounts.pending}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
              <span className="text-[11px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold block">
                Live on Homepage
              </span>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {testCounts.approved}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
              <span className="text-[11px] uppercase tracking-wider text-red-600 dark:text-red-400 font-bold block">
                Rejected
              </span>
              <p className="text-2xl font-black text-red-600 dark:text-red-400 mt-1">
                {testCounts.rejected}
              </p>
            </div>
          </div>

          {/* Search & Sub-Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex border-b sm:border-b-0 border-stone-200 dark:border-stone-800 gap-4 text-xs font-bold">
              {[
                { key: "", label: "All Reviews", count: testCounts.all },
                { key: "pending", label: "Pending", count: testCounts.pending },
                { key: "approved", label: "Approved & Live", count: testCounts.approved },
                { key: "rejected", label: "Rejected", count: testCounts.rejected }
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setTestStatus(tab.key);
                    setTestPage(1);
                  }}
                  className={`pb-2.5 transition-colors border-b-2 cursor-pointer flex items-center gap-1.5 ${
                    testStatus === tab.key
                      ? "border-laterite-600 text-laterite-600 dark:text-laterite-400 font-black"
                      : "border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 font-medium"
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                fetchTestimonials();
              }}
              className="relative w-full sm:w-64"
            >
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={testSearch}
                onChange={(e) => setTestSearch(e.target.value)}
                placeholder="Search testimonials..."
                className="w-full h-9 pl-9 pr-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs focus:outline-hidden focus:border-laterite-600"
              />
            </form>
          </div>

          {/* Testimonials Table */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 dark:bg-stone-800/60 text-stone-500 uppercase tracking-wider font-bold border-b border-stone-200 dark:border-stone-800">
                  <tr>
                    <th className="p-4">Explorer</th>
                    <th className="p-4">Location & Category</th>
                    <th className="p-4">Rating</th>
                    <th className="p-4">Website Feedback</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4">Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-700 dark:text-stone-300">
                  {isTestLoading ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-stone-400">
                        Loading website testimonials...
                      </td>
                    </tr>
                  ) : testimonials.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-stone-400">
                        No website testimonials found in this view.
                      </td>
                    </tr>
                  ) : (
                    testimonials.map((t) => (
                      <tr key={t.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30">
                        <td className="p-4 font-bold text-stone-900 dark:text-stone-100">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-8 h-8 rounded-full ${
                                t.avatar_bg || "bg-laterite-600"
                              } text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs`}
                            >
                              {t.avatar || t.name?.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <span>{t.name}</span>
                              <span className="block text-[11px] text-stone-500 font-normal">
                                {t.role || "Explorer"}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1 font-semibold text-stone-800 dark:text-stone-200">
                              <MapPin className="w-3.5 h-3.5 text-laterite-600 shrink-0" />
                              <span>{t.location || "Cambodia"}</span>
                            </div>
                            <span className="text-[10px] font-semibold text-laterite-600 dark:text-amber-400 block">
                              Website Review
                            </span>
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-1 text-amber-500">
                            {[...Array(t.rating || 5)].map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                        </td>

                        <td className="p-4 max-w-sm">
                          <p className="line-clamp-3 text-stone-700 dark:text-stone-300 italic">
                            "{t.quote_km || t.quote_en}"
                          </p>
                        </td>

                        <td className="p-4 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              t.status === "approved"
                                ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40"
                                : t.status === "rejected"
                                ? "bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-300/40"
                                : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/40"
                            }`}
                          >
                            {t.status === "approved"
                              ? "Live on Homepage"
                              : t.status === "pending"
                              ? "Pending Review"
                              : "Rejected"}
                          </span>
                        </td>

                        <td className="p-4 text-stone-500 text-[11px] font-mono">
                          {t.created_at ? t.created_at.substring(0, 10) : "Recent"}
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {t.status !== "approved" && (
                              <button
                                type="button"
                                onClick={() => handleApproveTestimonial(t.id)}
                                title="Approve & Publish to Homepage"
                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            )}

                            {t.status !== "rejected" && (
                              <button
                                type="button"
                                onClick={() => handleRejectTestimonial(t.id)}
                                title="Reject testimonial"
                                className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDeleteTestimonial(t.id)}
                              title="Delete permanently"
                              className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {testMeta && testMeta.last_page > 1 && (
              <div className="p-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500">
                <span>
                  Showing {testimonials.length} of {testMeta.total} testimonials
                </span>
                <div className="flex items-center gap-1">
                  <button
                    disabled={testPage <= 1}
                    onClick={() => setTestPage((p) => p - 1)}
                    className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-800 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-3 font-semibold">
                    Page {testPage} of {testMeta.last_page}
                  </span>
                  <button
                    disabled={testPage >= testMeta.last_page}
                    onClick={() => setTestPage((p) => p + 1)}
                    className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-800 disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW B: DESTINATION REVIEWS (ORIGINAL SYSTEM)                             */}
      {/* ========================================================================= */}
      {activeTab === "destinations" && (
        <div className="space-y-5">
          {/* Top Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
              <span className="text-[11px] uppercase tracking-wider text-stone-500 dark:text-stone-400 font-bold block">
                Total Reviews
              </span>
              <p className="text-2xl font-black text-stone-900 dark:text-white mt-1">
                {counts.all}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
              <span className="text-[11px] uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold block">
                Pending Moderation
              </span>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                {counts.pending}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
              <span className="text-[11px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold block">
                Approved & Live
              </span>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {counts.approved}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
              <span className="text-[11px] uppercase tracking-wider text-red-600 dark:text-red-400 font-bold block">
                Rejected
              </span>
              <p className="text-2xl font-black text-red-600 dark:text-red-400 mt-1">
                {counts.rejected}
              </p>
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex border-b border-stone-200 dark:border-stone-800 gap-6 text-xs font-bold">
            {[
              { key: "", label: "All Reviews", count: counts.all },
              { key: "pending", label: "Pending Moderation", count: counts.pending },
              { key: "approved", label: "Approved & Live", count: counts.approved },
              { key: "rejected", label: "Rejected", count: counts.rejected }
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setStatus(tab.key);
                  setPage(1);
                }}
                className={`pb-3 -mb-[2px] transition-colors border-b-2 cursor-pointer flex items-center gap-1.5 ${
                  status === tab.key
                    ? "border-amber-500 text-amber-600 dark:text-amber-400 font-extrabold"
                    : "border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 font-medium"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 dark:bg-stone-800/60 text-stone-500 uppercase tracking-wider font-bold border-b border-stone-200 dark:border-stone-800">
                  <tr>
                    <th className="p-4">Tourist User</th>
                    <th className="p-4">Attraction</th>
                    <th className="p-4">Rating</th>
                    <th className="p-4">Comment</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4">Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-700 dark:text-stone-300">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-stone-400">
                        Loading reviews...
                      </td>
                    </tr>
                  ) : reviews.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-stone-400">
                        No reviews in this category
                      </td>
                    </tr>
                  ) : (
                    reviews.map((rev) => (
                      <tr key={rev.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30">
                        <td className="p-4 font-bold text-stone-900 dark:text-stone-100">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-teal-700 text-white font-bold text-small flex items-center justify-center">
                              {rev.user?.name?.charAt(0) || "U"}
                            </div>
                            <div>
                              <span>{rev.user?.name || "Tourist"}</span>
                              <span className="block text-[11px] text-stone-400 font-normal">
                                {rev.user?.email}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="p-4 font-medium">
                          {rev.destination ? (
                            <Link
                              to={`/destinations/${rev.destination.slug}`}
                              target="_blank"
                              className="hover:text-amber-500 transition-colors flex items-center gap-1"
                            >
                              <span className="truncate max-w-[150px]">
                                {rev.destination.name_en}
                              </span>
                              <ExternalLink className="w-3 h-3 text-stone-400" />
                            </Link>
                          ) : (
                            "—"
                          )}
                        </td>

                        <td className="p-4">
                          <RatingStars rating={rev.rating} size="sm" />
                        </td>

                        <td className="p-4 max-w-sm">
                          <p className="line-clamp-2 text-stone-600 dark:text-stone-400 italic">
                            "{rev.comment}"
                          </p>
                        </td>

                        <td className="p-4 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              rev.status === "approved"
                                ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                                : rev.status === "rejected"
                                ? "bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300"
                                : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
                            }`}
                          >
                            {rev.status}
                          </span>
                        </td>

                        <td className="p-4 text-stone-400 text-[11px]">
                          {rev.created_at?.substring(0, 10)}
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {rev.status !== "approved" && (
                              <button
                                type="button"
                                onClick={() => handleApproveReview(rev.id)}
                                title="Approve review"
                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            )}
                            {rev.status !== "rejected" && (
                              <button
                                type="button"
                                onClick={() => handleRejectReview(rev.id)}
                                title="Reject review"
                                className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteReview(rev.id)}
                              title="Delete permanently"
                              className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Bar */}
            {meta && meta.last_page > 1 && (
              <div className="p-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500">
                <span>
                  Showing {reviews.length} of {meta.total} reviews
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
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export { AdminReviewsPage };
export default AdminReviewsPage;
