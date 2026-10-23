import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  BadgeDollarSign,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Edit3,
  Loader2,
  PlusCircle,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  TimerReset,
  WalletCards,
  X,
  XCircle,
} from "lucide-react";
import api from "@/lib/axios";
import { toast } from "@/store/toastStore";

const money = (value) => {
  const amount = Number(value || 0);
  return `$${Number.isInteger(amount) ? amount : amount.toFixed(2)}`;
};

const dateLabel = (value) => (value ? new Date(value).toLocaleDateString() : "—");

const emptyPlan = {
  code: "verified",
  name_km: "",
  name_en: "",
  description_km: "",
  description_en: "",
  price_usd: 0,
  billing_cycle: "monthly",
  features: "",
  limits: {
    max_photos: "",
    max_services: "",
    max_team_members: "",
    analytics_days: "",
    lead_export: false,
    featured_placement: false,
    sponsored_placement: false,
    support_level: "priority",
  },
  trial_days: 0,
  is_active: true,
  sort_order: 0,
};

const Modal = ({ open, onClose, title, subtitle, children, wide = false }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className={`max-h-[92vh] w-full overflow-y-auto rounded-card border border-line bg-cream p-5 shadow-premium dark:border-white/10 dark:bg-stone-850 sm:p-6 ${wide ? "max-w-3xl" : "max-w-xl"}`}>
        <div className="flex items-start justify-between gap-4 border-b border-stone-200 pb-3 dark:border-stone-800">
          <div>
            <h3 className="text-base font-extrabold text-forest dark:text-white sm:text-lg">{title}</h3>
            {subtitle ? <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">{subtitle}</p> : null}
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="pt-4">{children}</div>
      </div>
    </div>
  );
};

const Field = ({ label, children }) => (
  <label className="block space-y-1.5">
    <span className="text-xs font-bold uppercase tracking-wider text-stone-400">{label}</span>
    {children}
  </label>
);

const inputClass = "w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-800 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-stone-700 dark:bg-stone-900 dark:text-white";

