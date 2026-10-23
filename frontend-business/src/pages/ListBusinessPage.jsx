import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle,
  ClipboardCheck,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  ShieldCheck,
  Store,
  UserRound,
} from "lucide-react";
import api from "@/lib/axios";

const initialForm = {
  ownerName: "",
  businessName: "",
  email: "",
  phone: "",
  message: "",
};

const stepIcons = [MessageSquare, ClipboardCheck, ShieldCheck, Store];

export const ListBusinessPage = () => {
  const { t, i18n } = useTranslation();
  const isKm = i18n.language === "km";
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const details = [
      form.businessName ? `${t("list_business.form.business_name")}: ${form.businessName}` : "",
      form.ownerName ? `${t("list_business.form.owner_name")}: ${form.ownerName}` : "",
      form.message,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await api.post("/contact", {
        name: form.ownerName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        subject: t("list_business.form.subject"),
        message: details,
      });
      setSubmitted(true);
      setForm(initialForm);
    } catch (err) {
      const validationErrors = err.response?.data?.errors;
      const firstValidationError = validationErrors
        ? Object.values(validationErrors).flat()[0]
        : null;
      setError(
        firstValidationError ||
          err.response?.data?.message ||
          t("list_business.form.error")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = t("list_business.steps", { returnObjects: true });
  const checklist = t("list_business.checklist", { returnObjects: true });

  return (
    <div className="pb-20">
      <Helmet>
        <title>{t("list_business.meta_title")}</title>
        <meta name="description" content={t("list_business.meta_description")} />
      </Helmet>

      <section className="container-page pt-8 sm:pt-12">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="pt-2 lg:pr-8">
            <p className="eyebrow">{t("list_business.eyebrow")}</p>
            <h1 className="mt-4 max-w-2xl text-hero text-forest dark:text-cream">
              {t("list_business.title")}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted dark:text-white/65">
              {t("list_business.subtitle")}
            </p>

            <div className="mt-7 space-y-3">
              {["no_commission", "direct_contact", "free_start"].map((key) => (
                <div key={key} className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" />
                  <p className="text-sm leading-relaxed text-ink dark:text-white/75">
                    {t(`list_business.benefits.${key}`)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-card border border-line bg-sage p-5 dark:border-white/10 dark:bg-white/[0.04]">
              <p className="flex items-center gap-2 text-sm font-semibold text-forest dark:text-cream">
                <BadgeCheck className="h-4 w-4 text-brand-700 dark:text-brand-300" />
                {t("list_business.note_title")}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted dark:text-white/60">
                {t("list_business.note_copy")}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              <Link
                to="/pricing"
                className="inline-flex items-center gap-1.5 font-semibold text-forest hover:text-brand-700 dark:text-brand-300 dark:hover:text-brand-200"
              >
                {t("list_business.pricing_link")}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/businesses"
                className="inline-flex items-center gap-1.5 font-medium text-muted hover:text-forest dark:text-white/55 dark:hover:text-white"
              >
                {t("list_business.directory_link")}
              </Link>
            </div>
          </div>

          <div className="surface p-6 sm:p-8">
            {submitted ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-300">
                  <CheckCircle className="h-7 w-7" />
                </span>
                <h2 className="mt-5 text-xl font-bold text-forest dark:text-cream">
                  {t("list_business.form.success_title")}
                </h2>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted dark:text-white/60">
                  {t("list_business.form.success_copy")}
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="btn-secondary mt-6"
                >
                  {t("list_business.form.send_another")}
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-bold text-forest dark:text-cream">
                  {t("list_business.form.title")}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-muted dark:text-white/55">
                  {t("list_business.form.copy")}
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <label className="block space-y-2 text-sm font-semibold text-ink dark:text-white/80">
                    <span>{t("list_business.form.business_name")} *</span>
                    <span className="relative block">
                      <Store className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted dark:text-white/40" />
                      <input
                        required
                        value={form.businessName}
                        onChange={(event) => update("businessName", event.target.value)}
                        className="field pl-10"
                        placeholder={t("list_business.form.business_placeholder")}
                      />
                    </span>
                  </label>

                  <label className="block space-y-2 text-sm font-semibold text-ink dark:text-white/80">
                    <span>{t("list_business.form.owner_name")} *</span>
                    <span className="relative block">
                      <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted dark:text-white/40" />
                      <input
                        required
                        value={form.ownerName}
                        onChange={(event) => update("ownerName", event.target.value)}
                        className="field pl-10"
                        placeholder={t("list_business.form.owner_placeholder")}
                      />
                    </span>
                  </label>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block space-y-2 text-sm font-semibold text-ink dark:text-white/80">
                      <span>{t("list_business.form.email")} *</span>
                      <span className="relative block">
                        <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted dark:text-white/40" />
                        <input
                          required
                          type="email"
                          value={form.email}
                          onChange={(event) => update("email", event.target.value)}
                          className="field pl-10"
                          placeholder="you@example.com"
                        />
                      </span>
                    </label>

                    <label className="block space-y-2 text-sm font-semibold text-ink dark:text-white/80">
                      <span>{t("list_business.form.phone")}</span>
                      <span className="relative block">
                        <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted dark:text-white/40" />
                        <input
                          value={form.phone}
                          onChange={(event) => update("phone", event.target.value)}
                          className="field pl-10"
                          placeholder="+855 ..."
                        />
                      </span>
                    </label>
                  </div>

                  <label className="block space-y-2 text-sm font-semibold text-ink dark:text-white/80">
                    <span>{t("list_business.form.message")} *</span>
                    <textarea
                      required
                      rows={4}
                      value={form.message}
                      onChange={(event) => update("message", event.target.value)}
                      className="field resize-none"
                      placeholder={t("list_business.form.message_placeholder")}
                    />
                  </label>

                  {error ? (
                    <p className="rounded-control border border-danger-300 bg-danger-50 px-4 py-3 text-sm text-danger-700 dark:border-danger-500/30 dark:bg-danger-500/10 dark:text-danger-300">
                      {error}
                    </p>
                  ) : null}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary w-full"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    {isSubmitting
                      ? t("list_business.form.sending")
                      : t("list_business.form.submit")}
                  </button>
                  <p className="text-center text-xs leading-relaxed text-muted dark:text-white/45">
                    {t("list_business.form.privacy")}
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="container-page mt-16">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">{t("list_business.how_eyebrow")}</p>
            <h2 className="section-heading mt-2">{t("list_business.how_title")}</h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted dark:text-white/55">
            {t("list_business.how_copy")}
          </p>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.isArray(steps)
            ? steps.map((step, index) => {
                const Icon = stepIcons[index] || Store;
                return (
                  <div key={step.title} className="surface p-5">
                    <div className="flex items-center justify-between">
                      <span className="flex h-10 w-10 items-center justify-center rounded-control bg-sage text-brand-700 dark:bg-white/5 dark:text-brand-300">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="text-xs font-bold text-muted dark:text-white/40">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3 className="mt-4 text-base font-semibold text-forest dark:text-cream">
                      {step.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted dark:text-white/60">
                      {step.copy}
                    </p>
                  </div>
                );
              })
            : null}
        </div>
      </section>

      <section className="container-page mt-12">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="surface p-6 sm:p-8">
            <h2 className="flex items-center gap-2 text-lg font-bold text-forest dark:text-cream">
              <ClipboardCheck className="h-5 w-5 text-brand-700 dark:text-brand-300" />
              {t("list_business.prepare_title")}
            </h2>
            <ul className="mt-4 space-y-3">
              {Array.isArray(checklist)
                ? checklist.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" />
                      <span className="leading-relaxed text-ink dark:text-white/75">
                        {item}
                      </span>
                    </li>
                  ))
                : null}
            </ul>
          </div>

          <div className="surface p-6 sm:p-8">
            <h2 className="flex items-center gap-2 text-lg font-bold text-forest dark:text-cream">
              <MapPin className="h-5 w-5 text-brand-700 dark:text-brand-300" />
              {t("list_business.visit_title")}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted dark:text-white/60">
              {t("list_business.visit_copy")}
            </p>
            <div className="mt-5 space-y-3 text-sm">
              <p className="flex items-center gap-2.5 text-ink dark:text-white/75">
                <Phone className="h-4 w-4 text-muted dark:text-white/45" />
                +855 23 888 777
              </p>
              <p className="flex items-center gap-2.5 text-ink dark:text-white/75">
                <Mail className="h-4 w-4 text-muted dark:text-white/45" />
                contact@camgo.com
              </p>
              <p className="flex items-start gap-2.5 text-ink dark:text-white/75">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted dark:text-white/45" />
                {t("list_business.visit_address")}
              </p>
            </div>
            <Link to="/contact" className="btn-secondary mt-6">
              {t("list_business.contact_link")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
