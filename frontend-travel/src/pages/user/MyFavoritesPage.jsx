import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Sparkles,
  Heart,
  Compass,
  ArrowRight,
  RotateCcw,
  AlertCircle,
  MapPin,
  Calendar
} from "lucide-react";
import { DestinationCard } from "@/components/destinations/DestinationCard";
import { DestinationCardSkeleton } from "@/components/common/ShimmerSkeleton";
import { PageContainer } from "@/components/layout/PageContainer";
import { UserNavTabs } from "@/components/layout/UserNavTabs";
import { useFavoriteStore } from "@/store/favoriteStore";
import { useAuthStore } from "@/store/authStore";
import { favoritesApi } from "@/lib/api/favorites";
import { toast } from "@/store/toastStore";
import { SEOHead } from "@/components/common/SEOHead";
import { RumduolFlower } from "@/components/common/RumduolMotifs";

const toKm = (n) => (n === null || n === undefined ? "0" : String(n));

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

export const MyFavoritesPage = () => {
  const { t, i18n } = useTranslation();
  const km = i18n.language === "km";
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { favoritedIds } = useFavoriteStore();
  const [destinations, setDestinations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const fetchFavorites = async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      const res = await favoritesApi.getAll();

      let items = [];
      if (Array.isArray(res?.data)) {
        items = res.data;
      } else if (Array.isArray(res?.data?.items)) {
        items = res.data.items;
      } else if (Array.isArray(res?.items)) {
        items = res.items;
      } else if (Array.isArray(res)) {
        items = res;
      }

      setDestinations(items);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }
      setHasError(true);
      toast.error(km ? "បរាជ័យក្នុងការទាញយកបញ្ជីដែលបានរក្សាទុក" : "Failed to load saved itinerary");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    }
  }, [isAuthenticated]);

  const visibleDestinations = destinations.filter((d) =>
    favoritedIds.length === 0 ? true : favoritedIds.includes(d.id)
  );

  return (
    <div className="stone-grain pt-20 sm:pt-24 pb-20 space-y-8 font-sans text-stone-900 dark:text-stone-100 bg-stone-50 dark:bg-stone-950 min-h-screen">
      <SEOHead
        title={km ? "គោលដៅទេសចរណ៍ដែលបានរក្សាទុក — CamGO" : "Saved Destinations — CamGO Travel"}
        description="Your curated list of saved Cambodian heritage sanctuaries, temples, and expedition highlights."
      />

      <PageContainer className="space-y-6">
        {/* Navigation Tabs */}
        <UserNavTabs />

        {/* =================================================================== */}
        {/* 1. ANGKOR SANDSTONE FAVORITES HERO BANNER                           */}
        {/* =================================================================== */}
        <motion.div
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

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-laterite-600/10 dark:bg-laterite-500/15 border border-laterite-600/20 text-xs font-bold text-laterite-700 dark:text-laterite-300 font-sans tracking-wide uppercase">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                <span>{km ? "បណ្ណសាររមណីយដ្ឋានដែលបានរក្សាទុក" : "Saved Expeditions"}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black text-stone-900 dark:text-stone-100 tracking-tight leading-tight">
                {km ? "គោលដៅទេសចរណ៍ដែលបានរក្សាទុក" : "Saved Destinations"}
              </h1>

              <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 font-sans leading-relaxed">
                {km
                  ? "រតនសម្បត្តិបេតិកភណ្ឌ និងទីតាំងទេសចរណ៍ដែលអ្នកបានចំណាំទុកសម្រាប់ដំណើរកម្សាន្តទៅមុខ។ អាចរៀបចំចូលក្នុងកាលវិភាគ ឬទស្សនាលើផែនទីបានភ្លាមៗ។"
                  : "Heritage sanctuaries and attractions bookmarked for your upcoming Cambodian journeys. Ready to schedule into your itinerary or view on the interactive map."}
              </p>
            </div>

            {/* Quick Actions & Counter Badge */}
            <div className="flex flex-wrap items-center gap-3 shrink-0 self-start md:self-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-stone-100 dark:bg-stone-800/80 text-stone-900 dark:text-stone-100 text-xs font-sans font-bold border border-stone-200 dark:border-stone-700 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span>{km ? `សរុប ${toKm(visibleDestinations.length)} ទីតាំង` : `Total ${visibleDestinations.length} Saved`}</span>
              </div>

              {visibleDestinations.length > 0 && (
                <Link
                  to="/trip-planner"
                  className="min-h-[40px] px-4 rounded-2xl bg-laterite-600 hover:bg-laterite-700 text-white text-xs font-sans font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{km ? "រៀបចំកាលវិភាគ" : "Trip Planner"}</span>
                </Link>
              )}
            </div>
          </div>
        </motion.div>

        {/* =================================================================== */}
        {/* 2. GRID / EMPTY STATE / ERROR STATE                                 */}
        {/* =================================================================== */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <DestinationCardSkeleton key={i} />
            ))}
          </div>
        ) : hasError ? (
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="rounded-3xl sm:rounded-[36px] p-8 sm:p-14 text-center space-y-4 bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 max-w-lg mx-auto shadow-sm"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-black text-xl sm:text-2xl text-stone-900 dark:text-stone-100">
              {km ? "មិនអាចទាញយកទិន្នន័យបានទេ" : "Failed to load saved places"}
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 font-sans">
              {km ? "សូមព្យាយាមម្តងទៀតនៅពេលក្រោយ។" : "Unable to retrieve your saved itinerary at this moment."}
            </p>
            <button
              type="button"
              onClick={fetchFavorites}
              className="inline-flex items-center gap-2 min-h-[42px] px-6 rounded-2xl bg-laterite-600 hover:bg-laterite-700 text-white text-xs font-sans font-bold uppercase tracking-wider cursor-pointer shadow-sm transition-all active:scale-[0.98]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{km ? "ព្យាយាមម្តងទៀត" : "Try Again"}</span>
            </button>
          </motion.div>
        ) : visibleDestinations.length === 0 ? (
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="relative rounded-3xl sm:rounded-[36px] p-8 sm:p-16 text-center space-y-5 bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 max-w-xl mx-auto shadow-sm overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 w-16 h-16 rounded-3xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto shadow-2xs">
              <Heart className="w-8 h-8" />
            </div>

            <div className="relative z-10 space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-laterite-600/10 text-laterite-700 dark:text-laterite-400 text-xs font-bold font-sans uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{km ? "មិនទាន់មានទីតាំងរក្សាទុក" : "No Saved Sights"}</span>
              </div>
              <h3 className="font-heading font-black text-2xl sm:text-3xl text-stone-900 dark:text-stone-100 tracking-tight">
                {km ? "មិនទាន់មានទីតាំងរក្សាទុកនៅឡើយទេ" : "Your Wishlist is Empty"}
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 max-w-md mx-auto leading-relaxed font-sans">
                {km
                  ? "សូមស្វែងរកគោលដៅទេសចរណ៍ និងចុចលើប៊ូតុងបេះដូងនៅលើកាតរមណីយដ្ឋាន ដើម្បីប្រមូលទុកក្នុងបញ្ជីរបស់អ្នក។"
                  : "Explore Cambodian sights and tap the heart icon on any destination card to bookmark them here."}
              </p>
            </div>

            <div className="relative z-10 pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/destinations"
                className="inline-flex items-center gap-2 min-h-[44px] px-6 rounded-2xl bg-laterite-600 hover:bg-laterite-700 text-white text-xs font-sans font-bold uppercase tracking-wider shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
              >
                <Compass className="w-4 h-4" />
                <span>{km ? "រុករកគោលដៅទេសចរណ៍" : "Explore Destinations"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/map"
                className="inline-flex items-center gap-2 min-h-[44px] px-5 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-sans font-bold uppercase tracking-wider border border-stone-200 dark:border-stone-700 transition-all"
              >
                <MapPin className="w-4 h-4" />
                <span>{km ? "បើកផែនទី" : "View Map"}</span>
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {visibleDestinations.map((dest) => (
              <motion.div key={dest.id} variants={fadeInUp}>
                <DestinationCard destination={dest} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </PageContainer>
    </div>
  );
};

export default MyFavoritesPage;
