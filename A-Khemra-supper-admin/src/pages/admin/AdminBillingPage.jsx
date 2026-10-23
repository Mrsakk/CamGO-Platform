import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BadgeCheck,
  CheckCircle2,
  CreditCard,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Store,
  Wallet,
  X,
  XCircle,
} from "lucide-react";
import billingApi from "@/lib/api/billing";
import { toast } from "@/store/toastStore";

const money = (value) => `$${Number(value || 0).toFixed(2)}`;
const dateLabel = (value) => {
  if (!value) return "No expiry";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};
const inputDate = (date) => date.toISOString().slice(0, 10);

const statusStyles = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  expired: "bg-stone-100 text-stone-600 border-stone-200",
  canceled: "bg-stone-100 text-stone-600 border-stone-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${statusStyles[status] || "bg-stone-100 text-stone-600 border-stone-200"}`}>
    {status}
  </span>
);

const Modal = ({ title, subtitle, children, onClose, footer }) => (
  <div
    className="fixed inset-0 z-[80] flex items-center justify-center bg-stone-950/60 backdrop-blur-sm p-4"
    onClick={onClose}
  >
    <div
      className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="flex items-start justify-between gap-4 border-b border-stone-200 dark:border-stone-800 p-5 sm:p-6">
        <div>
          <h2 className="text-lg font-extrabold text-stone-900 dark:text-white">{title}</h2>
          {subtitle ? <p className="mt-1 text-xs text-stone-500">{subtitle}</p> : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
      {footer ? (
        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-stone-200 dark:border-stone-800 p-5 sm:p-6">
          {footer}
        </div>
      ) : null}
    </div>
  </div>
);

const Field = ({ label, hint, children }) => (
  <label className="block space-y-1.5">
    <span className="text-xs font-bold uppercase tracking-wider text-stone-500">{label}</span>
    {children}
    {hint ? <span className="block text-[11px] text-stone-400">{hint}</span> : null}
  </label>
);

const inputClass =
  "w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 px-3.5 py-2.5 text-sm text-stone-900 dark:text-white outline-none focus:border-laterite-500 focus:ring-2 focus:ring-laterite-500/20";

const PlanModal = ({ initial, onClose }) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    code: initial?.code || "verified",
    name_km: initial?.name_km || "",
    name_en: initial?.name_en || "",
    description_km: initial?.description_km || "",
    description_en: initial?.description_en || "",
    price_usd: initial?.price_usd ?? 0,
    billing_cycle: initial?.billing_cycle || "monthly",
    features: (initial?.features || []).join("\n"),
    is_active: initial?.is_active ?? true,
    sort_order: initial?.sort_order ?? 0,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        price_usd: Number(form.price_usd || 0),
        sort_order: Number(form.sort_order || 0),
        features: form.features
          .split("\n")
          .map((feature) => feature.trim())
          .filter(Boolean),
      };
      return initial?.id
        ? billingApi.updatePlan(initial.id, payload)
        : billingApi.createPlan(payload);
    },
    onSuccess: () => {
      toast.success(initial?.id ? "Plan updated" : "Plan created");
      queryClient.invalidateQueries({ queryKey: ["billing-plans"] });
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Could not save plan");
    },
  });

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  return (
    <Modal
      title={initial?.id ? "Edit plan" : "Create plan"}
      subtitle="Plan codes are tied to the business tier. Keep free, verified, and featured as the three sellable tiers."
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-bold text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="px-5 py-2.5 rounded-xl bg-laterite-600 text-white text-sm font-bold hover:bg-laterite-700 disabled:opacity-60"
          >
            {mutation.isPending ? "Saving..." : "Save plan"}
          </button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Plan code" hint={initial?.id ? "Plan codes cannot be changed after creation." : undefined}>
          <select
            className={`${inputClass} disabled:opacity-60 disabled:cursor-not-allowed`}
            value={form.code}
            disabled={Boolean(initial?.id)}
            onChange={(event) => set("code", event.target.value)}
          >
            <option value="free">free</option>
            <option value="verified">verified</option>
            <option value="featured">featured</option>
          </select>
        </Field>
        <Field label="Billing cycle">
          <select className={inputClass} value={form.billing_cycle} onChange={(event) => set("billing_cycle", event.target.value)}>
            <option value="none">none</option>
            <option value="monthly">monthly</option>
            <option value="yearly">yearly</option>
          </select>
        </Field>
        <Field label="Name (Khmer)">
          <input className={inputClass} value={form.name_km} onChange={(event) => set("name_km", event.target.value)} />
        </Field>
        <Field label="Name (English)">
          <input className={inputClass} value={form.name_en} onChange={(event) => set("name_en", event.target.value)} />
        </Field>
        <Field label="Price (USD)">
          <input type="number" min="0" step="0.01" className={inputClass} value={form.price_usd} onChange={(event) => set("price_usd", event.target.value)} />
        </Field>
        <Field label="Sort order">
          <input type="number" min="0" className={inputClass} value={form.sort_order} onChange={(event) => set("sort_order", event.target.value)} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Description (Khmer)">
            <textarea rows={2} className={inputClass} value={form.description_km} onChange={(event) => set("description_km", event.target.value)} />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Description (English)">
            <textarea rows={2} className={inputClass} value={form.description_en} onChange={(event) => set("description_en", event.target.value)} />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Features" hint="One feature per line.">
            <textarea rows={4} className={inputClass} value={form.features} onChange={(event) => set("features", event.target.value)} />
          </Field>
        </div>
        <label className="sm:col-span-2 flex items-center gap-3 rounded-xl border border-stone-200 dark:border-stone-800 p-3">
          <input type="checkbox" checked={form.is_active} onChange={(event) => set("is_active", event.target.checked)} className="w-4 h-4 accent-laterite-600" />
          <span className="text-sm font-semibold text-stone-700 dark:text-stone-200">Plan is active and visible to business owners</span>
        </label>
      </div>
    </Modal>
  );
};

