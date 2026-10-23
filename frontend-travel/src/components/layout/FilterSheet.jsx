import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X, RefreshCw } from "lucide-react";
import LintelFrame from "@/components/sandstone/LintelFrame";

/**
 * FilterSheet Component - Angkor Sandstone & Bas-Relief
 * - Stepped lintel framed moulding
 * - Sheet slides from bottom on mobile / modal on desktop
 * - Rendered via createPortal to document.body at z-[100] to sit above MobileBottomNav and all page elements
 * - 44px close button, Escape key closes, background scroll locked
 * - Single Laterite primary button ("Apply (N results)")
 */
export const FilterSheet = ({
  isOpen,
  onClose,
  title = "Filters",
  resultCount,
  onApply,
  onReset,
  applyLabel = "Apply",
  resetLabel = "Reset",
  children
}) => {
  // Lock scroll and handle Escape
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

  if (!isOpen) return null;

  const content = (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center pointer-events-auto">
      {/* Dim Backdrop covering entire viewport including bottom nav */}
      <div
        className="fixed inset-0 bg-stone-950/75 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet Container with Lintel Moulding */}
      <div
        className="relative w-full md:max-w-lg z-10 animate-slide-up max-h-[88dvh] flex flex-col p-0 sm:p-2 overscroll-contain"
        role="dialog"
        aria-modal="true"
      >
        <LintelFrame className="w-full overflow-hidden flex flex-col max-h-[88dvh] rounded-b-none sm:rounded-card shadow-2xl">
          <div className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 flex flex-col max-h-[86dvh]">
            {/* Sheet Header */}
            <div className="px-5 py-3.5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-subheading text-stone-900 dark:text-stone-100 font-km">
                {title}
              </h3>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close filters"
                className="w-11 h-11 rounded-control flex items-center justify-center text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Filters Body */}
            <div className="px-5 py-4 overflow-y-auto space-y-5 flex-1 text-small overscroll-contain">
              {children}
            </div>

            {/* Sticky Bottom Actions Bar */}
            <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex items-center gap-2.5 shrink-0 sticky bottom-0 z-10 pb-[calc(18px+env(safe-area-inset-bottom,0px))]">
              {onReset && (
                <button
                  type="button"
                  onClick={onReset}
                  className="btn-secondary min-h-[44px] px-4 text-small"
                >
                  <RefreshCw className="w-4 h-4 text-stone-500" />
                  <span>{resetLabel}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  if (onApply) onApply();
                  onClose();
                }}
                className="btn-primary min-h-[44px] flex-1 text-body font-semibold cursor-pointer"
              >
                <span>
                  {applyLabel}
                  {resultCount !== undefined && ` (${resultCount})`}
                </span>
              </button>
            </div>
          </div>
        </LintelFrame>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(content, document.body) : null;
};
