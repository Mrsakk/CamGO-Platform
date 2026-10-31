import { useEffect, Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { ToastContainer } from "@/components/common/ToastContainer";
import { ScrollToTopButton } from "@/components/common/ScrollToTopButton";
import { FloatingMapButton } from "@/components/common/FloatingMapButton";
import { LoadingFallback } from "@/components/common/LoadingFallback";
import { KhmerBackgroundDecor } from "@/components/common/KhmerBackgroundDecor";
import { useFavoriteStore } from "@/store/favoriteStore";
import { useAuthStore } from "@/store/authStore";

const PublicLayout = () => {
  const { pathname } = useLocation();
  const { isAuthenticated } = useAuthStore();
  const { syncFavorites } = useFavoriteStore();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    if (isAuthenticated) {
      syncFavorites();
    }
  }, [isAuthenticated, syncFavorites]);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans selection:bg-amber-500 selection:text-white transition-colors duration-200 relative overflow-x-hidden">
      {/* Default authentic Khmer cultural background motif layer across all pages */}
      <KhmerBackgroundDecor />

      <Navbar />
      <main className="flex-1 pb-[calc(56px+env(safe-area-inset-bottom,0px))] lg:pb-0 relative flex flex-col">
        <Suspense fallback={<LoadingFallback />}>
          <motion.div
            key={pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="w-full flex-1 flex flex-col"
          >
            <Outlet />
          </motion.div>
        </Suspense>
      </main>
      <Footer />
      <MobileBottomNav />
      <FloatingMapButton />
      <ScrollToTopButton />
      <ToastContainer />
    </div>
  );
};

export { PublicLayout };