const ActivateModal = ({ plans, onClose }) => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [form, setForm] = useState({
    plan_id: "",
    starts_at: inputDate(new Date()),
    ends_at: inputDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
    sponsored_category_until: "",
    sponsored_province_until: "",
    price_usd: "",
    method: "khqr",
    reference_no: "",
    notes: "",
  });

  const { data: businesses = [], isFetching } = useQuery({
    queryKey: ["billing-business-search", search],
    queryFn: () => billingApi.searchBusinesses(search),
    enabled: search.trim().length >= 2,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const payment = Number(form.price_usd || 0) > 0 || form.reference_no
        ? {
            amount_usd: Number(form.price_usd || 0),
            method: form.method,
            reference_no: form.reference_no || null,
            notes: form.notes || null,
          }
        : undefined;

      const payload = {
        plan_id: Number(form.plan_id),
        starts_at: form.starts_at ? `${form.starts_at}T00:00:00` : null,
        ends_at: form.ends_at ? `${form.ends_at}T23:59:59` : null,
        payment,
      };

      if (canSponsor && form.sponsored_category_until) {
        payload.sponsored_category_until = `${form.sponsored_category_until}T23:59:59`;
      }
      if (canSponsor && form.sponsored_province_until) {
        payload.sponsored_province_until = `${form.sponsored_province_until}T23:59:59`;
      }

      return billingApi.activateSubscription(selectedBusiness.id, payload);
    },
    onSuccess: (response) => {
      const warning = response?.data?.warning;
      toast.success("Subscription activated");
      if (warning) toast.warning(warning);
      queryClient.invalidateQueries({ queryKey: ["billing-subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["billing-plans"] });
      queryClient.invalidateQueries({ queryKey: ["billing-requests"] });
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Could not activate subscription");
    },
  });

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const choosePlan = (planId) => {
    const plan = plans.find((item) => String(item.id) === String(planId));
    setForm((current) => ({
      ...current,
      plan_id: planId,
      price_usd: plan ? plan.price_usd : current.price_usd,
      sponsored_category_until: plan?.code === "free" ? "" : current.sponsored_category_until,
      sponsored_province_until: plan?.code === "free" ? "" : current.sponsored_province_until,
    }));
  };

  const selectedPlan = plans.find((plan) => String(plan.id) === String(form.plan_id));
  const canSponsor = Boolean(selectedPlan && selectedPlan.code !== "free");

  return (
    <Modal
      title="Activate subscription"
      subtitle="Record a manual KHQR or offline payment and apply the selected tier to the business."
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-bold text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !selectedBusiness || !form.plan_id}
            className="px-5 py-2.5 rounded-xl bg-laterite-600 text-white text-sm font-bold hover:bg-laterite-700 disabled:opacity-60"
          >
            {mutation.isPending ? "Activating..." : "Activate plan"}
          </button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <Field label="Find business">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                className={`${inputClass} pl-9`}
                placeholder="Search by business name..."
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setSelectedBusiness(null);
                }}
              />
            </div>
          </Field>
          {selectedBusiness ? (
            <div className="flex items-center justify-between rounded-xl border border-laterite-200 bg-laterite-50 px-3.5 py-2.5 text-sm">
              <span className="font-bold text-laterite-800">{selectedBusiness.name_en || selectedBusiness.name_km}</span>
              <button type="button" onClick={() => setSelectedBusiness(null)} className="text-xs font-bold text-laterite-700">
                Change
              </button>
            </div>
          ) : null}
          {!selectedBusiness && search.trim().length >= 2 ? (
            <div className="rounded-xl border border-stone-200 dark:border-stone-800 divide-y divide-stone-100 dark:divide-stone-800 max-h-56 overflow-y-auto">
              {isFetching ? (
                <p className="p-3 text-xs text-stone-500">Searching...</p>
              ) : businesses.length === 0 ? (
                <p className="p-3 text-xs text-stone-500">No businesses found.</p>
              ) : (
                businesses.map((business) => (
                  <button
                    key={business.id}
                    type="button"
                    onClick={() => setSelectedBusiness(business)}
                    className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-left hover:bg-stone-50 dark:hover:bg-stone-800"
                  >
                    <span>
                      <span className="block text-sm font-bold text-stone-800 dark:text-stone-100">{business.name_en || business.name_km}</span>
                      <span className="block text-[11px] text-stone-500">{business.tier} · {business.province?.name_en || business.province?.name_km || "No province"}</span>
                    </span>
                    <BadgeCheck className={`w-4 h-4 ${business.is_verified ? "text-emerald-500" : "text-stone-300"}`} />
                  </button>
                ))
              )}
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Plan">
            <select className={inputClass} value={form.plan_id} onChange={(event) => choosePlan(event.target.value)}>
              <option value="">Select a plan</option>
              {plans.filter((plan) => plan.is_active).map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name_en} · {money(plan.price_usd)} / {plan.billing_cycle}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Amount paid (USD)">
            <input type="number" min="0" step="0.01" className={inputClass} value={form.price_usd} onChange={(event) => set("price_usd", event.target.value)} />
          </Field>
          <Field label="Starts on">
            <input type="date" className={inputClass} value={form.starts_at} onChange={(event) => set("starts_at", event.target.value)} />
          </Field>
          <Field label="Ends on">
            <input type="date" className={inputClass} value={form.ends_at} onChange={(event) => set("ends_at", event.target.value)} />
          </Field>
          <Field
            label="Category sponsorship ends"
            hint="Paid plans only. Capped to the subscription end date."
          >
            <input
              type="date"
              className={`${inputClass} disabled:opacity-60 disabled:cursor-not-allowed`}
              value={form.sponsored_category_until}
              disabled={!canSponsor}
              onChange={(event) => set("sponsored_category_until", event.target.value)}
            />
          </Field>
          <Field
            label="Province sponsorship ends"
            hint="Paid plans only. Capped to the subscription end date."
          >
            <input
              type="date"
              className={`${inputClass} disabled:opacity-60 disabled:cursor-not-allowed`}
              value={form.sponsored_province_until}
              disabled={!canSponsor}
              onChange={(event) => set("sponsored_province_until", event.target.value)}
            />
          </Field>
          <Field label="Payment method">
            <select className={inputClass} value={form.method} onChange={(event) => set("method", event.target.value)}>
              <option value="khqr">KHQR</option>
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank transfer</option>
              <option value="other">Other</option>
            </select>
          </Field>
          <Field label="Reference number">
            <input className={inputClass} placeholder="Bakong / invoice reference" value={form.reference_no} onChange={(event) => set("reference_no", event.target.value)} />
          </Field>
        </div>

        <Field label="Internal note">
          <textarea rows={2} className={inputClass} value={form.notes} onChange={(event) => set("notes", event.target.value)} />
        </Field>
      </div>
    </Modal>
  );
};

