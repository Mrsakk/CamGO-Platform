import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Sparkles,
  Scale,
  CheckCircle2,
  Landmark,
  ShieldAlert,
  RefreshCw,
  FileText,
  ArrowRight,
  Headphones,
  ShieldCheck
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

export const TermsPage = () => {
  const { i18n } = useTranslation();
  const km = i18n.language === "km";
  const [page, setPage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    contentApi
      .getPage("terms")
      .catch(() => contentApi.getPage("terms-of-use"))
      .then((res) => {
        const item = res?.page || res?.item || res?.data?.page || res?.data?.item || res?.data || res;
        if (item && (item.title_km || item.title_en || item.content_km || item.content_en)) {
          setPage(item);
        }
      })
      .catch((err) => console.log("Default terms loaded", err))
      .finally(() => setIsLoading(false));
  }, []);

  const title = km && page?.title_km ? page.title_km : page?.title_en || (km ? "លក្ខខណ្ឌនៃការប្រើប្រាស់" : "Terms of Use");
  const content = km && page?.content_km ? page.content_km : page?.content_en;

  const defaultSectionsKm = [
    {
      num: 1,
      icon: CheckCircle2,
      title: "ការយល់ព្រមលើលក្ខខណ្ឌប្រើប្រាស់",
      text: "តាមរយៈការចូលប្រើប្រាស់ និងរុករកថ្នាលទេសចរណ៍ CamGO Travel (CamGO Travel) អ្នកយល់ព្រមគោរពតាមលក្ខខណ្ឌ និងបទប្បញ្ញត្តិទាំងអស់ដែលមានចែងក្នុងឯកសារនេះ ព្រមទាំងច្បាប់ជាធរមាននៃព្រះរាជាណាចក្រកម្ពុជា។"
    },
    {
      num: 2,
      icon: Landmark,
      title: "កម្មសិទ្ធិបញ្ញា និងខ្លឹមសារបេតិកភណ្ឌ",
      text: "រូបភាព អត្ថបទស្រាវជ្រាវ និមិត្តសញ្ញា និងផែនទីដែលបានផ្សព្វផ្សាយនៅលើប្រព័ន្ធនេះ គឺជាកម្មសិទ្ធិរបស់ CamGO ឬដៃគូវប្បធម៌ដែលបានផ្តល់សិទ្ធិ។ ការចម្លង ការកែច្នៃ ឬការចែកចាយបន្តក្នុងគោលបំណងពាណិជ្ជកម្មត្រូវមានការអនុញ្ញាតជាលាយលក្ខណ៍អក្សរជាមុន។"
    },
    {
      num: 3,
      icon: ShieldAlert,
      title: "ទំនួលខុសត្រូវ និងសីលធម៌របស់អ្នកប្រើប្រាស់",
      text: "អ្នកប្រើប្រាស់ត្រូវផ្តល់ព័ត៌មានពិតប្រាកដក្នុងការបង្កើតគណនី និងមិនត្រូវធ្វើសកម្មភាពណាដែលបង្កគ្រោះថ្នាក់ដល់សុវត្ថិភាពប្រព័ន្ធ បង្ហោះមតិយោបល់ដែលបំពានច្បាប់ បរិហារកេរ្តិ៍ ឬធ្វើឱ្យខូចខាតដល់កិត្តិយសនៃបេតិកភណ្ឌជាតិឡើយ។"
    },
    {
      num: 4,
      icon: RefreshCw,
      title: "ការកែប្រែ និងបច្ចុប្បន្នភាពនៃលក្ខខណ្ឌ",
      text: "CamGO Travel រក្សាសិទ្ធិក្នុងការកែប្រែ ឬធ្វើបច្ចុប្បន្នភាពលក្ខខណ្ឌទាំងនេះគ្រប់ពេលវេលា ដើម្បីឆ្លើយតបនឹងការអភិវឌ្ឍប្រព័ន្ធ និងបទដ្ឋានគតិយុត្តជាធរមាន។ ការបន្តប្រើប្រាស់របស់អ្នកបញ្ជាក់ពីការយល់ព្រមលើលក្ខខណ្ឌដែលបានកែប្រែថ្មី។"
    }
  ];

  const defaultSectionsEn = [
    {
      num: 1,
      icon: CheckCircle2,
      title: "Acceptance of Platform Terms",
      text: "By accessing and exploring the CamGO Travel portal, you agree to comply with and be bound by these terms of use and all applicable laws and regulations of the Kingdom of Cambodia."
    },
    {
      num: 2,
      icon: Landmark,
      title: "Intellectual Property & Cultural Assets",
      text: "All cultural descriptions, research articles, photography, vector motifs, and cartographic datasets published on this platform are owned by CamGO or licensed contributors. Commercial reproduction requires prior written authorization."
    },
    {
      num: 3,
      icon: ShieldAlert,
      title: "User Conduct & Account Obligations",
      text: "Users agree to provide accurate registration details, respect community guidelines, and refrain from any activity that undermines the platform's security, data integrity, or the dignity of Cambodia's cultural treasures."
    },
    {
      num: 4,
      icon: RefreshCw,
      title: "Revisions and Policy Updates",
      text: "CamGO Travel reserves the right to revise or update these terms at any time as platform features and applicable regulatory standards evolve. Continued usage constitutes acceptance of revised terms."
    }
  ];

  const sections = km ? defaultSectionsKm : defaultSectionsEn;

  return (
    <div className="stone-grain min-h-[100dvh] bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 pt-20 sm:pt-24 pb-20">
      <SEOHead
        title={km ? "លក្ខខណ្ឌនៃការប្រើប្រាស់ — CamGO" : "Terms of Use — CamGO Travel"}
        description={
          km
            ? "ស្វែងយល់អំពីលក្ខខណ្ឌ និងបទប្បញ្ញត្តិនៃការប្រើប្រាស់ថ្នាលទេសចរណ៍ CamGO Travel។"
            : "Review the terms and conditions for exploring Cambodia's digital cultural atlas on CamGO Travel."
        }
      />

      <PageContainer className="space-y-8 sm:space-y-10">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs
          items={[
            { label: km ? "ទំព័រដើម" : "Home", to: "/" },
            { label: km ? "លក្ខខណ្ឌប្រើប្រាស់" : "Terms of Use" },
          ]}
        />

        {/* =================================================================== */}
        {/* 1. ANGKOR SANDSTONE TERMS HERO BANNER                               */}
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
              <Scale className="w-3.5 h-3.5 text-laterite-600 dark:text-laterite-400" />
              <span>{km ? "បទប្បញ្ញត្តិ និងកតិកាសញ្ញាផ្លូវការ" : "Legal Terms & Conditions"}</span>
            </div>

            <h1 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-stone-900 dark:text-stone-100 leading-tight tracking-tight">
              {title}
            </h1>

            <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 font-sans leading-relaxed">
              {km
                ? "សូមអានលក្ខខណ្ឌនៃការប្រើប្រាស់ទាំងនេះដោយយកចិត្តទុកដាក់ មុនពេលចូលប្រើប្រាស់ និងទទួលយកសេវានានាលើថ្នាលទេសចរណ៍ជាតិ CamGO Travel។"
                : "Please review these legal provisions carefully before navigating, planning journeys, and contributing to the CamGO Travel portal."}
            </p>

            {/* Quick Badges */}
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-sans font-semibold text-stone-600 dark:text-stone-400">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700">
                <Landmark className="w-3.5 h-3.5 text-laterite-600" />
                <span>{km ? "ការពារបេតិកភណ្ឌជាតិ" : "Heritage Protected"}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{km ? "ច្បាប់ជាធរមានកម្ពុជា" : "Kingdom of Cambodia Law"}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700">
                <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                <span>{km ? "បច្ចុប្បន្នភាពទៀងទាត់" : "Regular Updates"}</span>
              </span>
            </div>
          </div>
        </motion.section>

        {/* =================================================================== */}
        {/* 2. TERMS CONTENT: NUMBERED CARDS                                    */}
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
                        {km ? `មាត្រា ${sec.num}` : `Article ${sec.num}`}
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
        {/* 3. LEGAL QUESTIONS FOOTER CTA                                       */}
        {/* =================================================================== */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative rounded-3xl sm:rounded-[32px] bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 p-6 sm:p-8 lg:p-10 shadow-sm overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-laterite-600/10 dark:bg-laterite-500/15 border border-laterite-600/20 text-xs font-bold text-laterite-700 dark:text-laterite-300 font-sans uppercase">
              <Headphones className="w-3.5 h-3.5" />
              <span>{km ? "សំណួរច្បាប់ ឬការអនុញ្ញាត" : "Legal Inquiries"}</span>
            </div>
            <h3 className="font-heading font-black text-2xl sm:text-3xl text-stone-900 dark:text-stone-100 tracking-tight">
              {km ? "ត្រូវការការបំភ្លឺបន្ថែមលើលក្ខខណ្ឌ?" : "Have Questions Regarding Terms?"}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-sans leading-relaxed">
              {km
                ? "ប្រសិនបើអ្នកមានសំណួរអំពីកម្មសិទ្ធិបញ្ញា កិច្ចសហការ ឬការប្រើប្រាស់ទិន្នន័យ សូមទាក់ទងមកកាន់ផ្នែកច្បាប់នៃCamGO។"
                : "For intellectual property permissions, licensing requests, or partnership inquiries, reach out to our legal liaison."}
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/contact"
              className="min-h-[44px] px-6 py-2.5 rounded-2xl bg-laterite-600 hover:bg-laterite-700 text-white text-xs font-sans font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
            >
              <span>{km ? "ទាក់ទងយើង" : "Contact Desk"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/faq"
              className="min-h-[44px] px-5 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-sans font-bold uppercase tracking-wider flex items-center gap-2 border border-stone-200 dark:border-stone-700 transition-all"
            >
              <span>{km ? "សំណួរ-ចម្លើយ (FAQ)" : "Read FAQs"}</span>
            </Link>
          </div>
        </motion.div>
      </PageContainer>
    </div>
  );
};

export default TermsPage;
