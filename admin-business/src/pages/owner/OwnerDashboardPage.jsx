import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  Camera,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  Eye,
  ExternalLink,
  MessageSquare,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Users,
  Wrench,
} from "lucide-react";
import api from "@/lib/axios";
import { QueryError } from "@/components/common/QueryError";
import { getPublicBusinessUrl } from "@/lib/publicUrls";
import { useAuthStore } from "@/store/authStore";

const getDaysRemaining = (value) => {
  if (!value) return null;
  return Math.max(0, Math.ceil((new Date(value).getTime() - Date.now()) / 86400000));
};

const profileTabForAction = {
  identity: "general",
  contact: "contacts",
  location: "contacts",
  media: "media",
  hours: "hours",
  category_details: "category",
};

const profileLinkForAction = (action) =>
  action.key === "verification"
    ? "/owner/help?topic=verification"
    : `/owner/my-business?tab=${profileTabForAction[action.key] || "general"}`;

export const OwnerDashboardPage = () => {
  const { i18n } = useTranslation();
  const isKm = i18n.language === "km";
  const { hasBusinessCapability } = useAuthStore();
  const [range, setRange] = useState("30d");

  const {
    data: statsData,
    isLoading: statsLoading,
    isError: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ["owner-stats", range],
    queryFn: async () => {
      const res = await api.get(`/business/owner/stats?range=${range}`);
      return res.data?.data || res.data;
    },
  });

  const {
    data: business,
    isLoading: bizLoading,
    isError: bizError,
    refetch: refetchBusiness,
  } = useQuery({
    queryKey: ["owner-my-business"],
    queryFn: async () => {
      const res = await api.get("/business/owner/my-business");
      return res.data?.data || res.data;
    },
  });

  if (bizLoading || statsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-stone-500">
          {isKm ? "កំពុងទាញយកទិន្នន័យអាជីវកម្ម..." : "Loading your business dashboard..."}
        </p>
      </div>
    );
  }

  if (statsError || bizError) {
    return (
      <QueryError
        className="max-w-2xl mx-auto mt-10"
        onRetry={() => {
          refetchStats();
          refetchBusiness();
        }}
      />
    );
  }

  const totals = statsData?.totals || {};
  const channels = statsData?.channels || {};
  const leadStats = statsData?.leads || {};
  const leadChange = statsData?.lead_change || {};
  const profile = statsData?.profile || {};
  const tier = statsData?.tier || {};
  const currentTier = tier.current || business?.tier || "free";
  const tierLabel = { free: "Free", verified: "Pro", featured: "Premium" }[currentTier] || currentTier;
  const daysRemaining = getDaysRemaining(tier.trial_ends_at || tier.expires_at);
  const profileScore = Number(profile.score || 0);
  const name = isKm
    ? business?.name_km || business?.name_en
    : business?.name_en || business?.name_km;
  const rangeLabel = isKm ? range.replace("d", " ថ្ងៃ") : range;
  const leadChangePercent = Number(leadChange.change_percent || 0);
  const planLimits = statsData?.plan_limits || {};
  const usage = statsData?.usage || {};
  const followUps = statsData?.follow_ups || {};
  const followUpItems = followUps.items || [];
  const followUpCount = Number(followUps.count || 0);
  const followUpDays = Number(followUps.days || 3);

  const usageRows = [
    {
      key: "photos",
      label: isKm ? "រូបភាព" : "Photos",
      used: Number(usage.photos || 0),
      limit: planLimits.max_photos,
      icon: Camera,
    },
    {
      key: "services",
      label: isKm ? "សេវាកម្ម" : "Services",
      used: Number(usage.services || 0),
      limit: planLimits.max_services,
      icon: Wrench,
    },
    {
      key: "team_members",
      label: isKm ? "ក្រុមការងារ" : "Team members",
      used: Number(usage.team_members || 0),
      limit: planLimits.max_team_members,
      icon: Users,
    },
  ].map((row) => {
    const isUnlimited = row.limit === null || row.limit === undefined;
    const limit = isUnlimited ? null : Number(row.limit);
    const percent = limit && limit > 0 ? Math.min(100, Math.round((row.used / limit) * 100)) : 0;
    const isNearLimit = limit !== null && limit > 0 && row.used / limit >= 0.8;

    return { ...row, isUnlimited, limit, percent, isNearLimit };
  });

  const followUpStatusMeta = {
    new: {
      label: isKm ? "ថ្មី" : "New",
      className: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-900",
    },
    contacted: {
      label: isKm ? "បានទាក់ទង" : "Contacted",
      className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900",
    },
    qualified: {
      label: isKm ? "មានសក្តានុពល" : "Qualified",
      className: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-900",
    },
  };

  const metrics = [
    {
      label: isKm ? "អតិថិជនចាប់អារម្មណ៍ថ្មី" : "New leads",
      value: leadStats.total || 0,
      hint:
        leadChangePercent === 0
          ? isKm
            ? "ធៀបនឹងរយៈពេលមុន"
            : "vs previous period"
          : `${leadChangePercent > 0 ? "+" : ""}${leadChangePercent}% ${
              isKm ? "ធៀបនឹងរយៈពេលមុន" : "vs previous period"
            }`,
      icon: MessageSquare,
      color: "text-emerald-600 bg-emerald-500/10",
    },
    {
      label: isKm ? "ការមើលទំព័រ" : "Profile views",
      value: totals.views || 0,
      hint: isKm ? `ក្នុង ${rangeLabel}` : `In the last ${range}`,
      icon: Eye,
      color: "text-sky-600 bg-sky-500/10",
    },
    {
      label: isKm ? "ការទាក់ទងផ្ទាល់" : "Direct contacts",
      value: totals.contacts || 0,
      hint: isKm ? "ហៅទូរស័ព្ទ សារ និងទីតាំង" : "Calls, chats & directions",
      icon: PhoneCall,
      color: "text-amber-600 bg-amber-500/10",
    },
    {
      label: isKm ? "ការវាយតម្លៃមធ្យម" : "Average rating",
      value: totals.rating_avg ? Number(totals.rating_avg).toFixed(1) : "—",
      hint: `${totals.rating_count || 0} ${isKm ? "ការវាយតម្លៃ" : "reviews"}`,
      icon: Star,
      color: "text-yellow-600 bg-yellow-500/10",
    },
  ];

  const pipeline = [
    { key: "new", label: isKm ? "ថ្មី" : "New", value: leadStats.new || 0, color: "bg-sky-500" },
    { key: "contacted", label: isKm ? "បានទាក់ទង" : "Contacted", value: leadStats.contacted || 0, color: "bg-amber-500" },
    { key: "qualified", label: isKm ? "មានសក្តានុពល" : "Qualified", value: leadStats.qualified || 0, color: "bg-violet-500" },
    { key: "won", label: isKm ? "ទទួលបាន" : "Won", value: leadStats.won || 0, color: "bg-emerald-500" },
    { key: "lost", label: isKm ? "បាត់បង់" : "Lost", value: leadStats.lost || 0, color: "bg-stone-400" },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <section className="relative overflow-hidden rounded-[32px] border border-forest/20 bg-forest px-6 py-7 text-cream shadow-premium sm:px-8 sm:py-9">
        <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-brand-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-60 w-60 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative z-10 flex flex-col items-start justify-between gap-7 lg:flex-row lg:items-end">
          <div className="max-w-2xl space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-200">
                {isKm ? "ផ្ទាំងម្ចាស់អាជីវកម្ម" : "Business Owner Portal"}
              </span>
              <span
                className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] ${
                  business?.status === "approved"
                    ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-300"
                    : "border-amber-300/30 bg-amber-500/15 text-amber-300"
                }`}
              >
                {business?.status === "approved"
                  ? isKm
                    ? "កំពុងផ្សព្វផ្សាយ"
                    : "Live"
                  : isKm
                  ? "កំពុងរង់ចាំការត្រួតពិនិត្យ"
                  : "Under review"}
              </span>
              <span className="rounded-full bg-brand-500 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.1em] text-forest shadow-gold">
                {tierLabel}
              </span>
            </div>
            <h1 className="text-3xl leading-tight text-cream sm:text-4xl">
              {name || "My Business"}
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-white/55">
              {isKm
                ? "គ្រប់គ្រងព័ត៌មានអាជីវកម្ម តាមដានអតិថិជន និងបង្កើនឱកាសលក់ដោយគ្មានកម្រៃជើងសារ។"
                : "Manage your profile, follow up with customers, and grow without commission fees."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {business?.slug && (
              <a
                href={getPublicBusinessUrl(business.slug)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2.5 text-xs font-semibold text-white backdrop-blur-sm transition hover:border-brand-300/30 hover:bg-white/10"
              >
                <ExternalLink className="h-4 w-4 text-brand-300" />
                <span>{isKm ? "មើលទំព័រសាធារណៈ" : "View Live Profile"}</span>
              </a>
            )}
            {hasBusinessCapability("profile.update") && (
              <Link
                to="/owner/my-business"
                className="flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-xs font-bold text-forest shadow-gold transition hover:bg-brand-400"
              >
                <span>{isKm ? "កែប្រែព័ត៌មានអាជីវកម្ម" : "Edit Profile"}</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className="portal-surface space-y-3 p-5 transition hover:-translate-y-0.5 hover:shadow-premium"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted dark:text-stone-400">
                  {metric.label}
                </span>
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${metric.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="font-serif text-3xl font-semibold leading-none text-forest dark:text-cream">
                {typeof metric.value === "number"
                  ? metric.value.toLocaleString()
                  : metric.value}
              </div>
              <p className="text-xs text-stone-400">{metric.hint}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 portal-surface p-6 space-y-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-500" />
                {isKm ? "ស្ថិតិអតិថិជន" : "Customer Insights"}
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {isKm ? "ទិន្នន័យពិតប្រាកដពីទំព័រអាជីវកម្មរបស់អ្នក" : "Real data from your public business profile"}
              </p>
            </div>
            <div className="flex items-center gap-1 rounded-full border border-line bg-paper p-1 text-xs font-semibold dark:border-white/10 dark:bg-white/5">
              {["7d", "30d", "90d"].map((item) => (
                <button
                  key={item}
                  onClick={() => setRange(item)}
                  className={`rounded-full px-3 py-1.5 transition ${
                    range === item
                      ? "bg-brand-500 font-bold text-forest shadow-gold"
                      : "text-muted hover:text-forest dark:text-stone-400 dark:hover:text-white"
                  }`}
                >
                  {item.replace("d", isKm ? " ថ្ងៃ" : "d")}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-750">
              <div className="text-xs font-semibold text-stone-500">
                {isKm ? "អត្រាបំប្លែងអតិថិជន" : "Lead conversion"}
              </div>
              <div className="mt-2 text-2xl font-extrabold text-stone-900 dark:text-white">
                {leadStats.conversion_rate || 0}%
              </div>
              <div className="mt-1 text-xs text-stone-400">
                {isKm ? "អតិថិជនដែលទទួលបានជោគជ័យ" : "Leads marked as won"}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-750">
              <div className="text-xs font-semibold text-stone-500">
                {isKm ? "ការទាក់ទងតាមទូរស័ព្ទ" : "Phone contacts"}
              </div>
              <div className="mt-2 text-2xl font-extrabold text-stone-900 dark:text-white">
                {channels.phone || 0}
              </div>
              <div className="mt-1 text-xs text-stone-400">
                {isKm ? "ចុចហៅដោយផ្ទាល់" : "Direct call clicks"}
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-stone-900 dark:text-white">
                {isKm ? "ដំណាក់កាលអតិថិជន" : "Lead pipeline"}
              </h3>
              {hasBusinessCapability("leads.view") && (
                <Link to="/owner/leads" className="text-xs font-bold text-amber-600 flex items-center gap-1">
                  {isKm ? "មើលទាំងអស់" : "View all"}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
            <div className="space-y-2">
              {pipeline.map((stage) => {
                const total = Math.max(leadStats.total || 0, 1);
                return (
                  <div key={stage.key} className="flex items-center gap-3">
                    <span className="w-20 text-xs text-stone-500">{stage.label}</span>
                    <div className="flex-1 h-2 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${stage.color}`}
                        style={{ width: `${Math.round((stage.value / total) * 100)}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-xs font-bold text-stone-700 dark:text-stone-200">
                      {stage.value}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="portal-surface p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-500" />
              {isKm ? "ភាពពេញលេញនៃព័ត៌មាន" : "Profile strength"}
            </h2>
            <span className="text-lg font-extrabold text-emerald-600">{profileScore}%</span>
          </div>

          <div className="h-2.5 overflow-hidden rounded-full bg-paper dark:bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-600 via-brand-500 to-brand-300 transition-all"
              style={{ width: `${profileScore}%` }}
            />
          </div>

          <div className="space-y-2">
            {(profile.next_actions || []).slice(0, 4).map((action) => (
              <Link
                key={action.key}
                to={profileLinkForAction(action)}
                className="flex items-start gap-2 rounded-xl p-2.5 hover:bg-stone-50 dark:hover:bg-stone-800 transition"
              >
                <span className="mt-0.5 w-5 h-5 rounded-full border-2 border-stone-300 dark:border-stone-600 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-stone-800 dark:text-stone-200">
                    {isKm ? action.label_km : action.label_en}
                  </div>
                  <div className="text-[11px] text-stone-500 leading-snug">
                    {isKm ? action.hint_km : action.hint_en}
                  </div>
                </div>
              </Link>
            ))}
            {(profile.next_actions || []).length === 0 && (
              <div className="flex items-center gap-2 text-sm text-emerald-600 font-semibold">
                <CheckCircle2 className="w-5 h-5" />
                {isKm ? "ព័ត៌មានរបស់អ្នកពេញលេញហើយ!" : "Your profile is complete!"}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-stone-200 dark:border-stone-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-stone-500 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4" />
                {isKm ? "គម្រោងបច្ចុប្បន្ន" : "Current plan"}
              </span>
              <span className="uppercase text-amber-600 font-bold">{tierLabel}</span>
            </div>
            <p className="text-xs text-stone-500">
              {tier.is_on_trial
                ? isKm
                  ? `ការសាកល្បង Pro នៅសល់ ${daysRemaining} ថ្ងៃ`
                  : `Pro trial: ${daysRemaining} days left`
                : daysRemaining !== null
                ? isKm
                  ? `នៅសល់ ${daysRemaining} ថ្ងៃ`
                  : `${daysRemaining} days remaining`
                : isKm
                ? "គម្រោងសហគមន៍ឥតគិតថ្លៃ"
                : "Free community plan"}
            </p>
            {hasBusinessCapability("billing.manage") && (
              <Link
                to="/owner/subscription"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-forest px-4 py-2.5 text-xs font-bold text-cream transition hover:bg-forest/90 dark:bg-brand-500 dark:text-forest dark:hover:bg-brand-400"
              >
                <Sparkles className="w-4 h-4" />
                {tier.is_on_trial
                  ? isKm
                    ? "ជ្រើសរើសគម្រោងបន្ត"
                    : "Choose a plan"
                  : isKm
                  ? "មើលគម្រោង និងការជាវ"
                  : "View plans & billing"}
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {hasBusinessCapability("leads.view") && (
          <div className="lg:col-span-2 portal-surface p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  {isKm ? "អតិថិជនត្រូវតាមដាន" : "Follow-ups due"}
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {isKm
                    ? `អតិថិជនដែលមិនបានទាក់ទងលើសពី ${followUpDays} ថ្ងៃ`
                    : `Active leads without contact for ${followUpDays}+ days`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-extrabold text-amber-700 dark:text-amber-300">
                  {followUpCount}
                </span>
                <Link
                  to="/owner/leads"
                  className="text-xs font-bold text-amber-600 flex items-center gap-1 hover:underline"
                >
                  {isKm ? "មើលទាំងអស់" : "View all"}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {followUpCount === 0 ? (
              <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300">
                <CheckCircle2 className="w-5 h-5" />
                {isKm ? "គ្មានអតិថិជនដែលហួសកំណត់តាមដានទេ។" : "No overdue follow-ups right now."}
              </div>
            ) : (
              <div className="space-y-2">
                {followUpItems.map((lead) => {
                  const meta = followUpStatusMeta[lead.status] || followUpStatusMeta.new;
                  return (
                    <Link
                      key={lead.id}
                      to="/owner/leads"
                      className="flex items-center justify-between gap-3 rounded-2xl border border-stone-100 px-3.5 py-3 transition hover:border-amber-300 hover:bg-amber-50/40 dark:border-stone-800 dark:hover:border-amber-800 dark:hover:bg-amber-950/10"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${meta.className}`}>
                            {meta.label}
                          </span>
                          <span className="text-xs font-semibold capitalize text-stone-600 dark:text-stone-300">
                            {(lead.primary_channel || "contact").replace("_", " ")}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-stone-500 dark:text-stone-400">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {isKm
                              ? `រង់ចាំ ${lead.waiting_days} ថ្ងៃ`
                              : `Waiting ${lead.waiting_days} days`}
                          </span>
                          <span>
                            · {lead.contact_count} {isKm ? "ការទាក់ទង" : "contacts"}
                          </span>
                        </div>
                        {lead.note && (
                          <p className="mt-1 line-clamp-1 text-[11px] text-stone-400">{lead.note}</p>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 shrink-0 text-stone-400" />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div
          className={`portal-surface p-6 space-y-5 ${
            hasBusinessCapability("leads.view") ? "" : "lg:col-span-3"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-sky-500" />
                {isKm ? "ការប្រើប្រាស់គម្រោង" : "Plan usage"}
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {isKm ? "ធៀបនឹងដែនកំណត់គម្រោងបច្ចុប្បន្ន" : "Compared with your current plan limits"}
              </p>
            </div>
            {hasBusinessCapability("billing.manage") && (
              <Link
                to="/owner/subscription"
                className="shrink-0 text-xs font-bold text-amber-600 hover:underline"
              >
                {tierLabel}
              </Link>
            )}
          </div>

          <div className="space-y-4">
            {usageRows.map((row) => {
              const Icon = row.icon;
              return (
                <div key={row.key} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 dark:text-stone-300">
                      <Icon className="w-3.5 h-3.5 text-stone-400" />
                      {row.label}
                    </span>
                    <span className="text-xs font-bold text-stone-700 dark:text-stone-200">
                      {row.used}
                      <span className="font-medium text-stone-400">
                        {" / "}
                        {row.isUnlimited ? (isKm ? "គ្មានកំណត់" : "Unlimited") : row.limit}
                      </span>
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
                    <div
                      className={`h-full rounded-full transition-all ${
                        row.isUnlimited
                          ? "bg-emerald-300 dark:bg-emerald-800"
                          : row.isNearLimit
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      }`}
                      style={{ width: row.isUnlimited ? "100%" : `${row.percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {usageRows.some((row) => row.isNearLimit) && (
            <div className="rounded-2xl bg-amber-50 px-3.5 py-3 text-xs leading-relaxed text-amber-800 dark:bg-amber-950/20 dark:text-amber-300">
              {isKm
                ? "អ្នកជិតដល់ដែនកំណត់គម្រោងហើយ។ ដំឡើងគម្រោងដើម្បីបន្ថែមទៀត។"
                : "You are close to a plan limit. Upgrade to add more."}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {hasBusinessCapability("leads.view") && (
          <Link
            to="/owner/leads"
            className="portal-surface flex items-center gap-4 p-5 transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-premium"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-stone-900 dark:text-white">
                {isKm ? "តាមដានអតិថិជន" : "Follow up leads"}
              </div>
              <div className="text-xs text-stone-500">{isKm ? "កត់ត្រាការទាក់ទង" : "Track every conversation"}</div>
            </div>
          </Link>
        )}
        {hasBusinessCapability("reviews.view") && (
          <Link
            to="/owner/reviews"
            className="portal-surface flex items-center gap-4 p-5 transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-premium"
          >
            <div className="w-11 h-11 rounded-xl bg-yellow-500/10 text-yellow-600 flex items-center justify-center">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-stone-900 dark:text-white">
                {isKm ? "ឆ្លើយតបការវាយតម្លៃ" : "Reply to reviews"}
              </div>
              <div className="text-xs text-stone-500">{isKm ? "បង្កើតទំនុកចិត្ត" : "Build customer trust"}</div>
            </div>
          </Link>
        )}
        {hasBusinessCapability("notifications.view") && (
          <Link
            to="/owner/notifications"
            className="portal-surface flex items-center gap-4 p-5 transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-premium"
          >
            <div className="w-11 h-11 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-stone-900 dark:text-white">
                {isKm ? "ការជូនដំណឹង" : "Notifications"}
              </div>
              <div className="text-xs text-stone-500">{isKm ? "មិនខកខានឱកាស" : "Never miss an opportunity"}</div>
            </div>
          </Link>
        )}
      </div>

      {tier.has_used_trial && !tier.is_on_trial && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
            {isKm
              ? "ការសាកល្បង Pro របស់អ្នកបានប្រើរួចហើយ។ អ្នកអាចបន្តជាមួយគម្រោងបង់ប្រាក់បានគ្រប់ពេល ដោយទិន្នន័យរបស់អ្នកមិនបាត់បង់។"
              : "Your Pro trial has been used. You can upgrade anytime without losing your data."}
          </p>
        </div>
      )}
    </div>
  );
};