const PaymentModal = ({ subscription, onClose }) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    amount_usd: subscription.price_usd || 0,
    method: "khqr",
    reference_no: "",
    paid_at: inputDate(new Date()),
    notes: "",
  });

  const mutation = useMutation({
    mutationFn: () =>
      billingApi.recordPayment(subscription.id, {
        amount_usd: Number(form.amount_usd || 0),
        method: form.method,
        reference_no: form.reference_no || null,
        paid_at: form.paid_at ? `${form.paid_at}T00:00:00` : null,
        notes: form.notes || null,
      }),
    onSuccess: () => {
      toast.success("Payment recorded");
      queryClient.invalidateQueries({ queryKey: ["billing-subscriptions"] });
      onClose();
    },
    onError: (error) => toast.error(error.response?.data?.message || "Could not record payment"),
  });

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  return (
    <Modal
      title="Record payment"
      subtitle={`${subscription.business?.name_en || subscription.business?.name_km || "Business"} · ${subscription.plan?.name_en || "Plan"}`}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-bold text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="px-5 py-2.5 rounded-xl bg-laterite-600 text-white text-sm font-bold hover:bg-laterite-700 disabled:opacity-60"
          >
            {mutation.isPending ? "Saving..." : "Record payment"}
          </button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Amount (USD)">
          <input type="number" min="0" step="0.01" className={inputClass} value={form.amount_usd} onChange={(event) => set("amount_usd", event.target.value)} />
        </Field>
        <Field label="Method">
          <select className={inputClass} value={form.method} onChange={(event) => set("method", event.target.value)}>
            <option value="khqr">KHQR</option>
            <option value="cash">Cash</option>
            <option value="bank_transfer">Bank transfer</option>
            <option value="other">Other</option>
          </select>
        </Field>
        <Field label="Paid on">
          <input type="date" className={inputClass} value={form.paid_at} onChange={(event) => set("paid_at", event.target.value)} />
        </Field>
        <Field label="Reference number">
          <input className={inputClass} value={form.reference_no} onChange={(event) => set("reference_no", event.target.value)} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Notes">
            <textarea rows={2} className={inputClass} value={form.notes} onChange={(event) => set("notes", event.target.value)} />
          </Field>
        </div>
      </div>
    </Modal>
  );
};

