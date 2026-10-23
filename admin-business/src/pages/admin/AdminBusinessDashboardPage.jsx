import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Store,
  CheckCircle2,
  Clock,
  FileEdit,
  ShieldCheck,
  Eye,
  MessageSquare,
  ArrowRight,
  CreditCard,
  FileText,
  Sparkles,
} from "lucide-react";
import api from "@/lib/axios";
import { LoadingFallback } from "@/components/common/LoadingFallback";
import { useAuthStore } from "@/store/authStore";
import { toast } from "@/store/toastStore";

const tierLabels = { free: "Free", verified: "Pro", featured: "Premium" };

const formatQueueDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

const businessName = (business) =>
  business?.name_en || business?.name_km || `Business #${business?.id || ""}`;

export const AdminBusinessDashboardPage = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { hasPermission } = useAuthStore();
  const canManageBilling = hasPermission("subscriptions.manage");
  const canVerifyPayments = hasPermission("payments.verify");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "business", "stats"],
    queryFn: async () => {
      const res = await api.get("/admin/business/stats");
      return res.data?.data || res.data;
    },
  });

  const refreshQueues = () =>
    queryClient.invalidateQueries({ queryKey: ["admin", "business", "stats"] });

  const approveRequestMutation = useMutation({
    mutationFn: (id) =>
      api.post(`/admin/business/billing/subscription-requests/${id}/approve`, {}),
    onSuccess: () => {
      toast.success("Subscription request approved.");
      refreshQueues();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to approve request.");
    },
  });

  const rejectRequestMutation = useMutation({
    mutationFn: ({ id, admin_note }) =>
      api.post(`/admin/business/billing/subscription-requests/${id}/reject`, {
        admin_note,
      }),
    onSuccess: () => {
      toast.success("Subscription request rejected.");
      refreshQueues();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to reject request.");
    },
  });

  const updatePaymentMutation = useMutation({
    mutationFn: ({ id, status, notes }) =>
      api.put(`/admin/business/billing/payments/${id}`, { status, notes }),
    onSuccess: (_data, variables) => {
      toast.success(`Payment marked as ${variables.status}.`);
      refreshQueues();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update payment.");
    },
  });

  if (isLoading) return <LoadingFallback />;

  const totals = data?.totals || {};
  const interactions = data?.interactions || {};
  const topBusinesses = data?.top_businesses || [];
  const byCategory = data?.by_category || [];
  const byProvince = data?.by_province || [];
  const queues = data?.queues || {};
  const queueCounts = queues.counts || {};
  const pendingApprovals = queues.pending_approvals || [];
  const subscriptionRequests = queues.subscription_requests || [];
  const pendingPayments = queues.pending_payments || [];
  const expiringPlans = queues.expiring_plans || [];
  const totalAttention =
    (queueCounts.pending_approvals || 0) +
    (queueCounts.pending_subscription_requests || 0) +
    (queueCounts.pending_payments || 0) +
    (queueCounts.expiring_plans || 0);

  const handleApproveRequest = (request) => {
    const plan = request.requested_plan?.name_en || "the requested plan";
    if (!window.confirm(`Approve ${businessName(request.business)} for ${plan}?`)) {
      return;
    }
    approveRequestMutation.mutate(request.id);
  };

  const handleRejectRequest = (request) => {
    const note = window.prompt("Reason for rejecting this subscription request?");
    if (!note?.trim()) return;
    rejectRequestMutation.mutate({ id: request.id, admin_note: note.trim() });
  };

  const handlePaymentStatus = (payment, status) => {
    if (!window.confirm(`Mark this payment as ${status}?`)) return;
    updatePaymentMutation.mutate({ id: payment.id, status });
  };

  const attentionCards = [
    {
      key: "approvals",
      label: "Pending approvals",
      value: queueCounts.pending_approvals || 0,
      hint: "Businesses waiting to go live",
      icon: FileEdit,
      href: "/admin/businesses?status=pending_review",
      tone: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    },
    {
      key: "requests",
      label: "Upgrade requests",
      value: queueCounts.pending_subscription_requests || 0,
      hint: "Owners waiting for plan approval",
      icon: FileText,
      href: "#subscription-requests",
      tone: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
    },
    {
      key: "payments",
      label: "Payments to verify",
      value: queueCounts.pending_payments || 0,
      hint: "Manual transfers awaiting review",
      icon: CreditCard,
      href: "#pending-payments",
      tone: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
    },
    {
      key: "expiring",
      label: "Expiring in 30 days",
      value: queueCounts.expiring_plans || 0,
      hint: `${queueCounts.expiring_trials || 0} Pro trials ending soon`,
      icon: Clock,
      href: "#expiring-plans",
      tone: "bg-brand-500/15 text-brand-700 dark:text-brand-300",
    },
  ];

  const kpis = [
    {
      label: t("dashboard.total_businesses", "Total Businesses"),
      value: totals.total_businesses || 0,
      icon: Store,
      iconClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      valueClass: "text-forest dark:text-cream",
      hint: (
        <>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">{totals.approved || 0} active</span>
          <span className="text-muted dark:text-stone-400"> · {totals.draft || 0} draft</span>
        </>
      ),
    },
    {
      label: t("dashboard.verified", "Verified Badge"),
      value: totals.verified || 0,
      icon: ShieldCheck,
      iconClass: "bg-brand-500/10 text-brand-700 dark:text-brand-300",
      valueClass: "text-forest dark:text-cream",
      hint: <span className="text-muted dark:text-stone-400">KYC & tourism license certified</span>,
    },
    {
      label: t("dashboard.contacts_30d", "Direct Contacts (30d)"),
      value: interactions.contacts_last_30_days || 0,
      icon: MessageSquare,
      iconClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
      valueClass: "text-forest dark:text-cream",
      hint: (
        <>
          <span className="font-semibold text-sky-600 dark:text-sky-400">{interactions.contacts_last_7_days || 0}</span>
          <span className="text-muted dark:text-stone-400"> in the last 7 days</span>
        </>
      ),
    },
    {
      label: t("dashboard.views_30d", "Profile Views (30d)"),
      value: interactions.profile_views_last_30_days || 0,
      icon: Eye,
      iconClass: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
      valueClass: "text-forest dark:text-cream",
      hint: <span className="text-muted dark:text-stone-400">Organic visitor discovery</span>,
    },
  ];

  return (
    <div className="mx-auto max-w-[1280px] animate-fade-in space-y-8">
      <section className="relative overflow-hidden rounded-card border border-white/10 bg-forest px-6 py-7 text-cream shadow-premium sm:px-8 sm:py-9">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-brand-500" />
        <div className="relative z-10 flex flex-col items-start justify-between gap-7 lg:flex-row lg:items-end">
          <div className="max-w-2xl space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-brand-200">
                <Sparkles className="h-3.5 w-3.5" />
                Business operations
              </span>
              <span className="rounded-full border border-amber-300/30 bg-amber-500/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] text-amber-300">
                {totalAttention} open tasks
              </span>
            </div>
            <h1 className="text-2xl leading-tight text-cream sm:text-3xl">
              Business command center
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-white/55">
              Keep listings moving, verify payments, and protect the quality of
              Cambodia&apos;s local business directory.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="rounded-control border border-white/10 bg-white/[0.06] px-4 py-2.5 text-xs text-white/60">
              <span className="font-bold text-brand-300">{totals.total_businesses || 0}</span> businesses
              <span className="mx-1.5 text-white/20">·</span>
              <span className="font-bold text-brand-300">{totals.approved || 0}</span> live
            </div>
            <Link
              to="/admin/businesses"
              className="flex items-center gap-2 rounded-control bg-brand-500 px-5 py-2.5 text-xs font-bold text-forest shadow-gold transition hover:bg-brand-400"
            >
              <span>Manage listings</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="portal-surface space-y-3 p-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-premium"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase leading-snug tracking-[0.1em] text-muted dark:text-stone-400">
                  {kpi.label}
                </span>
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${kpi.iconClass}`}>
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <div className={`font-serif text-3xl font-semibold leading-none ${kpi.valueClass}`}>
                {kpi.value}
              </div>
              <div className="text-xs leading-relaxed text-stone-400">{kpi.hint}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {attentionCards.map((card) => {
          const Icon = card.icon;
          const className =
            "portal-surface p-4 transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-premium";
          const content = (
            <>
              <div className="flex items-start justify-between gap-3">
                <span className="text-xs font-bold uppercase leading-snug tracking-[0.1em] text-muted dark:text-stone-400">
                  {card.label}
                </span>
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${card.tone}`}>
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-3 font-serif text-3xl font-semibold leading-none text-forest dark:text-cream">
                {card.value}
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-muted dark:text-stone-400">
                {card.hint}
              </p>
            </>
          );

          return card.href.startsWith("#") ? (
            <a key={card.key} href={card.href} className={className}>
              {content}
            </a>
          ) : (
            <Link key={card.key} to={card.href} className={className}>
              {content}
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="portal-surface p-6 lg:col-span-2">
          <div className="mb-3 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-forest dark:text-cream">Approval Queue</h2>
              <p className="mt-1 text-xs text-muted dark:text-stone-400">
                Businesses waiting for publishing review
              </p>
            </div>
            <Link
              to="/admin/businesses?status=pending_review"
              className="flex shrink-0 items-center gap-1 rounded-control border border-line bg-paper px-3 py-1.5 text-xs font-semibold text-forest transition hover:border-brand-300 hover:bg-brand-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 dark:text-brand-300"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-sage-deep/60 dark:divide-stone-800">
            {pendingApprovals.length > 0 ? (
              pendingApprovals.map((biz) => (
                <div key={biz.id} className="flex items-start justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-forest dark:text-white">
                      {biz.name_en || biz.name_km}
                    </div>
                    <div className="truncate text-xs text-muted dark:text-stone-400">
                      {biz.name_km} · {tierLabels[biz.tier] || biz.tier}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px]">
                      <span className="text-muted dark:text-stone-500">
                        Waiting {biz.waiting_days}d
                      </span>
                      {biz.can_be_approved ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" /> Ready
                        </span>
                      ) : (
                        <span className="font-semibold text-amber-600 dark:text-amber-400">
                          {biz.missing_count} missing
                        </span>
                      )}
                    </div>
                  </div>
                  <Link
                    to={`/admin/businesses/${biz.id}/edit`}
                    className="shrink-0 rounded-control border border-line bg-paper px-3 py-1.5 text-xs font-semibold text-forest transition hover:border-brand-300 hover:bg-brand-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 dark:text-stone-300"
                  >
                    Review
                  </Link>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-xs text-muted dark:text-stone-500">
                No businesses are waiting for approval.
              </p>
            )}
          </div>
        </div>

        <div
          id="subscription-requests"
          className="portal-surface scroll-mt-24 p-6"
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-forest dark:text-cream">Upgrade Requests</h2>
              <p className="mt-1 text-xs text-muted dark:text-stone-400">
                Owners waiting for a plan decision
              </p>
            </div>
            <span className="rounded-full bg-sage px-2.5 py-0.5 text-xs font-bold text-forest dark:bg-stone-800 dark:text-stone-300">
              {queueCounts.pending_subscription_requests || 0}
            </span>
          </div>

          <div className="divide-y divide-sage-deep/60 dark:divide-stone-800">
            {subscriptionRequests.length > 0 ? (
              subscriptionRequests.map((request) => (
                <div key={request.id} className="py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-forest dark:text-white">
                        {businessName(request.business)}
                      </div>
                      <div className="text-xs text-muted dark:text-stone-400">
                        {request.requested_plan?.name_en || "Requested plan"}
                        {request.requested_plan?.price_usd
                          ? ` · $${request.requested_plan.price_usd}/mo`
                          : ""}
                      </div>
                      <div className="mt-0.5 text-[11px] text-muted dark:text-stone-500">
                        Requested {formatQueueDate(request.created_at)}
                      </div>
                    </div>
                    {request.business?.id && (
                      <Link
                        to={`/admin/businesses/${request.business.id}/edit`}
                        className="shrink-0 text-xs font-semibold text-brand-700 hover:underline dark:text-brand-300"
                      >
                        Open
                      </Link>
                    )}
                  </div>

                  {request.note && (
                    <p className="mt-2 line-clamp-2 rounded-xl bg-paper px-3 py-2 text-[11px] text-stone-600 dark:bg-stone-900 dark:text-stone-300">
                      {request.note}
                    </p>
                  )}

                  {canManageBilling && (
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        disabled={approveRequestMutation.isPending || rejectRequestMutation.isPending}
                        onClick={() => handleApproveRequest(request)}
                        className="rounded-control bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        disabled={approveRequestMutation.isPending || rejectRequestMutation.isPending}
                        onClick={() => handleRejectRequest(request)}
                        className="rounded-control border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950/40"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-xs text-muted dark:text-stone-500">
                No pending upgrade requests.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div
          id="expiring-plans"
          className="portal-surface scroll-mt-24 p-6 lg:col-span-2"
        >
          <div className="mb-3 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-forest dark:text-cream">Expiring Plans</h2>
              <p className="mt-1 text-xs text-muted dark:text-stone-400">
                Paid plans and trials ending in the next 30 days
              </p>
            </div>
            <span className="rounded-full bg-sage px-2.5 py-0.5 text-xs font-bold text-forest dark:bg-stone-800 dark:text-stone-300">
              {queueCounts.expiring_plans || 0}
            </span>
          </div>

          <div className="divide-y divide-sage-deep/60 dark:divide-stone-800">
            {expiringPlans.length > 0 ? (
              expiringPlans.map((biz) => (
                <div key={biz.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-forest dark:text-white">
                      {biz.name_en || biz.name_km}
                    </div>
                    <div className="truncate text-xs text-muted dark:text-stone-400">
                      {biz.is_trial ? "Pro trial" : biz.plan_name || tierLabels[biz.tier] || biz.tier}
                      {" · "}
                      {formatQueueDate(biz.expires_at)}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                        biz.days_left <= 7
                          ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                          : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                      }`}
                    >
                      {biz.days_left}d left
                    </span>
                    <Link
                      to={`/admin/businesses/${biz.id}/edit`}
                      className="rounded-control border border-line bg-paper px-3 py-1.5 text-xs font-semibold text-forest transition hover:border-brand-300 hover:bg-brand-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 dark:text-stone-300"
                    >
                      Manage
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-xs text-muted dark:text-stone-500">
                No plans are expiring in the next 30 days.
              </p>
            )}
          </div>
        </div>

        <div
          id="pending-payments"
          className="portal-surface scroll-mt-24 p-6"
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-forest dark:text-cream">Payments to Verify</h2>
              <p className="mt-1 text-xs text-muted dark:text-stone-400">
                Manual payments awaiting confirmation
              </p>
            </div>
            <span className="rounded-full bg-sage px-2.5 py-0.5 text-xs font-bold text-forest dark:bg-stone-800 dark:text-stone-300">
              {queueCounts.pending_payments || 0}
            </span>
          </div>

          <div className="divide-y divide-sage-deep/60 dark:divide-stone-800">
            {pendingPayments.length > 0 ? (
              pendingPayments.map((payment) => (
                <div key={payment.id} className="py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-forest dark:text-white">
                        {businessName(payment.business)}
                      </div>
                      <div className="text-xs font-semibold text-brand-700 dark:text-brand-300">
                        ${payment.amount_usd} {payment.currency}
                      </div>
                      <div className="mt-0.5 truncate text-[11px] text-muted dark:text-stone-500">
                        {payment.method || "manual"}
                        {payment.reference_no ? ` · ${payment.reference_no}` : ""}
                      </div>
                    </div>
                    {payment.business?.id && (
                      <Link
                        to={`/admin/businesses/${payment.business.id}/edit`}
                        className="shrink-0 text-xs font-semibold text-brand-700 hover:underline dark:text-brand-300"
                      >
                        Open
                      </Link>
                    )}
                  </div>

                  {canVerifyPayments && (
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        disabled={updatePaymentMutation.isPending}
                        onClick={() => handlePaymentStatus(payment, "verified")}
                        className="rounded-control bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                      >
                        Verify
                      </button>
                      <button
                        type="button"
                        disabled={updatePaymentMutation.isPending}
                        onClick={() => handlePaymentStatus(payment, "rejected")}
                        className="rounded-control border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950/40"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-xs text-muted dark:text-stone-500">
                No payments are waiting for verification.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="portal-surface p-6 lg:col-span-2">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-forest dark:text-cream">
                {t("dashboard.top_businesses", "Top Inquired Businesses")}
              </h2>
              <p className="mt-1 text-xs text-muted dark:text-stone-400">
                Businesses tourists contact the most directly
              </p>
            </div>
            <Link
              to="/admin/businesses"
              className="flex shrink-0 items-center gap-1 rounded-control border border-line bg-paper px-3 py-1.5 text-xs font-semibold text-forest transition hover:border-brand-300 hover:bg-brand-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 dark:text-brand-300"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-sage-deep text-[10px] font-bold uppercase tracking-[0.08em] text-muted dark:border-stone-700 dark:text-stone-400">
                  <th className="pb-3">Business</th>
                  <th className="pb-3">Verification</th>
                  <th className="pb-3 text-right">Inquiries (30d)</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage-deep/60 dark:divide-stone-800">
                {topBusinesses.length > 0 ? (
                  topBusinesses.map((biz) => (
                    <tr key={biz.id} className="transition hover:bg-sage/40 dark:hover:bg-stone-800/50">
                      <td className="py-3.5 pr-4">
                        <div className="font-semibold leading-tight text-forest dark:text-white">
                          {biz.name_km}
                        </div>
                        <div className="mt-0.5 text-xs leading-tight text-muted dark:text-stone-400">
                          {biz.name_en}
                        </div>
                      </td>
                      <td className="py-3.5">
                        {biz.is_verified ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-sage-deep bg-sage px-2.5 py-1 text-[10px] font-semibold text-forest dark:border-brand-800 dark:bg-brand-950/40 dark:text-brand-300">
                            <CheckCircle2 className="w-3 h-3" />
                            Verified
                          </span>
                        ) : (
                          <span className="text-xs text-muted dark:text-stone-500">Regular</span>
                        )}
                      </td>
                      <td className="py-3.5 text-right font-serif text-lg font-semibold text-brand-700 dark:text-brand-300">
                        {biz.contacts_count}
                      </td>
                      <td className="py-3.5 text-right">
                        <Link
                          to={`/admin/businesses/${biz.id}/edit`}
                          className="rounded-control border border-line bg-paper px-3 py-1.5 text-xs font-semibold text-forest transition hover:border-brand-300 hover:bg-brand-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 dark:text-stone-300"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-xs text-muted dark:text-stone-500">
                      No interaction events recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="portal-surface p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-base font-bold text-forest dark:text-cream">
              {t("dashboard.by_category", "Businesses by Category")}
            </h2>
            <Link to="/admin/categories" className="text-xs font-semibold text-brand-700 hover:underline dark:text-brand-300">
              Manage
            </Link>
          </div>

          <div className="space-y-3">
            {byCategory.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2.5">
                  <div className="h-2 w-2 rounded-full bg-brand-500"></div>
                  <span className="font-medium text-forest dark:text-stone-200">{cat.name_en}</span>
                </div>
                <span className="rounded-full bg-sage px-2.5 py-0.5 text-xs font-bold text-forest dark:bg-stone-800 dark:text-stone-300">
                  {cat.businesses_count}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t border-sage-deep pt-5 dark:border-stone-800">
            <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.12em] text-muted dark:text-stone-400">
              {t("dashboard.quick_actions", "Quick Actions")}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/admin/reviews"
                className="rounded-control border border-line bg-paper p-3 text-center text-xs font-semibold text-forest transition hover:border-brand-300 hover:bg-brand-50 dark:border-white/10 dark:bg-white/5 dark:text-stone-200 dark:hover:bg-white/10"
              >
                Review Queue
              </Link>
              <Link
                to="/admin/stats"
                className="rounded-control border border-line bg-paper p-3 text-center text-xs font-semibold text-forest transition hover:border-brand-300 hover:bg-brand-50 dark:border-white/10 dark:bg-white/5 dark:text-stone-200 dark:hover:bg-white/10"
              >
                Owner Reports
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
