import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Star, Sparkles, MessageSquareHeart } from "lucide-react";

export const FloatingReviewButton = ({ onClick }) => {
  const { i18n } = useTranslation();
  const km = i18n.language === "km";

  return (
    <aside aria-label="Review Website" className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40">
      <motion.button
        type="button"
        onClick={onClick}
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="group relative flex items-center gap-2.5 px-4 py-3 sm:px-5 sm:py-3.5 rounded-full bg-laterite-600 hover:bg-laterite-700 text-white font-sans font-bold text-xs sm:text-sm shadow-xl shadow-laterite-600/30 hover:shadow-2xl hover:shadow-laterite-600/40 border border-white/20 backdrop-blur-md cursor-pointer transition-colors"
        title={km ? "ចែករំលែកបទពិសោធន៍របស់អ្នកអំពីគេហទំព័រនេះ" : "Share your experience on this website"}
      >
        {/* Subtle Ambient Pulse Ring */}
        <span className="absolute -inset-1 rounded-full bg-laterite-500/30 animate-pulse pointer-events-none" />

        {/* Floating Stars / Sparkles Icon */}
        <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-white/20 text-amber-300">
          <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
        </div>

        {/* Label */}
        <span className="font-heading tracking-wide">
          {km ? "វាយតម្លៃគេហទំព័រ" : "Review Website"}
        </span>

        {/* Heart / Sparkle Mini Badge */}
        <Sparkles className="w-3.5 h-3.5 text-amber-300 group-hover:rotate-12 transition-transform" />
      </motion.button>
    </aside>
  );
};

export default FloatingReviewButton;
