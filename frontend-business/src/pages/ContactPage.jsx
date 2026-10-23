import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Mail, Phone, MapPin, CheckCircle } from "lucide-react";
import api from "@/lib/axios";

export const ContactPage = () => {
  const { i18n } = useTranslation();
  const isKm = i18n.language === "km";

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await api.post("/contact", {
        ...formData,
        phone: formData.phone.trim() || null,
      });
      setSubmitted(true);
    } catch (err) {
      const validationErrors = err.response?.data?.errors;
      const firstValidationError = validationErrors
        ? Object.values(validationErrors).flat()[0]
        : null;
      setError(
        firstValidationError ||
          err.response?.data?.message ||
          (isKm ? "មិនអាចផ្ញើសារបានទេ។ សូមព្យាយាមម្តងទៀត។" : "Could not send your message. Please try again.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const update = (key, value) => setFormData({ ...formData, [key]: value });

  const contactRows = [
    {
      icon: Phone,
      label: isKm ? "ទូរស័ព្ទ" : "Phone",
      value: "+855 23 999 888",
    },
    {
      icon: Mail,
      label: "Telegram / Email",
      value: "support@camgo.com",
    },
    {
      icon: MapPin,
      label: isKm ? "ការិយាល័យ" : "Location",
      value: isKm
        ? "រាជធានីភ្នំពេញ និងខេត្តសៀមរាប, កម្ពុជា"
        : "Phnom Penh & Siem Reap, Cambodia",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-[36px] border border-brand-200/60 bg-sage p-6 shadow-premium dark:border-white/10 dark:bg-[#0D1B15] md:rounded-[48px] md:p-12">
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-brand-500/15 blur-3xl" />
        <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h1 className="mt-4 text-forest dark:text-white">
              {isKm ? "ទាក់ទងមកកាន់យើង" : "Contact us"}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted dark:text-slate-300">
              {isKm
                ? "មានចម្ងល់ ឬចង់ចុះឈ្មោះអាជីវកម្មរបស់អ្នកនៅលើប្រព័ន្ធ? សូមផ្ញើសារមកកាន់យើង។"
                : "Have a question or want to list your business on the directory? Send us a message."}
            </p>

            <div className="mt-8 divide-y divide-sage-deep/80 dark:divide-slate-700">
              {contactRows.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-start gap-4 py-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-forest dark:bg-slate-800 dark:text-brand-300">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-forest dark:text-white">
                        {item.label}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-muted dark:text-slate-400">
                        {item.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-7">
            {submitted ? (
              <div className="surface space-y-4 p-8 text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sage text-forest">
                  <CheckCircle className="h-7 w-7" />
                </span>
                <h2 className="text-lg font-semibold text-forest dark:text-white">
                  {isKm ? "សាររបស់អ្នកត្រូវបានផ្ញើរួចរាល់" : "Message sent"}
                </h2>
                <p className="mx-auto max-w-sm text-xs leading-relaxed text-muted dark:text-slate-400">
                  {isKm
                    ? "ក្រុមការងាររបស់យើងនឹងឆ្លើយតបទៅកាន់អ្នកវិញតាមរយៈអ៊ីមែល ឬទូរស័ព្ទក្នុងពេលឆាប់ៗ។"
                    : "Our team will get back to you shortly via email or phone."}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="surface space-y-5 p-6 sm:p-8">
                {error && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
                    {error}
                  </div>
                )}

                <div>
                  <h2 className="text-xl font-semibold text-forest dark:text-white">
                    {isKm ? "សរសេរមកយើង" : "Let's talk!"}
                  </h2>
                  <p className="mt-1 text-xs text-muted dark:text-slate-400">
                    {isKm ? "យើងនឹងឆ្លើយតបក្នុងពេលឆាប់ៗ។" : "We usually reply within one business day."}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold text-forest dark:text-slate-300">
                      {isKm ? "ឈ្មោះរបស់អ្នក" : "Your name"} *
                    </span>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => update("name", e.target.value)}
                      className="field"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold text-forest dark:text-slate-300">
                      {isKm ? "លេខទូរស័ព្ទ / Telegram" : "Phone / Telegram"}
                    </span>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      className="field"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-forest dark:text-slate-300">
                    {isKm ? "អ៊ីមែល" : "Email address"} *
                  </span>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => update("email", e.target.value)}
                    className="field"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-forest dark:text-slate-300">
                    {isKm ? "ចំណងជើង" : "Subject"} *
                  </span>
                  <input
                    type="text"
                    required
                    maxLength={200}
                    value={formData.subject}
                    onChange={(e) => update("subject", e.target.value)}
                    className="field"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-forest dark:text-slate-300">
                    {isKm ? "សាររបស់អ្នក" : "Message"} *
                  </span>
                  <textarea
                    rows={5}
                    required
                    value={formData.message}
                    onChange={(e) => update("message", e.target.value)}
                    placeholder={isKm ? "សរសេរសំណួរ ឬព័ត៌មានលម្អិត..." : "Your question or details..."}
                    className="field resize-y"
                  />
                </label>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary inline-flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {isKm ? "កំពុងផ្ញើ..." : "Sending..."}
                    </>
                  ) : (
                    isKm ? "ផ្ញើសារ" : "Send message"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
