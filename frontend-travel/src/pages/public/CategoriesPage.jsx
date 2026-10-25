import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Search, X, Sparkles, Compass, ArrowRight } from "lucide-react";
import { categoriesApi } from "@/lib/api/categories";
import { CategoryCardSkeleton } from "@/components/common/ShimmerSkeleton";
import { PageContainer } from "@/components/layout/PageContainer";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { RumduolFlower } from "@/components/common/RumduolMotifs";
import { getImageUrl } from "@/lib/utils";

const toKm = (n) => String(n ?? 0);

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.04 } }
};

const CategoriesPage = () => {
  const { t, i18n } = useTranslation();
  const km = i18n.language === "km";
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    categoriesApi
      .getAll()
      .then((res) => {
        if (res.data) {
          const items = Array.isArray(res.data) ? res.data : res.data.items || [];
          setCategories(items);
        }
      })
      .catch((err) => {
        console.error("Failed to load categories", err);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories;
    const term = search.toLowerCase().trim();
    return categories.filter((c) => {
      return (
        (c.name_en && c.name_en.toLowerCase().includes(term)) ||
        (c.name_km && c.name_km.includes(term)) ||
        (c.description_en && c.description_en.toLowerCase().includes(term)) ||
        (c.description_km && c.description_km.includes(term))
      );
    });
  }, [categories, search]);

  return (
    <div className="stone-grain min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 pt-20 sm:pt-24 pb-20">
      <PageContainer className="space-y-8">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: km ? "ទំព័រដើម" : "Home", to: "/" },
            { label: km ? "ប្រភេទទេសចរណ៍" : "Categories & Pursuits" },
          ]}
        />

        {/* =================================================================== */}
        {/* 1. ANGKOR SANDSTONE CATEGORIES HERO BANNER                          */}
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
            {/* Left Column: Heading & Cultural Categorization */}
            <div className="lg:col-span-7 space-y-4">


              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black tracking-tight text-stone-900 dark:text-stone-100 leading-tight">
                {km ? "ស្វែងយល់តាមប្រភេទទេសចរណ៍" : "Browse by Pursuits"}
              </h1>

              <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 leading-relaxed max-w-2xl font-sans">
                {km
                  ? "ជ្រើសរើសប្រភេទទេសចរណ៍តាមចំណូលចិត្ត៖ ប្រាសាទបុរាណ កោះ ឆ្នេរ ទឹកធ្លាក់ ឬតំបន់អេកូទេសចរណ៍ធម្មជាតិ ផ្ទៀងផ្ទាត់ផ្ទាល់ពីទិន្នន័យជាក់ស្តែង។"
                  : "Explore destinations classified by ancient ruins, coastal retreats, cascading waterfalls, and sacred sanctuaries."}
              </p>
            </div>

            {/* Right Column: Search & Live Metric Plate */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-6 rounded-3xl bg-stone-50/90 dark:bg-stone-800/80 border border-stone-200/90 dark:border-stone-700/80 space-y-4 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200/80 dark:border-stone-700">
                  <span className="text-xs uppercase tracking-wider font-bold text-stone-500 dark:text-stone-400 font-sans">
                    {km ? "តម្រងប្រភេទរហ័ស" : "Filter Themes"}
                  </span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-stone-200/70 dark:bg-stone-900 text-stone-800 dark:text-stone-200 font-mono">
                    {km ? `${toKm(filteredCategories.length)} / ${toKm(categories.length)}` : `${filteredCategories.length} of ${categories.length}`}
                  </span>
                </div>

                {/* Filter Input */}
                <div className="relative w-full">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-laterite-600 dark:text-laterite-400">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={km ? "ស្វែងរកប្រភេទ..." : "Filter categories..."}
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

                <p className="text-xs text-stone-500 dark:text-stone-400 font-sans leading-relaxed">
                  {km
                    ? "ចាត់ថ្នាក់តាមលក្ខណៈពិសេសនៃទីតាំង ដើម្បីជួយសម្រួលដល់ការរៀបចំដំណើរកម្សាន្តរបស់អ្នក។"
                    : "Tailored themes designed to match your travel passions and heritage interests."}
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* =================================================================== */}
        {/* 2. CATEGORIES GRID: PHOTOGRAPHIC THEME CARDS                        */}
        {/* =================================================================== */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {[...Array(6)].map((_, i) => (
              <CategoryCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="rounded-3xl sm:rounded-[36px] p-8 sm:p-14 text-center space-y-4 bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 max-w-lg mx-auto shadow-sm"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-laterite-600/10 text-laterite-700 dark:text-laterite-400 text-xs font-bold uppercase tracking-wider font-sans">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{km ? "ទិន្នន័យស្វែងរក" : "No Categories Found"}</span>
            </div>
            <h3 className="font-heading font-black text-2xl text-stone-900 dark:text-stone-100 leading-snug">
              {km ? "រកមិនឃើញប្រភេទទេសចរណ៍ទេ" : "No Categories Found"}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 max-w-sm mx-auto leading-relaxed font-sans">
              {km ? "សូមសាកល្បងស្វែងរកដោយពាក្យគន្លឹះផ្សេង។" : "Try searching with different terms."}
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
          >
            {filteredCategories.map((c) => {
              const name = km && c.name_km ? c.name_km : c.name_en;
              const subName = km ? c.name_en : c.name_km;
              const desc = km && c.description_km ? c.description_km : (c.description_en || c.description_km);
              const catImage = getImageUrl(
                c.image || c.image_url,
                "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
              );
              const count = c.destinations_count || 0;

              return (
                <motion.div
                  key={c.id}
                  variants={fadeInUp}
                  whileHover={{ y: -2, scale: 1.018 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Link
                    to={`/categories/${c.slug}`}
                    className="group rounded-3xl sm:rounded-[32px] overflow-hidden aspect-[4/5] relative flex flex-col justify-between p-5 sm:p-6 select-none border border-stone-200/90 dark:border-stone-800 shadow-sm hover:shadow-2xl transition-all duration-500 bg-stone-950"
                  >
                    {/* Photographic Background */}
                    <img
                      src={catImage}
                      alt={name}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80";
                      }}
                    />

                    {/* Multi-layer Ambient Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/95 via-stone-950/45 to-stone-950/20 group-hover:from-stone-950/90 transition-colors pointer-events-none" />

                    {/* Top Bar: Destination Count Plaque */}
                    <div className="relative z-10 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-900/80 backdrop-blur-md border border-white/20 text-white text-xs font-bold shadow-xs font-sans">
                        <Compass className="w-3.5 h-3.5 text-amber-400" />
                        <span>{km ? `${toKm(count)} ទីតាំងទេសចរណ៍` : `${count} sanctuaries`}</span>
                      </span>
                    </div>

                    {/* Bottom Content: Name, Description, Action Link */}
                    <div className="relative z-10 space-y-2 text-white">
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

                      {desc && (
                        <p className="text-xs text-stone-300/80 line-clamp-2 font-sans leading-relaxed">
                          {desc}
                        </p>
                      )}

                      <div className="pt-2 flex items-center justify-between text-xs font-bold text-amber-400 group-hover:text-amber-300 transition-colors border-t border-white/10">
                        <span className="font-sans">{km ? "រុករកគោលដៅទាំងអស់" : "Explore Destinations"}</span>
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

export { CategoriesPage };
export default CategoriesPage;
