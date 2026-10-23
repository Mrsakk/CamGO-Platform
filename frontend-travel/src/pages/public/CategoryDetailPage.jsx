import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Compass, Sparkles, MapPin } from "lucide-react";
import { DestinationCard } from "@/components/destinations/DestinationCard";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { DestinationCardSkeleton } from "@/components/common/ShimmerSkeleton";
import { PageContainer } from "@/components/layout/PageContainer";
import { EmptyState } from "@/components/layout/EmptyState";
import { RumduolFlower } from "@/components/common/RumduolMotifs";
import { categoriesApi } from "@/lib/api/categories";
import { toast } from "@/store/toastStore";

const toKm = (n) => String(n ?? 0);

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.04 } }
};

const CategoryDetailPage = () => {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const km = i18n.language === "km";
  const [category, setCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);
    categoriesApi
      .getBySlug(slug)
      .then((res) => {
        const raw = res?.data || res;
        const catData = raw?.category || (raw?.id ? raw : null);
        const destList =
          res?.destinations ||
          raw?.destinations ||
          catData?.destinations ||
          [];

        if (catData) {
          setCategory({
            ...catData,
            destinations: Array.isArray(destList) ? destList : []
          });
        }
      })
      .catch(() => {
        toast.error("Failed to load category");
      })
      .finally(() => setIsLoading(false));
  }, [slug]);

  if (isLoading) {
    return (
      <div className="pt-20 sm:pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 animate-pulse">
        <div className="h-6 w-48 bg-stone-200 dark:bg-stone-800 rounded-xl" />
        <div className="h-44 rounded-3xl bg-stone-200 dark:bg-stone-800" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-4">
          {[...Array(4)].map((_, i) => (
            <DestinationCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="pt-24 pb-20 max-w-xl mx-auto px-4 text-center space-y-4">
        <h2 className="text-3xl font-heading font-black text-stone-900 dark:text-stone-100">
          {km ? "រកមិនឃើញប្រភេទទេសចរណ៍នេះទេ" : "Category Not Found"}
        </h2>
        <Link to="/categories" className="inline-flex items-center min-h-[44px] px-6 rounded-2xl bg-laterite-600 hover:bg-laterite-700 text-white font-bold text-xs uppercase tracking-wider">
          {km ? "ត្រឡប់ទៅប្រភេទទាំងអស់" : "Back to All Categories"}
        </Link>
      </div>
    );
  }

  const name = km && category.name_km ? category.name_km : category.name_en;
  const description = km && category.description_km ? category.description_km : category.description_en;
  const destinations = category.destinations || [];

  return (
    <div className="stone-grain min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 pt-20 sm:pt-24 pb-20">
      <PageContainer className="space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: km ? "ប្រភេទទេសចរណ៍" : "Categories", to: "/categories" },
            { label: name }
          ]}
        />

        {/* =================================================================== */}
        {/* 1. ANGKOR SANDSTONE CATEGORY HERO BANNER                            */}
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

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Heading & Description */}
            <div className="lg:col-span-8 space-y-4">


              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black tracking-tight text-stone-900 dark:text-stone-100 leading-tight">
                {name}
              </h1>

              {description && (
                <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 leading-relaxed max-w-2xl font-sans">
                  {description}
                </p>
              )}
            </div>

            {/* Right Column: Metric Card */}
            <div className="lg:col-span-4">
              <div className="p-6 rounded-3xl bg-stone-50/90 dark:bg-stone-800/80 border border-stone-200/90 dark:border-stone-700/80 space-y-3 shadow-2xs text-center">
                <span className="text-xs uppercase tracking-wider font-bold text-stone-500 dark:text-stone-400 font-sans block">
                  {km ? "ចំនួនគោលដៅក្នុងប្រភេទនេះ" : "Curated Attractions"}
                </span>
                <span className="text-4xl font-black font-heading text-laterite-600 dark:text-laterite-400 block">
                  {toKm(destinations.length)}
                </span>
                <span className="text-xs text-stone-600 dark:text-stone-400 font-medium font-sans block">
                  {km ? "ទីតាំងទេសចរណ៍ដែលបានចងក្រង" : "Places documented in this pursuit"}
                </span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* =================================================================== */}
        {/* 2. DESTINATIONS LIST                                                */}
        {/* =================================================================== */}
        <div className="space-y-4 pt-4">
          <div className="pb-3 border-b border-stone-200/80 dark:border-stone-800">
            <h2 className="font-heading font-black text-xl sm:text-2xl text-stone-900 dark:text-stone-100 tracking-tight">
              {km ? `គោលដៅទេសចរណ៍ក្នុងប្រភេទ ${name}` : `Destinations in ${name}`} ({toKm(destinations.length)})
            </h2>
          </div>

          {destinations.length === 0 ? (
            <EmptyState
              icon={Compass}
              title={km ? "មិនទាន់មានគោលដៅទេសចរណ៍ក្នុងប្រភេទនេះទេ" : "No Destinations Documented Yet"}
              description={km ? "ព័ត៌មានអំពីគោលដៅក្នុងប្រភេទនេះកំពុងត្រូវបានរៀបចំ។" : "Curators are currently documenting attractions for this category."}
            />
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
            >
              {destinations.map((dest) => (
                <motion.div key={dest.id} variants={fadeInUp}>
                  <DestinationCard destination={dest} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </PageContainer>
    </div>
  );
};

export { CategoryDetailPage };
export default CategoryDetailPage;
