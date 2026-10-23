import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Search, X, BookOpen, Sparkles, Calendar, Clock, ArrowRight } from "lucide-react";
import { contentApi } from "@/lib/api/content";
import { BlogCardSkeleton } from "@/components/common/ShimmerSkeleton";
import { PageContainer } from "@/components/layout/PageContainer";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { SEOHead } from "@/components/common/SEOHead";
import { RumduolFlower } from "@/components/common/RumduolMotifs";

const toKm = (n) => (n === null || n === undefined ? "0" : String(n));

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } }
};

export const BlogPage = () => {
  const { i18n } = useTranslation();
  const km = i18n.language === "km";
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setIsLoading(true);
    contentApi
      .getBlogPosts({ per_page: 20 })
      .then((res) => {
        if (res.data) {
          const items = res.data?.items || res.data || [];
          setPosts(Array.isArray(items) ? items : []);
        }
      })
      .catch((err) => {
        console.error("Failed to load blog posts", err);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const filteredPosts = useMemo(() => {
    if (!search.trim()) return posts;
    const q = search.toLowerCase().trim();
    return posts.filter((p) => {
      const titleKm = (p.title_km || "").toLowerCase();
      const titleEn = (p.title_en || "").toLowerCase();
      const excerptKm = (p.excerpt_km || "").toLowerCase();
      const excerptEn = (p.excerpt_en || "").toLowerCase();
      return (
        titleKm.includes(q) ||
        titleEn.includes(q) ||
        excerptKm.includes(q) ||
        excerptEn.includes(q)
      );
    });
  }, [posts, search]);

  return (
    <div className="stone-grain min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 pt-20 sm:pt-24 pb-20">
      <SEOHead
        title={km ? "អត្ថបទស្រាវជ្រាវ និងសារព័ត៌មាន — CamGO" : "Travel Journal & Heritage Essays — CamGO"}
        description={
          km
            ? "ស្វែងយល់ពីប្រវត្តិសាស្រ្តខ្មែរ ស្ថាបត្យកម្មប្រាសាទបុរាណ វប្បធម៌ និងការណែនាំដំណើរកម្សាន្តដែលចងក្រងយ៉ាងផ្ចិតផ្ចង់។"
            : "Curated essays on ancient Khmer architecture, spiritual traditions, and practical expedition guides across the Kingdom of Cambodia."
        }
      />

      <PageContainer className="space-y-8 sm:space-y-10">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: km ? "ទំព័រដើម" : "Home", to: "/" },
            { label: km ? "អត្ថបទ និងសារព័ត៌មាន" : "Travel Journal" },
          ]}
        />

        {/* =================================================================== */}
        {/* 1. KHMER ARCHITECTURAL BLOG HERO BANNER                            */}
        {/* =================================================================== */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
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

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
            {/* Left Column: Editorial Headline & Purpose */}
            <div className="lg:col-span-7 space-y-4">


              <h1 className="font-heading font-black text-3xl sm:text-5xl lg:text-6xl text-stone-950 dark:text-white leading-[1.12] tracking-tight">
                {km ? "អត្ថបទស្រាវជ្រាវ និងរឿងរ៉ាវបេតិកភណ្ឌ" : "Ancient Stories & Travel Essays"}
              </h1>

              <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 leading-relaxed max-w-2xl font-medium font-sans">
                {km
                  ? `ស្វែងយល់ពីប្រវត្តិសាស្រ្តខ្មែរ ស្ថាបត្យកម្មប្រាសាទបុរាណ វប្បធម៌ និងការណែនាំដំណើរកម្សាន្តចំនួន ${toKm(posts.length)} អត្ថបទដែលចងក្រងយ៉ាងផ្ចិតផ្ចង់ចេញពីទិន្នន័យជាក់ស្តែង។`
                  : `Curated collection of ${posts.length} published essays on ancient Khmer architecture, spiritual traditions, and practical travel fieldworks across Cambodia.`}
              </p>
            </div>

            {/* Right Column: Split Metric Overview Cards */}
            <div className="lg:col-span-5 p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-stone-50/90 dark:bg-stone-800/80 border border-stone-200/90 dark:border-stone-700/80 space-y-4 shadow-sm backdrop-blur-xs">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-700">
                <span className="text-xs font-bold uppercase tracking-wider font-sans text-stone-600 dark:text-stone-400 font-khmer">
                  {km ? "បណ្ណសារអត្ថបទជាតិ" : "Journal Archive"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-700 shadow-2xs">
                  <span className="text-2xl sm:text-3xl font-black font-mono text-stone-900 dark:text-stone-100 block">
                    {toKm(posts.length)}
                  </span>
                  <span className="text-xs text-stone-500 dark:text-stone-400 font-khmer font-bold mt-1 block">
                    {km ? "អត្ថបទសរុប" : "Total Published"}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-700 shadow-2xs">
                  <span className="text-2xl sm:text-3xl font-black font-mono text-laterite-600 dark:text-amber-400 block">
                    100%
                  </span>
                  <span className="text-xs text-stone-500 dark:text-stone-400 font-khmer font-bold mt-1 block">
                    {km ? "ស្រាវជ្រាវផ្ទាល់" : "Field Verified"}
                  </span>
                </div>
              </div>

              <p className="text-xs text-stone-500 dark:text-stone-400 pt-2 border-t border-stone-200 dark:border-stone-700 leading-relaxed font-sans font-medium">
                {km
                  ? "ចងក្រងដោយក្រុមការងារស្រាវជ្រាវ និងសហគមន៍ទេសចរណ៍CamGO។"
                  : "Documented by cultural researchers and the CamGO field team."}
              </p>
            </div>
          </div>
        </motion.section>

        {/* =================================================================== */}
        {/* 2. SEARCH & FILTER SUB-BAR                                          */}
        {/* =================================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border border-stone-200/90 dark:border-stone-800 shadow-sm p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-sm"
        >
          <div className="relative flex-1 max-w-md">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-laterite-600 dark:text-amber-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={km ? "ស្វែងរកចំណងជើងអត្ថបទ ឬប្រធានបទ..." : "Search articles or topics..."}
              className="w-full h-11 pl-10 pr-10 text-xs sm:text-sm font-sans rounded-xl bg-stone-50 dark:bg-stone-950/80 border border-stone-300 dark:border-stone-700/80 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:border-laterite-500 dark:focus:border-amber-500 focus:bg-white dark:focus:bg-stone-900 focus:ring-2 focus:ring-laterite-500/20 transition-all shadow-2xs"
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

          <div className="flex items-center gap-2 justify-end">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-laterite-600/10 dark:bg-laterite-950/50 border border-laterite-600/20 text-laterite-700 dark:text-amber-400 text-xs font-semibold font-khmer">
              <BookOpen className="w-3.5 h-3.5 text-laterite-600 dark:text-amber-400" />
              <span>
                {km
                  ? `បង្ហាញ ${toKm(filteredPosts.length)} នៃ ${toKm(posts.length)} អត្ថបទ`
                  : `Showing ${filteredPosts.length} of ${posts.length} articles`}
              </span>
            </div>
          </div>
        </motion.div>

        {/* =================================================================== */}
        {/* 3. BLOG POSTS GRID: ELEVATED CULTURAL CARDS                         */}
        {/* =================================================================== */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {[...Array(6)].map((_, i) => (
              <BlogCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="rounded-3xl p-8 sm:p-12 text-center space-y-4 bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 max-w-lg mx-auto shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-laterite-600/10 text-laterite-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-xl sm:text-2xl text-stone-900 dark:text-stone-100">
              {km ? "មិនទាន់មានអត្ថបទត្រូវនឹងការស្វែងរកទេ" : "No articles matching search query"}
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 font-sans">
              {km ? "សូមសាកល្បងស្វែងរកពាក្យគន្លឹះផ្សេងទៀត។" : "Please try searching with different keywords."}
            </p>
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="btn-secondary min-h-[38px] px-4 rounded-xl text-xs font-semibold mt-2 cursor-pointer"
              >
                {km ? "កំណត់ឡើងវិញ" : "Clear Search"}
              </button>
            )}
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7"
          >
            {filteredPosts.map((post) => {
              const title = km && post.title_km ? post.title_km : post.title_en;
              const excerpt = km && post.excerpt_km ? post.excerpt_km : post.excerpt_en;
              const dateStr = post.published_at ? post.published_at.substring(0, 10) : null;

              return (
                <motion.div
                  key={post.id}
                  variants={fadeInUp}
                  whileHover={{ y: -6, scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  transition={{ type: "spring", stiffness: 340, damping: 22 }}
                >
                  <Link
                    to={`/blog/${post.slug}`}
                    className="group rounded-2xl sm:rounded-3xl overflow-hidden bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800/90 shadow-2xs hover:shadow-xl hover:shadow-stone-950/10 dark:hover:shadow-black/50 hover:border-laterite-500/40 dark:hover:border-laterite-500/40 transition-all duration-300 flex flex-col justify-between select-none h-full block"
                  >
                    {/* Visual Media Pane */}
                    {post.image_url && (
                      <div className="w-full aspect-[16/10] border-b border-stone-200/90 dark:border-stone-800 overflow-hidden bg-stone-950 relative">
                        <img
                          src={post.image_url}
                          alt={title}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                        />
                        {/* Cinematic Scrims */}
                        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/70 via-stone-950/20 to-transparent pointer-events-none" />
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent pointer-events-none" />

                        {/* Top-Left Date Pill */}
                        {dateStr && (
                          <div className="absolute top-3 left-3 z-10">
                            <span className="px-2.5 py-1 rounded-full bg-stone-950/70 dark:bg-stone-900/80 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold shadow-xs flex items-center gap-1.5 font-mono">
                              <Calendar className="w-3 h-3 text-amber-400" />
                              <span>{dateStr}</span>
                            </span>
                          </div>
                        )}

                        {/* Bottom-Left Reading Badge */}
                        <div className="absolute bottom-3 left-3 z-10">
                          <span className="px-2.5 py-0.5 rounded-full bg-stone-950/75 backdrop-blur-md border border-white/20 text-stone-200 text-[10px] font-semibold flex items-center gap-1 font-khmer shadow-xs">
                            <Clock className="w-3 h-3 text-amber-400" />
                            <span>{km ? "អាន 4 នាទី" : "4 min read"}</span>
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Editorial Content */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-2">
                        <h2 className="text-base sm:text-lg font-heading font-black text-stone-900 dark:text-stone-100 group-hover:text-laterite-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug tracking-wide">
                          {title}
                        </h2>

                        {excerpt && (
                          <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed font-sans font-medium">
                            {excerpt}
                          </p>
                        )}
                      </div>

                      {/* Action Footer & Circular Arrow Button */}
                      <div>
                        <div className="pt-3 border-t border-stone-200/80 dark:border-stone-800/80 flex items-center justify-between text-xs font-bold text-laterite-600 dark:text-laterite-400 font-khmer">
                          <span className="group-hover:text-laterite-700 dark:group-hover:text-amber-400 transition-colors">
                            {km ? "អានអត្ថបទពេញ" : "Read Article"}
                          </span>
                          <div className="w-7 h-7 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 group-hover:bg-laterite-600 group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-2xs group-hover:translate-x-0.5 shrink-0">
                            <ArrowRight className="w-3.5 h-3.5" />
                          </div>
                        </div>

                        {/* Animated Light Beam Accent Line */}
                        <div className="h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-laterite-600 via-amber-500 to-laterite-600 transition-all duration-500 rounded-full mt-2" />
                      </div>
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

export default BlogPage;
