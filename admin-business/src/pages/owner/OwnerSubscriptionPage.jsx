import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  Gift,
  Loader2,
  Phone,
  QrCode,
  Send,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import api from "@/lib/axios";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { QueryError } from "@/components/common/QueryError";
import { toast } from "@/store/toastStore";

const cycleLabel = (cycle, isKm) => {
  if (cycle === "monthly") return isKm ? "ក្នុងមួយខែ" : "per month";
  if (cycle === "yearly") return isKm ? "ក្នុងមួយឆ្នាំ" : "per year";
  return isKm ? "រហូត" : "forever";
};

const priceLabel = (price) => {
  const value = Number(price || 0);
  return `$${Number.isInteger(value) ? value : value.toFixed(2)}`;
};

const getDaysRemaining = (value) => {
  if (!value) return null;
  return Math.max(0, Math.ceil((new Date(value).getTime() - Date.now()) / 86400000));
};

export const OwnerSubscriptionPage = () => {
  const { i18n } = useTranslation();
  const isKm = i18n.language === "km";
  const queryClient = useQueryClient();
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [requestNote, setRequestNote] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);

  const {
    data: subscriptionData,
    isLoading: subscriptionLoading,
    isError: subscriptionError,
    refetch: refetchSubscription,
  } = useQuery({
    queryKey: ["owner-subscription"],
    queryFn: async () => {
      const res = await api.get("/business/owner/subscription");
      return res.data?.data || res.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: plansData,
    isLoading: plansLoading,
    isError: plansError,
    refetch: refetchPlans,
  } = useQuery({
    queryKey: ["owner-subscription-plans"],
    queryFn: async () => {
      const res = await api.get("/business/owner/plans");
      return res.data?.data || res.data;
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["owner-subscription"] });
    queryClient.invalidateQueries({ queryKey: ["owner-stats"] });
    queryClient.invalidateQueries({ queryKey: ["owner-my-business"] });
  };

  const planRequest = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post("/business/owner/subscription/request", payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success(isKm ? "បានផ្ញើសំណើជ្រើសរើសគម្រោង!" : "Upgrade request submitted successfully!");
      invalidate();
      setShowRenewModal(false);
      setRequestNote("");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
        (isKm ? "មិនអាចផ្ញើសំណើបានទេ" : "Could not submit request")
      );
    },
  });

  const trialMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post("/business/owner/subscription/trial");
      return res.data;
    },
    onSuccess: () => {
      toast.success(
        isKm ? "បានចាប់ផ្តើមសាកល្បង Pro ៣០ ថ្ងៃ!" : "Your 30-day Pro trial has started!"
      );
      invalidate();
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
        (isKm ? "មិនអាចចាប់ផ្តើមការសាកល្បងបានទេ" : "Could not start the trial")
      );
    },
  });

  const cancelRequestMutation = useMutation({
    mutationFn: async (id) => {
      await api.post(`/business/owner/subscription/requests/${id}/cancel`);
    },
    onSuccess: () => {
      toast.success(isKm ? "បានបោះបង់សំណើ!" : "Request canceled!");
      invalidate();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || (isKm ? "បរាជ័យ" : "Action failed"));
    },
  });

  const subscription = subscriptionData || {};
  const business = subscription.business || {};
  const pendingRequest = subscription.pending_request;
  const trial = subscription.trial || {};
  const profileCompletion = trial.profile_completion || {};
  const plans = Array.isArray(plansData) ? plansData : plansData?.data || [];
  const currentTier = business.tier || "free";
  const billingTier = business.billing_tier || currentTier;
  const selectedPlanData = plans.find((plan) => String(plan.id) === String(selectedPlan));
  const trialDaysLeft = getDaysRemaining(business.trial_ends_at);
  const paidDaysLeft = getDaysRemaining(business.subscription_expires_at);

  const tierTitle = {
    free: isKm ? "គម្រោងសហគមន៍ឥតគិតថ្លៃ" : "Free Community Listing",
    verified: "Pro",
    featured: "Premium",
  };

  const tierName = {
    free: "Free",
    verified: "Pro",
    featured: "Premium",
  };

  const openRequest = (plan) => {
    setSelectedPlan(plan.id);
    setRequestNote("");
    setShowRenewModal(true);
  };

  const submitRequest = () => {
    if (!selectedPlanData) return;
    planRequest.mutate({
      plan_id: selectedPlanData.id,
      note: requestNote.trim() || null,
    });
  };

  const missingChecks = (profileCompletion.checks || []).filter((check) => !check.done);

  const pendingPlanName = isKm
    ? pendingRequest?.requested_plan?.name_km || pendingRequest?.requested_plan?.name_en
    : pendingRequest?.requested_plan?.name_en || pendingRequest?.requested_plan?.name_km;

  const requestTrial = () => {
    setConfirmAction({
      type: "trial",
      title: isKm ? "ចាប់ផ្តើមការសាកល្បង Pro?" : "Start the Pro trial?",
      description: isKm
        ? "អ្នកនឹងទទួលបានមុខងារ Pro ឥតគិតថ្លៃ ៣០ ថ្ងៃ។ ការសាកល្បងអាចប្រើបានតែម្តងប៉ុណ្ណោះ។"
        : "You will receive 30 days of Pro features for free. The trial can only be used once.",
    });
  };

  const requestCancel = () => {
    setConfirmAction({
      type: "cancel",
      id: pendingRequest?.id,
      title: isKm ? "បោះបង់សំណើគម្រោង?" : "Cancel the plan request?",
      description: isKm
        ? `សំណើសម្រាប់ “${pendingPlanName || ""}” នឹងត្រូវដកចេញ។ អ្នកអាចដាក់សំណើថ្មីម្តងទៀតបាន។`
        : `Your request for “${pendingPlanName || ""}” will be withdrawn. You can submit a new request later.`,
    });
  };

  const runConfirmedAction = () => {
    if (!confirmAction) return;
    const clear = () => setConfirmAction(null);

    if (confirmAction.type === "trial") {
      trialMutation.mutate(undefined, { onSettled: clear });
      return;
    }

    if (confirmAction.id) {
      cancelRequestMutation.mutate(confirmAction.id, { onSettled: clear });
    }
  };

  if (subscriptionError || plansError) {
    return (
      <QueryError
        className="max-w-2xl mx-auto mt-10"
        onRetry={() => {
          refetchSubscription();
          refetchPlans();
        }}
        isRetrying={subscriptionLoading || plansLoading}
      />
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">


      {pendingRequest ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900/40 px-5 py-4 text-sm text-amber-900 dark:text-amber-300">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 shrink-0" />
            <span>
              {isKm ? "សំណើរបស់អ្នកកំពុងរង់ចាំការត្រួតពិនិត្យ៖ " : "Your request is awaiting review: "}
              <strong>
                {isKm
                  ? pendingRequest.requested_plan?.name_km || pendingRequest.requested_plan?.name_en
                  : pendingRequest.requested_plan?.name_en || pendingRequest.requested_plan?.name_km}
              </strong>
            </span>
          </div>
          <button
            onClick={requestCancel}
            disabled={cancelRequestMutation.isPending}
            className="text-xs font-bold uppercase tracking-wider underline disabled:opacity-50 self-start sm:self-auto"
          >
            {isKm ? "បោះបង់សំណើ" : "Cancel request"}
          </button>
        </div>
      ) : null}

      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white p-6 sm:p-8 rounded-3xl border border-stone-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
              {isKm ? "ស្ថានភាពការជាវបច្ចុប្បន្ន" : "Active Subscription Status"}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${currentTier === "featured"
                ? "bg-amber-500 text-stone-950"
                : currentTier === "verified"
                  ? "bg-blue-500 text-white"
                  : "bg-stone-700 text-stone-300"
                }`}
            >
              {tierName[currentTier] || currentTier}
            </span>
            {business.is_verified ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                <ShieldCheck className="w-3 h-3" />
                {isKm ? "បានផ្ទៀងផ្ទាត់" : "Verified"}
              </span>
            ) : null}
          </div>

          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {tierTitle[currentTier] || tierTitle.free}
          </div>

          <div className="text-xs sm:text-sm text-stone-300 flex flex-wrap items-center gap-x-4 gap-y-2">
            {subscriptionLoading ? (
              <span className="flex items-center gap-1.5 text-stone-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                {isKm ? "កំពុងផ្ទុក..." : "Loading..."}
              </span>
            ) : business.is_on_trial ? (
              <span className="flex items-center gap-1.5 text-amber-300 font-semibold">
                <Gift className="w-4 h-4" />
                {isKm
                  ? `ការសាកល្បង Pro នៅសល់ ${trialDaysLeft} ថ្ងៃ`
                  : `Pro trial: ${trialDaysLeft} days left`}
              </span>
            ) : business.subscription_expires_at ? (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-400" />
                {isKm ? "ប្រើបានដល់៖ " : "Valid until: "}
                {new Date(business.subscription_expires_at).toLocaleDateString()}
                {paidDaysLeft !== null && (
                  <span className="font-bold text-amber-400">
                    ({paidDaysLeft} {isKm ? "ថ្ងៃ" : "days"})
                  </span>
                )}
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-stone-400">
                <Clock className="w-4 h-4" />
                {isKm ? "គម្រោងឥតគិតថ្លៃ គ្មានថ្ងៃផុតកំណត់" : "Free tier with no expiration"}
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            const premiumPlan = plans.find((plan) => plan.code === "featured") || plans[0];
            if (premiumPlan) openRequest(premiumPlan);
          }}
          disabled={Boolean(pendingRequest) || plans.length === 0}
          className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-stone-950 font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition"
        >
          <CreditCard className="w-4 h-4" />
          {isKm ? "កែប្រែ / បន្តគម្រោង" : "Upgrade / Renew Plan"}
        </button>
      </div>

      {!business.is_subscription_active && !business.is_on_trial && !business.has_used_trial && (
        <div className="rounded-3xl bg-white dark:bg-stone-850 border border-amber-500/30 p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Gift className="w-6 h-6 text-amber-500" />
                <h2 className="font-extrabold text-base text-stone-900 dark:text-white">
                  {isKm ? "សាកល្បង Pro ឥតគិតថ្លៃ ៣០ ថ្ងៃ" : "Free 30-day Pro trial"}
                </h2>
              </div>
              <p className="text-xs text-stone-500 mt-1 max-w-xl leading-relaxed">
                {isKm
                  ? "សាកល្បងមុខងារ Pro ដោយឥតគិតថ្លៃរយៈពេល ៣០ ថ្ងៃ។ លក្ខខណ្ឌ៖ ព័ត៌មានពេញលេញយ៉ាងហោចណាស់ ៨០% និងបានផ្ទៀងផ្ទាត់ KYC។"
                  : "Try Pro features free for 30 days. Requires at least 80% profile completion and KYC verification."}
              </p>
            </div>
            <div className="text-left sm:text-right shrink-0">
              <div className="text-3xl font-extrabold text-amber-600">{profileCompletion.score || 0}%</div>
              <div className="text-[10px] text-stone-400 uppercase font-bold">
                {isKm ? "ភាពពេញលេញ" : "Profile score"}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              {(profileCompletion.checks || []).map((check) => (
                <div key={check.key} className="flex items-start gap-2">
                  <span
                    className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${check.done ? "bg-emerald-500 text-white" : "border-2 border-stone-300 dark:border-stone-600"
                      }`}
                  >
                    {check.done && <Check className="w-3 h-3" />}
                  </span>
                  <span className={`text-xs ${check.done ? "text-stone-700 dark:text-stone-300" : "text-stone-500"}`}>
                    {isKm ? check.label_km : check.label_en}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-col justify-between gap-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-700 p-4">
              {trial.can_start ? (
                <>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    {isKm ? "អ្នកមានលក្ខខណ្ឌគ្រប់គ្រាន់សម្រាប់ការសាកល្បង!" : "You are eligible for the trial!"}
                  </p>
                  <button
                    onClick={requestTrial}
                    disabled={trialMutation.isPending}
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-extrabold text-xs flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {trialMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gift className="w-4 h-4" />}
                    {isKm ? "ចាប់ផ្តើមសាកល្បងឥឡូវ" : "Start trial now"}
                  </button>
                </>
              ) : (
                <>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    {isKm
                      ? "សូមបំពេញលក្ខខណ្ឌខាងក្រោម ដើម្បីអាចចាប់ផ្តើមការសាកល្បង។"
                      : "Complete the requirements below to unlock the trial."}
                  </p>
                  <div className="space-y-1.5">
                    {profileCompletion.score < 80 && (
                      <div className="text-[11px] text-amber-700 dark:text-amber-400">
                        • {isKm ? "ត្រូវការពិន្ទុយ៉ាងហោចណាស់ ៨០%" : "Requires at least 80% profile score"}
                      </div>
                    )}
                    {!business.is_verified && (
                      <div className="text-[11px] text-amber-700 dark:text-amber-400">
                        • {isKm ? "ត្រូវការការផ្ទៀងផ្ទាត់ KYC" : "KYC verification required"}
                      </div>
                    )}
                  </div>
                  {missingChecks.length > 0 && (
                    <p className="text-[10px] text-stone-400">
                      {isKm ? "សូមបំពេញព័ត៌មាននៅផ្ទាំងអាជីវកម្មរបស់ខ្ញុំ។" : "Complete the missing items in My Business."}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plansLoading ? (
            <div className="md:col-span-3 flex items-center justify-center gap-2 rounded-3xl border border-stone-200 bg-white p-10 text-sm text-stone-500 dark:border-stone-800 dark:bg-stone-850">
              <Loader2 className="w-5 h-5 animate-spin" />
              {isKm ? "កំពុងផ្ទុកគម្រោង..." : "Loading plans..."}
            </div>
          ) : plans.length === 0 ? (
            <div className="md:col-span-3 rounded-3xl border border-stone-200 bg-white p-10 text-center text-sm text-stone-500 dark:border-stone-800 dark:bg-stone-850">
              {isKm ? "មិនមានគម្រោងសកម្មទេ។" : "No active plans are available."}
            </div>
          ) : (
            plans.map((plan) => {
              const isCurrent = billingTier === plan.code;
              const isPopular = plan.code === "featured";
              return (
                <div
                  key={plan.id}
                  className={`rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 border ${isPopular
                    ? "bg-white dark:bg-stone-850 border-amber-500 shadow-xl relative"
                    : isCurrent
                      ? "bg-white dark:bg-stone-850 border-emerald-500 shadow-md"
                      : "bg-white dark:bg-stone-850 border-stone-200/80 dark:border-stone-800 shadow-sm"
                    }`}
                >
                  {isPopular ? (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-500 to-brand-300 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-forest shadow">
                      {isKm ? "ពេញនិយមបំផុត" : "Most Popular"}
                    </div>
                  ) : null}

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-stone-900 dark:text-white">
                        {isKm ? plan.name_km || plan.name_en : plan.name_en || plan.name_km}
                      </h3>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 min-h-[32px]">
                        {isKm
                          ? plan.description_km || plan.description_en
                          : plan.description_en || plan.description_km}
                      </p>
                      {plan.trial_days > 0 ? (
                        <span className="mt-2 inline-flex rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                          {isKm ? `សាកល្បង ${plan.trial_days} ថ្ងៃ` : `${plan.trial_days}-day free trial`}
                        </span>
                      ) : null}
                    </div>

                    <div className="flex items-baseline gap-1 py-2 border-y border-stone-100 dark:border-stone-800">
                      <span className="text-3xl font-extrabold text-stone-900 dark:text-white">
                        {priceLabel(plan.price_usd)}
                      </span>
                      <span className="text-xs text-stone-400 font-semibold">
                        / {cycleLabel(plan.billing_cycle, isKm)}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <p className="font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider text-[10px]">
                        {isKm ? "មុខងាររួមបញ្ចូល៖" : "Features included:"}
                      </p>
                      <ul className="space-y-2">
                        {(plan.features || []).map((feature, index) => (
                          <li key={`${plan.id}-${index}`} className="flex items-start gap-2 text-stone-600 dark:text-stone-300">
                            <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      {plan.limits ? (
                        <div className="grid grid-cols-3 gap-2 pt-2">
                          {[
                            { labelKm: "រូបភាព", labelEn: "Photos", value: plan.limits.max_photos },
                            { labelKm: "សេវាកម្ម", labelEn: "Services", value: plan.limits.max_services },
                            { labelKm: "ក្រុម", labelEn: "Team", value: plan.limits.max_team_members },
                          ].map((limit) => (
                            <div key={limit.labelEn} className="rounded-xl bg-stone-50 dark:bg-stone-800/60 px-2 py-2 text-center">
                              <div className="text-sm font-extrabold text-stone-800 dark:text-stone-100">
                                {limit.value === null ? "∞" : limit.value}
                              </div>
                              <div className="text-[9px] font-semibold uppercase tracking-wide text-stone-400">
                                {isKm ? limit.labelKm : limit.labelEn}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-stone-100 dark:border-stone-800">
                    {isCurrent ? (
                      <div className="w-full py-2.5 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-xs font-bold text-center flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        {isKm ? "គម្រោងបច្ចុប្បន្នរបស់អ្នក" : "Your Current Plan"}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openRequest(plan)}
                        disabled={Boolean(pendingRequest)}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed ${isPopular
                          ? "bg-amber-500 hover:bg-amber-600 text-stone-950 shadow-sm"
                          : "bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200"
                          }`}
                      >
                        {pendingRequest
                          ? isKm ? "សំណើកំពុងរង់ចាំ" : "Request pending"
                          : isKm ? "ជ្រើសរើសគម្រោង" : "Select Plan"}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <p className="text-[11px] text-stone-400 leading-relaxed">
        {isKm
          ? "ចំណាំ៖ KYC និងគម្រោងជាការបង់ប្រាក់ខុសគ្នា។ ការផ្ទៀងផ្ទាត់ KYC ផ្តល់សញ្ញាផ្ទៀងផ្ទាត់ ឯគម្រោងគ្រប់គ្រងការបង្ហាញ និងមុខងារបន្ថែម។ គ្មានកម្រៃជើងសារលើការទាក់ទងទេ។"
          : "Note: KYC and paid plans are separate. KYC grants a verified badge; plans control visibility and extra features. There are no contact commissions."}
      </p>

      {showRenewModal ? (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-850 w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-base sm:text-lg text-stone-900 dark:text-white">
                  {isKm ? "ស្នើសុំជ្រើសរើសគម្រោង" : "Request Subscription Upgrade"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRenewModal(false)}
                className="p-1 text-stone-400 hover:text-stone-600"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedPlanData ? (
              <div className="rounded-2xl border border-stone-200 dark:border-stone-700 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-stone-400">
                      {isKm ? "គម្រោងដែលបានជ្រើសរើស" : "Selected plan"}
                    </p>
                    <p className="mt-1 text-lg font-extrabold text-stone-900 dark:text-white">
                      {isKm
                        ? selectedPlanData.name_km || selectedPlanData.name_en
                        : selectedPlanData.name_en || selectedPlanData.name_km}
                    </p>
                  </div>
                  <p className="text-right">
                    <span className="text-2xl font-extrabold text-stone-900 dark:text-white">
                      {priceLabel(selectedPlanData.price_usd)}
                    </span>
                    <span className="block text-[11px] text-stone-400">
                      / {cycleLabel(selectedPlanData.billing_cycle, isKm)}
                    </span>
                  </p>
                </div>
              </div>
            ) : null}

            <div className="space-y-4 text-xs sm:text-sm text-stone-600 dark:text-stone-300">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-300 space-y-2">
                <div className="font-bold flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-amber-600" />
                  {isKm ? "ការទូទាត់ដោយដៃ (KHQR)៖" : "Manual payment via KHQR:"}
                </div>
                <p className="text-xs leading-relaxed">
                  {isKm
                    ? "បន្ទាប់ពីផ្ញើសំណើ ក្រុមការងារនឹងទាក់ទងអ្នកដើម្បីទូទាត់តាម KHQR Bakong ឬធនាគារ។ គម្រោងនឹងសកម្មបន្ទាប់ពីផ្ទៀងផ្ទាត់ការទូទាត់។"
                    : "After submitting, our team will contact you to settle via KHQR Bakong or bank transfer. Your plan activates once the payment is verified."}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-2.5">
                <div className="text-xs font-bold uppercase text-stone-400">
                  {isKm ? "ទំនាក់ទំនងក្រុមការងារ" : "Admin contact"}
                </div>
                <div className="flex items-center gap-2 font-semibold text-stone-800 dark:text-stone-200">
                  <Send className="w-4 h-4 text-sky-500" />
                  <span>Telegram: @camgo_admin</span>
                </div>
                <div className="flex items-center gap-2 font-semibold text-stone-800 dark:text-stone-200">
                  <Phone className="w-4 h-4 text-emerald-500" />
                  <span>Hotline: +855 12 345 678</span>
                </div>
              </div>

              <label className="block space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                  {isKm ? "សម្គាល់បន្ថែម (ស្រេចចិត្ត)" : "Additional note (optional)"}
                </span>
                <textarea
                  rows={3}
                  value={requestNote}
                  onChange={(event) => setRequestNote(event.target.value)}
                  placeholder={isKm ? "ឧ. សូមចាប់ផ្តើមពីថ្ងៃទី ១..." : "E.g. Please activate from the 1st..."}
                  className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 px-3.5 py-2.5 text-sm text-stone-900 dark:text-white outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                />
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setShowRenewModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-500"
              >
                {isKm ? "បិទ" : "Close"}
              </button>
              <button
                type="button"
                onClick={submitRequest}
                disabled={planRequest.isPending || !selectedPlanData}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-stone-950 font-bold text-xs flex items-center gap-2 shadow-sm"
              >
                {planRequest.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {planRequest.isPending ? (isKm ? "កំពុងផ្ញើ..." : "Submitting...") : isKm ? "ផ្ញើសំណើ" : "Submit request"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(confirmAction)}
        title={confirmAction?.title}
        description={confirmAction?.description}
        confirmLabel={
          confirmAction?.type === "trial"
            ? isKm
              ? "ចាប់ផ្តើម"
              : "Start trial"
            : isKm
              ? "បោះបង់សំណើ"
              : "Cancel request"
        }
        tone={confirmAction?.type === "cancel" ? "danger" : "warning"}
        isPending={trialMutation.isPending || cancelRequestMutation.isPending}
        onConfirm={runConfirmedAction}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
};
