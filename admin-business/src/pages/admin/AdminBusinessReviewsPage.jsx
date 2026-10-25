import { useState } from "react";
import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Star,
  CheckCircle,
  XCircle,
  Trash2,
  Filter,
  CheckSquare,
  Square,
  MessageSquare,
  Building,
  RefreshCw,
  Clock,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import api from "@/lib/axios";
import { toast } from "@/store/toastStore";

export const AdminBusinessReviewsPage = () => {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const isKm = i18n.language === "km";

  const [statusFilter, setStatusFilter] = useState("pending");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);

  const requestRejectionReason = () => {
    const reason = window.prompt(
      isKm ? "មូលហេតុនៃការបដិសេធ (ត្រូវបំពេញ):" : "Reason for rejection (required):"
    );
    return reason?.trim() || null;
  };

  // Fetch reviews with keepPreviousData for instant switching
  const {
    data: reviewsData,
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["admin", "reviews", statusFilter, page],
    queryFn: async () => {
      const params = {
        page,
        per_page: 15,
      };
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }
      const res = await api.get("/admin/business/reviews", { params });
      return res.data;
    },
    placeholderData: keepPreviousData,
  });

  const payload = reviewsData?.data || reviewsData || {};
  const rawReviews = payload?.items || (Array.isArray(payload) ? payload : []);
  const reviews = Array.isArray(rawReviews) ? rawReviews : [];
  const meta = payload?.meta || reviewsData?.meta || {};
  const pendingCount = payload?.pending_count ?? reviewsData?.pending_count ?? 0;

  // Single status mutation
  const statusMutation = useMutation({
    mutationFn: async ({ id, status, reason }) => {
      if (status === "approved") {
        await api.post(`/admin/business/reviews/${id}/approve`);
      } else {
        await api.post(`/admin/business/reviews/${id}/reject`, { reason });
      }
    },
    onSuccess: (_, variables) => {
      toast.success(
        variables.status === "approved"
          ? (isKm ? "បានអនុម័តការវាយតម្លៃជោគជ័យ" : "Review approved")
          : (isKm ? "បានបដិសេធការវាយតម្លៃ" : "Review rejected")
      );
      queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      setSelectedIds((prev) => prev.filter((id) => id !== variables.id));
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Operation failed");
    },
  });

  // Bulk status mutation
  const bulkStatusMutation = useMutation({
    mutationFn: async ({ ids, status, reason }) => {
      await api.post("/admin/business/reviews/bulk-moderate", {
        ids,
        action: status === "approved" ? "approve" : "reject",
        reason,
      });
    },
    onSuccess: (_, variables) => {
      toast.success(
        variables.status === "approved"
          ? (isKm ? `បានអនុម័ត ${variables.ids.length} ការវាយតម្លៃ` : `Approved ${variables.ids.length} reviews`)
          : (isKm ? `បានបដិសេធ ${variables.ids.length} ការវាយតម្លៃ` : `Rejected ${variables.ids.length} reviews`)
      );
      setSelectedIds([]);
      queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Bulk operation failed");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/admin/business/reviews/${id}`);
    },
    onSuccess: () => {
      toast.success(isKm ? "បានលុបការវាយតម្លៃ" : "Review deleted");
      queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Delete failed");
    },
  });

  const handleSelectAll = () => {
    if (selectedIds.length === reviews.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(reviews.map((r) => r.id));
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="mx-auto max-w-[1280px] space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-700 dark:text-brand-300">
          Trust & quality
        </p>
        <h1 className="mt-1 text-2xl text-forest dark:text-cream">Review moderation</h1>
        <p className="mt-1 text-sm text-muted dark:text-stone-400">
          Approve genuine visitor feedback and keep the directory trustworthy.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="portal-surface flex flex-wrap items-center justify-between gap-4 p-4">
        <div className="flex flex-wrap gap-2">
          {[
            { key: "pending", label: isKm ? "រង់ចាំពិនិត្យ" : "Pending", count: pendingCount },
            { key: "approved", label: isKm ? "បានអនុម័ត" : "Approved" },
            { key: "rejected", label: isKm ? "បានបដិសេធ" : "Rejected" },
            { key: "all", label: isKm ? "ទាំងអស់" : "All Reviews" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setStatusFilter(tab.key);
                setPage(1);
                setSelectedIds([]);
              }}
              className={`flex items-center gap-2 rounded-control px-4 py-2 text-sm font-medium transition ${statusFilter === tab.key
                  ? "bg-brand-500 text-forest shadow-gold"
                  : "bg-paper text-muted hover:bg-brand-50 hover:text-forest dark:bg-white/5 dark:text-stone-300 dark:hover:bg-white/10"
                }`}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-xs font-bold ${statusFilter === tab.key ? "bg-forest/10 text-forest" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500 dark:text-stone-400">
              {isKm ? `បានជ្រើស ${selectedIds.length}` : `Selected ${selectedIds.length}`}
            </span>
            <button
              onClick={() => bulkStatusMutation.mutate({ ids: selectedIds, status: "approved" })}
              disabled={bulkStatusMutation.isPending}
              className="flex items-center gap-1.5 rounded-control bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-premium transition hover:bg-emerald-700 disabled:opacity-50"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              {isKm ? "អនុម័តទាំងអស់" : "Approve Selected"}
            </button>
            <button
              onClick={() => {
                const reason = requestRejectionReason();
                if (!reason) return;
                bulkStatusMutation.mutate({ ids: selectedIds, status: "rejected", reason });
              }}
              disabled={bulkStatusMutation.isPending}
              className="flex items-center gap-1.5 rounded-control bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-premium transition hover:bg-rose-700 disabled:opacity-50"
            >
              <XCircle className="w-3.5 h-3.5" />
              {isKm ? "បដិសេធទាំងអស់" : "Reject Selected"}
            </button>
          </div>
        )}
      </div>

      {/* Review List */}
        <div className="portal-surface overflow-hidden">
        {isLoading && reviews.length === 0 ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-500 mb-3" />
            <p className="text-sm text-stone-500 dark:text-stone-400">
              {isKm ? "កំពុងផ្ទុកទិន្នន័យ..." : "Loading reviews..."}
            </p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="w-12 h-12 mx-auto text-stone-300 dark:text-stone-600 mb-3" />
            <p className="text-base font-medium text-stone-700 dark:text-stone-300">
              {isKm ? "គ្មានការវាយតម្លៃក្នុងស្ថានភាពនេះទេ" : "No reviews found in this status"}
            </p>
            <p className="text-xs text-stone-400 mt-1">
              {isKm ? "មតិវាយតម្លៃថ្មីពីអ្នកទស្សនានឹងបង្ហាញនៅទីនេះ" : "Visitor reviews will appear here for staff moderation."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100 dark:divide-stone-800">
            {/* Header / Select all bar */}
            <div className="p-3 bg-stone-50 dark:bg-stone-800/50 flex items-center justify-between text-xs font-medium text-stone-500">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 flex items-center gap-1.5"
                >
                  {selectedIds.length === reviews.length && reviews.length > 0 ? (
                    <CheckSquare className="w-4 h-4 text-amber-500" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                  <span>{isKm ? "ជ្រើសទាំងអស់" : "Select all on page"}</span>
                </button>
              </div>
              <div>
                {isKm ? `បង្ហាញ ${reviews.length} នៃ ${meta.total || reviews.length}` : `Showing ${reviews.length} of ${meta.total || reviews.length}`}
              </div>
            </div>

            {/* List */}
            {reviews.map((review) => {
              const isSelected = selectedIds.includes(review.id);
              const bizName = isKm
                ? review.business?.name_km || review.business?.name_en
                : review.business?.name_en || review.business?.name_km;

              return (
                <div
                  key={review.id}
                  className={`p-4 transition hover:bg-stone-50/70 dark:hover:bg-stone-800/40 ${isSelected ? "bg-amber-50/40 dark:bg-amber-500/5" : ""
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleSelect(review.id)}
                      className="mt-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-amber-500" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-stone-900 dark:text-white text-sm">
                            {review.display_name}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 uppercase">
                            {review.locale}
                          </span>
                          <div className="flex items-center text-amber-500">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3.5 h-3.5 ${star <= review.rating ? "fill-amber-500 text-amber-500" : "text-stone-300 dark:text-stone-600"
                                  }`}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div>
                          {review.status === "approved" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              <CheckCircle className="w-3 h-3" />
                              {isKm ? "បានអនុម័ត" : "Approved"}
                            </span>
                          ) : review.status === "rejected" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                              <XCircle className="w-3 h-3" />
                              {isKm ? "បានបដិសេធ" : "Rejected"}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                              <Clock className="w-3 h-3" />
                              {isKm ? "រង់ចាំពិនិត្យ" : "Pending"}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Business link & Date */}
                      <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mb-2">
                        <Building className="w-3.5 h-3.5 text-stone-400" />
                        <span className="font-medium text-stone-700 dark:text-stone-300">
                          {bizName || (isKm ? "អាជីវកម្ម ID: " + review.business_id : "Business ID: " + review.business_id)}
                        </span>
                        <span>•</span>
                        <span>{new Date(review.created_at).toLocaleDateString()}</span>
                      </div>

                      {/* Comment text */}
                      <p className="mb-3 whitespace-pre-wrap rounded-control border border-line bg-paper p-3 text-sm text-forest dark:border-white/10 dark:bg-white/5 dark:text-stone-200">
                        {review.comment}
                      </p>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {review.status !== "approved" && (
                          <button
                            type="button"
                            onClick={() => statusMutation.mutate({ id: review.id, status: "approved" })}
                            disabled={statusMutation.isPending}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-medium transition"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            {isKm ? "អនុម័ត" : "Approve"}
                          </button>
                        )}

                        {review.status !== "rejected" && (
                          <button
                            type="button"
                            onClick={() => {
                              const reason = requestRejectionReason();
                              if (!reason) return;
                              statusMutation.mutate({ id: review.id, status: "rejected", reason });
                            }}
                            disabled={statusMutation.isPending}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 text-xs font-medium transition"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                            {isKm ? "បដិសេធ" : "Reject"}
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(isKm ? "តើអ្នកពិតជាចង់លុបការវាយតម្លៃនេះមែនទេ?" : "Delete this review?")) {
                              deleteMutation.mutate(review.id);
                            }
                          }}
                          disabled={deleteMutation.isPending}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-xs transition ml-auto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          {isKm ? "លុប" : "Delete"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
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
    </div>
  );
};
