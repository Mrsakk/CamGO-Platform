import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Search, X, Sparkles, MapPin, ArrowRight, Compass } from "lucide-react";
import { provincesApi } from "@/lib/api/provinces";
import { ProvinceCardSkeleton } from "@/components/common/ShimmerSkeleton";
import { PageContainer } from "@/components/layout/PageContainer";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { RumduolFlower } from "@/components/common/RumduolMotifs";
import { getImageUrl } from "@/lib/utils";

const toKm = (n) => String(n ?? 0);
const pad = (n) => String(n).padStart(2, "0");

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.04 } }
};

const ProvincesPage = () => {
  const { t, i18n } = useTranslation();
  const km = i18n.language === "km";
  const [provinces, setProvinces] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    provincesApi
      .getAll()
      .then((res) => {
        if (res.data) {
          const items = Array.isArray(res.data) ? res.data : res.data.items || [];
          setProvinces(items);
        }
      })
      .catch((err) => {
        console.error("Failed to load provinces", err);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const filteredProvinces = useMemo(() => {
    if (!search.trim()) return provinces;
    const term = search.toLowerCase().trim();
    return provinces.filter((p) => {
      return (
        (p.name_en && p.name_en.toLowerCase().includes(term)) ||
        (p.name_km && p.name_km.includes(term)) ||
        (p.code && p.code.toLowerCase().includes(term))
      );
    });
  }, [provinces, search]);

  return (
    <div className="stone-grain min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 pt-20 sm:pt-24 pb-20">
      <PageContainer className="space-y-8">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: km ? "ទំព័រដើម" : "Home", to: "/" },
            { label: km ? "រាជធានី និងខេត្ត" : "Provinces Atlas" },
          ]}
        />

        {/* =================================================================== */}
        {/* 1. ANGKOR SANDSTONE PROVINCES HERO BANNER                           */}
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
            {/* Left Column: Atlas Title & Overview */}
            <div className="lg:col-span-7 space-y-4">


              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black tracking-tight text-stone-900 dark:text-stone-100 leading-tight">
                {km ? "រាជធានី និងខេត្តនៅកម្ពុជា" : "Kingdom of Cambodia Atlas"}
              </h1>

              <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 leading-relaxed max-w-2xl font-sans">
                {km
                  ? "រុករកគោលដៅទេសចរណ៍ បេតិកភណ្ឌប្រវត្តិសាស្ត្រ និងរតនសម្បត្តិធម្មជាតិសម្បូរបែបក្នុងគ្រប់ខេត្ត-រាជធានី ផ្ទៀងផ្ទាត់ផ្ទាល់ពីទិន្នន័យជាក់ស្តែង។"
                  : "Discover ancient sanctuary ruins, eco-reserves, pristine coastal islands, and regional heritage across all 25 provinces."}
              </p>
            </div>

            {/* Right Column: Search & Live Metric Plate */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-6 rounded-3xl bg-stone-50/90 dark:bg-stone-800/80 border border-stone-200/90 dark:border-stone-700/80 space-y-4 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200/80 dark:border-stone-700">
                  <span className="text-xs uppercase tracking-wider font-bold text-stone-500 dark:text-stone-400 font-sans">
                    {km ? "ស្វែងរកខេត្តរហ័ស" : "Search Atlas"}
                  </span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-stone-200/70 dark:bg-stone-900 text-stone-800 dark:text-stone-200 font-mono">
                    {km ? `${toKm(filteredProvinces.length)} / ${toKm(provinces.length || 25)}` : `${filteredProvinces.length} of ${provinces.length || 25}`}
                  </span>
                </div>

                {/* Search Input */}
                <div className="relative w-full">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-laterite-600 dark:text-laterite-400">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={km ? "ស្វែងរកឈ្មោះខេត្ត ឬកូដរដ្ឋបាល..." : "Search province or code..."}
                    className="w-full h-11 pl-10 pr-10 text-xs sm:text-sm font-km rounded-2xl bg-white dark:bg-stone-950 border border-stone-200/90 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:border-laterite-600 focus:ring-2 focus:ring-laterite-600/20 transition-all shadow-2xs"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      aria-label="Clear search"
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 font-sans pt-1">
                  <span>{km ? "ចុចលើខេត្តនីមួយៗដើម្បីស្វែងយល់រមណីយដ្ឋាន" : "Select any province to explore"}</span>
                  <Link to="/map" className="text-laterite-600 dark:text-laterite-400 font-bold hover:underline shrink-0 flex items-center gap-1">
                    <span>{km ? "ផែនទី" : "Map"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* =================================================================== */}
        {/* 2. PROVINCES GRID: PHOTOGRAPHIC ATLAS CARDS                         */}
        {/* =================================================================== */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <ProvinceCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredProvinces.length === 0 ? (
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="rounded-3xl sm:rounded-[36px] p-8 sm:p-14 text-center space-y-4 bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 max-w-lg mx-auto shadow-sm"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-laterite-600/10 text-laterite-700 dark:text-laterite-400 text-xs font-bold uppercase tracking-wider font-sans">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{km ? "ទិន្នន័យស្វែងរក" : "No Provinces Found"}</span>
            </div>
            <h3 className="font-heading font-black text-2xl text-stone-900 dark:text-stone-100 leading-snug">
              {km ? "រកមិនឃើញខេត្តទេ" : "No Provinces Found"}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 max-w-sm mx-auto leading-relaxed font-sans">
              {km ? "សូមសាកល្បងស្វែងរកដោយឈ្មោះខេត្តផ្សេង។" : "Try searching with a different province name."}
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSearch("")}
                className="px-6 py-2.5 rounded-2xl bg-laterite-600 hover:bg-laterite-700 text-white text-xs font-sans font-bold uppercase tracking-wider shadow-sm cursor-pointer transition-all active:scale-[0.98]"
              >
                <span>{km ? "សម្អាតការស្វែងរក" : "Clear Search"}</span>
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6"
          >
            {filteredProvinces.map((p, idx) => {
              const name = km && p.name_km ? p.name_km : p.name_en;
              const subName = km ? p.name_en : p.name_km;
              const adminCode = p.code ? p.code : pad(idx + 1);
              const provImage = getImageUrl(
                p.image_url || p.image,
                "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
              );
              const count = p.destinations_count || 0;

              return (
                <motion.div
                  key={p.id}
                  variants={fadeInUp}
                  whileHover={{ y: -8, scale: 1.018 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Link
                    to={`/provinces/${p.slug}`}
                    className="group rounded-3xl sm:rounded-[32px] overflow-hidden aspect-[3/4] relative flex flex-col justify-between p-5 select-none border border-stone-200/90 dark:border-stone-800 shadow-sm hover:shadow-2xl transition-all duration-500 bg-stone-950"
                  >
                    {/* Province Photographic Background */}
                    <img
                      src={provImage}
                      alt={name}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                    />

                    {/* Multi-layer Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/95 via-stone-950/45 to-stone-950/20 group-hover:from-stone-950/90 transition-colors pointer-events-none" />

                    {/* Top Bar: Admin Code Plaque & Destination Count */}
                    <div className="relative z-10 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-950/80 backdrop-blur-md border border-white/20 text-white font-mono text-[11px] font-bold uppercase tracking-wider shadow-xs">
                        <MapPin className="w-3 h-3 text-amber-400" />
                        <span>{`KH-${adminCode}`}</span>
                      </span>

                      <span className="px-3 py-1 rounded-full bg-stone-900/80 backdrop-blur-md border border-white/20 text-white text-[11px] sm:text-xs font-bold shadow-xs font-sans">
                        {km ? `${toKm(count)} ទីតាំង` : `${count} spots`}
                      </span>
                    </div>

                    {/* Bottom Content: Name, Area, Description & Direct Link */}
                    <div className="relative z-10 space-y-2 text-white">
                      {p.area_km2 && (
                        <div className="text-[10px] font-mono uppercase tracking-wider text-amber-300/90 font-semibold">
                          {km
                            ? `ផ្ទៃដី ${toKm(Number(p.area_km2).toLocaleString())} គ.ម²`
                            : `AREA ${Number(p.area_km2).toLocaleString()} KM²`}
                        </div>
                      )}

                      <div className="space-y-0.5">
                        <h3 className="font-heading font-black text-2xl sm:text-3xl text-white group-hover:text-amber-300 transition-colors leading-none tracking-wide drop-shadow-sm">
                          {name}
                        </h3>
                        {subName && (
                          <span className="text-xs text-stone-300/90 block font-sans tracking-wide">
                            {subName}
                          </span>
                        )}
                      </div>

                      {p.description_km && (
                        <p className="text-xs text-stone-300/80 line-clamp-1 font-sans leading-relaxed">
                          {km ? p.description_km : (p.description_en || p.description_km)}
                        </p>
                      )}

                      <div className="pt-2 flex items-center justify-between text-xs font-bold text-amber-400 group-hover:text-amber-300 transition-colors border-t border-white/10">
                        <span className="font-sans">{km ? "រុករកគោលដៅទេសចរណ៍" : "Explore Territory"}</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>

                      {/* Animated Light Beam */}
                      <div className="h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-laterite-600 via-amber-400 to-laterite-600 transition-all duration-500 rounded-full" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </PageContainer>
    </div>
  );
};

export { ProvincesPage };
export default ProvincesPage;
