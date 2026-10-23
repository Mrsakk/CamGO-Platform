import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  CheckCircle2,
  Clock,
  Loader2,
  MessageCircle,
  MessageSquare,
  RefreshCw,
  Send,
  Star,
  ThumbsUp,
} from "lucide-react";
import api from "@/lib/axios";
import { QueryError } from "@/components/common/QueryError";
import { toast } from "@/store/toastStore";
import { useAuthStore } from "@/store/authStore";

const formatDate = (value, isKm) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(isKm ? "km-KH" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const Stars = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((value) => (
      <Star
        key={value}
        className={`w-4 h-4 ${value <= Number(rating)
          ? "text-amber-500 fill-amber-500"
          : "text-stone-300 dark:text-stone-600"
          }`}
      />
    ))}
  </div>
);

export const OwnerReviewsPage = () => {
  const { i18n } = useTranslation();
  const isKm = i18n.language === "km";
  const queryClient = useQueryClient();
  const { hasBusinessCapability } = useAuthStore();
  const canReply = hasBusinessCapability("reviews.manage");

  const [statusFilter, setStatusFilter] = useState("approved");
  const [page, setPage] = useState(1);
  const [replying, setReplying] = useState(null);
  const [replyText, setReplyText] = useState("");

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ["owner-reviews", statusFilter, page],
    queryFn: async () => {
      const params = { page, per_page: 15 };
      if (statusFilter !== "all") params.status = statusFilter;
      const res = await api.get("/business/owner/reviews", { params });
      return res.data;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["owner-review-stats"],
    queryFn: async () => {
      const res = await api.get("/business/owner/reviews/stats");
      return res.data?.data || res.data;
    },
  });

  const replyMutation = useMutation({
    mutationFn: async ({ id, ownerReply }) => {
      const res = await api.put(`/business/owner/reviews/${id}/reply`, {
        owner_reply: ownerReply,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success(isKm ? "បានរក្សាទុកការឆ្លើយតប!" : "Reply saved successfully!");
      setReplying(null);
      setReplyText("");
      queryClient.invalidateQueries({ queryKey: ["owner-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["owner-review-stats"] });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
        (isKm ? "មិនអាចរក្សាទុកការឆ្លើយតបបានទេ" : "Could not save reply")
      );
    },
  });

  const reviews = Array.isArray(data?.data) ? data.data : [];
  const meta = data?.meta || {};

  const openReply = (review) => {
    setReplying(review);
    setReplyText(review.owner_reply || "");
  };

  const statusMeta = {
    pending: { km: "រង់ចាំត្រួតពិនិត្យ", en: "Pending", className: "bg-amber-500/10 text-amber-600" },
    approved: { km: "បានអនុម័ត", en: "Approved", className: "bg-emerald-500/10 text-emerald-600" },
    rejected: { km: "បានបដិសេធ", en: "Rejected", className: "bg-rose-500/10 text-rose-600" },
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">


      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-850 border border-stone-200/80 dark:border-stone-800">
          <div className="flex items-center gap-2 text-xs font-bold text-stone-500">
            <Star className="w-4 h-4 text-amber-500" />
            {isKm ? "ពិន្ទុមធ្យម" : "Average rating"}
          </div>
          <div className="mt-2 text-3xl font-extrabold text-stone-900 dark:text-white">
            {stats?.rating_avg ? Number(stats.rating_avg).toFixed(1) : "—"}
          </div>
          <div className="text-xs text-stone-400">{stats?.approved || 0} {isKm ? "ការវាយតម្លៃ" : "approved"}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-850 border border-stone-200/80 dark:border-stone-800">
          <div className="flex items-center gap-2 text-xs font-bold text-stone-500">
            <Clock className="w-4 h-4 text-amber-500" />
            {isKm ? "រង់ចាំត្រួតពិនិត្យ" : "Pending moderation"}
          </div>
          <div className="mt-2 text-3xl font-extrabold text-stone-900 dark:text-white">{stats?.pending || 0}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-850 border border-stone-200/80 dark:border-stone-800">
          <div className="flex items-center gap-2 text-xs font-bold text-stone-500">
            <MessageCircle className="w-4 h-4 text-emerald-500" />
            {isKm ? "បានឆ្លើយតប" : "Replied"}
          </div>
          <div className="mt-2 text-3xl font-extrabold text-emerald-600">{stats?.replied || 0}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-850 border border-stone-200/80 dark:border-stone-800">
          <div className="flex items-center gap-2 text-xs font-bold text-stone-500">
            <ThumbsUp className="w-4 h-4 text-sky-500" />
            {isKm ? "មិនទាន់ឆ្លើយតប" : "Awaiting reply"}
          </div>
          <div className="mt-2 text-3xl font-extrabold text-sky-600">{stats?.unreplied || 0}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { key: "approved", km: "បានអនុម័ត", en: "Approved" },
          { key: "pending", km: "រង់ចាំត្រួតពិនិត្យ", en: "Pending" },
          { key: "rejected", km: "បានបដិសេធ", en: "Rejected" },
          { key: "all", km: "ទាំងអស់", en: "All" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setStatusFilter(tab.key);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${statusFilter === tab.key
              ? "bg-amber-500 text-stone-950 border-amber-500"
              : "bg-white dark:bg-stone-850 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400"
              }`}
          >
            {isKm ? tab.km : tab.en}
          </button>



        ))}
      </div>

      {isError ? (
        <QueryError onRetry={refetch} isRetrying={isFetching} />
      ) : isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-stone-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          {isKm ? "កំពុងផ្ទុកការវាយតម្លៃ..." : "Loading reviews..."}
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-850 p-12 text-center space-y-2">
          <Star className="w-10 h-10 text-stone-300 dark:text-stone-600 mx-auto" />
          <h3 className="font-bold text-stone-900 dark:text-white">
            {isKm ? "មិនមានការវាយតម្លៃទេ" : "No reviews yet"}
          </h3>
          <p className="text-xs text-stone-500">
            {isKm
              ? "ការវាយតម្លៃពីភ្ញៀវនឹងបង្ហាញនៅទីនេះបន្ទាប់ពីក្រុមការងារអនុម័ត។"
              : "Visitor reviews will appear here after staff approval."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const status = statusMeta[review.status] || statusMeta.pending;
            return (
              <div key={review.id} className="bg-white dark:bg-stone-850 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-5 shadow-sm space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-stone-900 dark:text-white">{review.display_name}</span>
                      <Stars rating={review.rating} />
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${status.className}`}>
                        {isKm ? status.km : status.en}
                      </span>
                    </div>
                    <div className="text-xs text-stone-400 mt-1">{formatDate(review.created_at, isKm)}</div>
                  </div>
                  {canReply && review.status === "approved" && (
                    <button
                      onClick={() => openReply(review)}
                      className="px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      {review.owner_reply ? (isKm ? "កែការឆ្លើយតប" : "Edit reply") : isKm ? "ឆ្លើយតប" : "Reply"}
                    </button>
                  )}
                </div>

                {review.comment ? (
                  <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-line">
                    {review.comment}
                  </p>
                ) : null}

                {review.owner_reply ? (
                  <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 p-3.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-700 dark:text-amber-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {isKm ? "ការឆ្លើយតបពីអាជីវកម្ម" : "Business reply"}
                    </div>
                    <p className="mt-1 text-xs text-stone-700 dark:text-stone-300 whitespace-pre-line">{review.owner_reply}</p>
                  </div>
                ) : null}
              </div>
            );
          })}

          <div className="flex items-center justify-between px-2 text-xs text-stone-500">
            <span>{isKm ? `សរុប ${meta.total || 0}` : `${meta.total || 0} total`}</span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                className="px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 disabled:opacity-40 font-semibold"
              >
                {isKm ? "មុន" : "Prev"}
              </button>
              <span>{meta.current_page || 1} / {meta.last_page || 1}</span>
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

      {replying && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-stone-850 rounded-3xl p-6 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-4">
            <div>
              <h3 className="font-extrabold text-lg text-stone-900 dark:text-white">
                {isKm ? "ឆ្លើយតបការវាយតម្លៃ" : "Reply to review"}
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                {isKm
                  ? "ការឆ្លើយតបរបស់អ្នកនឹងបង្ហាញជាសាធារណៈក្រោមការវាយតម្លៃនេះ។"
                  : "Your reply will be publicly visible under this review."}
              </p>
            </div>
            <textarea
              rows={5}
              value={replyText}
              onChange={(event) => setReplyText(event.target.value)}
              placeholder={isKm ? "សូមអរគុណសម្រាប់មតិកែលម្អរបស់អ្នក..." : "Thank you for your feedback..."}
              className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 px-3.5 py-2.5 text-sm"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setReplying(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-stone-500"
              >
                {isKm ? "បិទ" : "Cancel"}
              </button>
              <button
                onClick={() =>
                  replyMutation.mutate({
                    id: replying.id,
                    ownerReply: replyText.trim() || null,
                  })
                }
                disabled={replyMutation.isPending}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs flex items-center gap-2 disabled:opacity-50"
              >
                {replyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {isKm ? "រក្សាទុកឆ្លើយតប" : "Save reply"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
