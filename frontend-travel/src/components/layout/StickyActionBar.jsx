import { Heart, Share2, Navigation, Calendar } from "lucide-react";

/**
 * StickyActionBar Component - Angkor Sandstone & Bas-Relief
 * Mobile thumb-zone action bar on detail screens:
 * - Exactly 1 primary Laterite action button
 * - Outlined stone secondary buttons (Share, Route, Plan)
 * - 44px minimum tap targets
 * - Respects safe area bottom inset
 */
export const StickyActionBar = ({
  isSaved,
  onSave,
  saveLabel = "Save",
  savedLabel = "Saved",
  onShare,
  shareLabel = "Share",
  onAddToPlan,
  planLabel = "Plan",
  directionsUrl,
  directionsLabel = "Route"
}) => {
  return (
    <div className="lg:hidden fixed bottom-[calc(56px+env(safe-area-inset-bottom,0px))] left-0 right-0 z-40 bg-stone-100/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-stone-300 dark:border-stone-800 px-4 py-2.5 shadow-raise">
      <div className="flex items-center gap-2 max-w-md mx-auto">
        {/* Primary Action Button: Save to Favorites */}
        <button
          type="button"
          onClick={onSave}
          aria-label={isSaved ? savedLabel : saveLabel}
          className={`flex-1 min-h-[44px] text-body rounded-xl font-semibold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
            isSaved
              ? "bg-red-500/15 border-red-500/50 text-red-600 dark:text-red-400"
              : "btn-primary"
          }`}
        >
          <Heart className={`w-4 h-4 transition-transform ${isSaved ? "fill-red-500 text-red-500 scale-110" : ""}`} />
          <span className="truncate">{isSaved ? savedLabel : saveLabel}</span>
        </button>

        {/* Add to Plan Button (Secondary Stone) */}
        {onAddToPlan && (
          <button
            type="button"
            onClick={onAddToPlan}
            aria-label={planLabel}
            className="btn-secondary min-h-[44px] min-w-[44px] px-3 text-stone-700 hover:text-stone-900"
          >
            <Calendar className="w-4 h-4" />
          </button>
        )}

        {/* Share Button (Secondary Stone) */}
        <button
          type="button"
          onClick={onShare}
          aria-label={shareLabel}
          className="btn-secondary min-h-[44px] min-w-[44px] px-3 text-stone-700 hover:text-stone-900"
        >
          <Share2 className="w-4 h-4" />
        </button>

        {/* Directions Link (Secondary Stone) */}
        {directionsUrl && (
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={directionsLabel}
            className="btn-secondary min-h-[44px] px-3.5 text-stone-700 dark:text-stone-200 text-small"
          >
            <Navigation className="w-4 h-4 text-river-600" />
            <span>{directionsLabel}</span>
          </a>
        )}
      </div>
    </div>
  );
};
