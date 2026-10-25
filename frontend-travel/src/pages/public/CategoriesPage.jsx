import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Search,
  X,
  Sparkles,
  Compass,
  ArrowRight,
  Landmark,
  TreePine,
  Mountain,
  Waves,
  UtensilsCrossed,
  Footprints,
  Users,
  Camera,
  Palmtree,
} from "lucide-react";
import { categoriesApi } from "@/lib/api/categories";
import { CategoryCardSkeleton } from "@/components/common/ShimmerSkeleton";
import { PageContainer } from "@/components/layout/PageContainer";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { RumduolFlower } from "@/components/common/RumduolMotifs";

const toKm = (n) => String(n ?? 0);
const pad = (n) => String(n).padStart(2, "0");

const getCategoryIcon = (category) => {
  const key = `${category?.slug || ""} ${category?.icon || ""} ${category?.name_en || ""}`.toLowerCase();
  if (key.includes("temple") || key.includes("heritage") || key.includes("monument") || key.includes("ancient") || key.includes("culture")) {
    return Landmark;
  }
  if (key.includes("nature") || key.includes("eco") || key.includes("forest") || key.includes("wildlife")) {
    return TreePine;
  }
  if (key.includes("mountain") || key.includes("hill") || key.includes("waterfall")) {
    return Mountain;
  }
  if (key.includes("beach") || key.includes("coast") || key.includes("island") || key.includes("sea") || key.includes("water")) {
    return Waves;
  }
  if (key.includes("food") || key.includes("culinary") || key.includes("dining") || key.includes("taste")) {
    return UtensilsCrossed;
  }
  if (key.includes("adventure") || key.includes("trek") || key.includes("hike") || key.includes("sport")) {
    return Footprints;
  }
  if (key.includes("community") || key.includes("local") || key.includes("village") || key.includes("people")) {
    return Users;
  }
  if (key.includes("photo") || key.includes("sight") || key.includes("view")) {
    return Camera;
  }
  if (key.includes("relax") || key.includes("resort") || key.includes("leisure")) {
    return Palmtree;
  }
  return Compass;
};

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
            {filteredCategories.map((c, idx) => {
              const name = km && c.name_km ? c.name_km : c.name_en;
              const subName = km ? c.name_en : c.name_km;
              const desc = km && c.description_km ? c.description_km : (c.description_en || c.description_km);
              const count = c.destinations_count || 0;
              const CategoryIcon = getCategoryIcon(c);
              const categoryIndexStr = pad(idx + 1);

              return (
                <motion.div
                  key={c.id}
                  variants={fadeInUp}
                  whileHover={{ y: -6, scale: 1.018 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 320, damping: 22 }}
                >
                  <Link
                    to={`/categories/${c.slug}`}
                    className="group rounded-3xl p-6 sm:p-7 relative flex flex-col justify-between select-none border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm hover:shadow-2xl hover:border-laterite-500/50 dark:hover:border-laterite-500/40 transition-all duration-300 min-h-[310px] sm:min-h-[320px] overflow-hidden"
                  >
                    {/* Layered Ambient Glow Orbs */}
                    <div className="absolute -top-16 -right-16 w-44 h-44 bg-gradient-to-br from-laterite-500/12 via-amber-500/8 to-transparent rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-700" />
                    <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-stone-200/30 dark:bg-stone-800/20 rounded-full blur-2xl pointer-events-none" />

                    {/* Rotating Rumduol Flower Watermark */}
                    <div className="absolute -right-8 -bottom-8 opacity-[0.035] dark:opacity-[0.045] group-hover:opacity-[0.08] group-hover:rotate-45 transition-all duration-700 pointer-events-none select-none">
                      <RumduolFlower size={200} className="text-laterite-600 dark:text-amber-400" />
                    </div>

                    {/* Top Row: Icon Vessel & Plaque Counter */}
                    <div className="relative z-10 flex items-start justify-between gap-4">
                      {/* Architectural Icon Vessel */}
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-stone-50 to-stone-100 dark:from-stone-850 dark:to-stone-800 border border-stone-200/90 dark:border-stone-700/80 text-laterite-600 dark:text-amber-400 flex items-center justify-center shadow-xs group-hover:bg-laterite-600 group-hover:text-white group-hover:border-laterite-600 group-hover:shadow-lg group-hover:shadow-laterite-600/25 transition-all duration-300">
                        <CategoryIcon className="w-6 h-6 stroke-[1.9] group-hover:scale-110 transition-transform duration-300" />
                      </div>

                      {/* Top Counter Plaque */}
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 dark:bg-stone-800/90 border border-stone-200/80 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-bold font-sans shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 group-hover:scale-125 transition-transform" />
                          <span>{km ? `${toKm(count)} ទីតាំង` : `${count} spots`}</span>
                        </span>
                      </div>
                    </div>

                    {/* Middle Block: Index Tag, Title, Subtitle, Description */}
                    <div className="relative z-10 space-y-2 py-4 my-auto">
                      <div className="flex items-center gap-2 text-[10px] font-mono font-bold tracking-widest text-stone-400 dark:text-stone-500 uppercase">
                        <span>{`#${categoryIndexStr}`}</span>
                        <span className="w-1 h-1 rounded-full bg-stone-300 dark:bg-stone-700" />
                        <span>{subName || "CAMGO ATLAS"}</span>
                      </div>

                      <h3 className="font-heading font-black text-2xl sm:text-[26px] text-stone-900 dark:text-stone-100 group-hover:text-laterite-600 dark:group-hover:text-amber-400 transition-colors leading-tight tracking-wide">
                        {name}
                      </h3>

                      {desc && (
                        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-sans leading-relaxed line-clamp-3 pt-0.5">
                          {desc}
                        </p>
                      )}
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="relative z-10 pt-3.5 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between">
                      <span className="text-xs font-bold text-laterite-600 dark:text-amber-400 font-sans group-hover:translate-x-1 transition-transform duration-200">
                        {km ? "រុករកគោលដៅទាំងអស់" : "Explore All Sanctuaries"}
                      </span>

                      <div className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 flex items-center justify-center group-hover:bg-laterite-600 group-hover:text-white group-hover:translate-x-1 transition-all duration-300 shadow-2xs">
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>

                    {/* Bottom Animated Beam */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-laterite-600 via-amber-400 to-laterite-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
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
