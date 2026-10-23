import { useTranslation } from "react-i18next";
import { Store, ShieldCheck, Heart, Award, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const AboutPage = () => {
  const { i18n } = useTranslation();
  const isKm = i18n.language === "km";

  const features = [
    {
      icon: ShieldCheck,
      title: isKm ? "គ្មានកម្រៃជើងសារ ០%" : "0% booking commission",
      text: isKm
        ? "រាល់ប្រាក់ចំណូលរបស់អ្នកទទួលបាន ១០០% ពេញលេញ។ យើងមិនកាត់ថ្លៃសេវា ឬកម្រៃកក់ពីអាជីវកម្ម ឬភ្ញៀវទេសចរឡើយ។"
        : "Business owners keep 100% of their earnings. We never charge commission fees or booking markups.",
    },
    {
      icon: Award,
      title: isKm ? "ការផ្ទៀងផ្ទាត់ច្បាស់លាស់" : "Verified listings",
      text: isKm
        ? "អាជីវកម្មនីមួយៗត្រូវបានក្រុមការងារពិនិត្យឯកសារស្របច្បាប់ និងទីតាំងជាក់ស្តែង ដើម្បីធានាសុវត្ថិភាពដល់ភ្ញៀវ។"
        : "Every business profile is reviewed with legitimate identification and verified contact credentials.",
    },
    {
      icon: Heart,
      title: isKm ? "គាំទ្រសហគមន៍មូលដ្ឋាន" : "Local communities",
      text: isKm
        ? "ជួយជំរុញសេដ្ឋកិច្ចសហគមន៍មូលដ្ឋាននៅទូទាំង ២៥ រាជធានី-ខេត្តនៃព្រះរាជាណាចក្រកម្ពុជា។"
        : "Direct support for guesthouses, local guides, crafts artisans, and family-owned restaurants across Cambodia.",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-[36px] border border-brand-200/60 bg-sage px-6 py-12 shadow-premium dark:border-white/10 dark:bg-[#0D1B15] md:rounded-[48px] md:px-12 md:py-16">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="relative grid grid-cols-1 items-end gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">

            <h1 className="mt-5 max-w-3xl leading-[1.08] text-forest dark:text-white">
              {isKm
                ? "ភ្ជាប់ទេសចរជាមួយអាជីវកម្មក្នុងស្រុកដោយផ្ទាល់"
                : "Direct tourism without intermediaries"}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted dark:text-slate-300">
              {isKm
                ? "CamGO Business ត្រូវបានបង្កើតឡើងក្នុងគោលបំណងលើកកម្ពស់សហគ្រាសទេសចរណ៍ខ្នាតតូច និងមធ្យមនៅកម្ពុជា តាមរយៈការតភ្ជាប់ភ្ញៀវទេសចរទៅកាន់ម្ចាស់អាជីវកម្មដោយផ្ទាល់ ដោយគ្មានការកាត់កម្រៃជើងសារ។"
                : "CamGO Business empowers local Cambodian tourism SMEs by giving them a verified, commission-free platform where travelers can call or message them directly."}
            </p>
          </div>

          <div className="lg:col-span-4">
            <div className="rounded-3xl border border-white/70 bg-white/70 p-6 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/60">
              <p className="font-serif text-5xl font-semibold text-forest dark:text-brand-300">0%</p>
              <p className="mt-2 text-sm text-muted dark:text-slate-400">
                {isKm ? "កម្រៃជើងសារ ឬថ្លៃកក់" : "Commission or booking fees"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.title}
              className="surface p-6 transition duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-premium-lg"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-sage text-forest dark:bg-brand-950/40 dark:text-brand-300">
                <Icon className="h-5 w-5" />
              </span>
              <h2 className="mt-5 text-lg font-semibold text-forest dark:text-white">
                {feature.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted dark:text-slate-400">
                {feature.text}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-10 flex justify-center">
        <Link to="/businesses" className="btn-primary">
          {isKm ? "ស្វែងរកអាជីវកម្មទេសចរណ៍" : "Explore the directory"}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};
