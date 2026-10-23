import React, { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * SwipeRow Component - Angkor Sandstone & Bas-Relief
 * - Mobile (360 to 430px): Card width ~80% (w-[80vw] max-w-[320px]) so next card peeks in
 * - Touch swipe with scroll-snap, NO arrows on mobile
 * - Laptop/Desktop: Smooth scroll with clean stone navigation arrows
 * - Accessible: tabIndex={0}, focus ring, role="list", items role="listitem"
 */
export const SwipeRow = ({
  children,
  className = "",
  itemClassName = "",
  showDots = true,
  showArrows = true,
  ariaLabel = "Scrollable card row"
}) => {
  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const childArray = React.Children.toArray(children).filter(Boolean);
  const count = childArray.length;

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;

    const scrollLeft = el.scrollLeft;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(scrollLeft > 15);
    setCanScrollRight(scrollLeft < maxScroll - 15);

    const cardWidth = el.firstElementChild ? el.firstElementChild.offsetWidth : 280;
    const index = Math.round(scrollLeft / (cardWidth + 16));
    setActiveIndex(Math.min(Math.max(0, index), count - 1));
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [count]);

  const scroll = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.firstElementChild ? el.firstElementChild.offsetWidth : 300;
    const step = el.clientWidth > 768 ? cardWidth * 1.5 : cardWidth;
    el.scrollBy({
      left: direction === "left" ? -step : step,
      behavior: "smooth"
    });
  };

  if (count === 0) return null;

  return (
    <div className="relative w-full group/swiper space-y-3">
      {/* Desktop Left Scroll Arrow */}
      {showArrows && (
        <button
          type="button"
          onClick={() => scroll("left")}
          disabled={!canScrollLeft}
          aria-label="Scroll left"
          className="hidden sm:flex absolute -left-3 lg:-left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-800 shadow-raise items-center justify-center text-stone-700 dark:text-stone-300 hover:text-laterite-600 dark:hover:text-laterite-400 hover:border-laterite-600 dark:hover:border-laterite-600 transition-all disabled:opacity-0 disabled:pointer-events-none cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}

      {/* Desktop Right Scroll Arrow */}
      {showArrows && (
        <button
          type="button"
          onClick={() => scroll("right")}
          disabled={!canScrollRight}
          aria-label="Scroll right"
          className="hidden sm:flex absolute -right-3 lg:-right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-800 shadow-raise items-center justify-center text-stone-700 dark:text-stone-300 hover:text-laterite-600 dark:hover:text-laterite-400 hover:border-laterite-600 dark:hover:border-laterite-600 transition-all disabled:opacity-0 disabled:pointer-events-none cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}

      {/* 1-Row Horizontal Scroll Track */}
      <div
        ref={scrollRef}
        role="list"
        aria-label={ariaLabel}
        tabIndex={0}
        className={`flex flex-nowrap overflow-x-auto snap-x snap-mandatory gap-5 sm:gap-6 lg:gap-7 py-5 sm:py-6 px-4 sm:px-2 -my-5 sm:-my-6 -mx-4 sm:mx-0 scrollbar-none no-scrollbar scroll-smooth focus:outline-none rounded-2xl ${className}`}
        style={{
          overscrollBehaviorX: "contain",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none"
        }}
      >
        {childArray.map((child, idx) => (
          <div
            key={idx}
            role="listitem"
            className={`shrink-0 snap-start w-[82vw] max-w-[320px] sm:w-[310px] lg:w-[340px] ${itemClassName}`}
          >
            {child}
          </div>
        ))}
      </div>

      {/* Touch Progress Dots for Mobile */}
      {showDots && count > 3 && (
        <div className="flex sm:hidden items-center justify-center gap-1.5 pt-1" aria-hidden="true">
          {childArray.slice(0, 8).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                i === activeIndex
                  ? "w-4 bg-laterite-600"
                  : "w-1.5 bg-stone-300 dark:bg-stone-700"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
