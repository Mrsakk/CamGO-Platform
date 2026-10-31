import { useNavigate } from "react-router-dom";
import { PrefetchLink } from "@/components/common/PrefetchLink";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Heart, MapPin, ArrowRight, Star, Eye, Tag, Sparkles } from "lucide-react";
import { useFavoriteStore } from "@/store/favoriteStore";
import { useAuthStore } from "@/store/authStore";
import { toast } from "@/store/toastStore";
import { getImageUrl } from "@/lib/utils";

import { queryClient } from "@/lib/queryClient";
import { destinationsApi } from "@/lib/api/destinations";

const prefetchDestinationChunk = () => import("@/pages/public/DestinationDetailPage");

/**
 * DestinationCard - Premium Cultural & Architectural Travel Card
 * - Adaptive Split-Screen & Multi-Column Grid Support
 * - Frosted Glass Badges (Category, Rating, Free/Fee tag)
 * - Interactive Wishlist Heart with Ambient Red Glow
 * - Elevated hover physics & animated terracotta/amber beam
 */
export const DestinationCard = ({
  destination,
  onQuickView,
  layout = "adaptive", // "adaptive" | "horizontal" | "vertical"
  className = ""
}) => {
  const { i18n, t } = useTranslation();
  const km = i18n.language === "km";
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { isFavorite, toggleFavorite } = useFavoriteStore();
  const isFav = destination?.id ? isFavorite(destination.id) : false;

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.info(t("auth.login_required", "Please log in to save favorites"));
      navigate("/login");
      return;
    }
    if (destination?.id) {
      await toggleFavorite(destination.id);
    }
  };

  const handlePrefetch = () => {
    if (destination?.slug) {
      queryClient.prefetchQuery({
        queryKey: ["destination", destination.slug],
        queryFn: () => destinationsApi.getBySlug(destination.slug),
        staleTime: 1000 * 60 * 5,
      });
    }
  };

  if (!destination) return null;

  const name = km && destination.name_km ? destination.name_km : (destination.name_en || destination.name_km || "");
  const secondaryName = km ? destination.name_en : destination.name_km;
  const provinceName = destination.province
    ? km && destination.province.name_km
      ? destination.province.name_km
      : destination.province.name_en
    : null;
  const categoryName = destination.category
    ? km && destination.category.name_km
      ? destination.category.name_km
      : destination.category.name_en
    : null;
  const coverImage = getImageUrl(
    destination.cover_image || destination.primary_image?.image_url,
    "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80"
  );

  const ratingScore = Number(destination.rating_avg ?? destination.avg_rating ?? 0);
  const reviewsCount = destination.rating_count ?? destination.reviews_count ?? 0;

  // Short excerpt
  const excerpt =
    (km && destination.short_description_km ? destination.short_description_km : destination.short_description_en) ||
    (km && destination.excerpt_km ? destination.excerpt_km : destination.excerpt_en) ||
    (destination.description_km && km ? destination.description_km.slice(0, 100) : destination.description_en?.slice(0, 100));

  // Split-screen responsive layout classes
  const isHorizontalOnly = layout === "horizontal";
  const isVerticalOnly = layout === "vertical";

  const containerClasses = isHorizontalOnly
    ? "flex flex-row"
    : isVerticalOnly
      ? "flex flex-col"
      : "flex flex-col max-sm:flex-row"; // Adaptive: Horizontal on mobile single-column, Vertical in multi-column grids

  const mediaClasses = isHorizontalOnly
    ? "w-2/5 sm:w-5/12 shrink-0 aspect-auto min-h-[170px] border-r border-stone-200/90 dark:border-stone-800"
    : isVerticalOnly
      ? "w-full aspect-[4/3] border-b border-stone-200/90 dark:border-stone-800"
      : "max-sm:w-[42%] max-sm:shrink-0 max-sm:aspect-auto max-sm:min-h-[160px] max-sm:border-r w-full sm:aspect-[4/3] sm:border-b border-stone-200/90 dark:border-stone-800";

  return (
    <motion.div
      className="h-full"
      whileHover={{ y: -4, scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: "spring", stiffness: 340, damping: 22 }}
    >
      <PrefetchLink
        to={`/destinations/${destination.slug}`}
        prefetchData={handlePrefetch}
        prefetchChunk={prefetchDestinationChunk}
        prefetchOnView={true}
        className={`group rounded-2xl sm:rounded-3xl overflow-hidden h-full bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800/90 shadow-2xs hover:shadow-xl hover:shadow-stone-950/10 dark:hover:shadow-black/50 hover:-translate-y-1.5 hover:border-laterite-500/40 dark:hover:border-laterite-500/40 transition-all duration-300 select-none flex flex-col justify-between ${containerClasses} ${className}`}
      >
        {/* =================================================================== */}
        {/* PANE 1: VISUAL MEDIA SCREEN                                         */}
        {/* =================================================================== */}
        <div className={`relative overflow-hidden bg-stone-200 dark:bg-stone-800 ${mediaClasses}`}>
          <img
            src={coverImage}
            alt={name}
            loading="lazy"
            decoding="async"
            width="400"
            height="300"
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80";
            }}
          />

          {/* Cinematic Scrim Overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950/60 via-stone-950/15 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/75 via-transparent to-transparent pointer-events-none" />

          {/* Floating Category Pill (Top-Left) */}
          {categoryName && (
            <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-stone-950/70 dark:bg-stone-900/80 text-white text-[10px] sm:text-[11px] font-semibold backdrop-blur-md border border-white/20 shadow-xs pointer-events-none font-khmer flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-amber-300" />
              <span>{categoryName}</span>
            </span>
          )}

          {/* Floating Favorite Button (Top-Right) */}
          <button
            type="button"
            onClick={handleFavoriteClick}
            aria-label={isFav ? "Remove from saved" : "Save destination"}
            className={`absolute top-2.5 right-2.5 w-8 h-8 sm:w-8.5 sm:h-8.5 flex items-center justify-center rounded-full bg-stone-950/70 hover:bg-stone-950/90 text-white border ${isFav ? "border-red-500/60 shadow-xs shadow-red-500/30" : "border-white/20"
              } backdrop-blur-md transition-all active:scale-90 hover:scale-110 cursor-pointer z-10 shadow-xs`}
          >
            <Heart
              className={`w-4 h-4 transition-all duration-200 ${isFav
                ? "fill-red-500 text-red-500 scale-110 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]"
                : "text-stone-200 hover:text-red-400"
                }`}
            />
          </button>


          {/* Admission Fee Tag (Bottom-Right of Media) */}
          {(destination.is_free || destination.entrance_fee_usd) && (
            <div className="absolute bottom-2.5 right-2.5 z-10">
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-md border shadow-xs pointer-events-none font-khmer ${destination.is_free
                  ? "bg-emerald-950/75 text-emerald-300 border-emerald-500/30"
                  : "bg-stone-950/75 text-amber-300 border-amber-500/30"
                  }`}
              >
                {destination.is_free
                  ? km
                    ? "ឥតគិតថ្លៃ"
                    : "Free"
                  : `$${destination.entrance_fee_usd}`}
              </span>
            </div>
          )}

          {/* Quick View Button on Hover */}
          {onQuickView && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView(destination);
              }}
              aria-label="Quick View"
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute inset-0 m-auto w-fit h-fit px-3.5 py-1.5 rounded-full bg-stone-950/90 text-white text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md border border-white/25 shadow-lg z-20 cursor-pointer pointer-events-auto hover:bg-laterite-600 hover:border-laterite-500"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="font-khmer">{km ? "មើលរហ័ស" : "Quick View"}</span>
            </button>
          )}
        </div>

        {/* =================================================================== */}
        {/* PANE 2: MINIMALIST EDITORIAL CONTENT SCREEN                         */}
        {/* =================================================================== */}
        <div className="p-5 sm:p-5.5 flex flex-col justify-between flex-1 min-w-0">
          <div className="space-y-2">
            {/* Province Location Pin */}
            {provinceName && (
              <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 font-medium font-khmer">
                <MapPin className="w-3.5 h-3.5 text-laterite-600 dark:text-laterite-400 shrink-0" />
                <span className="truncate">{provinceName}</span>
              </div>
            )}

            {/* Destination Title */}
            <h3 className="font-heading font-black text-base sm:text-lg text-stone-950 dark:text-white line-clamp-1 group-hover:text-laterite-600 dark:group-hover:text-amber-400 transition-colors leading-snug">
              {name}
            </h3>

            {/* Secondary Bilingual Title */}
            {secondaryName && (
              <p className="text-xs text-stone-500 dark:text-stone-400 truncate font-sans leading-none">
                {secondaryName}
              </p>
            )}

            {/* Excerpt preview if available */}
            {excerpt && (
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 font-sans line-clamp-2 leading-relaxed pt-1">
                {excerpt}
              </p>
            )}
          </div>

          {/* Bottom Action Divider & Interactive Circle Button */}
          <div className="pt-3.5 mt-3.5 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-xs sm:text-sm font-bold text-laterite-600 dark:text-laterite-400">
            <span className="truncate font-khmer group-hover:text-laterite-700 dark:group-hover:text-amber-400 transition-colors">
              {km ? "មើលព័ត៌មានលម្អិត" : "View Details"}
            </span>
            <div className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 group-hover:bg-laterite-600 group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-2xs group-hover:translate-x-1 shrink-0">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </PrefetchLink>
    </motion.div>
  );
};


export default DestinationCard;
