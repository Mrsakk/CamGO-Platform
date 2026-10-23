import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  CircleDollarSign,
  HelpCircle,
  ShieldCheck,
  Sparkles,
  Store,
} from "lucide-react";

const planStyles = [
  {
    key: "free",
    icon: Store,
    highlighted: false,
  },
  {
    key: "pro",
    icon: Sparkles,
    highlighted: true,
  },
  {
    key: "premium",
    icon: BadgeCheck,
    highlighted: false,
  },
];

export const PricingPage = () => {
  const { t, i18n } = useTranslation();
  const isKm = i18n.language === "km";

  const plans = t("pricing.plans", { returnObjects: true });
  const faqs = t("pricing.faq.items", { returnObjects: true });

  return (
    <div className="pb-20">
      <Helmet>
        <title>{t("pricing.meta_title")}</title>
        <meta name="description" content={t("pricing.meta_description")} />
      </Helmet>

      <section className="container-page pt-8 sm:pt-12">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">{t("pricing.eyebrow")}</p>
          <h1 className="mt-4 text-hero text-forest dark:text-cream">
            {t("pricing.title")}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted dark:text-white/65">
            {t("pricing.subtitle")}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted dark:text-white/55">
            <span className="inline-flex items-center gap-2">
              <CircleDollarSign className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              {t("pricing.note_commission")}
            </span>
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              {t("pricing.note_kyc")}
            </span>
          </div>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {Array.isArray(plans)
            ? plans.map((plan, index) => {
                const style = planStyles[index] || planStyles[0];
                const Icon = style.icon;

                return (
                  <article
                    key={style.key}
                    className={`relative flex flex-col rounded-card border bg-cream p-6 shadow-premium dark:bg-stone-850 ${
                      style.highlighted
                        ? "border-brand-500 ring-1 ring-brand-500"
                        : "border-line dark:border-white/10"
                    }`}
                  >
                    {style.highlighted ? (
                      <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-brand-500 px-3 py-1 text-xs font-bold text-forest-dark">
                        <Sparkles className="h-3.5 w-3.5" />
                        {t("pricing.popular")}
                      </span>
                    ) : null}

                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-control bg-sage text-brand-700 dark:bg-white/5 dark:text-brand-300">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <h2 className="text-lg font-bold text-forest dark:text-cream">
                          {plan.name}
                        </h2>
                        <p className="text-sm text-muted dark:text-white/55">
                          {plan.tagline}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex items-end gap-1.5">
                      <span className="text-3xl font-bold tracking-tight text-forest dark:text-cream">
                        {plan.price}
                      </span>
                      {plan.period ? (
                        <span className="pb-1 text-sm text-muted dark:text-white/55">
                          {plan.period}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 min-h-[40px] text-sm leading-relaxed text-muted dark:text-white/55">
                      {plan.description}
                    </p>

                    <ul className="mt-5 flex-1 space-y-3 border-t border-line pt-5 text-sm dark:border-white/10">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2.5">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" />
                          <span className="text-ink dark:text-white/75">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Link
                      to="/list-your-business"
                      className={`mt-6 ${
                        style.highlighted ? "btn-primary" : "btn-secondary"
                      }`}
                    >
                      {style.highlighted
                        ? t("pricing.cta_primary")
                        : t("pricing.cta_secondary")}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </article>
                );
              })
            : null}
        </div>

        <p className="mx-auto mt-5 max-w-3xl text-center text-sm leading-relaxed text-muted dark:text-white/55">
          {t("pricing.payment_note")}
        </p>
      </section>

      <section className="container-page mt-16">
        <div className="grid gap-4 md:grid-cols-3">
          {["included", "trial", "verified"].map((key) => (
            <div key={key} className="surface p-6">
              <h2 className="text-base font-bold text-forest dark:text-cream">
                {t(`pricing.cards.${key}.title`)}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted dark:text-white/60">
                {t(`pricing.cards.${key}.copy`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page mt-16">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-control bg-sage text-brand-700 dark:bg-white/5 dark:text-brand-300">
              <HelpCircle className="h-5 w-5" />
            </span>
            <div>
              <p className="eyebrow">{t("pricing.faq.eyebrow")}</p>
              <h2 className="mt-2 text-2xl font-bold text-forest dark:text-cream">
                {t("pricing.faq.title")}
              </h2>
            </div>
          </div>

          <div className="mt-6 divide-y divide-line rounded-card border border-line bg-cream px-6 shadow-premium dark:divide-white/10 dark:border-white/10 dark:bg-stone-850">
            {Array.isArray(faqs)
              ? faqs.map((item) => (
                  <div key={item.question} className="py-5">
                    <h3 className="text-base font-semibold text-forest dark:text-cream">
                      {item.question}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted dark:text-white/60">
                      {item.answer}
                    </p>
                  </div>
                ))
              : null}
          </div>
        </div>
      </section>

      <section className="container-page mt-16">
        <div className="relative overflow-hidden rounded-card border border-white/10 bg-forest px-6 py-12 text-white shadow-premium sm:px-10">
          <div className="absolute inset-x-0 top-0 h-1 bg-brand-500" />
          <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-xl">
              <p className="text-xs font-semibold text-brand-300">
                {t("pricing.final.eyebrow")}
              </p>
              <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
                {t("pricing.final.title")}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/65">
                {t("pricing.final.copy")}
              </p>
            </div>
            <Link to="/list-your-business" className="btn-primary shrink-0">
              {t("pricing.final.cta")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
