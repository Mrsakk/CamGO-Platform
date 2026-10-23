import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, MessageSquare, Star, Trash2, Edit3, ArrowRight, Compass } from "lucide-react";
import { RatingStars } from "@/components/common/RatingStars";
import { ReviewModal } from "@/components/reviews/ReviewModal";
import { PageContainer } from "@/components/layout/PageContainer";
import { UserNavTabs } from "@/components/layout/UserNavTabs";
import { SEOHead } from "@/components/common/SEOHead";
import { RumduolFlower } from "@/components/common/RumduolMotifs";
import { reviewsApi } from "@/lib/api/reviews";
import { toast } from "@/store/toastStore";

const toKm = (n) => (n === null || n === undefined ? "0" : String(n));

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }
};

export const MyReviewsPage = () => {
  const { t, i18n } = useTranslation();
  const km = i18n.language === "km";
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingReview, setEditingReview] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const res = await reviewsApi.getMyReviews();
      const items = res.data?.items || res.data || [];
      if (Array.isArray(items)) {
        setReviews(items);
      }
    } catch {
      toast.error(km ? "បរាជ័យក្នុងការទាញយកការវាយតម្លៃរបស់អ្នក" : "Failed to load your reviews");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm(km ? "តើអ្នកពិតជាចង់លុបការវាយតម្លៃនេះមែនទេ?" : "Are you sure you want to delete this review?")) return;
    try {
      setReviews((prev) => prev.filter((r) => r.id !== id));
      await reviewsApi.delete(id);
      toast.success(km ? "បានលុបការវាយតម្លៃជោគជ័យ!" : "Review deleted successfully!");
    } catch {
      toast.error(km ? "បរាជ័យក្នុងការលុបការវាយតម្លៃ" : "Failed to delete review");
      fetchReviews();
    }
  };

  return (
    <div className="stone-grain pt-20 sm:pt-24 pb-20 space-y-8 font-sans text-stone-900 dark:text-stone-100 bg-stone-50 dark:bg-stone-950 min-h-screen">
      <SEOHead
        title={km ? "កំណត់ត្រាវាយតម្លៃរបស់ខ្ញុំ — CamGO" : "My Reviews — CamGO Travel"}
        description="View and manage your verified reviews and ratings across Cambodian destinations."
      />

      <PageContainer className="max-w-5xl space-y-6">
        {/* Navigation Tabs */}
        <UserNavTabs />

        {/* =================================================================== */}
        {/* 1. ANGKOR SANDSTONE MY REVIEWS HERO BANNER                          */}
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
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{km ? "បណ្ណសារមតិយោបល់ និងការវាយតម្លៃ" : "Feedback & Ratings"}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black text-stone-900 dark:text-stone-100 tracking-tight leading-tight">
                {km ? "កំណត់ត្រាវាយតម្លៃរបស់ខ្ញុំ" : "My Reviews"}
              </h1>

              <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 font-sans leading-relaxed">
                {km
                  ? "ការវាយតម្លៃ និងមតិយោបល់ផ្ទាល់ខ្លួនរបស់អ្នកដើម្បីជួយណែនាំអ្នកទេសចរដទៃទៀតក្នុងការរុករកកម្ពុជា។"
                  : "Your verified feedback and ratings guiding travelers across Cambodia."}
              </p>
            </div>

            {/* Counter Badge */}
            <div className="shrink-0 self-start md:self-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-stone-100 dark:bg-stone-800/80 text-stone-900 dark:text-stone-100 text-xs font-sans font-bold border border-stone-200 dark:border-stone-700 shadow-2xs">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>{km ? `សរុប ${toKm(reviews.length)} ការវាយតម្លៃ` : `Total ${reviews.length} Reviews`}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* =================================================================== */}
        {/* 2. REVIEWS LIST / SKELETON / EMPTY STATE                            */}
        {/* =================================================================== */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-32 rounded-3xl bg-stone-100 dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 animate-pulse"
              />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="relative rounded-3xl sm:rounded-[36px] p-8 sm:p-16 text-center space-y-5 bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 max-w-xl mx-auto shadow-sm overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto shadow-2xs">
              <MessageSquare className="w-8 h-8" />
            </div>

            <div className="relative z-10 space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-laterite-600/10 text-laterite-700 dark:text-laterite-400 text-xs font-bold font-sans uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{km ? "មិនទាន់មានការវាយតម្លៃ" : "No Reviews Yet"}</span>
              </div>
              <h3 className="font-heading font-black text-2xl sm:text-3xl text-stone-900 dark:text-stone-100 tracking-tight">
                {km ? "មិនទាន់មានការវាយតម្លៃនៅឡើយទេ" : "No Reviews Written Yet"}
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 max-w-md mx-auto leading-relaxed font-sans">
                {km
                  ? "តើអ្នកធ្លាប់បានទៅទស្សនាប្រាសាទបុរាណ ឬកោះត្រូពិកដែរឬទេ? ចែករំលែកបទពិសោធន៍របស់អ្នកនៅទីនេះដើម្បីជួយអ្នកទេសចរដទៃទៀត។"
                  : "Visited a Cambodian destination or heritage monument? Share your feedback to assist fellow travelers."}
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
            </div>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {reviews.map((rev) => {
                const dest = rev.destination;
                const destName = km && dest?.name_km ? dest.name_km : dest?.name_en;
                return (
                  <motion.div
                    key={rev.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-7 border border-stone-200/90 dark:border-stone-800 shadow-sm hover:shadow-md transition-all space-y-4 relative"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100 dark:border-stone-800">
                      <div>
                        {dest ? (
                          <Link
                            to={`/destinations/${dest.slug}`}
                            className="font-heading font-black text-lg sm:text-xl text-stone-900 dark:text-stone-100 hover:text-laterite-600 dark:hover:text-laterite-400 transition-colors"
                          >
                            {destName}
                          </Link>
                        ) : (
                          <span className="font-heading font-black text-lg sm:text-xl text-stone-900 dark:text-stone-100">
                            {destName || "Destination"}
                          </span>
                        )}
                        <span className="text-xs font-sans text-stone-500 dark:text-stone-400 block mt-0.5">
                          {rev.created_at?.substring(0, 10)}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 self-start sm:self-auto">
                        <RatingStars rating={rev.rating} size="sm" />

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingReview(rev);
                              setModalOpen(true);
                            }}
                            className="w-9 h-9 rounded-2xl text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer flex items-center justify-center border border-stone-200 dark:border-stone-700"
                            title="Edit Review"
                            aria-label="Edit review"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(rev.id)}
                            className="w-9 h-9 rounded-2xl text-stone-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer flex items-center justify-center border border-stone-200 dark:border-stone-700"
                            title="Delete Review"
                            aria-label="Delete review"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm sm:text-base text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-line font-sans">
                      {rev.comment}
                    </p>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Edit Review Modal */}
        <ReviewModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditingReview(null);
          }}
          destinationId={editingReview?.destination_id}
          existingReview={editingReview}
          onSuccess={fetchReviews}
        />
      </PageContainer>
    </div>
  );
};

export default MyReviewsPage;
