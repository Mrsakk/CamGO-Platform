import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Search,
  MapPin,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Loader2,
  Store,
  ChevronRight,
  ShieldCheck,
  Compass,
  Hotel,
  UtensilsCrossed,
  Bus,
  Gift,
  Ticket,
  Activity,
} from "lucide-react";
import api from "@/lib/axios";
import { BusinessCard } from "@/components/common/BusinessCard";

export const HomePage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isKm = i18n.language === "km";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [heroEmail, setHeroEmail] = useState("");
  const [heroEmailStatus, setHeroEmailStatus] = useState("idle");
  const [heroEmailError, setHeroEmailError] = useState("");

  const { data: homeData, isLoading } = useQuery({
    queryKey: ["public", "home"],
    queryFn: async () => {
      const res = await api.get("/business/public/home");
      return res.data;
    },
  });

  const shuffleArray = (arr) => {
    if (!arr || !arr.length) return [];
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const homePayload = homeData?.data || homeData || {};

  const verifiedList = useMemo(() => {
    const pool = homePayload?.verified_pool || [];
    return shuffleArray(pool).slice(0, 6);
  }, [homePayload?.verified_pool]);

  const newestList = useMemo(() => {
    const pool = homePayload?.newest_pool || [];
    return shuffleArray(pool).slice(0, 6);
  }, [homePayload?.newest_pool]);

  const categories = homePayload?.categories || [];
  const provinces = homePayload?.provinces || [];
  const featured = verifiedList[0];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    if (selectedProvince) params.set("province", selectedProvince);
    navigate(`/businesses?${params.toString()}`);
  };

  const handleHeroEmailSubmit = async (e) => {
    e.preventDefault();
    const email = heroEmail.trim();

    if (!email || heroEmailStatus === "loading") return;

    setHeroEmailStatus("loading");
    setHeroEmailError("");

    try {
      await api.post("/contact", {
        name: "CamGO email subscriber",
        email,
        subject: t("home.hero_form.subject"),
        message: t("home.hero_form.message", { email }),
      });
      setHeroEmail("");
      setHeroEmailStatus("success");
    } catch (error) {
      setHeroEmailError(
        error?.response?.data?.message || t("home.hero_form.error")
      );
      setHeroEmailStatus("error");
    }
  };

  const getCategoryIcon = (icon) => {
    const key = String(icon || "")
      .replace(/[\s_-]/g, "")
      .toLowerCase();

    if (["hotel", "accommodation", "building", "bed"].includes(key)) {
      return Hotel;
    }
    if (["utensilscrossed", "utensils", "restaurant", "coffee", "food"].includes(key)) {
      return UtensilsCrossed;
    }
    if (["compass", "guide", "tourguide"].includes(key)) {
      return Compass;
    }
    if (["bus", "car", "transport"].includes(key)) {
      return Bus;
    }
    if (["gift", "crafts", "souvenir"].includes(key)) {
      return Gift;
    }
    if (["sparkles", "spa", "wellness"].includes(key)) {
      return Sparkles;
    }
    if (["ticket", "activity", "activities"].includes(key)) {
      return Ticket;
    }
    return Activity;
  };

  return (
    <div className="pb-20">
      <section className="container-page pt-6">
        <div className="overflow-hidden rounded-card border border-line bg-sage/60 shadow-premium dark:border-white/10 dark:bg-stone-850">
          <div className="relative px-5 py-10 sm:px-8 sm:py-14 lg:min-h-[36rem] lg:px-12 lg:py-16">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="eyebrow">{t("home.eyebrow")}</p>
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-muted dark:text-white/55">
                <ShieldCheck className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                {t("home.trust_kyc")}
              </span>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-hero-display mt-6 max-w-[18ch] text-forest dark:text-cream"
            >
              {t("home.hero_title")}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.08 }}
              className="mt-5 max-w-xl text-base leading-relaxed text-muted dark:text-white/60"
            >
              {t("home.hero_subtitle")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.14 }}
              className="mt-7 max-w-2xl"
            >
              {heroEmailStatus === "success" ? (
                <div
                  role="status"
                  className="flex items-start gap-3 rounded-card border border-teal-600/20 bg-cream p-4 shadow-premium dark:border-teal-400/20 dark:bg-stone-850"
                >
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-teal-600 dark:text-teal-400" />
                  <div>
                    <p className="text-sm font-semibold text-forest dark:text-cream">
                      {t("home.hero_form.success")}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-muted dark:text-white/55">
                      {t("home.hero_form.note")}
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleHeroEmailSubmit}>
                  <div className="flex flex-col gap-2 rounded-card border border-line bg-cream p-2 shadow-premium dark:border-white/10 dark:bg-stone-850 sm:flex-row sm:items-center">
                    <label htmlFor="hero-email" className="sr-only">
                      {t("home.hero_form.label")}
                    </label>
                    <input
                      id="hero-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={heroEmail}
                      onChange={(e) => setHeroEmail(e.target.value)}
                      placeholder={t("home.hero_form.placeholder")}
                      disabled={heroEmailStatus === "loading"}
                      className="min-h-touch w-full flex-1 bg-transparent px-3 text-sm text-ink outline-none placeholder:text-muted/70 disabled:opacity-60 dark:text-cream dark:placeholder:text-white/35"
                    />
                    <button
                      type="submit"
                      disabled={heroEmailStatus === "loading"}
                      className="btn-primary shrink-0 !min-h-touch px-5"
                    >
                      {heroEmailStatus === "loading" ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>{t("home.hero_form.loading")}</span>
                        </>
                      ) : (
                        <>
                          <span>{t("home.hero_form.cta")}</span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                  <p className="mt-2.5 flex items-center gap-2 text-xs text-muted dark:text-white/55">
                    <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-teal-600 dark:text-teal-400" />
                    {t("home.hero_form.note")}
                  </p>
                  {heroEmailStatus === "error" ? (
                    <p role="alert" className="mt-2 text-xs font-medium text-danger">
                      {heroEmailError}
                    </p>
                  ) : null}
                </form>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="mt-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 text-xs text-muted dark:text-white/55"
            >
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <span className="inline-flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  {t("home.trust_zero_commission")}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Store className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  {t("home.trust_direct")}
                </span>
              </div>

              {featured ? (
                <Link
                  to={`/b/${featured.slug}`}
                  className="group inline-flex items-center gap-2 font-semibold text-forest transition hover:text-brand-600 dark:text-cream dark:hover:text-brand-300"
                >
                  <Sparkles className="h-4 w-4 text-brand-600 dark:text-brand-300" />
                  <span>
                    {featured.is_featured
                      ? t("home.featured_label")
                      : t("home.verified_label")}
                    :{" "}
                    {isKm
                      ? featured.name_km || featured.name_en
                      : featured.name_en || featured.name_km}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </Link>
              ) : null}
            </motion.div>
          </div>
        </div>

        <form
          onSubmit={handleSearchSubmit}
          className="mt-4 grid gap-2 rounded-card border border-line bg-cream p-3 shadow-premium dark:border-white/10 dark:bg-stone-850 md:grid-cols-[1fr_auto_16rem_auto] md:items-center"
        >
          <div className="flex flex-1 items-center gap-3 rounded-control bg-sage px-4 py-3 dark:bg-white/5">
            <Search className="h-4 w-4 shrink-0 text-brand-600" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("search.placeholder")}
              className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted dark:text-slate-100"
            />
          </div>

          <div className="hidden h-7 w-px bg-line md:block" />

          <div className="flex w-full items-center gap-3 rounded-control bg-sage px-4 py-3 dark:bg-white/5 md:w-56">
            <MapPin className="h-4 w-4 shrink-0 text-brand-600" />
            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="w-full bg-transparent text-sm text-ink outline-none dark:text-slate-100"
            >
              <option value="">{t("search.all_provinces")}</option>
              {provinces.map((prov) => (
                <option key={prov.id} value={prov.id}>
                  {isKm ? prov.name_km : prov.name_en}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn-accent shrink-0">
            <span>{t("search.button")}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mx-auto mt-5 flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-2 px-2 text-xs">
          <span className="font-semibold text-muted">
            {t("home.popular")}
          </span>
          {categories.slice(0, 5).map((cat) => (
            <Link
              key={cat.id}
              to={`/businesses?category=${cat.id}`}
              className="rounded-full border border-line bg-cream px-3.5 py-2 font-medium text-forest transition hover:border-brand-500 hover:bg-brand-50 dark:border-white/10 dark:bg-white/5 dark:text-cream"
            >
              {isKm ? cat.name_km : cat.name_en}
            </Link>
          ))}
        </div>
      </section>

      <section id="categories" className="mx-auto max-w-content px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">{t("home.categories_eyebrow")}</p>
            <h2 className="section-heading mt-2">{t("home.categories_title")}</h2>
          </div>
          <Link
            to="/businesses"
            className="hidden items-center gap-1 text-sm font-semibold text-forest hover:text-brand-600 dark:text-white dark:hover:text-brand-300 sm:inline-flex"
          >
            {t("home.view_all")}
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
          {categories.map((cat) => {
            const Icon = getCategoryIcon(cat.icon);
            return (
              <Link
                key={cat.id}
                to={`/businesses?category=${cat.id}`}
                className="group flex min-h-[112px] flex-col justify-between rounded-card border border-line bg-cream p-4 shadow-premium transition duration-200 hover:-translate-y-0.5 hover:border-brand-400 dark:border-white/10 dark:bg-stone-850"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-control bg-sage text-brand-700 transition duration-200 group-hover:bg-brand-500 group-hover:text-forest-dark dark:bg-white/5 dark:text-brand-300">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="mt-3 line-clamp-2 text-sm font-semibold text-ink dark:text-slate-100">
                  {isKm ? cat.name_km : cat.name_en}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="border-y border-line bg-sage py-16 dark:border-white/10 dark:bg-stone-950">
        <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow">{t("home.verified_eyebrow")}</p>
              <h2 className="section-heading mt-2">{t("home.verified_title")}</h2>
            </div>
            <Link
              to="/businesses?verified=1"
              className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-forest hover:text-brand-600 dark:text-white dark:hover:text-brand-300 sm:inline-flex"
            >
              {t("home.view_all")}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 no-scrollbar sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-3">
            {verifiedList.map((biz) => (
              <div key={biz.id} className="w-[82vw] max-w-[320px] min-w-[260px] flex-shrink-0 snap-start sm:w-auto sm:max-w-none sm:min-w-0">
                <BusinessCard business={biz} source="list" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-content px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">{t("home.new_eyebrow")}</p>
            <h2 className="section-heading mt-2">{t("home.new_title")}</h2>
          </div>
          <Link
            to="/businesses?sort=newest"
            className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-forest hover:text-brand-600 dark:text-white dark:hover:text-brand-300 sm:inline-flex"
          >
            {t("home.view_all")}
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 no-scrollbar sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-3">
          {newestList.map((biz) => (
            <div key={biz.id} className="w-[82vw] max-w-[320px] min-w-[260px] flex-shrink-0 snap-start sm:w-auto sm:max-w-none sm:min-w-0">
              <BusinessCard business={biz} source="list" />
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-content px-4 pb-16 sm:px-6 lg:px-8">
        <div className="premium-panel p-6 md:p-10">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow">{t("home.provinces_eyebrow")}</p>
              <h2 className="section-heading mt-2">{t("home.provinces_title")}</h2>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {provinces.slice(0, 12).map((prov) => (
              <Link
                key={prov.id}
                to={`/businesses?province=${prov.id}`}
                className="group flex items-center justify-between gap-2 rounded-full border border-transparent px-4 py-3 transition hover:border-brand-200 hover:bg-brand-50 dark:hover:border-white/10 dark:hover:bg-white/5"
              >
                <span className="flex items-center gap-2 text-sm font-medium text-ink group-hover:text-forest dark:text-slate-100 dark:group-hover:text-brand-300">
                  <MapPin className="h-3.5 w-3.5 text-brand-600" />
                  {isKm ? prov.name_km : prov.name_en}
                </span>
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-paper px-2 text-[11px] font-semibold text-muted group-hover:bg-brand-100 group-hover:text-brand-800 dark:bg-white/10 dark:text-white/50">
                  {prov.businesses_count || 0}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-content px-4 pb-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-card border border-white/10 bg-forest px-6 py-14 text-white shadow-premium sm:px-10 md:py-20">
          <div className="absolute inset-x-0 top-0 h-1 bg-brand-500" />
          <div className="relative max-w-2xl">
            <p className="inline-flex items-center gap-2 text-xs font-semibold text-brand-300">
              <Store className="h-4 w-4" />
              {t("home.owners_eyebrow")}
            </p>
            <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
              {t("home.direct_contact_banner.title")}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/65 md:text-base">
              {t("home.direct_contact_banner.subtitle")}
            </p>
            <Link to="/list-your-business" className="btn-primary mt-7">
              {t("home.direct_contact_banner.cta")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {isLoading && (
        <div className="mx-auto max-w-content px-4 pb-8 text-center text-xs text-muted sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-brand-600" />
            {t("home.loading")}
          </span>
        </div>
      )}
    </div>
  );
};