const RequestActionModal = ({ request, mode, onClose }) => {
  const queryClient = useQueryClient();
  const [adminNote, setAdminNote] = useState("");
  const [endsAt, setEndsAt] = useState(inputDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)));

  const mutation = useMutation({
    mutationFn: () =>
      mode === "approve"
        ? billingApi.approveRequest(request.id, {
            admin_note: adminNote || null,
            ends_at: endsAt ? `${endsAt}T23:59:59` : null,
          })
        : billingApi.rejectRequest(request.id, { admin_note: adminNote }),
    onSuccess: (response) => {
      if (mode === "approve") {
        toast.success("Subscription request approved");
        if (response?.data?.warning) toast.warning(response.data.warning);
      } else {
        toast.success("Subscription request rejected");
      }
      queryClient.invalidateQueries({ queryKey: ["billing-requests"] });
      queryClient.invalidateQueries({ queryKey: ["billing-subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["billing-plans"] });
      onClose();
    },
    onError: (error) => toast.error(error.response?.data?.message || "Could not update request"),
  });

  return (
    <Modal
      title={mode === "approve" ? "Approve upgrade request" : "Reject upgrade request"}
      subtitle={`${request.business?.name_en || request.business?.name_km || "Business"} · ${request.requested_plan?.name_en || "Plan"}`}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-bold text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || (mode === "reject" && !adminNote.trim())}
            className={`px-5 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-60 ${mode === "approve" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"}`}
          >
            {mutation.isPending ? "Saving..." : mode === "approve" ? "Approve request" : "Reject request"}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {mode === "approve" ? (
          <Field label="Subscription ends on">
            <input type="date" className={inputClass} value={endsAt} onChange={(event) => setEndsAt(event.target.value)} />
          </Field>
        ) : null}
        <Field label={`Admin note${mode === "reject" ? " (required)" : ""}`}>
          <textarea
            rows={3}
            className={inputClass}
            placeholder={mode === "approve" ? "Optional internal note..." : "Tell the owner why the request was rejected..."}
            value={adminNote}
            onChange={(event) => setAdminNote(event.target.value)}
          />
        </Field>
        {request.note ? (
          <div className="rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 p-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Owner note</p>
            <p className="mt-1 text-sm text-stone-700 dark:text-stone-300">{request.note}</p>
          </div>
        ) : null}
      </div>
    </Modal>
  );
};

export const AdminBillingPage = () => {
  const [tab, setTab] = useState("plans");
  const [planModal, setPlanModal] = useState(null);
  const [activateOpen, setActivateOpen] = useState(false);
  const [paymentFor, setPaymentFor] = useState(null);
  const [requestAction, setRequestAction] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState("");
  const [requestStatus, setRequestStatus] = useState("pending");
  const [search, setSearch] = useState("");

  const { data: plansData, isLoading: plansLoading } = useQuery({
    queryKey: ["billing-plans"],
    queryFn: billingApi.getPlans,
  });

  const { data: subscriptionsData, isLoading: subscriptionsLoading } = useQuery({
    queryKey: ["billing-subscriptions", subscriptionStatus, search],
    queryFn: () => billingApi.getSubscriptions({ status: subscriptionStatus || undefined, search: search || undefined, per_page: 30 }),
  });

  const { data: requestsData, isLoading: requestsLoading } = useQuery({
    queryKey: ["billing-requests", requestStatus],
    queryFn: () => billingApi.getRequests({ status: requestStatus || undefined, per_page: 30 }),
  });

  const plans = plansData?.data || [];
  const subscriptions = subscriptionsData?.data || [];
  const requests = requestsData?.data || [];
  const pendingCount = requests.filter((item) => item.status === "pending").length;

  const tabs = [
    { id: "plans", label: "Plans", count: plans.length },
    { id: "subscriptions", label: "Subscriptions", count: subscriptionsData?.meta?.total ?? subscriptions.length },
    { id: "requests", label: "Upgrade requests", count: requestsData?.meta?.total ?? requests.length },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="rounded-3xl bg-gradient-to-r from-stone-900 via-stone-900 to-stone-800 text-white p-6 sm:p-8 shadow-xl border border-stone-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-400">
            <CreditCard className="w-3.5 h-3.5" />
            Phase 2 Entitlements & Placement
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
            <Wallet className="w-8 h-8 text-emerald-400" />
            Plans & Subscription Billing
          </h1>
          <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
            Manage the plan catalog, activate business subscriptions, record manual KHQR payments, and approve owner upgrade requests.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setActivateOpen(true)}
          className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 hover:bg-amber-600 px-5 py-3 text-sm font-extrabold text-stone-950 shadow-lg shadow-amber-500/20 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Activate subscription
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Active plans</span>
            <Store className="w-5 h-5 text-amber-500" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-stone-900 dark:text-white">{plans.filter((plan) => plan.is_active).length}</p>
          <p className="text-xs text-stone-400">Sellable tiers in the catalog</p>
        </div>
        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Subscriptions</span>
            <Sparkles className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-emerald-600">{subscriptionsData?.meta?.total ?? subscriptions.length}</p>
          <p className="text-xs text-stone-400">Matching the current filter</p>
        </div>
        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Pending requests</span>
            <RefreshCw className="w-5 h-5 text-blue-500" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-blue-600">{pendingCount}</p>
          <p className="text-xs text-stone-400">Owner upgrade requests awaiting review</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
              tab === item.id
                ? "bg-stone-900 text-white dark:bg-white dark:text-stone-900"
                : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50 dark:bg-stone-900 dark:text-stone-300 dark:border-stone-800"
            }`}
          >
            {item.label}
            <span className={`rounded-full px-2 py-0.5 text-[10px] ${tab === item.id ? "bg-white/20" : "bg-stone-100 dark:bg-stone-800"}`}>
              {item.count}
            </span>
          </button>
        ))}
      </div>

      {tab === "plans" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold text-stone-900 dark:text-white">Plan catalog</h2>
              <p className="text-xs text-stone-500">Prices are per billing cycle. KYC is still required for the verified badge.</p>
            </div>
            <button
              type="button"
              onClick={() => setPlanModal({})}
              className="inline-flex items-center gap-2 rounded-xl bg-laterite-600 hover:bg-laterite-700 px-4 py-2.5 text-sm font-bold text-white"
            >
              <Plus className="w-4 h-4" />
              New plan
            </button>
          </div>

          {plansLoading ? (
            <p className="text-sm text-stone-500">Loading plans...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <div key={plan.id} className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-sm flex flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="inline-flex rounded-full bg-stone-100 dark:bg-stone-800 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
                        {plan.code}
                      </span>
                      <h3 className="mt-3 text-lg font-extrabold text-stone-900 dark:text-white">{plan.name_en}</h3>
                      <p className="text-xs text-stone-500">{plan.name_km}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPlanModal(plan)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
                      aria-label="Edit plan"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="mt-4 text-3xl font-extrabold text-stone-900 dark:text-white">
                    {money(plan.price_usd)}
                    <span className="ml-1 text-xs font-semibold text-stone-400">/ {plan.billing_cycle}</span>
                  </p>
                  <p className="mt-2 text-xs text-stone-500 min-h-[32px]">{plan.description_en || plan.description_km}</p>
                  <ul className="mt-4 space-y-2 text-xs text-stone-600 dark:text-stone-300 flex-1">
                    {(plan.features || []).map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-emerald-500 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5 flex items-center justify-between border-t border-stone-100 dark:border-stone-800 pt-3">
                    <span className={`text-[11px] font-bold ${plan.is_active ? "text-emerald-600" : "text-stone-400"}`}>
                      {plan.is_active ? "Active" : "Inactive"}
                    </span>
                    <span className="text-[11px] text-stone-400">{plan.subscriptions_count || 0} subscriptions</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {tab === "subscriptions" ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold text-stone-900 dark:text-white">Subscriptions</h2>
              <p className="text-xs text-stone-500">Every activation creates an auditable subscription record.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  className={`${inputClass} pl-9 w-full sm:w-64`}
                  placeholder="Search business..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
              <select className={`${inputClass} w-auto`} value={subscriptionStatus} onChange={(event) => setSubscriptionStatus(event.target.value)}>
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="canceled">Canceled</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-stone-50 dark:bg-stone-950 text-[11px] uppercase tracking-wider text-stone-500">
                <tr>
                  <th className="px-4 py-3 font-bold">Business</th>
                  <th className="px-4 py-3 font-bold">Plan</th>
                  <th className="px-4 py-3 font-bold">Status</th>
                  <th className="px-4 py-3 font-bold">Period</th>
                  <th className="px-4 py-3 font-bold">Paid</th>
                  <th className="px-4 py-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {subscriptionsLoading ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-stone-500">Loading subscriptions...</td></tr>
                ) : subscriptions.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-stone-500">No subscriptions match this filter.</td></tr>
                ) : (
                  subscriptions.map((subscription) => (
                    <tr key={subscription.id} className="hover:bg-stone-50/70 dark:hover:bg-stone-950/40">
                      <td className="px-4 py-3">
                        <p className="font-bold text-stone-800 dark:text-stone-100">{subscription.business?.name_en || subscription.business?.name_km || "Deleted business"}</p>
                        <p className="text-[11px] text-stone-500">
                          {subscription.business?.tier} · {subscription.business?.is_verified ? "KYC verified" : "No badge"}
                          {subscription.business?.is_sponsored_category ? " · Category sponsor" : ""}
                          {subscription.business?.is_sponsored_province ? " · Province sponsor" : ""}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-stone-700 dark:text-stone-200">{subscription.plan?.name_en || "Archived plan"}</p>
                        <p className="text-[11px] text-stone-500">{money(subscription.price_usd)} / {subscription.plan?.billing_cycle || "one-time"}</p>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={subscription.status} /></td>
                      <td className="px-4 py-3 text-xs text-stone-600 dark:text-stone-300">
                        <p>{dateLabel(subscription.starts_at)}</p>
                        <p className="text-stone-400">to {dateLabel(subscription.ends_at)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-bold text-stone-700 dark:text-stone-200">{money(subscription.paid_total)}</p>
                        <p className="text-[11px] text-stone-400">{subscription.payments?.length || 0} payment(s)</p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => setPaymentFor(subscription)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 dark:border-stone-700 px-3 py-1.5 text-xs font-bold text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800"
                        >
                          <Wallet className="w-3.5 h-3.5" />
                          Payment
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {tab === "requests" ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold text-stone-900 dark:text-white">Upgrade requests</h2>
              <p className="text-xs text-stone-500">Approve a request to activate the plan and optionally record a payment.</p>
            </div>
            <select className={`${inputClass} w-auto`} value={requestStatus} onChange={(event) => setRequestStatus(event.target.value)}>
              <option value="">All requests</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="canceled">Canceled</option>
            </select>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-stone-50 dark:bg-stone-950 text-[11px] uppercase tracking-wider text-stone-500">
                <tr>
                  <th className="px-4 py-3 font-bold">Business</th>
                  <th className="px-4 py-3 font-bold">Requested plan</th>
                  <th className="px-4 py-3 font-bold">Status</th>
                  <th className="px-4 py-3 font-bold">Requested</th>
                  <th className="px-4 py-3 font-bold">Note</th>
                  <th className="px-4 py-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {requestsLoading ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-stone-500">Loading requests...</td></tr>
                ) : requests.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-stone-500">No upgrade requests match this filter.</td></tr>
                ) : (
                  requests.map((request) => (
                    <tr key={request.id} className="hover:bg-stone-50/70 dark:hover:bg-stone-950/40">
                      <td className="px-4 py-3">
                        <p className="font-bold text-stone-800 dark:text-stone-100">{request.business?.name_en || request.business?.name_km || "Deleted business"}</p>
                        <p className="text-[11px] text-stone-500">{request.requester?.name || "Owner"} · {request.contact_phone || "No phone"}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-stone-700 dark:text-stone-200">{request.requested_plan?.name_en || "Archived plan"}</p>
                        <p className="text-[11px] text-stone-500">{money(request.requested_plan?.price_usd)} / {request.requested_plan?.billing_cycle || "one-time"}</p>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={request.status} /></td>
                      <td className="px-4 py-3 text-xs text-stone-600 dark:text-stone-300">{dateLabel(request.created_at)}</td>
                      <td className="px-4 py-3 max-w-xs">
                        <p className="text-xs text-stone-600 dark:text-stone-300">{request.note || "—"}</p>
                        {request.admin_note ? <p className="mt-1 text-[11px] text-stone-400">Admin: {request.admin_note}</p> : null}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {request.status === "pending" ? (
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setRequestAction({ request, mode: "approve" })}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => setRequestAction({ request, mode: "reject" })}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-stone-400">Reviewed</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {planModal ? (
        <PlanModal
          key={planModal.id || "new-plan"}
          initial={planModal.id ? planModal : null}
          onClose={() => setPlanModal(null)}
        />
      ) : null}

      {activateOpen ? (
        <ActivateModal plans={plans} onClose={() => setActivateOpen(false)} />
      ) : null}

      {paymentFor ? (
        <PaymentModal subscription={paymentFor} onClose={() => setPaymentFor(null)} />
      ) : null}

      {requestAction ? (
        <RequestActionModal
          request={requestAction.request}
          mode={requestAction.mode}
          onClose={() => setRequestAction(null)}
        />
      ) : null}
    </div>
  );
};
