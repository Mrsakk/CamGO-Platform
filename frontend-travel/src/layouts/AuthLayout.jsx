import { Suspense } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Sun, Moon } from "lucide-react";
import { useThemeStore } from "@/store/themeStore";
import { useTranslation } from "react-i18next";
import { LoadingFallback } from "@/components/common/LoadingFallback";
import { KhmerBackgroundDecor } from "@/components/common/KhmerBackgroundDecor";

const AuthLayout = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useThemeStore();
  const { i18n } = useTranslation();
  const km = i18n.language === "km";

  return (
    <div className="min-h-screen flex flex-col justify-between bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 relative font-sans overflow-x-hidden">
      {/* Default authentic Khmer cultural background motif layer */}
      <KhmerBackgroundDecor />

      {/* 1. TOP NAVIGATION */}
      <header className="relative z-10 p-4 sm:p-6 flex items-center justify-between max-w-5xl mx-auto w-full">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-stone-700 dark:text-stone-200 hover:text-laterite-600 dark:hover:text-laterite-400 text-small font-semibold px-3.5 py-2 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-laterite-600 dark:text-laterite-400" />
          <span>{km ? "ត្រឡប់ទៅទំព័រដើម" : "Back to Home"}</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-0.5 text-small font-semibold">
            <button
              onClick={() => i18n.changeLanguage("km")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                i18n.language === "km"
                  ? "bg-laterite-600 text-white font-bold shadow-xs"
                  : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
              }`}
            >
              ខ្មែរ
            </button>
            <button
              onClick={() => i18n.changeLanguage("en")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                i18n.language === "en"
                  ? "bg-laterite-600 text-white font-bold shadow-xs"
                  : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
              }`}
            >
              EN
            </button>
          </div>

          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-200 hover:text-laterite-600 dark:hover:text-laterite-400 flex items-center justify-center transition-colors cursor-pointer"
            title="Toggle theme"
            aria-label="Toggle dark mode"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* 2. CENTERED AUTH DOSSIER CARD (max 420px) */}
      <div className="relative z-10 my-auto px-4 py-8 flex flex-col items-center justify-center">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 mb-6 group">
          <div className="w-12 h-12 rounded-xl bg-laterite-600 flex items-center justify-center text-white shadow-md">
            <span className="font-heading font-bold text-xl">CG</span>
          </div>
          <div>
            <div className="font-bold text-subheading tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-1">
              <span>Cam</span>
              <span className="text-laterite-600 dark:text-laterite-400">GO</span>
            </div>
            <div className="text-small text-stone-600 dark:text-stone-400">
              {km ? "បណ្តាញទេសចរណ៍វប្បធម៌ខ្មែរ" : "Cultural Heritage Portal"}
            </div>
          </div>
        </Link>

        {/* Card Outlet in Sandstone Raised Panel (max 420px centered) */}
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[420px] panel-raised bg-stone-100 dark:bg-stone-900 rounded-2xl p-6 sm:p-8 shadow-xl border border-stone-200 dark:border-stone-800 relative"
        >
          <Suspense fallback={<LoadingFallback />}>
            <Outlet />
          </Suspense>
        </motion.div>
      </div>

      {/* 3. FOOTER COLOPHON */}
      <footer className="relative z-10 py-6 text-center text-small text-stone-500 dark:text-stone-400 space-y-1">
        <div>CamGO Travel • Cultural Heritage Atlas</div>
      </footer>
    </div>
  );
};

export { AuthLayout };
export default AuthLayout;
