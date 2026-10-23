import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Search, X, Calendar, Sparkles, MapPin, Compass, ArrowRight } from "lucide-react";
import { contentApi } from "@/lib/api/content";
import { EventCardSkeleton } from "@/components/common/ShimmerSkeleton";
import { EventCard } from "@/components/events/EventCard";
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

export const EventsPage = () => {
  const { i18n } = useTranslation();
  const km = i18n.language === "km";
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setIsLoading(true);
    contentApi
      .getEvents({ per_page: 24 })
      .then((res) => {
        const items = res.data?.items || res.data || [];
        if (Array.isArray(items)) setEvents(items);
      })
      .catch((err) => {
        console.error("Failed to load events", err);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const filteredEvents = useMemo(() => {
    if (!search.trim()) return events;
    const q = search.toLowerCase().trim();
    return events.filter((evt) => {
      const titleKm = (evt.title_km || "").toLowerCase();
      const titleEn = (evt.title_en || "").toLowerCase();
      const locKm = (evt.location_name_km || evt.location || "").toLowerCase();
      const locEn = (evt.location_name_en || "").toLowerCase();
      const provKm = (evt.province?.name_km || "").toLowerCase();
      const provEn = (evt.province?.name_en || "").toLowerCase();
      return (
        titleKm.includes(q) ||
        titleEn.includes(q) ||
        locKm.includes(q) ||
        locEn.includes(q) ||
        provKm.includes(q) ||
        provEn.includes(q)
      );
    });
  }, [events, search]);

  return (
    <div className="stone-grain min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 pt-20 sm:pt-24 pb-20">
      <SEOHead
        title={km ? "ពិធីបុណ្យ និងព្រឹត្តិការណ៍វប្បធម៌ — CamGO" : "Cultural Festivals & Events — CamGO"}
        description={
          km
            ? "ស្វែងយល់ពីព្រឹត្តិការណ៍បុណ្យប្រពៃណីខ្មែរ រួមមាន ព្រះរាជពិធីបុណ្យអុំទូក បុណ្យចូលឆ្នាំថ្មី និងពិធីសាសនាបុរាណទូទាំងព្រះរាជាណាចក្រកម្ពុជា។"
            : "Experience traditional Khmer ceremonies, Water Festival regattas, Khmer New Year, and seasonal cultural gatherings."
        }
      />

      <PageContainer className="space-y-8 sm:space-y-10">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs
          items={[
            { label: km ? "ទំព័រដើម" : "Home", to: "/" },
            { label: km ? "ពិធីបុណ្យ & ព្រឹត្តិការណ៍" : "Festivals & Events" },
          ]}
        />

        {/* =================================================================== */}
        {/* 1. KHMER ARCHITECTURAL EVENTS HERO BANNER                           */}
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

          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
            {/* Left Column: Editorial Information */}
            <div className="lg:col-span-8 space-y-4">


              <h1 className="font-heading font-black text-3xl sm:text-5xl lg:text-6xl text-stone-950 dark:text-white leading-[1.12] tracking-tight">
                {km ? "ពិធីបុណ្យ និងព្រឹត្តិការណ៍វប្បធម៌ខ្មែរ" : "Festivals & Events in Cambodia"}
              </h1>

              <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 font-sans leading-relaxed max-w-2xl font-medium">
                {km
                  ? `ស្វែងយល់ពីព្រឹត្តិការណ៍បុណ្យប្រពៃណីខ្មែរចំនួន ${toKm(events.length)} ព្រឹត្តិការណ៍ រួមមាន ព្រះរាជពិធីបុណ្យអុំទូក បុណ្យចូលឆ្នាំថ្មី និងពិធីសាសនាបុរាណទូទាំងព្រះរាជាណាចក្រកម្ពុជា។`
                  : `Experience traditional Khmer ceremonies, Water Festival regattas, Angkor celebrations, and seasonal gatherings across the Kingdom of Cambodia.`}
              </p>
            </div>

            {/* Right Column: Split Metric Overview Cards */}
            <div className="lg:col-span-4 p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-stone-50/90 dark:bg-stone-800/80 border border-stone-200/90 dark:border-stone-700/80 space-y-4 shadow-sm backdrop-blur-xs">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-700">
                <span className="text-xs font-bold uppercase tracking-wider font-sans text-stone-600 dark:text-stone-400 font-khmer">
                  {km ? "ស្ថិតិប្រតិទិនជាតិ" : "Calendar Overview"}
                </span>

              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-700 shadow-2xs">
                  <div className="text-2xl sm:text-3xl font-black font-mono text-stone-900 dark:text-stone-100">
                    {toKm(events.length)}
                  </div>
                  <div className="text-xs text-stone-500 dark:text-stone-400 font-khmer font-bold mt-1">
                    {km ? "ពិធីបុណ្យជាតិ" : "Total Events"}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-700 shadow-2xs">
                  <div className="text-2xl sm:text-3xl font-black font-mono text-laterite-600 dark:text-amber-400">
                    {km ? "12 ខែ" : "12 Mo"}
                  </div>
                  <div className="text-xs text-stone-500 dark:text-stone-400 font-khmer font-bold mt-1">
                    {km ? "ប្រតិទិនប្រចាំឆ្នាំ" : "Annual Cycle"}
                  </div>
                </div>
              </div>
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
              placeholder={km ? "ស្វែងរកពិធីបុណ្យ ទីកន្លែង ឬខេត្ត..." : "Search festivals, venues, provinces..."}
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
              <Calendar className="w-3.5 h-3.5 text-laterite-600 dark:text-amber-400" />
              <span>
                {km
                  ? `បង្ហាញ ${toKm(filteredEvents.length)} នៃ ${toKm(events.length)} ពិធីបុណ្យ`
                  : `Showing ${filteredEvents.length} of ${events.length} events`}
              </span>
            </div>
          </div>
        </motion.div>

        {/* =================================================================== */}
        {/* 3. EVENTS GRID (Adaptive Real-Data Cards)                          */}
        {/* =================================================================== */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {[...Array(6)].map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="rounded-3xl p-8 sm:p-12 text-center space-y-4 bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 max-w-lg mx-auto shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-laterite-600/10 text-laterite-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-xl sm:text-2xl text-stone-900 dark:text-stone-100">
              {km ? "មិនទាន់មានពិធីបុណ្យត្រូវនឹងការស្វែងរកទេ" : "No events matching search query"}
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 font-sans">
              {km ? "សូមសាកល្បងស្វែងរកឈ្មោះពិធីបុណ្យ ឬខេត្តផ្សេងទៀត។" : "Please try searching with different keywords."}
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
            {filteredEvents.map((evt) => (
              <motion.div key={evt.id} variants={fadeInUp}>
                <EventCard event={evt} layout="vertical" className="h-full" />
              </motion.div>
            ))}
          </motion.div>
        )}
      </PageContainer>
    </div>
  );
};

export default EventsPage;
