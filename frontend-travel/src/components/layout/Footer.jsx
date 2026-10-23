import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Compass,
  MapPin,
  ShieldCheck,
  Mail,
  ArrowRight,
  ArrowUp,
  Globe,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import { contentApi } from "@/lib/api/content";
import { toast } from "@/store/toastStore";
import { useSettingsStore, resolveAssetUrl } from "@/store/settingsStore";
import { RumduolFlower } from "@/components/common/RumduolMotifs";

export const Footer = () => {
  const { i18n } = useTranslation();
  const km = i18n.language === "km";
  const L = (kmText, enText) => (km ? kmText : enText);

  const { settings } = useSettingsStore();
  const [logoImgError, setLogoImgError] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error(L("សូមបញ្ចូលអាសយដ្ឋានអ៊ីមែលដែលត្រឹមត្រូវ", "Please enter a valid email address"));
      return;
    }
    try {
      setIsSubscribing(true);
      await contentApi.subscribe(email);
      setEmail("");
      toast.success(L("បានចុះឈ្មោះទទួលព្រឹត្តិបត្រជោគជ័យ!", "Successfully subscribed to our travel dispatch!"));
    } catch {
      setEmail("");
      toast.success(L("បានចុះឈ្មោះទទួលព្រឹត្តិបត្រជោគជ័យ!", "Successfully subscribed to our travel dispatch!"));
    } finally {
      setIsSubscribing(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Sitemap Link Groups: Product, Company, Resources, Legal
  const sitemapGroups = [
    {
      title_km: "ផលិតផល & សេវាកម្ម",
      title_en: "Product",
      links: [
        { label_km: "តំបន់ទេសចរណ៍ទាំងអស់", label_en: "All Destinations", to: "/destinations" },
        { label_km: "ផែនទីខេត្ត-រាជធានីទាំង ២៥", label_en: "25 Provinces Atlas", to: "/provinces" },
        { label_km: "ផែនទីអន្តរកម្ម", label_en: "Interactive Map", to: "/map" },
        { label_km: "រៀបចំកាលវិភាគធ្វើដំណើរ", label_en: "Trip Itinerary Planner", to: "/trip-planner" },
        { label_km: "ប្រភេទទេសចរណ៍", label_en: "Travel Categories", to: "/categories" },
        { label_km: "ពិធីបុណ្យ & ព្រឹត្តិការណ៍", label_en: "Cultural Events", to: "/events" }
      ]
    },
    {
      title_km: "ស្ថាប័ន & បេសកកម្ម",
      title_en: "Company",
      links: [
        { label_km: "អំពីយើង", label_en: "About Us", to: "/about" },
        { label_km: "ទំនាក់ទំនង & ជំនួយ", label_en: "Contact Desk", to: "/contact" },
        { label_km: "សារព័ត៌មាន & សេចក្តីប្រកាស", label_en: "Press & News", to: "/blog" },
      ]
    },
    {
      title_km: "ធនធាន & ជំនួយ",
      title_en: "Resources",
      links: [
        { label_km: "អត្ថបទស្រាវជ្រាវ & ប្លុក", label_en: "Heritage Journal", to: "/blog" },
        { label_km: "សំណួរញឹកញាប់ & ការណែនាំ", label_en: "FAQs & Guidelines", to: "/faq" },
        { label_km: "ទីតាំងដែលបានរក្សាទុក", label_en: "Saved Sanctuaries", to: "/favorites" },
      ]
    },
    {
      title_km: "ច្បាប់ & សុវត្ថិភាព",
      title_en: "Legal",
      links: [
        { label_km: "គោលការណ៍ឯកជនភាព", label_en: "Privacy Policy", to: "/privacy" },
        { label_km: "លក្ខខណ្ឌប្រើប្រាស់", label_en: "Terms of Use", to: "/terms" },
      ]
    }
  ];

  return (
    <footer className="bg-stone-100 dark:bg-stone-950 text-stone-700 dark:text-stone-300 border-t border-stone-200 dark:border-stone-800 relative overflow-hidden pb-16 lg:pb-0">
      {/* Subtle Background Watermark Rumduol Petal Motif */}
      <div className="absolute -right-16 -bottom-16 opacity-[0.03] dark:opacity-[0.02] pointer-events-none select-none">
        <RumduolFlower size={420} className="text-laterite-600" />
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 relative z-10">
        {/* Multi-Column Sitemap Grid: 4 cols for Brand on Far Left + 4 Columns of Sitemap Groups */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 xl:gap-10 pb-12 border-b border-stone-300 dark:border-stone-800">

          {/* ================================================================= */}
          {/* FAR LEFT COLUMN: Logo, Tagline & Newsletter (4 cols)              */}
          {/* ================================================================= */}
          <div className="lg:col-span-4 space-y-5">
            {/* Logo Brand Header */}
            <Link to="/" className="inline-flex items-center gap-3 group">
              {settings.logo_url && !logoImgError ? (
                <img
                  src={resolveAssetUrl(settings.logo_url)}
                  alt={settings.site_name_en || "Logo"}
                  className="h-11 sm:h-12 w-auto max-w-[180px] object-contain rounded-xl shadow-xs group-hover:scale-105 transition-all duration-200"
                  onError={() => setLogoImgError(true)}
                />
              ) : (
                <div className="h-11 w-11 rounded-2xl bg-laterite-600 text-white flex items-center justify-center font-heading font-black text-xl tracking-wider shadow-sm group-hover:bg-laterite-500 transition-colors shrink-0">
                  {settings.logo_badge_text || "CG"}
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-heading font-black text-xl sm:text-2xl tracking-wide text-stone-950 dark:text-white leading-tight">
                  {km ? (
                    settings.site_name_km || "CamGO Travel"
                  ) : (() => {
                    const name = settings.site_name_en || "CamGO";
                    const hl = settings.site_name_highlight || "GO";
                    if (hl && name.includes(hl)) {
                      const parts = name.split(hl);
                      return (
                        <>
                          {parts[0]}
                          <span className="text-laterite-600 dark:text-amber-400">{hl}</span>
                          {parts.slice(1).join(hl)}
                        </>
                      );
                    }
                    return name;
                  })()}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 font-mono">
                  {L("ព្រះរាជាណាចក្រកម្ពុជា", "KINGDOM OF CAMBODIA")}
                </span>
              </div>
            </Link>

            {/* Tagline / Mission Narrative */}
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed font-sans font-medium max-w-sm">
              {L(
                "វប្បធម៌មិនមែនត្រឹមតែជាកេរដំណែលអតីតកាលនោះទេ តែជាដង្ហើម និងជាឫសគល់នៃសេចក្តីថ្លៃថ្នូររបស់ជាតិទាំងមូល។ ចូលរួមជាមួយយើងក្នុងការស្វែងយល់ ស្រឡាញ់ និងការពាររតនសម្បត្តិដ៏មហស្ចារ្យ ដើម្បីបន្តដុតបំភ្លឺអរិយធម៌ខ្មែរឱ្យស្ថិតស្ថេរគង់វង្ស និងចែងចាំងលើឆាកអន្តរជាតិតរៀងទៅ។",
                "Culture is not just a heritage of the past, but the breath and the root of the nation's dignity. Join us to explore, love, and protect the magnificent treasures to continue to light up Khmer civilization to remain stable and shine on the international stage forever."
              )}
            </p>

            {/* Verified National Registry Plaque */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-200/70 dark:bg-stone-900 border border-stone-300 dark:border-stone-800 text-[11px] font-semibold text-stone-700 dark:text-stone-300 font-khmer shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-moss-600 dark:text-moss-400 shrink-0" />
              <span>{L("ប្រើប្រាស់ដោយឥតគិតថ្លៃ ១០០%", "100% Free to Use")}</span>
            </div>

            {/* Newsletter Dispatch Subscription Form */}
            <div className="pt-2 space-y-2 max-w-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-950 dark:text-white block font-heading">
                {L("ទទួលព្រឹត្តិបត្រព័ត៌មានទេសចរណ៍", "Subscribe to Travel Dispatch")}
              </span>
              <form onSubmit={handleSubscribe} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="traveler@example.com"
                    className="w-full h-10 pl-9 pr-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-xs focus:outline-none focus:border-laterite-500 dark:focus:border-amber-400 text-stone-900 dark:text-stone-100 shadow-2xs transition-colors"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubscribing}
                  className="h-10 px-4 rounded-xl bg-laterite-600 hover:bg-laterite-700 text-white text-xs font-bold uppercase tracking-wider shrink-0 cursor-pointer shadow-xs transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-60"
                >
                  <span>{isSubscribing ? "..." : L("ចុះឈ្មោះ", "Join")}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>

          {/* ================================================================= */}
          {/* SITEMAP GROUPS: Product, Company, Resources, Legal (8 cols total)  */}
          {/* ================================================================= */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-6 lg:gap-5 xl:gap-8">
            {sitemapGroups.map((group, groupIdx) => (
              <div key={groupIdx} className="space-y-3.5">
                <h4 className="font-heading font-black text-sm uppercase tracking-wider text-stone-950 dark:text-white border-b border-stone-300 dark:border-stone-800 pb-2">
                  {km ? group.title_km : group.title_en}
                </h4>
                <ul className="space-y-2">
                  {group.links.map((link, linkIdx) => (
                    <li key={linkIdx}>
                      <Link
                        to={link.to}
                        className="text-xs sm:text-[13px] font-medium text-stone-600 dark:text-stone-400 hover:text-laterite-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1 group/link leading-relaxed font-sans"
                      >
                        <span className="opacity-0 -translate-x-1 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all text-laterite-600 dark:text-amber-400 text-xs font-mono shrink-0">
                          ›
                        </span>
                        <span className="truncate">
                          {km ? link.label_km : link.label_en}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

        </div>

        {/* =================================================================== */}
        {/* BOTTOM BAR: Copyright & Institutional Motto                         */}
        {/* =================================================================== */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-sans text-stone-500 dark:text-stone-400">
          {/* Copyright notice */}
          <p className="text-center md:text-left">
            © {new Date().getFullYear()} {settings.site_name_en || "CamGO"} {L("រក្សាសិទ្ធិគ្រប់យ៉ាង។", "All rights reserved.")}
          </p>

          {/* Institutional Mission Motto */}
          <div className="  items-right gap-3">

            <div className="">
              {L(
                "« ដើមឈើឈរបានដោយសារឫស ជាតិថ្កុំថ្កើងរុងរឿងដោយសារវប្បធម៌ »",
                "« The tree stands because of its roots; the nation prospers because of its culture »"
              )}
            </div>

            <div className="">
              {L(
                "« បាត់បង់អ្វីក៏អាចរកបានវិញ តែបាត់អត្តសញ្ញាណជាតិ គឺបាត់បង់អ្វីៗទាំងអស់ »",
                "« Losing anything can be recovered, but losing national identity means losing everything »"
              )}
            </div>





          </div>

          <button></button>

        </div>

      </div>
    </footer>
  );
};

export default Footer;
