import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Star,
  Send,
  Sparkles,
  MapPin,
  Compass,
  CheckCircle2,
  Heart,
  Loader2,
  Quote
} from "lucide-react";
import { contentApi } from "@/lib/api/content";
import { useAuthStore } from "@/store/authStore";
import { toast } from "@/store/toastStore";
import { RumduolFlower } from "@/components/common/RumduolMotifs";

export const WebsiteReviewModal = ({ isOpen, onClose, onSuccess }) => {
  const { t, i18n } = useTranslation();
  const km = i18n.language === "km";
  const { user, isAuthenticated } = useAuthStore();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState("");
  const [role, setRole] = useState("Heritage Explorer");
  const [location, setLocation] = useState("");
  const [quote, setQuote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Pre-fill user details if logged in
  useEffect(() => {
    if (isOpen) {
      if (isAuthenticated && user) {
        setName(user.name || "");
        if (user.country || user.city) {
          setLocation([user.city, user.country].filter(Boolean).join(", "));
        }
      }
      setError(null);
    }
  }, [isOpen, isAuthenticated, user]);

  if (!isOpen) return null;

  const roleSuggestions = [
    { en: "Heritage Explorer", km: "អ្នករុករកបេតិកភណ្ឌ" },
    { en: "Solo Backpacker", km: "អ្នកទេសចរទោល" },
    { en: "Cultural Anthropologist", km: "អ្នកស្រាវជ្រាវវប្បធម៌" },
    { en: "Travel Photographer", km: "ជាងថតរូបទេសចរណ៍" },
    { en: "Eco Adventurer", km: "អ្នកផ្សងព្រេងអេកូទេសចរណ៍" }
  ];

  const ratingDescriptions = {
    5: km ? "ល្អឥតខ្ចោះ • Exceptional Website" : "Exceptional Website (5/5)",
    4: km ? "ល្អណាស់ • Very Good Experience" : "Very Good Experience (4/5)",
    3: km ? "ល្អបង្គួរ • Good Experience" : "Good Experience (3/5)",
    2: km ? "មធ្យម • Fair Experience" : "Fair Experience (2/5)",
    1: km ? "ត្រូវកែលម្អ • Needs Improvement" : "Needs Improvement (1/5)"
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError(km ? "សូមបញ្ចូលឈ្មោះរបស់អ្នក" : "Please provide your name");
      return;
    }
    if (!quote.trim() || quote.trim().length < 5) {
      setError(km ? "សូមចែករំលែកមតិយោបល់យ៉ាងតិច ៥ តួអក្សរ" : "Please share your website experience (min 5 characters)");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const payload = {
        name: name.trim(),
        role: role.trim() || (km ? "អ្នករុករក" : "Explorer"),
        location: location.trim() || (km ? "កម្ពុជា" : "Cambodia"),
        trip: "Website Review",
        rating,
        quote: quote.trim(),
        quote_km: quote.trim()
      };

      await contentApi.submitTestimonial(payload);

      toast.success(
        km
          ? "អរគុណសម្រាប់ការវាយតម្លៃគេហទំព័រ! មតិរបស់អ្នកត្រូវបានបញ្ជូនដើម្បីពិនិត្យ និងបង្ហាញនៅលើទំព័រដើម។"
          : "Thank you for your website review! Your feedback was submitted for moderation and will appear on the homepage."
      );

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        (km ? "មានបញ្ហាក្នុងការបញ្ជូនការវាយតម្លៃ" : "Failed to submit website review");
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-stone-950/75 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-lg my-auto rounded-3xl sm:rounded-[36px] bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-2xl p-6 sm:p-8 text-stone-900 dark:text-stone-100 overflow-hidden"
        >
          {/* Ambient Glows */}
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-laterite-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Rotating Rumduol watermark */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
            className="absolute -right-12 -top-12 opacity-[0.04] dark:opacity-[0.03] pointer-events-none select-none"
          >
            <RumduolFlower size={260} className="text-laterite-600" />
          </motion.div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="space-y-2 mb-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-laterite-600/10 dark:bg-laterite-500/15 border border-laterite-600/20 text-xs font-bold text-laterite-700 dark:text-laterite-300 uppercase tracking-wider font-sans">
              <Sparkles className="w-3.5 h-3.5 text-laterite-600" />
              <span>{km ? "ការវាយតម្លៃគេហទំព័រ" : "Website Review"}</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-stone-900 dark:text-stone-100">
              {km ? "វាយតម្លៃគេហទំព័រ និងបទពិសោធន៍" : "Review Website & Platform"}
            </h3>

            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-sans leading-relaxed">
              {km
                ? "ចែករំលែកចំណាប់អារម្មណ៍ និងមតិយោបល់របស់អ្នកអំពីការប្រើប្រាស់គេហទំព័រCamGO។"
                : "Share your feedback and experience using the CamGO website platform."}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-xs font-medium text-red-600 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Review Form */}
          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            {/* Interactive Star Rating */}
            <div className="p-4 rounded-2xl bg-stone-50/90 dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700/80 text-center space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block">
                {km ? "ពិន្ទុវាយតម្លៃរបស់អ្នក" : "Your Rating"}
              </span>

              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = (hoverRating || rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 cursor-pointer transition-transform hover:scale-120 active:scale-95 focus:outline-hidden"
                    >
                      <Star
                        className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${isFilled
                          ? "fill-amber-400 text-amber-400 drop-shadow-xs"
                          : "text-stone-300 dark:text-stone-600"
                          }`}
                      />
                    </button>
                  );
                })}
              </div>

              <p className="text-xs font-bold text-amber-600 dark:text-amber-400">
                {ratingDescriptions[hoverRating || rating]}
              </p>
            </div>

            {/* Name & Location Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider block">
                  {km ? "ឈ្មោះរបស់អ្នក" : "Your Name"} <span className="text-laterite-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={km ? "ឧ. សេង ចិន្តា" : "e.g. Chenda Seng"}
                  className="w-full h-11 px-3.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm font-sans focus:outline-hidden focus:border-laterite-600 focus:ring-2 focus:ring-laterite-600/20"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider block">
                  {km ? "ទីកន្លែង / ប្រទេស" : "Location / Country"}
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={km ? "ឧ. ភ្នំពេញ, កម្ពុជា" : "e.g. Phnom Penh, Cambodia"}
                  className="w-full h-11 px-3.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm font-sans focus:outline-hidden focus:border-laterite-600 focus:ring-2 focus:ring-laterite-600/20"
                />
              </div>
            </div>




            {/* Review Comment / Quote Textarea */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider block">
                {km ? "មតិយោបល់ និងការវាយតម្លៃគេហទំព័រ" : "Your Website Review & Feedback"}{" "}
                <span className="text-laterite-600">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                placeholder={
                  km
                    ? "តើអ្នកចូលចិត្តអ្វីខ្លះអំពីគេហទំព័រនេះ? តើផែនទី កាលវិភាគ ឬព័ត៌មានបេតិកភណ្ឌបានជួយអ្នកដូចម្តេចខ្លះ?"
                    : "What did you love most about this website? How did the interactive maps, trip planner, or verified registry help you?"
                }
                className="w-full p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm font-sans focus:outline-hidden focus:border-laterite-600 focus:ring-2 focus:ring-laterite-600/20 leading-relaxed"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="min-h-[44px] px-5 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                {km ? "បោះបង់" : "Cancel"}
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="min-h-[44px] px-6 rounded-2xl bg-laterite-600 hover:bg-laterite-700 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-laterite-600/20 transition-all cursor-pointer active:scale-95 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{km ? "កំពុងបញ្ជូន..." : "Submitting..."}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{km ? "បញ្ជូនការវាយតម្លៃ" : "Submit Review"}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};

export default WebsiteReviewModal;
