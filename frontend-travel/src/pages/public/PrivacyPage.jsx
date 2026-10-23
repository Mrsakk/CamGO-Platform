import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Sparkles,
  ShieldCheck,
  Lock,
  EyeOff,
  UserCheck,
  FileText,
  ArrowRight,
  Headphones,
  User
} from "lucide-react";
import { contentApi } from "@/lib/api/content";
import { PageContainer } from "@/components/layout/PageContainer";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { SEOHead } from "@/components/common/SEOHead";
import { RumduolFlower } from "@/components/common/RumduolMotifs";

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }
};

export const PrivacyPage = () => {
  const { i18n } = useTranslation();
  const km = i18n.language === "km";
  const [page, setPage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    contentApi
      .getPage("privacy-policy")
      .catch(() => contentApi.getPage("privacy"))
      .then((res) => {
        const item = res?.page || res?.item || res?.data?.page || res?.data?.item || res?.data || res;
        if (item && (item.title_km || item.title_en || item.content_km || item.content_en)) {
          setPage(item);
        }
      })
      .catch((err) => console.log("Default privacy policy loaded", err))
      .finally(() => setIsLoading(false));
  }, []);

  const title = km && page?.title_km ? page.title_km : page?.title_en || (km ? "គោលការណ៍ឯកជនភាព" : "Privacy Policy");
  const content = km && page?.content_km ? page.content_km : page?.content_en;

  const defaultSectionsKm = [
    {
      num: 1,
      icon: Lock,
      title: "ការប្រមូលទិន្នន័យផ្ទាល់ខ្លួន",
      text: "យើងខ្ញុំប្រមូលព័ត៌មានដែលអ្នកបានផ្តល់ដោយផ្ទាល់នៅពេលបង្កើតគណនី (ដូចជា ឈ្មោះ អ៊ីមែល និងលេខទូរស័ព្ទ) និងទិន្នន័យនៃការប្រើប្រាស់ដើម្បីកែលម្អបទពិសោធន៍រុករកគោលដៅទេសចរណ៍ ការរក្សាទុកកន្លែងដែលចូលចិត្ត (Favorites) និងការរៀបចំផែនការធ្វើដំណើរ (Trip Planner)។"
    },
    {
      num: 2,
      icon: ShieldCheck,
      title: "ការប្រើប្រាស់ និងការការពារព័ត៌មាន",
      text: "ព័ត៌មានរបស់អ្នកត្រូវបានប្រើប្រាស់សម្រាប់តែការផ្ទៀងផ្ទាត់គណនី ការផ្តល់សេវាទេសចរណ៍ និងការជូនដំណឹងអំពីព្រឹត្តិការណ៍វប្បធម៌សំខាន់ៗប៉ុណ្ណោះ។ យើងខ្ញុំប្រើប្រាស់បច្ចេកវិទ្យាសម្ងាត់កូដ (Encryption) និងប្រព័ន្ធសុវត្ថិភាពស្តង់ដារខ្ពស់ដើម្បីការពារទិន្នន័យរបស់អ្នកពីការចូលប្រើប្រាស់ដោយគ្មានការអនុញ្ញាត។"
    },
    {
      num: 3,
      icon: EyeOff,
      title: "ការមិនចែករំលែកទិន្នន័យទៅភាគីទីបី",
      text: "CamGO Travel ប្តេជ្ញាមិនលក់ មិនជួល ឬមិនធ្វើពាណិជ្ជកម្មលើទិន្នន័យផ្ទាល់ខ្លួនរបស់អ្នកទៅកាន់ភាគីទីបីឡើយ។ ទិន្នន័យអាចត្រូវបានចែករំលែកលុះត្រាតែមានការតម្រូវដោយច្បាប់ជាធរមាននៃព្រះរាជាណាចក្រកម្ពុជា។"
    },
    {
      num: 4,
      icon: UserCheck,
      title: "សិទ្ធិ និងជម្រើសគ្រប់គ្រងរបស់អ្នកប្រើប្រាស់",
      text: "អ្នកមានសិទ្ធិពេញលេញក្នុងការចូលមើល កែប្រែព័ត៌មានផ្ទាល់ខ្លួន ឬស្នើសុំលុបគណនីរបស់អ្នកចេញពីប្រព័ន្ធគ្រប់ពេលវេលា តាមរយៈទំព័រគ្រប់គ្រងគណនី (Profile Settings) ឬដោយទាក់ទងមកកាន់ក្រុមការងារជំនួយរបស់យើងខ្ញុំ។"
    }
  ];

  const defaultSectionsEn = [
    {
      num: 1,
      icon: Lock,
      title: "Information We Collect",
      text: "We collect information you provide directly when registering (such as name, email address, and optional contact details), as well as preference data used to power your travel wishlist, saved destinations, and personalized trip planner itineraries."
    },
    {
      num: 2,
      icon: ShieldCheck,
      title: "How We Use and Secure Your Data",
      text: "Your information is strictly utilized to authenticate your sessions, personalize your exploration, and communicate relevant heritage events. We employ industry-standard encryption and strict access controls to safeguard your personal records."
    },
    {
      num: 3,
      icon: EyeOff,
      title: "No Third-Party Commercial Sharing",
      text: "CamGO Travel never sells, rents, or commercializes your personal records to third-party advertisers. Information is only disclosed when mandatory under applicable laws of the Kingdom of Cambodia."
    },
    {
      num: 4,
      icon: UserCheck,
      title: "User Rights & Data Control",
      text: "You retain full control over your personal records. You may review, update, or request the deletion of your account and travel data at any time via your user profile settings or by contacting our team."
    }
  ];

  const sections = km ? defaultSectionsKm : defaultSectionsEn;

  return (
    <div className="stone-grain min-h-[100dvh] bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 pt-20 sm:pt-24 pb-20">
      <SEOHead
        title={km ? "គោលការណ៍ឯកជនភាព — CamGO" : "Privacy Policy — CamGO Travel"}
        description={
          km
            ? "ស្វែងយល់អំពីគោលការណ៍ការពារទិន្នន័យ និងការរក្សាការសម្ងាត់របស់អ្នកប្រើប្រាស់នៃCamGO Travel។"
            : "Learn how CamGO Travel safeguards your privacy and personal data across our Cambodian cultural atlas."
        }
      />

      <PageContainer className="space-y-8 sm:space-y-10">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs
          items={[
            { label: km ? "ទំព័រដើម" : "Home", to: "/" },
            { label: km ? "គោលការណ៍ឯកជនភាព" : "Privacy Policy" },
          ]}
        />

        {/* =================================================================== */}
        {/* 1. ANGKOR SANDSTONE PRIVACY HERO BANNER                             */}
        {/* =================================================================== */}
        <motion.section
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="relative rounded-3xl sm:rounded-[36px] border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-10 lg:p-12 shadow-sm overflow-hidden"
        >
          {/* Layered Ambient Glow Orbs */}
          <div className="absolute -top-24 -left-24 w-80 sm:w-96 h-80 sm:h-96 bg-laterite-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-80 sm:w-96 h-80 sm:h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Rotating Rumduol Flower Watermark */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 200, repeat: Infinity, ease: "linear" }}
            className="absolute -right-16 -top-16 opacity-[0.035] dark:opacity-[0.025] pointer-events-none select-none"
          >
            <RumduolFlower size={420} className="text-laterite-600" />
          </motion.div>

          <div className="relative z-10 space-y-4 max-w-3xl">
            {/* Frosted Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-laterite-600/10 dark:bg-laterite-500/15 border border-laterite-600/20 text-xs font-bold text-laterite-700 dark:text-laterite-300 font-sans tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-laterite-600 dark:text-laterite-400" />
              <span>{km ? "ការការពារទិន្នន័យ និងសិទ្ធិឯកជនភាព" : "Data Protection & Privacy"}</span>
            </div>

            <h1 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-stone-900 dark:text-stone-100 leading-tight tracking-tight">
              {title}
            </h1>

            <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 font-sans leading-relaxed">
              {km
                ? "CamGO Travel ប្តេជ្ញាការពារឯកជនភាព និងសុវត្ថិភាពទិន្នន័យផ្ទាល់ខ្លួនរបស់អ្នកប្រើប្រាស់គ្រប់រូប ដោយផ្អែកលើស្តង់ដារសុវត្ថិភាពកម្រិតខ្ពស់ និងតម្លាភាពពេញលេញ។"
                : "CamGO Travel is deeply committed to safeguarding your personal privacy and protecting all travel records with high-standard cryptographic safeguards and transparent controls."}
            </p>

            {/* Quick Trust Pillars */}
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-sans font-semibold text-stone-600 dark:text-stone-400">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700">
                <Lock className="w-3.5 h-3.5 text-laterite-600" />
                <span>{km ? "បច្ចេកវិទ្យាសម្ងាត់កូដ 256-bit" : "256-bit Encryption"}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700">
                <EyeOff className="w-3.5 h-3.5 text-emerald-600" />
                <span>{km ? "គ្មានការលក់ទិន្នន័យ" : "Zero Commercial Sale"}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>{km ? "អនុលោមតាមច្បាប់កម្ពុជា" : "Cambodia Law Compliant"}</span>
              </span>
            </div>
          </div>
        </motion.section>

        {/* =================================================================== */}
        {/* 2. PRIVACY CLAUSES: ELEGANT NUMBERED ACCENT CARDS                   */}
        {/* =================================================================== */}
        {content ? (
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-sm"
          >
            <div className="prose dark:prose-invert max-w-none text-stone-700 dark:text-stone-300 font-sans leading-relaxed space-y-4 whitespace-pre-line text-sm sm:text-base">
              {content}
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {sections.map((sec) => {
              const IconComponent = sec.icon || FileText;
              return (
                <motion.div
                  key={sec.num}
                  variants={fadeInUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="group relative p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 hover:border-laterite-600/40 dark:hover:border-laterite-600/40 shadow-sm hover:shadow-md transition-all duration-300 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-laterite-600/10 dark:bg-laterite-500/15 text-laterite-600 dark:text-laterite-400 flex items-center justify-center group-hover:bg-laterite-600 group-hover:text-white transition-all duration-300">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-mono font-bold text-stone-600 dark:text-stone-400">
                        {km ? `ផ្នែកទី ${sec.num}` : `Section ${sec.num}`}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-heading font-black text-lg sm:text-xl text-stone-900 dark:text-stone-100 tracking-wide group-hover:text-laterite-700 dark:group-hover:text-laterite-300 transition-colors">
                    {sec.title}
                  </h3>

                  <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 leading-relaxed font-sans">
                    {sec.text}
                  </p>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* =================================================================== */}
        {/* 3. USER PROFILE SETTINGS CTA                                        */}
        {/* =================================================================== */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative rounded-3xl sm:rounded-[32px] bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 p-6 sm:p-8 lg:p-10 shadow-sm overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-laterite-600/5 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-laterite-600/10 dark:bg-laterite-500/15 border border-laterite-600/20 text-xs font-bold text-laterite-700 dark:text-laterite-300 font-sans uppercase">
              <UserCheck className="w-3.5 h-3.5" />
              <span>{km ? "សិទ្ធិគ្រប់គ្រងគណនីរបស់អ្នក" : "Your Data Controls"}</span>
            </div>
            <h3 className="font-heading font-black text-2xl sm:text-3xl text-stone-900 dark:text-stone-100 tracking-tight">
              {km ? "គ្រប់គ្រងព័ត៌មានផ្ទាល់ខ្លួនរបស់អ្នក" : "Manage Your Account Settings"}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-sans leading-relaxed">
              {km
                ? "អ្នកអាចចូលទៅកាន់ទំព័រព័ត៌មានផ្ទាល់ខ្លួន (Profile) ដើម្បីកែប្រែព័ត៌មាន ឬគ្រប់គ្រងកាលវិភាគធ្វើដំណើររបស់អ្នកគ្រប់ពេលវេលា។"
                : "Access your account settings to update profile records, manage saved destinations, or request data export at any time."}
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/profile"
              className="min-h-[44px] px-6 py-2.5 rounded-2xl bg-laterite-600 hover:bg-laterite-700 text-white text-xs font-sans font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
            >
              <User className="w-4 h-4" />
              <span>{km ? "ព័ត៌មានផ្ទាល់ខ្លួន" : "My Profile"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/contact"
              className="min-h-[44px] px-5 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-sans font-bold uppercase tracking-wider flex items-center gap-2 border border-stone-200 dark:border-stone-700 transition-all"
            >
              <Headphones className="w-4 h-4" />
              <span>{km ? "ទាក់ទងជំនួយ" : "Help Desk"}</span>
            </Link>
          </div>
        </motion.div>
      </PageContainer>
    </div>
  );
};

export default PrivacyPage;
