import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";

export const ScrollToTopButton = () => {
  const { pathname } = useLocation();
  const { i18n } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 320) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const isHomePage = pathname === "/";
  const isMapPage = pathname === "/map";
  const isDestinationDetail = pathname.startsWith("/destinations/") && pathname !== "/destinations";

  // Calculate bottom positioning so it stacks cleanly above FloatingMapButton
  const getBottomClass = () => {
    if (isMapPage) {
      // On map page, FloatingMapButton is hidden
      return "bottom-20 sm:bottom-8";
    }
    if (isHomePage) {
      // On HomePage: Review Button (bottom) -> Map Button (middle) -> ScrollToTop (top)
      return "bottom-[calc(200px+env(safe-area-inset-bottom,0px))] sm:bottom-[148px]";
    }
    if (isDestinationDetail) {
      // Destination detail: StickyActionBar (bottom) -> Map Button (middle) -> ScrollToTop (top)
      return "bottom-[calc(180px+env(safe-area-inset-bottom,0px))] sm:bottom-[76px]";
    }
    // Normal pages: Map Button (bottom) -> ScrollToTop (top)
    return "bottom-[calc(126px+env(safe-area-inset-bottom,0px))] sm:bottom-[76px]";
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          onClick={scrollToTop}
          aria-label={i18n.language === "km" ? "ត្រឡប់ទៅលើវិញ" : "Back to top"}
          title={i18n.language === "km" ? "ត្រឡប់ទៅលើវិញ" : "Back to top"}
          className={`fixed z-30 right-4 sm:right-6 p-2.5 sm:p-3 rounded-full silk-glass border border-amber-500/40 text-amber-600 dark:text-amber-400 hover:text-white hover:bg-gradient-to-tr hover:from-amber-500 hover:to-amber-600 shadow-xl hover:shadow-amber-500/30 transition-all duration-300 hover:scale-110 cursor-pointer group flex items-center justify-center backdrop-blur-xl ${getBottomClass()}`}
        >
          <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-y-0.5 transition-transform duration-300" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};
