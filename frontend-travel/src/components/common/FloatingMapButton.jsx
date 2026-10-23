import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Map, Sparkles } from "lucide-react";

/**
 * FloatingMapButton Component - CamGO Travel Portal
 * - Positioned on the right side, stacked neatly on top of the Review Button on HomePage
 * - Floats on all pages across the frontend travel application
 * - Automatically hidden when already on the /map explorer page
 * - Adaptive positioning considering MobileBottomNav, safe areas, StickyActionBar, and Review Button
 * - Khmer Silk Glass & Angkor Laterite aesthetic with ambient pulse ring and live badge
 */
export const FloatingMapButton = () => {
  const { pathname } = useLocation();
  const { i18n } = useTranslation();
  const km = i18n.language === "km";

  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  // Hide floating button when virtual keyboard is open on mobile
  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;

    const handleViewportChange = () => {
      const diff = window.innerHeight - window.visualViewport.height;
      setIsKeyboardOpen(diff > 150);
    };

    window.visualViewport.addEventListener("resize", handleViewportChange);
    return () => {
      window.visualViewport?.removeEventListener("resize", handleViewportChange);
    };
  }, []);

  // If already on the interactive map page, don't show the floating map button
  const isMapPage = pathname === "/map";
  if (isMapPage || isKeyboardOpen) return null;

  // On HomePage, FloatingReviewButton is present at bottom-20 (mobile) and sm:bottom-6 (desktop)
  const isHomePage = pathname === "/";
  // On destination detail page on mobile, StickyActionBar is present above MobileBottomNav
  const isDestinationDetail = pathname.startsWith("/destinations/") && pathname !== "/destinations";

  // Calculate bottom positioning so it sits neatly on top of the Review button on HomePage
  const getBottomClass = () => {
    if (isHomePage) {
      // Sits directly above the Review Button
      return "bottom-[calc(140px+env(safe-area-inset-bottom,0px))] sm:bottom-[86px]";
    }
    if (isDestinationDetail) {
      // Sits above Mobile StickyActionBar on destination detail pages
      return "bottom-[calc(122px+env(safe-area-inset-bottom,0px))] sm:bottom-6";
    }
    // Normal public pages
    return "bottom-[calc(68px+env(safe-area-inset-bottom,0px))] sm:bottom-6";
  };

  return (
    <AnimatePresence>
      <motion.aside
        aria-label={km ? "ផ្លូវកាត់ទៅកាន់ផែនទីទេសចរណ៍" : "Shortcut to Travel Map"}
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed z-40 right-4 sm:right-6 transition-all duration-300 ${getBottomClass()}`}
      >
        <Link
          to="/map"
          className="group relative flex items-center gap-2 sm:gap-2.5 pl-2 pr-3.5 py-1.5 sm:pl-2.5 sm:pr-4 sm:py-2 rounded-full bg-stone-900/95 dark:bg-stone-900/95 text-stone-100 hover:text-white border border-amber-500/50 hover:border-amber-400 shadow-xl shadow-stone-950/30 hover:shadow-2xl hover:shadow-amber-500/30 backdrop-blur-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer select-none"
          title={km ? "បើកផែនទីអន្តរកម្ម ២៥ ខេត្ត-រាជធានី" : "Open Interactive Map of 25 Provinces"}
        >
          {/* Subtle Ambient Pulse Ring */}
          <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-500/30 via-laterite-500/30 to-amber-500/30 blur-sm pointer-events-none group-hover:opacity-100 opacity-70 transition-opacity duration-300 animate-pulse" />

          {/* Map Icon Container with Radar Live Ping */}
          <div className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-amber-500 via-amber-600 to-laterite-600 text-stone-950 shadow-md group-hover:rotate-6 transition-transform duration-300 shrink-0">
            <Map className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.4]" />
            {/* Live Active Radar Dot */}
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-stone-900" />
            </span>
          </div>

          {/* Label & Micro-Badge */}
          <div className="flex flex-col items-start leading-none">
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-black text-xs sm:text-sm tracking-wide text-amber-400 group-hover:text-amber-300 transition-colors">
                {km ? "ផែនទី" : "Map"}
              </span>
              <span className="hidden sm:inline font-heading font-bold text-xs text-stone-200">
                {km ? "ទេសចរណ៍" : "Explorer"}
              </span>
              <Sparkles className="w-3 h-3 text-amber-400 group-hover:rotate-12 transition-transform hidden sm:inline" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-sans font-medium text-stone-400 group-hover:text-stone-300 transition-colors mt-0.5">
              {km ? "២៥ ខេត្ត/ក្រុង" : "25 Provinces"}
            </span>
          </div>
        </Link>
      </motion.aside>
    </AnimatePresence>
  );
};

export default FloatingMapButton;
