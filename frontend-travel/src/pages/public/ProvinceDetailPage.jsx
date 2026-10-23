import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Users, Compass, LayoutGrid, Map as MapIcon, MapPin, ArrowRight, Sparkles } from "lucide-react";
import { DestinationCard } from "@/components/destinations/DestinationCard";
import { MapOnDemand } from "@/components/common/MapOnDemand";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { DestinationCardSkeleton } from "@/components/common/ShimmerSkeleton";
import { PageContainer } from "@/components/layout/PageContainer";
import { EmptyState } from "@/components/layout/EmptyState";
import { RumduolFlower } from "@/components/common/RumduolMotifs";
import { provincesApi } from "@/lib/api/provinces";
import { toast } from "@/store/toastStore";
import { SEOHead } from "@/components/common/SEOHead";

const toKm = (n) => String(n ?? 0);

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.04 } }
};

const ProvinceDetailPage = () => {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const km = i18n.language === "km";
  const [province, setProvince] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);
    provincesApi
      .getBySlug(slug)
      .then((res) => {
        const raw = res?.data || res;
        const provData = raw?.province || (raw?.id ? raw : null);
        const destList =
          res?.destinations ||
          raw?.destinations ||
          provData?.destinations ||
          [];

        if (provData) {
          setProvince({
            ...provData,
            destinations: Array.isArray(destList) ? destList : []
          });
        }
      })
      .catch(() => {
        toast.error("Failed to load province");
      })
      .finally(() => setIsLoading(false));
  }, [slug]);

  if (isLoading) {
    return (
      <div className="pt-20 sm:pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 animate-pulse">
        <div className="h-6 w-48 bg-stone-200 dark:bg-stone-800 rounded-xl" />
        <div className="aspect-[16/9] sm:aspect-[21/9] bg-stone-200 dark:bg-stone-800 rounded-3xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-4">
          {[...Array(4)].map((_, i) => (
            <DestinationCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!province) {
    return (
      <div className="pt-24 pb-20 max-w-xl mx-auto px-4 text-center space-y-4">
        <h2 className="text-3xl font-heading font-black text-stone-900 dark:text-stone-100">
          {km ? "រកមិនឃើញខេត្តនេះទេ" : "Province Not Found"}
        </h2>
        <Link to="/provinces" className="inline-flex items-center min-h-[44px] px-6 rounded-2xl bg-laterite-600 hover:bg-laterite-700 text-white font-bold text-xs uppercase tracking-wider">
          {km ? "ត្រឡប់ទៅបញ្ជីខេត្ត" : "Back to Provinces Atlas"}
        </Link>
      </div>
    );
  }

  const name = km && province.name_km ? province.name_km : province.name_en;
  const description = km && province.description_km ? province.description_km : province.description_en;
  const capital = km && province.capital_km ? province.capital_km : province.capital;
  const destinations = province.destinations || [];

  return (
    <div className="stone-grain min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 pt-20 sm:pt-24 pb-20">
      <SEOHead
        title={`${name} | ${capital ? (km ? `ទីរួមខេត្ត ${capital}` : `Capital: ${capital}`) : "Cambodia"}`}
        description={province.excerpt_km || province.excerpt_en || description?.slice(0, 160)}
        image={province.image || province.image_url}
        type="place"
      />

      <PageContainer className="space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: km ? "ខេត្ត-រាជធានី" : "The 25 Provinces", to: "/provinces" },
            { label: name }
          ]}
        />

        {/* =================================================================== */}
        {/* 1. ANGKOR SANDSTONE PROVINCE HERO BANNER                            */}
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
            {/* Left Column: Heading, Description & Stats Matrix */}
            <div className="lg:col-span-7 space-y-5">
              <div className="space-y-3">


                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black tracking-tight text-stone-900 dark:text-stone-100 leading-tight">
                  {name}
                </h1>

                {capital && (
                  <p className="text-sm text-stone-600 dark:text-stone-400 flex items-center gap-1.5 font-sans">
                    <span className="text-stone-500">{km ? "ទីរួមខេត្ត / រាជធានី៖" : "Provincial Capital:"}</span>
                    <span className="font-bold text-stone-900 dark:text-stone-100">{capital}</span>
                  </p>
                )}

                {description && (
                  <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 leading-relaxed max-w-xl font-sans">
                    {description}
                  </p>
                )}
              </div>

              {/* 4 Facts Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200/90 dark:border-stone-700/80 shadow-2xs">
                  <span className="text-[11px] uppercase tracking-wider text-stone-500 dark:text-stone-400 block font-bold font-sans">
                    {km ? "ទីរួមខេត្ត" : "Capital"}
                  </span>
                  <p className="text-sm font-black text-stone-900 dark:text-stone-100 mt-1 truncate font-heading">
                    {capital || "—"}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200/90 dark:border-stone-700/80 shadow-2xs">
                  <span className="text-[11px] uppercase tracking-wider text-stone-500 dark:text-stone-400 block font-bold font-sans">
                    {km ? "ចំនួនគោលដៅ" : "Places"}
                  </span>
                  <p className="text-sm font-black text-laterite-600 dark:text-laterite-400 mt-1 font-heading">
                    {toKm(destinations.length)} {km ? "ទីតាំង" : "Sights"}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200/90 dark:border-stone-700/80 shadow-2xs">
                  <span className="text-[11px] uppercase tracking-wider text-stone-500 dark:text-stone-400 block font-bold font-sans">
                    {km ? "ប្រជាជន" : "Population"}
                  </span>
                  <p className="text-sm font-black text-stone-900 dark:text-stone-100 mt-1 truncate font-mono">
                    {province.population ? Number(province.population).toLocaleString() : "—"}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200/90 dark:border-stone-700/80 shadow-2xs">
                  <span className="text-[11px] uppercase tracking-wider text-stone-500 dark:text-stone-400 block font-bold font-sans">
                    {km ? "ផ្ទៃដី" : "Area"}
                  </span>
                  <p className="text-sm font-black text-stone-900 dark:text-stone-100 mt-1 truncate font-mono">
                    {province.area ? `${province.area} km²` : "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Showcase Card */}
            <div className="lg:col-span-5">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-stone-200 dark:bg-stone-800 border border-stone-200/90 dark:border-stone-800 relative shadow-md group">
                {province.image || province.image_url ? (
                  <img
                    src={province.image || province.image_url}
                    alt={name}
                    loading="eager"
                    fetchPriority="high"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                ) : (
                  <div className="w-full h-full bg-stone-300 dark:bg-stone-800" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 text-white pointer-events-none">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-stone-900/80 backdrop-blur-md text-stone-200 inline-flex items-center gap-1.5 border border-white/20 font-sans">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>{km ? "ទេសភាពតំបន់" : "Provincial Landscape"}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* =================================================================== */}
        {/* 2. DESTINATIONS IN THIS PROVINCE                                    */}
        {/* =================================================================== */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200/80 dark:border-stone-800">
            <h2 className="font-heading font-black text-xl sm:text-2xl text-stone-900 dark:text-stone-100 tracking-tight">
              {km ? `គោលដៅទេសចរណ៍ក្នុងខេត្ត ${name}` : `Destinations in ${name}`} ({toKm(destinations.length)})
            </h2>

            {/* View Mode Toggle */}
            {destinations.length > 0 && (
              <div className="flex items-center gap-1 p-1 rounded-2xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`min-h-[34px] px-3.5 rounded-xl text-xs font-sans font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all ${viewMode === "grid"
                      ? "bg-laterite-600 text-white shadow-xs"
                      : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
                    }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Grid</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("map")}
                  className={`min-h-[34px] px-3.5 rounded-xl text-xs font-sans font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all ${viewMode === "map"
                      ? "bg-laterite-600 text-white shadow-xs"
                      : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
                    }`}
                >
                  <MapIcon className="w-3.5 h-3.5" />
                  <span>Map</span>
                </button>
              </div>
            )}
          </div>

          {destinations.length === 0 ? (
            <EmptyState
              icon={Compass}
              title={km ? "មិនទាន់មានគោលដៅទេសចរណ៍ត្រូវបានបញ្ចូលទេ" : "No Destinations Documented Yet"}
              description={km ? "ព័ត៌មានអំពីគោលដៅក្នុងខេត្តនេះកំពុងត្រូវបានរៀបចំ។" : "Curators are currently documenting attractions in this province."}
            />
          ) : viewMode === "map" ? (
            <div className="rounded-3xl overflow-hidden h-[520px] border border-stone-200/90 dark:border-stone-800 shadow-md">
              <MapOnDemand destinations={destinations} />
            </div>
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

export { ProvinceDetailPage };
export default ProvinceDetailPage;
