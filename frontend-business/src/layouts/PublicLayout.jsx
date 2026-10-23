import { useState, useEffect } from "react";
import { Outlet, Link, NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Store,
  Compass,
  Search,
  Globe,
  Sun,
  Moon,
  Menu,
  X,
  ExternalLink,
  ArrowUpRight,
} from "lucide-react";
import { useThemeStore } from "@/store/themeStore";
import { useSettingsStore, resolveAssetUrl } from "@/store/settingsStore";
import { ADMIN_BASE_URL, TRAVEL_BASE_URL } from "@/lib/urls";

export const PublicLayout = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { theme, toggleTheme, initTheme } = useThemeStore();
  const { settings, fetchSettings } = useSettingsStore();
  const [logoImgError, setLogoImgError] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isKm = i18n.language === "km";

  useEffect(() => {
    initTheme();
    fetchSettings();
  }, [initTheme, fetchSettings]);

  useEffect(() => {
    setMobileMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const toggleLanguage = () => {
    i18n.changeLanguage(isKm ? "en" : "km");
  };

  const navLinks = [
    { to: "/", label: t("nav.home", "Home"), end: true },
    { to: "/businesses", label: t("nav.directory", "Directory") },
    { to: "/pricing", label: t("nav.pricing", "Pricing") },
    { to: "/about", label: t("nav.about", "About") },
    { to: "/contact", label: t("nav.contact", "Contact") },
  ];

  const linkClass = ({ isActive }) =>
    `relative flex items-center py-2 text-sm font-medium transition ${isActive
      ? "text-forest after:absolute after:-bottom-0.5 after:left-1/2 after:h-1.5 after:w-1.5 after:-translate-x-1/2 after:rounded-full after:bg-brand-500 dark:text-brand-300"
      : "text-muted hover:text-forest dark:text-white/50 dark:hover:text-white"
    }`;

  return (
    <div className="premium-page flex min-h-screen flex-col text-ink transition-colors dark:text-cream">
      <div className="border-b border-white/10 bg-forest text-brand-200 dark:bg-stone-900 dark:text-brand-300">
        <div className="mx-auto flex h-9 max-w-content items-center justify-between px-4 text-xs sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400 shadow-[0_0_0_4px_rgba(198,161,91,0.12)]" />
            <span className="hidden sm:inline">
              {isKm
                ? "ថតឯកសារអាជីវកម្មទេសចរណ៍ផ្ទាល់ · គ្មានកម្រៃជើងសារ"
                : "Cambodia direct tourism directory · zero commission"}
            </span>
            <span className="sm:hidden">CamGO Business</span>
          </div>
          <a
            href={TRAVEL_BASE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold transition hover:text-brand-100 dark:hover:text-white"
          >
            {t("nav.travel_site", "CamGO Travel")}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-xl dark:border-white/10 dark:bg-stone-900/90">
        <div className="mx-auto flex h-[72px] max-w-content items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="group flex shrink-0 items-center gap-3 py-1">
            {settings.logo_url && !logoImgError ? (
              <img
                src={resolveAssetUrl(settings.logo_url)}
                alt={
                  isKm
                    ? `${settings.site_name_km || "CamGO"} អាជីវកម្ម`
                    : `${settings.site_name_en || "CamGO"} Business`
                }
                className="h-11 w-auto max-w-[190px] object-contain transition-transform duration-300 group-hover:scale-[1.02] sm:h-12 sm:max-w-[220px]"
                onError={() => setLogoImgError(true)}
              />
            ) : (
              <>
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-500/30 bg-forest text-brand-300 shadow-premium">
                  <Store className="h-5 w-5" />
                </span>
                <span className="leading-tight">
                  <span className="block text-xl font-semibold tracking-tight text-forest dark:text-cream">
                    {isKm
                      ? settings.site_name_km || "CamGO"
                      : settings.site_name_en || "CamGO"}
                  </span>
                  <span className="mt-0.5 block text-xs font-semibold text-brand-700 dark:text-brand-300">
                    Business Directory
                  </span>
                </span>
              </>
            )}
          </Link>

          <nav className="hidden h-[72px] items-center gap-7 md:flex">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleLanguage}
              className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-forest transition hover:bg-brand-50 dark:text-brand-200 dark:hover:bg-white/5"
              title="Change language"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>{isKm ? "EN" : "ខ្មែរ"}</span>
            </button>

            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-full text-forest transition hover:bg-brand-50 dark:text-brand-200 dark:hover:bg-white/5"
              title="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>

            <Link
              to="/businesses"
              className="btn-accent ml-1 hidden !min-h-0 !px-5 !py-2.5 sm:inline-flex"
            >
              <Search className="h-3.5 w-3.5" />
              <span>{isKm ? "ស្វែងរក" : "Browse"}</span>
            </Link>

            <button
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-forest transition hover:bg-brand-50 dark:text-brand-200 dark:hover:bg-white/5 md:hidden"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-line bg-paper px-4 py-4 dark:border-white/10 dark:bg-stone-900 md:hidden">
            <nav className="space-y-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `block rounded-full px-4 py-2.5 text-sm font-medium ${isActive
                      ? "bg-brand-50 text-forest dark:bg-brand-500/10 dark:text-brand-300"
                      : "text-muted hover:bg-brand-50 hover:text-forest dark:text-white/60 dark:hover:bg-white/5 dark:hover:text-white"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <a
                href={TRAVEL_BASE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-full px-4 py-2.5 text-sm font-medium text-forest hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-white/5"
              >
                <span>{t("nav.travel_site", "CamGO Travel")}</span>
                <ExternalLink className="h-4 w-4" />
              </a>
              <Link to="/businesses" className="btn-primary mt-2 w-full">
                <Search className="h-4 w-4" />
                {isKm ? "រកមើលអាជីវកម្ម" : "Browse businesses"}
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1 pb-16 sm:pb-0">
        <Outlet />
      </main>

      <footer className="relative overflow-hidden bg-forest pb-20 pt-14 text-sm text-cream sm:pb-12">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-brand-500/60" />
        <div className="relative mx-auto max-w-content px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col items-start justify-between gap-6 border-b border-white/10 pb-12 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-300">
                {isKm ? "ចាប់ផ្តើមដំណើររបស់អ្នក" : "Start your journey"}
              </p>
              <h2 className="mt-3 font-serif text-3xl font-semibold text-white sm:text-4xl">
                {isKm
                  ? "ស្វែងរកបទពិសោធន៍ក្នុងស្រុកដែលពិតប្រាកដ"
                  : "Discover authentic local experiences"}
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/55">
                {t("footer.desc")}
              </p>
            </div>
            <Link to="/businesses" className="btn-primary shrink-0">
              {t("nav.directory", "Browse directory")}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
            <div className="space-y-4 md:col-span-5">
              <Link to="/" className="group flex items-center gap-2.5">
                {settings.logo_url && !logoImgError ? (
                  <img
                    src={resolveAssetUrl(settings.logo_url)}
                    alt={
                      isKm
                        ? `${settings.site_name_km || "CamGO"} អាជីវកម្ម`
                        : `${settings.site_name_en || "CamGO"} Business`
                    }
                    className="h-11 w-auto max-w-[190px] object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                    onError={() => setLogoImgError(true)}
                  />
                ) : (
                  <>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-forest-dark">
                      <Store className="h-4 w-4" />
                    </span>
                    <span className="text-lg font-semibold text-white">
                      {isKm
                        ? `${settings.site_name_km || "CamGO"} អាជីវកម្ម`
                        : `${settings.site_name_en || "CamGO"} Business`}
                    </span>
                  </>
                )}
              </Link>
              <p className="max-w-md text-xs leading-relaxed text-white/50">
                {isKm
                  ? "ភ្ជាប់ភ្ញៀវទេសចរទៅកាន់អាជីវកម្មក្នុងស្រុកដោយផ្ទាល់។"
                  : "Connecting travelers directly with Cambodia's local tourism businesses."}
              </p>
              <p className="border-l-2 border-brand-500 pl-3 text-xs leading-relaxed text-white/50">
                <span className="font-semibold text-white/80">
                  {isKm ? "ចំណាំ៖ " : "Note: "}
                </span>
                {t("footer.no_booking_notice")}
              </p>
            </div>

            <div className="md:col-span-2">
              <h4 className="mb-3 font-serif text-base font-semibold text-white">
                {t("footer.links", "Explore")}
              </h4>
              <ul className="space-y-2.5 text-xs text-white/50">
                <li>
                  <Link to="/" className="transition hover:text-brand-300">
                    {t("nav.home", "Home")}
                  </Link>
                </li>
                <li>
                  <Link to="/businesses" className="transition hover:text-brand-300">
                    {t("nav.directory", "Directory")}
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" className="transition hover:text-brand-300">
                    {t("nav.pricing", "Pricing")}
                  </Link>
                </li>
                <li>
                  <Link to="/list-your-business" className="transition hover:text-brand-300">
                    {t("nav.list_business", "List your business")}
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="transition hover:text-brand-300">
                    {t("nav.about", "About")}
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="transition hover:text-brand-300">
                    {t("nav.contact", "Contact")}
                  </Link>
                </li>
              </ul>
            </div>

            <div className="md:col-span-2">
              <h4 className="mb-3 font-serif text-base font-semibold text-white">
                {isKm ? "ច្បាប់" : "Legal"}
              </h4>
              <ul className="space-y-2.5 text-xs text-white/50">
                <li>
                  <Link to="/privacy" className="transition hover:text-brand-300">
                    {t("nav.privacy", "Privacy")}
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="transition hover:text-brand-300">
                    {t("nav.terms", "Terms")}
                  </Link>
                </li>
              </ul>
            </div>

            <div className="md:col-span-3">
              <h4 className="mb-3 font-serif text-base font-semibold text-white">
                {isKm ? "វេទិកា" : "Ecosystem"}
              </h4>
              <ul className="space-y-2.5 text-xs text-white/50">
                <li>
                  <a
                    href={TRAVEL_BASE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 transition hover:text-brand-300"
                  >
                    CamGO Travel
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
                <li>
                  <a
                    href={ADMIN_BASE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 transition hover:text-brand-300"
                  >
                    {isKm ? "ផ្ទាំងគ្រប់គ្រង" : "Staff portal"}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-white/10 pt-6 text-xs text-white/35 sm:flex-row">
            <p>
              © {new Date().getFullYear()} CamGO. {t("footer.rights")}
            </p>
            <p>{isKm ? "សម្រាប់ទេសចរណ៍កម្ពុជា" : "Made for Cambodian tourism"}</p>
          </div>
        </div>
      </footer>

      <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-line bg-cream/95 px-4 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl dark:border-white/10 dark:bg-stone-900/95 sm:hidden">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 rounded-full px-4 py-1 text-[11px] font-semibold transition ${isActive
              ? "bg-brand-50 text-forest dark:bg-brand-500/10 dark:text-brand-200"
              : "text-muted dark:text-white/50"
            }`
          }
        >
          <Store className="h-5 w-5" />
          <span>{t("nav.home", "Home")}</span>
        </NavLink>

        <NavLink
          to="/businesses"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 rounded-full px-4 py-1 text-[11px] font-semibold transition ${isActive
              ? "bg-brand-50 text-forest dark:bg-brand-500/10 dark:text-brand-200"
              : "text-muted dark:text-white/50"
            }`
          }
        >
          <Search className="h-5 w-5" />
          <span>{t("nav.directory", "Directory")}</span>
        </NavLink>

        <a
          href={TRAVEL_BASE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1 rounded-full px-4 py-1 text-[11px] font-semibold text-muted dark:text-white/50"
        >
          <Compass className="h-5 w-5" />
          <span>Travel</span>
        </a>
      </div>
    </div>
  );
};