const StatusBadge = ({ status }) => {
  const map = {
    active: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    verified: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    approved: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    pending: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    rejected: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
    canceled: "bg-stone-500/10 text-stone-500 dark:text-stone-400",
    expired: "bg-stone-500/10 text-stone-500 dark:text-stone-400",
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${map[status] || map.pending}`}>
      {status}
    </span>
  );
};

const Pagination = ({ meta, page, setPage }) => {
  if (!meta?.last_page || meta.last_page <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t border-stone-200 bg-stone-50 p-3 text-xs dark:border-stone-800 dark:bg-stone-800/40">
      <span className="text-stone-500">Page {meta.current_page} of {meta.last_page}</span>
      <div className="flex items-center gap-2">
        <button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded-lg border border-stone-300 p-1.5 disabled:opacity-40 dark:border-stone-700">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button type="button" disabled={page >= meta.last_page} onClick={() => setPage((value) => value + 1)} className="rounded-lg border border-stone-300 p-1.5 disabled:opacity-40 dark:border-stone-700">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export const AdminBillingPage = () => {
  const { i18n } = useTranslation();
  const isKm = i18n.language === "km";
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("subscriptions");
  const [search, setSearch] = useState("");
  const [subscriptionStatus, setSubscriptionStatus] = useState("");
  const [requestStatus, setRequestStatus] = useState("pending");
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [subPage, setSubPage] = useState(1);
  const [requestPage, setRequestPage] = useState(1);
  const [paymentPage, setPaymentPage] = useState(1);

  const [paymentTarget, setPaymentTarget] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    amount_usd: "",
    method: "khqr",
    status: "verified",
    reference_no: "",
    receipt_no: "",
    paid_at: "",
    notes: "",
  });

  const [approveTarget, setApproveTarget] = useState(null);
  const [approveForm, setApproveForm] = useState({
    plan_id: "",
    starts_at: "",
    ends_at: "",
    admin_note: "",
    record_payment: false,
    amount_usd: "",
    method: "khqr",
    reference_no: "",
  });

  const [planTarget, setPlanTarget] = useState(null);
  const [planForm, setPlanForm] = useState(emptyPlan);

  const [activateOpen, setActivateOpen] = useState(false);
  const [businessSearch, setBusinessSearch] = useState("");
  const [activateForm, setActivateForm] = useState({
    business_id: "",
    business_label: "",
    plan_id: "",
    starts_at: "",
    ends_at: "",
    notes: "",
    record_payment: false,
    amount_usd: "",
    method: "khqr",
    reference_no: "",
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-billing"] });
  };

  const statsQuery = useQuery({
    queryKey: ["admin-billing", "stats"],
    queryFn: async () => {
      const res = await api.get("/admin/business/billing/stats");
      return res.data?.data || {};
    },
  });

  const plansQuery = useQuery({
    queryKey: ["admin-billing", "plans"],
    queryFn: async () => {
      const res = await api.get("/admin/business/billing/plans");
      return res.data?.data || [];
    },
  });

  const subscriptionsQuery = useQuery({
    queryKey: ["admin-billing", "subscriptions", subPage, search, subscriptionStatus],
    queryFn: async () => {
      const params = { page: subPage, per_page: 15 };
      if (search.trim()) params.search = search.trim();
      if (subscriptionStatus) params.status = subscriptionStatus;
      const res = await api.get("/admin/business/billing/subscriptions", { params });
      return res.data;
    },
    enabled: activeTab === "subscriptions",
  });

  const requestsQuery = useQuery({
    queryKey: ["admin-billing", "requests", requestPage, search, requestStatus],
    queryFn: async () => {
      const params = { page: requestPage, per_page: 15 };
      if (search.trim()) params.search = search.trim();
      if (requestStatus) params.status = requestStatus;
      const res = await api.get("/admin/business/billing/subscription-requests", { params });
      return res.data;
    },
    enabled: activeTab === "requests",
  });

  const paymentsQuery = useQuery({
    queryKey: ["admin-billing", "payments", paymentPage, search, paymentStatus],
    queryFn: async () => {
      const params = { page: paymentPage, per_page: 15 };
      if (search.trim()) params.search = search.trim();
      if (paymentStatus) params.status = paymentStatus;
      const res = await api.get("/admin/business/billing/payments", { params });
      return res.data;
    },
    enabled: activeTab === "payments",
  });

  const businessSearchQuery = useQuery({
    queryKey: ["admin-billing", "business-search", businessSearch],
    queryFn: async () => {
      const res = await api.get("/admin/business/businesses", {
        params: { search: businessSearch.trim(), per_page: 8 },
      });
      return res.data?.data || [];
    },
    enabled: activateOpen && businessSearch.trim().length >= 2,
  });

  const plans = Array.isArray(plansQuery.data) ? plansQuery.data : [];
  const subscriptions = subscriptionsQuery.data?.data || [];
  const requests = requestsQuery.data?.data || [];
  const payments = paymentsQuery.data?.data || [];
  const stats = statsQuery.data || {};
  const planCodes = ["free", "verified", "featured"];
  const availablePlanCodes = planCodes.filter(
    (code) => !plans.some((plan) => plan.code === code)
  );

  const statCards = useMemo(() => [
    { label: isKm ? "ការជាវសកម្ម" : "Active subscriptions", value: stats.active_subscriptions ?? "—", icon: BadgeDollarSign, tone: "text-emerald-600 bg-emerald-500/10" },
    { label: isKm ? "ការសាកល្បង" : "Active trials", value: stats.trial_subscriptions ?? "—", icon: Sparkles, tone: "text-sky-600 bg-sky-500/10" },
    { label: isKm ? "ជិតផុតកំណត់ ៧ ថ្ងៃ" : "Expiring in 7 days", value: stats.expiring_soon ?? "—", icon: TimerReset, tone: "text-amber-600 bg-amber-500/10" },
    { label: isKm ? "សំណើរង់ចាំ" : "Pending requests", value: stats.pending_requests ?? "—", icon: Send, tone: "text-violet-600 bg-violet-500/10" },
    { label: isKm ? "ការទូទាត់រង់ចាំ" : "Pending payments", value: stats.pending_payments ?? "—", icon: WalletCards, tone: "text-rose-600 bg-rose-500/10" },
    { label: isKm ? "ចំណូល ៣០ ថ្ងៃ" : "Revenue 30 days", value: money(stats.verified_revenue_30d), icon: CreditCard, tone: "text-forest bg-brand-500/15 dark:text-brand-300" },
  ], [isKm, stats]);

  const recordPayment = useMutation({
    mutationFn: async () => {
      if (!paymentTarget?.id) return;
      await api.post(`/admin/business/billing/subscriptions/${paymentTarget.id}/payments`, {
        amount_usd: Number(paymentForm.amount_usd || 0),
        method: paymentForm.method,
        status: paymentForm.status,
        reference_no: paymentForm.reference_no || null,
        receipt_no: paymentForm.receipt_no || null,
        paid_at: paymentForm.paid_at || null,
        notes: paymentForm.notes || null,
      });
    },
    onSuccess: () => {
      toast.success(isKm ? "បានកត់ត្រាការទូទាត់" : "Payment recorded");
      setPaymentTarget(null);
      invalidate();
    },
    onError: (error) => toast.error(error.response?.data?.message || (isKm ? "បរាជ័យ" : "Failed to record payment")),
  });

  const approveRequest = useMutation({
    mutationFn: async () => {
      if (!approveTarget?.id) return;
      const payload = {
        plan_id: Number(approveForm.plan_id || approveTarget.requested_plan?.id),
        starts_at: approveForm.starts_at || null,
        ends_at: approveForm.ends_at || null,
        admin_note: approveForm.admin_note || null,
      };
      if (approveForm.record_payment) {
        payload.payment = {
          amount_usd: Number(approveForm.amount_usd || 0),
          method: approveForm.method,
          reference_no: approveForm.reference_no || null,
          status: "verified",
          paid_at: new Date().toISOString(),
        };
      }
      await api.post(`/admin/business/billing/subscription-requests/${approveTarget.id}/approve`, payload);
    },
    onSuccess: () => {
      toast.success(isKm ? "បានអនុម័តសំណើ និងធ្វើឱ្យគម្រោងសកម្ម" : "Request approved and plan activated");
      setApproveTarget(null);
      invalidate();
    },
    onError: (error) => toast.error(error.response?.data?.message || (isKm ? "បរាជ័យ" : "Failed to approve request")),
  });

  const rejectRequest = useMutation({
    mutationFn: async ({ id, note }) => {
      await api.post(`/admin/business/billing/subscription-requests/${id}/reject`, { admin_note: note });
    },
    onSuccess: () => {
      toast.success(isKm ? "បានបដិសេធសំណើ" : "Request rejected");
      invalidate();
    },
    onError: (error) => toast.error(error.response?.data?.message || (isKm ? "បរាជ័យ" : "Failed to reject request")),
  });

  const updatePaymentStatus = useMutation({
    mutationFn: async ({ id, status, notes }) => {
      await api.put(`/admin/business/billing/payments/${id}`, { status, notes });
    },
    onSuccess: (_, variables) => {
      toast.success(variables.status === "verified"
        ? isKm ? "បានផ្ទៀងផ្ទាត់ការទូទាត់" : "Payment verified"
        : isKm ? "បានបដិសេធការទុទាត់" : "Payment rejected");
      invalidate();
    },
    onError: (error) => toast.error(error.response?.data?.message || (isKm ? "បរាជ័យ" : "Failed to update payment")),
  });

  const savePlan = useMutation({
    mutationFn: async () => {
      const limits = {
        ...planForm.limits,
        max_photos: planForm.limits.max_photos === "" ? null : Number(planForm.limits.max_photos),
        max_services: planForm.limits.max_services === "" ? null : Number(planForm.limits.max_services),
        max_team_members: planForm.limits.max_team_members === "" ? null : Number(planForm.limits.max_team_members),
        analytics_days: planForm.limits.analytics_days === "" ? null : Number(planForm.limits.analytics_days),
      };
      const payload = {
        code: planForm.code,
        name_km: planForm.name_km,
        name_en: planForm.name_en,
        description_km: planForm.description_km || null,
        description_en: planForm.description_en || null,
        price_usd: Number(planForm.price_usd || 0),
        billing_cycle: planForm.billing_cycle,
        features: planForm.features.split("\n").map((item) => item.trim()).filter(Boolean),
        limits,
        trial_days: Number(planForm.trial_days || 0),
        is_active: Boolean(planForm.is_active),
        sort_order: Number(planForm.sort_order || 0),
      };

      if (planTarget?.id) {
        await api.put(`/admin/business/billing/plans/${planTarget.id}`, payload);
      } else {
        await api.post("/admin/business/billing/plans", payload);
      }
    },
    onSuccess: () => {
      toast.success(isKm ? "បានរក្សាទុកគម្រោង" : "Plan saved");
      setPlanTarget(null);
      invalidate();
    },
    onError: (error) => {
      const errors = error.response?.data?.errors;
      const firstError = errors ? Object.values(errors)[0]?.[0] : null;
      toast.error(firstError || error.response?.data?.message || (isKm ? "បរាជ័យ" : "Failed to save plan"));
    },
  });

  const activatePlan = useMutation({
    mutationFn: async () => {
      if (!activateForm.business_id || !activateForm.plan_id) return;
      const payload = {
        plan_id: Number(activateForm.plan_id),
        starts_at: activateForm.starts_at || null,
        ends_at: activateForm.ends_at || null,
        notes: activateForm.notes || null,
      };
      if (activateForm.record_payment) {
        payload.payment = {
          amount_usd: Number(activateForm.amount_usd || 0),
          method: activateForm.method,
          reference_no: activateForm.reference_no || null,
          status: "verified",
          paid_at: new Date().toISOString(),
        };
      }
      await api.post(`/admin/business/billing/businesses/${activateForm.business_id}/activate`, payload);
    },
    onSuccess: () => {
      toast.success(isKm ? "បានធ្វើឱ្យគម្រោងសកម្ម" : "Subscription activated");
      setActivateOpen(false);
      setBusinessSearch("");
      setActivateForm({ business_id: "", business_label: "", plan_id: "", starts_at: "", ends_at: "", notes: "", record_payment: false, amount_usd: "", method: "khqr", reference_no: "" });
      invalidate();
    },
    onError: (error) => toast.error(error.response?.data?.message || (isKm ? "បរាជ័យ" : "Failed to activate subscription")),
  });

  const openPayment = (subscription) => {
    setPaymentTarget(subscription);
    setPaymentForm({
      amount_usd: subscription.price_usd ?? "",
      method: "khqr",
      status: "verified",
      reference_no: "",
      receipt_no: "",
      paid_at: "",
      notes: "",
    });
  };

  const openApprove = (request) => {
    setApproveTarget(request);
    const requestedPlan = plans.find((plan) => plan.id === request.requested_plan?.id);
    setApproveForm({
      plan_id: request.requested_plan?.id || "",
      starts_at: "",
      ends_at: "",
      admin_note: "",
      record_payment: false,
      amount_usd: requestedPlan?.price_usd ?? "",
      method: "khqr",
      reference_no: "",
    });
  };

  const openPlan = (plan = null) => {
    setPlanTarget(plan || {});
    if (!plan) {
      setPlanForm({
        ...emptyPlan,
        code: availablePlanCodes[0] || emptyPlan.code,
        limits: { ...emptyPlan.limits },
      });
      return;
    }
    setPlanForm({
      code: plan.code,
      name_km: plan.name_km || "",
      name_en: plan.name_en || "",
      description_km: plan.description_km || "",
      description_en: plan.description_en || "",
      price_usd: plan.price_usd ?? 0,
      billing_cycle: plan.billing_cycle || "monthly",
      features: (plan.features || []).join("\n"),
      limits: {
        max_photos: plan.limits?.max_photos ?? "",
        max_services: plan.limits?.max_services ?? "",
        max_team_members: plan.limits?.max_team_members ?? "",
        analytics_days: plan.limits?.analytics_days ?? "",
        lead_export: Boolean(plan.limits?.lead_export),
        featured_placement: Boolean(plan.limits?.featured_placement),
        sponsored_placement: Boolean(plan.limits?.sponsored_placement),
        support_level: plan.limits?.support_level || "priority",
      },
      trial_days: plan.trial_days ?? 0,
      is_active: Boolean(plan.is_active),
      sort_order: plan.sort_order ?? 0,
    });
  };

  const openActivation = (plan = null) => {
    setActivateOpen(true);
    setBusinessSearch("");
    setActivateForm({
      business_id: "",
      business_label: "",
      plan_id: plan?.id || "",
      starts_at: "",
      ends_at: "",
      notes: "",
      record_payment: false,
      amount_usd: plan?.price_usd ?? "",
      method: "khqr",
      reference_no: "",
    });
  };

  const confirmRejectRequest = (request) => {
    const note = window.prompt(isKm ? "មូលហេតុនៃការបដិសេធ (ត្រូវបំពេញ):" : "Reason for rejection (required):");
    if (!note?.trim()) return;
    rejectRequest.mutate({ id: request.id, note: note.trim() });
  };

  const confirmUpdatePayment = (payment, status) => {
    let notes = null;
    if (status === "rejected") {
      notes = window.prompt(isKm ? "មូលហេតុនៃការបដិសេធការទូទាត់:" : "Reason for rejecting this payment:");
      if (!notes?.trim()) return;
      notes = notes.trim();
    }
    updatePaymentStatus.mutate({ id: payment.id, status, notes });
  };

  const tabs = [
    { key: "subscriptions", label: isKm ? "ការជាវ" : "Subscriptions", icon: CreditCard },
    { key: "requests", label: isKm ? "សំណើគម្រោង" : "Requests", icon: Send, badge: stats.pending_requests },
    { key: "payments", label: isKm ? "ការទូទាត់" : "Payments", icon: WalletCards, badge: stats.pending_payments },
    { key: "plans", label: isKm ? "គម្រោង" : "Plans", icon: Sparkles },
  ];

  const isFetching = subscriptionsQuery.isFetching || requestsQuery.isFetching || paymentsQuery.isFetching;
  const hasError = statsQuery.isError || plansQuery.isError || subscriptionsQuery.isError || requestsQuery.isError || paymentsQuery.isError;

  return (
    <div className="mx-auto max-w-[1280px] space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-brand-700 dark:text-brand-300">
            <BadgeDollarSign className="h-4 w-4" />
            {isKm ? "មជ្ឈមណ្ឌលហិរញ្ញវត្ថុ" : "Revenue operations"}
          </div>
          <h1 className="mt-1.5 text-2xl font-bold text-forest dark:text-cream sm:text-3xl">
            {isKm ? "ការគ្រប់គ្រងការជាវ និងការទូទាត់" : "Billing control center"}
          </h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            {isKm
              ? "គ្រប់គ្រងគម្រោង ការជាវ សំណើពីម្ចាស់អាជីវកម្ម និងការផ្ទៀងផ្ទាត់ការទូទាត់នៅកន្លែងតែមួយ។"
              : "Manage plans, subscriptions, owner requests, and payment verification in one place."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ["admin-billing"] });
            }}
            disabled={isFetching}
            className="inline-flex items-center gap-2 rounded-control border border-line bg-cream px-4 py-2.5 text-xs font-bold text-forest transition hover:border-brand-300 hover:bg-brand-50 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-stone-200 dark:hover:bg-white/10"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            {isKm ? "ធ្វើឱ្យថ្មី" : "Refresh"}
          </button>
          <button
            type="button"
            onClick={() => openActivation()}
            className="inline-flex items-center gap-2 rounded-control bg-brand-500 px-4 py-2.5 text-xs font-extrabold text-forest shadow-gold transition hover:bg-brand-400"
          >
            <PlusCircle className="h-4 w-4" />
            {isKm ? "ធ្វើឱ្យគម្រោងសកម្ម" : "Activate plan"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((card) => (
          <div key={card.label} className="portal-surface p-4">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${card.tone}`}>
              <card.icon className="h-4 w-4" />
            </div>
            <div className="mt-3 text-xl font-extrabold text-forest dark:text-white">{card.value}</div>
            <div className="mt-0.5 text-xs font-bold uppercase tracking-wide text-stone-400">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 portal-surface p-2">
        <div className="flex flex-wrap gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setActiveTab(tab.key);
                setSearch("");
                if (tab.key === "subscriptions") setSubPage(1);
                if (tab.key === "requests") setRequestPage(1);
                if (tab.key === "payments") setPaymentPage(1);
              }}
              className={`inline-flex items-center gap-2 rounded-control px-4 py-2.5 text-xs font-bold transition ${activeTab === tab.key
                ? "bg-brand-500 text-forest shadow-gold"
                : "text-muted hover:bg-brand-50 hover:text-forest dark:text-stone-400 dark:hover:bg-white/10"
                }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {tab.badge > 0 ? (
                <span className={`rounded-full px-1.5 py-0.5 text-xs ${activeTab === tab.key ? "bg-white/20" : "bg-amber-500/15 text-amber-700 dark:text-amber-400"}`}>
                  {tab.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      {hasError ? (
        <div className="rounded-card border border-rose-200 bg-rose-50 p-6 text-sm font-semibold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-300">
          {isKm ? "មិនអាចទាញយកទិន្នន័យហិរញ្ញវត្ថុបានទេ។ សូមព្យាយាមម្តងទៀត។" : "Could not load billing data. Please try again."}
        </div>
      ) : null}

      {activeTab !== "plans" ? (
        <div className="flex flex-col gap-3 portal-surface p-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-stone-400" />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setSubPage(1);
                setRequestPage(1);
                setPaymentPage(1);
              }}
              placeholder={isKm ? "ស្វែងរកតាមឈ្មោះអាជីវកម្ម..." : "Search by business name..."}
              className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-stone-700 dark:bg-stone-900 dark:text-white"
            />
          </div>
          {activeTab === "subscriptions" ? (
            <select value={subscriptionStatus} onChange={(event) => { setSubscriptionStatus(event.target.value); setSubPage(1); }} className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-xs font-semibold dark:border-stone-700 dark:bg-stone-900 dark:text-white">
              <option value="">{isKm ? "ស្ថានភាពទាំងអស់" : "All statuses"}</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="canceled">Canceled</option>
            </select>
          ) : null}
          {activeTab === "requests" ? (
            <select value={requestStatus} onChange={(event) => { setRequestStatus(event.target.value); setRequestPage(1); }} className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-xs font-semibold dark:border-stone-700 dark:bg-stone-900 dark:text-white">
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="canceled">Canceled</option>
              <option value="">All requests</option>
            </select>
          ) : null}
          {activeTab === "payments" ? (
            <select value={paymentStatus} onChange={(event) => { setPaymentStatus(event.target.value); setPaymentPage(1); }} className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-xs font-semibold dark:border-stone-700 dark:bg-stone-900 dark:text-white">
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
              <option value="">All payments</option>
            </select>
          ) : null}
        </div>
      ) : null}

      {activeTab === "subscriptions" ? (
        <div className="overflow-hidden portal-surface overflow-hidden">
          <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3 dark:border-stone-800">
            <h2 className="text-sm font-extrabold text-forest dark:text-white">{isKm ? "ការជាវថ្មីៗ" : "Recent subscriptions"}</h2>
            <span className="text-xs font-semibold text-stone-400">{subscriptionsQuery.data?.meta?.total || 0} total</span>
          </div>
          {subscriptionsQuery.isLoading ? (
            <div className="flex items-center justify-center gap-2 p-12 text-sm text-stone-500"><Loader2 className="h-5 w-5 animate-spin text-amber-500" /> Loading...</div>
          ) : subscriptions.length === 0 ? (
            <div className="p-12 text-center text-sm text-stone-500">{isKm ? "មិនមានការជាវទេ" : "No subscriptions found"}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-xs">
                <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-400 dark:bg-stone-800/50">
                  <tr>
                    <th className="px-4 py-3">Business</th>
                    <th className="px-4 py-3">Plan</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Period</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Paid</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {subscriptions.map((subscription) => (
                    <tr key={subscription.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/30">
                      <td className="px-4 py-3">
                        <div className="font-bold text-forest dark:text-white">
                          {isKm ? subscription.business?.name_km || subscription.business?.name_en : subscription.business?.name_en || subscription.business?.name_km}
                        </div>
                        <div className="text-xs text-stone-400">#{subscription.business?.id}</div>
                      </td>
                      <td className="px-4 py-3 font-semibold">{subscription.plan?.code}</td>
                      <td className="px-4 py-3"><StatusBadge status={subscription.status} /></td>
                      <td className="px-4 py-3 text-stone-500">
                        {dateLabel(subscription.starts_at)} → {dateLabel(subscription.ends_at)}
                      </td>
                      <td className="px-4 py-3 font-bold">{money(subscription.price_usd)}</td>
                      <td className="px-4 py-3 font-semibold text-emerald-600 dark:text-emerald-400">{money(subscription.paid_total)}</td>
                      <td className="px-4 py-3 text-right">
                        <button type="button" onClick={() => openPayment(subscription)} className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-2.5 py-1.5 text-xs font-bold text-amber-700 hover:bg-amber-500/20 dark:text-amber-400">
                          <CreditCard className="h-3.5 w-3.5" />
                          {isKm ? "កត់ត្រាការទូទាត់" : "Record payment"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Pagination meta={subscriptionsQuery.data?.meta} page={subPage} setPage={setSubPage} />
        </div>
      ) : null}

      {activeTab === "requests" ? (
        <div className="space-y-3">
          {requestsQuery.isLoading ? (
            <div className="flex items-center justify-center gap-2 portal-surface p-12 text-sm text-stone-500 dark:border-stone-800 dark:bg-stone-850"><Loader2 className="h-5 w-5 animate-spin text-amber-500" /> Loading...</div>
          ) : requests.length === 0 ? (
            <div className="portal-surface p-12 text-center text-sm text-stone-500 dark:border-stone-800 dark:bg-stone-850">{isKm ? "មិនមានសំណើទេ" : "No requests found"}</div>
          ) : (
            requests.map((request) => (
              <div key={request.id} className="portal-surface p-4 sm:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-extrabold text-forest dark:text-white">
                        {isKm ? request.business?.name_km || request.business?.name_en : request.business?.name_en || request.business?.name_km}
                      </h3>
                      <StatusBadge status={request.status} />
                      <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-bold uppercase text-stone-500 dark:bg-stone-800 dark:text-stone-400">
                        {request.requested_plan?.code || "plan"}
                      </span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500 dark:text-stone-400">
                      <span>{request.requested_plan?.name_en || request.requested_plan?.name_km}</span>
                      <span>{money(request.requested_plan?.price_usd)} / {request.requested_plan?.billing_cycle}</span>
                      <span>{request.contact_phone || "—"}</span>
                      <span>{dateLabel(request.created_at)}</span>
                    </div>
                    {request.note ? <p className="mt-2 rounded-xl bg-stone-50 p-2.5 text-xs text-stone-600 dark:bg-stone-800/60 dark:text-stone-300">{request.note}</p> : null}
                    {request.admin_note ? <p className="mt-2 text-xs italic text-stone-400">Admin: {request.admin_note}</p> : null}
                  </div>
                  {request.status === "pending" ? (
                    <div className="flex shrink-0 items-center gap-2">
                      <button type="button" onClick={() => openApprove(request)} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {isKm ? "អនុម័ត" : "Approve"}
                      </button>
                      <button type="button" onClick={() => confirmRejectRequest(request)} disabled={rejectRequest.isPending} className="inline-flex items-center gap-1.5 rounded-xl bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-500/20 disabled:opacity-50 dark:text-rose-400">
                        <XCircle className="h-3.5 w-3.5" />
                        {isKm ? "បដិសេធ" : "Reject"}
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            ))
          )}
          <Pagination meta={requestsQuery.data?.meta} page={requestPage} setPage={setRequestPage} />
        </div>
      ) : null}

      {activeTab === "payments" ? (
        <div className="overflow-hidden portal-surface overflow-hidden">
          <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3 dark:border-stone-800">
            <h2 className="text-sm font-extrabold text-forest dark:text-white">{isKm ? "ការទូទាត់" : "Payments"}</h2>
            <span className="text-xs font-semibold text-stone-400">{paymentsQuery.data?.meta?.total || 0} total</span>
          </div>
          {paymentsQuery.isLoading ? (
            <div className="flex items-center justify-center gap-2 p-12 text-sm text-stone-500"><Loader2 className="h-5 w-5 animate-spin text-amber-500" /> Loading...</div>
          ) : payments.length === 0 ? (
            <div className="p-12 text-center text-sm text-stone-500">{isKm ? "មិនមានការទូទាត់ទេ" : "No payments found"}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-xs">
                <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-400 dark:bg-stone-800/50">
                  <tr>
                    <th className="px-4 py-3">Business</th>
                    <th className="px-4 py-3">Plan</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Method / Ref</th>
                    <th className="px-4 py-3">Paid</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/30">
                      <td className="px-4 py-3 font-bold text-forest dark:text-white">
                        {isKm ? payment.subscription?.business?.name_km || payment.subscription?.business?.name_en : payment.subscription?.business?.name_en || payment.subscription?.business?.name_km}
                      </td>
                      <td className="px-4 py-3 font-semibold">{payment.subscription?.plan?.code || "—"}</td>
                      <td className="px-4 py-3 font-extrabold">{money(payment.amount_usd)}</td>
                      <td className="px-4 py-3 text-stone-500">
                        <div className="font-semibold uppercase">{payment.method}</div>
                        <div className="text-xs">{payment.reference_no || payment.receipt_no || "—"}</div>
                      </td>
                      <td className="px-4 py-3 text-stone-500">{dateLabel(payment.paid_at || payment.created_at)}</td>
                      <td className="px-4 py-3"><StatusBadge status={payment.status} /></td>
                      <td className="px-4 py-3 text-right">
                        {payment.status === "pending" ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button type="button" onClick={() => confirmUpdatePayment(payment, "verified")} disabled={updatePaymentStatus.isPending} className="rounded-lg bg-emerald-500/10 p-1.5 text-emerald-600 hover:bg-emerald-500/20 disabled:opacity-50 dark:text-emerald-400" title="Verify">
                              <CheckCircle2 className="h-4 w-4" />
                            </button>
                            <button type="button" onClick={() => confirmUpdatePayment(payment, "rejected")} disabled={updatePaymentStatus.isPending} className="rounded-lg bg-rose-500/10 p-1.5 text-rose-600 hover:bg-rose-500/20 disabled:opacity-50 dark:text-rose-400" title="Reject">
                              <XCircle className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-stone-400">{payment.verified_by?.name || "—"}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Pagination meta={paymentsQuery.data?.meta} page={paymentPage} setPage={setPaymentPage} />
        </div>
      ) : null}

      {activeTab === "plans" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-forest dark:text-white">{isKm ? "គម្រោងអាជីវកម្ម" : "Business plans"}</h2>
            {availablePlanCodes.length > 0 ? (
              <button type="button" onClick={() => openPlan()} disabled={plansQuery.isLoading || plansQuery.isError} className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3.5 py-2 text-xs font-extrabold text-stone-950 hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50">
                <PlusCircle className="h-3.5 w-3.5" />
                {isKm ? "បន្ថែមគម្រោង" : "New plan"}
              </button>
            ) : (
              <span className="text-xs font-semibold text-stone-400">
                {isKm ? "គម្រោងទាំង ៣ ត្រូវបានកំណត់រួចហើយ" : "All 3 tiers are configured"}
              </span>
            )}
          </div>
          {plansQuery.isLoading ? (
            <div className="flex items-center justify-center gap-2 portal-surface p-12 text-sm text-stone-500 dark:border-stone-800 dark:bg-stone-850">
              <Loader2 className="h-5 w-5 animate-spin text-amber-500" /> Loading...
            </div>
          ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {plans.map((plan) => (
              <div key={plan.id} className="flex flex-col justify-between portal-surface p-5">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-stone-400">{plan.code}</div>
                      <h3 className="mt-1 text-lg font-extrabold text-forest dark:text-white">{plan.name_en}</h3>
                      <p className="text-xs text-stone-500">{plan.name_km}</p>
                    </div>
                    <StatusBadge status={plan.is_active ? "active" : "expired"} />
                  </div>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-forest dark:text-white">{money(plan.price_usd)}</span>
                    <span className="text-xs text-stone-400">/ {plan.billing_cycle}</span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-xl bg-stone-50 p-2 dark:bg-stone-800/60"><span className="font-bold">{plan.limits?.max_photos ?? "∞"}</span> photos</div>
                    <div className="rounded-xl bg-stone-50 p-2 dark:bg-stone-800/60"><span className="font-bold">{plan.limits?.max_services ?? "∞"}</span> services</div>
                    <div className="rounded-xl bg-stone-50 p-2 dark:bg-stone-800/60"><span className="font-bold">{plan.trial_days || 0}</span> trial days</div>
                    <div className="rounded-xl bg-stone-50 p-2 dark:bg-stone-800/60"><span className="font-bold">{plan.subscriptions_count || 0}</span> subs</div>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 border-t border-stone-100 pt-4 dark:border-stone-800">
                  <button type="button" onClick={() => openPlan(plan)} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-sage-deep px-3 py-2 text-xs font-bold text-forest hover:bg-stone-50 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800">
                    <Edit3 className="h-3.5 w-3.5" />
                    {isKm ? "កែសម្រួល" : "Edit"}
                  </button>
                  <button type="button" onClick={() => openActivation(plan)} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-amber-500 px-3 py-2 text-xs font-extrabold text-stone-950 hover:bg-amber-600">
                    <Sparkles className="h-3.5 w-3.5" />
                    {isKm ? "ធ្វើឱ្យសកម្ម" : "Activate"}
                  </button>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      ) : null}

      <Modal
        open={Boolean(paymentTarget)}
        onClose={() => setPaymentTarget(null)}
        title={isKm ? "កត់ត្រាការទូទាត់" : "Record payment"}
        subtitle={paymentTarget?.business ? (isKm ? paymentTarget.business.name_km : paymentTarget.business.name_en) : ""}
      >
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label={isKm ? "ចំនួនទឹកប្រាក់ (USD)" : "Amount (USD)"}>
              <input type="number" min="0" step="0.01" value={paymentForm.amount_usd} onChange={(event) => setPaymentForm({ ...paymentForm, amount_usd: event.target.value })} className={inputClass} />
            </Field>
            <Field label={isKm ? "វិធីទូទាត់" : "Method"}>
              <select value={paymentForm.method} onChange={(event) => setPaymentForm({ ...paymentForm, method: event.target.value })} className={inputClass}>
                <option value="khqr">KHQR</option>
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank transfer</option>
                <option value="other">Other</option>
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label={isKm ? "ស្ថានភាព" : "Status"}>
              <select value={paymentForm.status} onChange={(event) => setPaymentForm({ ...paymentForm, status: event.target.value })} className={inputClass}>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </Field>
            <Field label={isKm ? "កាលបរិច្ឆេទ" : "Paid at"}>
              <input type="datetime-local" value={paymentForm.paid_at} onChange={(event) => setPaymentForm({ ...paymentForm, paid_at: event.target.value })} className={inputClass} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label={isKm ? "លេខយោង" : "Reference no"}>
              <input value={paymentForm.reference_no} onChange={(event) => setPaymentForm({ ...paymentForm, reference_no: event.target.value })} className={inputClass} />
            </Field>
            <Field label={isKm ? "លេខបង្កាន់ដៃ" : "Receipt no"}>
              <input value={paymentForm.receipt_no} onChange={(event) => setPaymentForm({ ...paymentForm, receipt_no: event.target.value })} className={inputClass} />
            </Field>
          </div>
          <Field label={isKm ? "កំណត់ចំណាំ" : "Notes"}>
            <textarea rows={3} value={paymentForm.notes} onChange={(event) => setPaymentForm({ ...paymentForm, notes: event.target.value })} className={inputClass} />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setPaymentTarget(null)} className="rounded-xl px-4 py-2 text-xs font-semibold text-stone-500">{isKm ? "បិទ" : "Cancel"}</button>
            <button type="button" onClick={() => recordPayment.mutate()} disabled={recordPayment.isPending} className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-extrabold text-stone-950 disabled:opacity-50">
              {recordPayment.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
              {isKm ? "រក្សាទុក" : "Save payment"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(approveTarget)}
        onClose={() => setApproveTarget(null)}
        title={isKm ? "អនុម័តសំណើគម្រោង" : "Approve plan request"}
        subtitle={approveTarget?.business ? (isKm ? approveTarget.business.name_km : approveTarget.business.name_en) : ""}
      >
        <div className="space-y-3">
          <Field label={isKm ? "គម្រោង" : "Plan"}>
            <select value={approveForm.plan_id} onChange={(event) => {
              const nextPlan = plans.find((plan) => String(plan.id) === event.target.value);
              setApproveForm({ ...approveForm, plan_id: event.target.value, amount_usd: nextPlan?.price_usd ?? approveForm.amount_usd });
            }} className={inputClass}>
              {plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name_en} — {money(plan.price_usd)}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={isKm ? "ចាប់ផ្តើម" : "Starts at"}>
              <input type="date" value={approveForm.starts_at} onChange={(event) => setApproveForm({ ...approveForm, starts_at: event.target.value })} className={inputClass} />
            </Field>
            <Field label={isKm ? "បញ្ចប់" : "Ends at"}>
              <input type="date" value={approveForm.ends_at} onChange={(event) => setApproveForm({ ...approveForm, ends_at: event.target.value })} className={inputClass} />
            </Field>
          </div>
          <Field label={isKm ? "កំណត់ចំណាំរបស់អ្នកគ្រប់គ្រង" : "Admin note"}>
            <textarea rows={2} value={approveForm.admin_note} onChange={(event) => setApproveForm({ ...approveForm, admin_note: event.target.value })} className={inputClass} />
          </Field>
          <label className="flex items-center gap-2 rounded-xl bg-stone-50 p-3 text-xs font-semibold text-stone-700 dark:bg-stone-800 dark:text-stone-300">
            <input type="checkbox" checked={approveForm.record_payment} onChange={(event) => setApproveForm({ ...approveForm, record_payment: event.target.checked })} className="h-4 w-4 rounded border-stone-300 text-amber-500" />
            {isKm ? "កត់ត្រាការទូទាត់ដែលបានផ្ទៀងផ្ទាត់" : "Record a verified payment"}
          </label>
          {approveForm.record_payment ? (
            <div className="grid grid-cols-3 gap-3">
              <Field label={isKm ? "ចំនួន" : "Amount"}>
                <input type="number" min="0" step="0.01" value={approveForm.amount_usd} onChange={(event) => setApproveForm({ ...approveForm, amount_usd: event.target.value })} className={inputClass} />
              </Field>
              <Field label={isKm ? "វិធី" : "Method"}>
                <select value={approveForm.method} onChange={(event) => setApproveForm({ ...approveForm, method: event.target.value })} className={inputClass}>
                  <option value="khqr">KHQR</option>
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank transfer</option>
                  <option value="other">Other</option>
                </select>
              </Field>
              <Field label={isKm ? "លេខយោង" : "Reference"}>
                <input value={approveForm.reference_no} onChange={(event) => setApproveForm({ ...approveForm, reference_no: event.target.value })} className={inputClass} />
              </Field>
            </div>
          ) : null}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setApproveTarget(null)} className="rounded-xl px-4 py-2 text-xs font-semibold text-stone-500">{isKm ? "បិទ" : "Cancel"}</button>
            <button type="button" onClick={() => approveRequest.mutate()} disabled={approveRequest.isPending} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-extrabold text-white disabled:opacity-50">
              {approveRequest.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              {isKm ? "អនុម័ត និងធ្វើឱ្យសកម្ម" : "Approve & activate"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(planTarget)}
        onClose={() => setPlanTarget(null)}
        title={planTarget?.id ? (isKm ? "កែសម្រួលគម្រោង" : "Edit plan") : (isKm ? "បង្កើតគម្រោងថ្មី" : "Create plan")}
        wide
      >
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label={isKm ? "កូដ" : "Code"}>
              <select disabled={Boolean(planTarget?.id)} value={planForm.code} onChange={(event) => setPlanForm({ ...planForm, code: event.target.value })} className={inputClass}>
                {(planTarget?.id ? planCodes : availablePlanCodes).map((code) => (
                  <option key={code} value={code}>{code}</option>
                ))}
              </select>
            </Field>
            <Field label={isKm ? "វដ្ត" : "Billing cycle"}>
              <select value={planForm.billing_cycle} onChange={(event) => setPlanForm({ ...planForm, billing_cycle: event.target.value })} className={inputClass}>
                <option value="none">none</option>
                <option value="monthly">monthly</option>
                <option value="yearly">yearly</option>
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label={isKm ? "ឈ្មោះខ្មែរ" : "Khmer name"}>
              <input value={planForm.name_km} onChange={(event) => setPlanForm({ ...planForm, name_km: event.target.value })} className={inputClass} />
            </Field>
            <Field label={isKm ? "ឈ្មោះអង់គ្លេស" : "English name"}>
              <input value={planForm.name_en} onChange={(event) => setPlanForm({ ...planForm, name_en: event.target.value })} className={inputClass} />
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label={isKm ? "តម្លៃ (USD)" : "Price (USD)"}>
              <input type="number" min="0" step="0.01" value={planForm.price_usd} onChange={(event) => setPlanForm({ ...planForm, price_usd: event.target.value })} className={inputClass} />
            </Field>
            <Field label={isKm ? "ថ្ងៃសាកល្បង" : "Trial days"}>
              <input type="number" min="0" value={planForm.trial_days} onChange={(event) => setPlanForm({ ...planForm, trial_days: event.target.value })} className={inputClass} />
            </Field>
            <Field label={isKm ? "លំដាប់" : "Sort order"}>
              <input type="number" min="0" value={planForm.sort_order} onChange={(event) => setPlanForm({ ...planForm, sort_order: event.target.value })} className={inputClass} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label={isKm ? "ការពិពណ៌នាខ្មែរ" : "Khmer description"}>
              <textarea rows={2} value={planForm.description_km} onChange={(event) => setPlanForm({ ...planForm, description_km: event.target.value })} className={inputClass} />
            </Field>
            <Field label={isKm ? "ការពិពណ៌នាអង់គ្លេស" : "English description"}>
              <textarea rows={2} value={planForm.description_en} onChange={(event) => setPlanForm({ ...planForm, description_en: event.target.value })} className={inputClass} />
            </Field>
          </div>
          <Field label={isKm ? "មុខងារ (មួយបន្ទាត់មួយ)" : "Features (one per line)"}>
            <textarea rows={4} value={planForm.features} onChange={(event) => setPlanForm({ ...planForm, features: event.target.value })} className={inputClass} />
          </Field>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["max_photos", isKm ? "រូបភាព" : "Photos"],
              ["max_services", isKm ? "សេវាកម្ម" : "Services"],
              ["max_team_members", isKm ? "ក្រុម" : "Team"],
              ["analytics_days", isKm ? "ថ្ងៃវិភាគ" : "Analytics days"],
            ].map(([key, label]) => (
              <Field key={key} label={label}>
                <input type="number" min="1" value={planForm.limits[key]} onChange={(event) => setPlanForm({ ...planForm, limits: { ...planForm.limits, [key]: event.target.value } })} className={inputClass} />
              </Field>
            ))}
          </div>
          <div className="flex flex-wrap gap-4 rounded-xl bg-stone-50 p-3 text-xs font-semibold text-stone-700 dark:bg-stone-800 dark:text-stone-300">
            {[
              ["lead_export", isKm ? "នាំចេញអតិថិជន" : "Lead export"],
              ["featured_placement", isKm ? "បង្ហាញលេចធ្លោ" : "Featured placement"],
              ["sponsored_placement", isKm ? "ការឧបត្ថម្ភ" : "Sponsored placement"],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2">
                <input type="checkbox" checked={Boolean(planForm.limits[key])} onChange={(event) => setPlanForm({ ...planForm, limits: { ...planForm.limits, [key]: event.target.checked } })} className="h-4 w-4 rounded border-stone-300 text-amber-500" />
                {label}
              </label>
            ))}
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={Boolean(planForm.is_active)} onChange={(event) => setPlanForm({ ...planForm, is_active: event.target.checked })} className="h-4 w-4 rounded border-stone-300 text-amber-500" />
              {isKm ? "សកម្ម" : "Active"}
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setPlanTarget(null)} className="rounded-xl px-4 py-2 text-xs font-semibold text-stone-500">{isKm ? "បិទ" : "Cancel"}</button>
            <button type="button" onClick={() => savePlan.mutate()} disabled={savePlan.isPending} className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-extrabold text-stone-950 disabled:opacity-50">
              {savePlan.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              {isKm ? "រក្សាទុកគម្រោង" : "Save plan"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={activateOpen}
        onClose={() => setActivateOpen(false)}
        title={isKm ? "ធ្វើឱ្យគម្រោងសកម្ម" : "Activate subscription"}
        subtitle={isKm ? "ស្វែងរកអាជីវកម្ម និងជ្រើសរើសគម្រោង" : "Find a business and choose a plan"}
      >
        <div className="space-y-3">
          <Field label={isKm ? "ស្វែងរកអាជីវកម្ម" : "Find business"}>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
              <input value={businessSearch} onChange={(event) => setBusinessSearch(event.target.value)} placeholder={isKm ? "វាយឈ្មោះយ៉ាងហោចណាស់ ២ តួអក្សរ..." : "Type at least 2 characters..."} className={`${inputClass} pl-9`} />
            </div>
          </Field>
          {activateForm.business_id ? (
            <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
              <span>{activateForm.business_label}</span>
              <button type="button" onClick={() => setActivateForm({ ...activateForm, business_id: "", business_label: "" })} className="text-emerald-700/70 hover:text-emerald-700 dark:text-emerald-400/70">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : null}
          {businessSearchQuery.data?.length > 0 && !activateForm.business_id ? (
            <div className="max-h-40 overflow-y-auto rounded-xl border border-stone-200 dark:border-stone-700">
              {businessSearchQuery.data.map((business) => (
                <button
                  key={business.id}
                  type="button"
                  onClick={() => setActivateForm({ ...activateForm, business_id: business.id, business_label: isKm ? business.name_km || business.name_en : business.name_en || business.name_km })}
                  className="block w-full border-b border-stone-100 px-3 py-2 text-left text-xs last:border-0 hover:bg-amber-50 dark:border-stone-800 dark:hover:bg-stone-800"
                >
                  <div className="font-bold text-forest dark:text-white">{isKm ? business.name_km || business.name_en : business.name_en || business.name_km}</div>
                  <div className="text-xs text-stone-400">#{business.id} • {business.status} • {business.tier}</div>
                </button>
              ))}
            </div>
          ) : null}
          <Field label={isKm ? "គម្រោង" : "Plan"}>
            <select value={activateForm.plan_id} onChange={(event) => {
              const nextPlan = plans.find((plan) => String(plan.id) === event.target.value);
              setActivateForm({ ...activateForm, plan_id: event.target.value, amount_usd: nextPlan?.price_usd ?? activateForm.amount_usd });
            }} className={inputClass}>
              <option value="">{isKm ? "ជ្រើសរើសគម្រោង" : "Select a plan"}</option>
              {plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name_en} — {money(plan.price_usd)}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={isKm ? "ចាប់ផ្តើម" : "Starts at"}>
              <input type="date" value={activateForm.starts_at} onChange={(event) => setActivateForm({ ...activateForm, starts_at: event.target.value })} className={inputClass} />
            </Field>
            <Field label={isKm ? "បញ្ចប់" : "Ends at"}>
              <input type="date" value={activateForm.ends_at} onChange={(event) => setActivateForm({ ...activateForm, ends_at: event.target.value })} className={inputClass} />
            </Field>
          </div>
          <Field label={isKm ? "កំណត់ចំណាំ" : "Notes"}>
            <textarea rows={2} value={activateForm.notes} onChange={(event) => setActivateForm({ ...activateForm, notes: event.target.value })} className={inputClass} />
          </Field>
          <label className="flex items-center gap-2 rounded-xl bg-stone-50 p-3 text-xs font-semibold text-stone-700 dark:bg-stone-800 dark:text-stone-300">
            <input type="checkbox" checked={activateForm.record_payment} onChange={(event) => setActivateForm({ ...activateForm, record_payment: event.target.checked })} className="h-4 w-4 rounded border-stone-300 text-amber-500" />
            {isKm ? "កត់ត្រាការទូទាត់ដែលបានផ្ទៀងផ្ទាត់" : "Record a verified payment"}
          </label>
          {activateForm.record_payment ? (
            <div className="grid grid-cols-3 gap-3">
              <Field label={isKm ? "ចំនួន" : "Amount"}>
                <input type="number" min="0" step="0.01" value={activateForm.amount_usd} onChange={(event) => setActivateForm({ ...activateForm, amount_usd: event.target.value })} className={inputClass} />
              </Field>
              <Field label={isKm ? "វិធី" : "Method"}>
                <select value={activateForm.method} onChange={(event) => setActivateForm({ ...activateForm, method: event.target.value })} className={inputClass}>
                  <option value="khqr">KHQR</option>
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank transfer</option>
                  <option value="other">Other</option>
                </select>
              </Field>
              <Field label={isKm ? "លេខយោង" : "Reference"}>
                <input value={activateForm.reference_no} onChange={(event) => setActivateForm({ ...activateForm, reference_no: event.target.value })} className={inputClass} />
              </Field>
            </div>
          ) : null}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setActivateOpen(false)} className="rounded-xl px-4 py-2 text-xs font-semibold text-stone-500">{isKm ? "បិទ" : "Cancel"}</button>
            <button type="button" onClick={() => activatePlan.mutate()} disabled={activatePlan.isPending || !activateForm.business_id || !activateForm.plan_id} className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-extrabold text-stone-950 disabled:opacity-50">
              {activatePlan.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {isKm ? "ធ្វើឱ្យសកម្ម" : "Activate"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
