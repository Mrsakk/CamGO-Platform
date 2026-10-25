import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  MapPin,
  Star,
  Clock,
  Compass,
  ArrowRight,
  Heart,
  Calendar,
  Ticket
} from "lucide-react";
import { useFavoriteStore } from "@/store/favoriteStore";
import { useAuthStore } from "@/store/authStore";
import { toast } from "@/store/toastStore";
import LintelFrame from "@/components/sandstone/LintelFrame";
import { getImageUrl } from "@/lib/utils";

export const DestinationQuickViewModal = ({ destination, isOpen, onClose }) => {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const modalRef = useRef(null);
  const { isAuthenticated } = useAuthStore();
  const { isFavorite, toggleFavorite } = useFavoriteStore();

  // Close on Escape key and lock background scroll
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!destination) return null;

  const isFav = isFavorite(destination.id);

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.info(t("auth.login_required", "Please log in to save favorites"));
      navigate("/login");
      return;
    }
    await toggleFavorite(destination.id);
  };

  const name = i18n.language === "km" && destination.name_km ? destination.name_km : destination.name_en;
  const secondaryName = i18n.language === "km" ? destination.name_en : destination.name_km;
  const provinceName = destination.province
    ? i18n.language === "km" && destination.province.name_km
      ? destination.province.name_km
      : destination.province.name_en
    : null;
  const categoryName = destination.category
    ? i18n.language === "km" && destination.category.name_km
      ? destination.category.name_km
      : destination.category.name_en
    : null;
  const coverImage = getImageUrl(
    destination.cover_image || destination.primary_image?.image_url,
    "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80"
  );

  const ratingScore = Number(destination.rating_avg ?? destination.avg_rating ?? 5.0);
  const reviewsCount = destination.rating_count ?? destination.reviews_count ?? 4;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 pointer-events-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-950/75 backdrop-blur-sm"
          />

          {/* Stepped Lintel Framed Modal with Corner Ornaments */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative w-full sm:max-w-2xl lg:max-w-3xl z-10 max-h-[90vh] flex flex-col"
          >
            <LintelFrame withCorners={true} className="w-full overflow-hidden">
              <div className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 overflow-y-auto max-h-[85vh]">
                {/* Close Button (44px tap target) */}
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close modal"
                  className="absolute top-3 right-3 z-30 w-11 h-11 rounded-control bg-stone-100/90 dark:bg-stone-800/90 text-stone-700 dark:text-stone-200 border border-stone-300 dark:border-stone-700 flex items-center justify-center shadow-raise cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Photo & Quick Info Deck */}
                <div className="relative aspect-[16/9] w-full bg-stone-950">
                  <img
                    src={coverImage}
                    alt={name}
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80";
                    }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent" />

                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    {categoryName && (
                      <span className="px-2.5 py-0.5 rounded-control bg-stone-900/80 text-white text-small font-semibold mb-1 inline-block">
                        {categoryName}
                      </span>
                    )}
                    <h2 className="text-heading font-bold">{name}</h2>
                    {secondaryName && <p className="text-small text-stone-300">{secondaryName}</p>}
                  </div>
                </div>

                {/* Facts & Description */}
                <div className="p-4 sm:p-6 space-y-4">
                  {/* Facts Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {provinceName && (
                      <div className="p-2.5 rounded-control bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700/60">
                        <span className="text-small text-stone-500 dark:text-stone-400 block leading-tight">
                          {i18n.language === "km" ? "ទីតាំង" : "Location"}
                        </span>
                        <span className="text-body font-semibold truncate block mt-0.5">
                          {provinceName}
                        </span>
                      </div>
                    )}

                    <div className="p-2.5 rounded-control bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700/60">
                      <span className="text-small text-stone-500 dark:text-stone-400 block leading-tight">
                        {i18n.language === "km" ? "ការវាយតម្លៃ" : "Rating"}
                      </span>
                      <div className="flex items-center gap-1 mt-0.5 font-semibold text-body">
                        <Star className="w-4 h-4 fill-gold-500 text-gold-500" />
                        <span>{ratingScore.toFixed(1)}</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-control bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700/60">
                      <span className="text-small text-stone-500 dark:text-stone-400 block leading-tight">
                        {i18n.language === "km" ? "ម៉ោងបើក" : "Hours"}
                      </span>
                      <span className="text-body font-semibold block mt-0.5">
                        {destination.opening_hours || (i18n.language === "km" ? "7:00 - 17:00" : "7:00 AM - 5:00 PM")}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-control bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700/60">
                      <span className="text-small text-stone-500 dark:text-stone-400 block leading-tight">
                        {i18n.language === "km" ? "តម្លៃសំបុត្រ" : "Fee"}
                      </span>
                      <span className="text-body font-semibold block mt-0.5">
                        {destination.entry_fee || (i18n.language === "km" ? "ឥតគិតថ្លៃ" : "Free Entry")}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-body text-stone-700 dark:text-stone-300 line-clamp-3 leading-relaxed">
                    {i18n.language === "km" && destination.description_km
                      ? destination.description_km
                      : destination.description_en || destination.short_description || ""}
                  </p>

                  {/* Modal Action Bar (One Primary Button) */}
                  <div className="pt-2 flex items-center justify-between gap-3 border-t border-stone-200 dark:border-stone-800">
                    <button
                      type="button"
                      onClick={handleFavoriteClick}
                      className={`btn-secondary min-h-[44px] px-4 text-small transition-all ${
                        isFav ? "border-red-500/50 text-red-600 dark:text-red-400 bg-red-500/10 shadow-xs" : ""
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isFav ? "fill-red-500 text-red-500 scale-110" : "text-stone-500 hover:text-red-500"
                        }`}
                      />
                      <span>
                        {isFav
                          ? i18n.language === "km" ? "បានរក្សាទុក" : "Saved"
                          : i18n.language === "km" ? "រក្សាទុក" : "Save"}
                      </span>
                    </button>

                    <Link
                      to={`/destinations/${destination.slug}`}
                      onClick={onClose}
                      className="btn-primary min-h-[44px] flex-1 text-center"
                    >
                      <span>{i18n.language === "km" ? "មើលព័ត៌មានលម្អិតទាំងអស់" : "View Full Details"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </LintelFrame>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return typeof document !== "undefined" ? createPortal(modalContent, document.body) : null;
};
