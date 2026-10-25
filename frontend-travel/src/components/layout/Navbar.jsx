import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";
import { useFavoriteStore } from "@/store/favoriteStore";
import { useSettingsStore, resolveAssetUrl } from "@/store/settingsStore";
import { toast } from "@/store/toastStore";
import { destinationsApi } from "@/lib/api/destinations";
import {
  Menu,
  X,
  Search,
  Sun,
  Moon,
  User,
  Heart,
  ChevronDown,
  Globe,
  LogOut,
  LogIn,
  Shield,
  ArrowRight,
  Compass,
} from "lucide-react";

const toKm = (n) => (n === null || n === undefined ? "0" : String(n));

const UserAvatar = ({ user, size = "w-6 h-6", textSize = "text-[11px]" }) => {
  const [imgError, setImgError] = useState(false);
  const avatarUrl =
    user?.avatar ||
    (user?.name
      ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=c2410c&color=fff&bold=true`
      : null);

  const initial = (user?.name || user?.email || "U").charAt(0).toUpperCase();

  if (avatarUrl && !imgError) {
    return (
      <img
        src={avatarUrl}
        alt={user?.name || "Profile"}
        onError={() => setImgError(true)}
        className={`${size} rounded-full object-cover border border-laterite-600/30 shrink-0 shadow-xs`}
      />
    );
  }

  return (
    <div
      className={`${size} rounded-full bg-laterite-600 text-white flex items-center justify-center shrink-0 font-bold ${textSize} shadow-xs font-sans`}
    >
      {initial}
    </div>
  );
};

export const Navbar = () => {
  const { t, i18n } = useTranslation();
  const km = i18n.language === "km";
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, isAdmin } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { count: favoritesCount } = useFavoriteStore();
  const { settings } = useSettingsStore();
  const [logoImgError, setLogoImgError] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [destDropdownOpen, setDestDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [desktopSearchOpen, setDesktopSearchOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search suggestions (350ms)
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 1) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(() => {
      setIsSearching(true);
      destinationsApi
        .getSuggestions(searchQuery.trim())
        .then((res) => {
          const list = res?.data?.suggestions || res?.suggestions || [];
          setSuggestions(Array.isArray(list) ? list.slice(0, 6) : []);
        })
        .catch(() => setSuggestions([]))
        .finally(() => setIsSearching(false));
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
    setDesktopSearchOpen(false);
    setDestDropdownOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        setDesktopSearchOpen(false);
        setDestDropdownOpen(false);
        setProfileDropdownOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest("#profile-menu-container")) {
        setProfileDropdownOpen(false);
      }
      if (!e.target.closest("#destination-menu-container")) {
        setDestDropdownOpen(false);
      }
      if (!e.target.closest("#navbar-search-bar") && !e.target.closest("#navbar-search-trigger")) {
        setDesktopSearchOpen(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  const switchLanguage = (lang) => {
    i18n.changeLanguage(lang);
    document.documentElement.lang = lang;
    localStorage.setItem("i18nextLng", lang);
  };

  const handleLogout = async () => {
    await logout();
    toast.success(km ? "បានចាកចេញពីគណនីជោគជ័យ" : "Successfully signed out");
    navigate("/");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      navigate(`/destinations?search=${encodeURIComponent(query)}`);
    } else {
      navigate("/destinations");
    }
    setMobileMenuOpen(false);
    setDesktopSearchOpen(false);
  };

  const primaryLinks = [
    { to: "/", label: km ? "ទំព័រដើម" : "Home" },
    { to: "/destinations", label: km ? "គោលដៅទេសចរណ៍" : "Destinations", isDest: true },

    { to: "/events", label: km ? "ព្រឹត្តិការណ៍" : "Events" },
    { to: "/blog", label: km ? "អត្ថបទ" : "Journal" },
    { to: "/about", label: km ? "អំពីយើង" : "About" },
  ];

  const destinationDropdownItems = [
    { to: "/destinations", label: km ? "តំបន់ទេសចរណ៍ទាំងអស់" : "All Destinations" },
    { to: "/provinces", label: km ? "ខេត្ត-រាជធានីទាំង 25" : "25 Provinces Atlas" },
    { to: "/categories", label: km ? "ប្រភេទទេសចរណ៍" : "Categories" },
    { to: "/map", label: km ? "ផែនទីទេសចរណ៍" : "Interactive Map" },
    { to: "/trip-planner", label: km ? "រៀបចំកាលវិភាគ" : "Trip Itinerary" },
  ];

  const drawerLinks = [
    { to: "/", label: km ? "ទំព័រដើម" : "Home" },
    { to: "/destinations", label: km ? "តំបន់ទេសចរណ៍ទាំងអស់" : "All Destinations" },
    { to: "/provinces", label: km ? "ខេត្ត-រាជធានីទាំង 25" : "25 Provinces Atlas" },
    { to: "/categories", label: km ? "ប្រភេទទេសចរណ៍" : "Categories" },
    { to: "/map", label: km ? "ផែនទីទេសចរណ៍" : "Travel Map" },
    { to: "/trip-planner", label: km ? "រៀបចំកាលវិភាគ" : "Trip Itinerary" },
    { to: "/events", label: km ? "ពិធីបុណ្យ & ព្រឹត្តិការណ៍" : "Festivals & Events" },
    { to: "/blog", label: km ? "អត្ថបទ និងសារព័ត៌មាន" : "Heritage Journal" },
    { to: "/faq", label: km ? "សំណួរដែលសួរញឹកញាប់" : "FAQs & Guidelines" },
    { to: "/about", label: km ? "អំពីយើង" : "About Us" },
    { to: "/contact", label: km ? "ទំនាក់ទំនង" : "Contact Desk" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-200">
      {/* Main Navbar Top Row */}
      <div
        className={`h-16 sm:h-18 transition-all duration-200 bg-stone-100/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-300 dark:border-stone-800 text-stone-900 dark:text-stone-100 ${isScrolled ? "shadow-md" : ""
          }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-3 sm:gap-4">

          {/* ================================================================= */}
          {/* 1. LEFT: Mobile Menu Button + Brand Logo & Wordmark               */}
          {/* ================================================================= */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
            {/* Mobile Drawer Trigger with Menu / X icon */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-10 h-10 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:text-laterite-600 hover:border-laterite-500/40 cursor-pointer transition-colors flex items-center justify-center shrink-0 shadow-2xs"
              aria-label={mobileMenuOpen ? (km ? "បិទម៉ឺនុយ" : "Close Navigation") : (km ? "បើកម៉ឺនុយ" : "Open Navigation")}
              title={km ? "ម៉ឺនុយ" : "Menu"}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Brand Logo & Wordmark */}
            <Link to="/" className="flex items-center gap-2.5 sm:gap-3 shrink-0 group py-1">
              {(settings.logo_url || !logoImgError) ? (
                <img
                  src={resolveAssetUrl(settings.logo_url || "/logo.png")}
                  alt={settings.site_name_en || "Logo"}
                  className="h-10 sm:h-12 w-auto max-w-[170px] sm:max-w-[220px] object-contain group-hover:scale-105 transition-transform duration-200 drop-shadow-xs"
                  onError={(e) => {
                    if (!e.currentTarget.src.endsWith('/logo.png')) {
                      e.currentTarget.src = '/logo.png';
                    } else {
                      setLogoImgError(true);
                    }
                  }}
                />
              ) : (
                <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl bg-laterite-600 text-white flex items-center justify-center font-heading font-black text-xl tracking-wider shadow-sm group-hover:bg-laterite-500 transition-colors shrink-0">
                  {settings.logo_badge_text || "CG"}
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-heading font-bold text-base sm:text-lg lg:text-xl leading-tight tracking-wide text-stone-900 dark:text-stone-100">
                  {km ? (
                    settings.site_name_km || "CamGO Travel"
                  ) : (() => {
                    const name = settings.site_name_en || "CamGO";
                    const hl = settings.site_name_highlight || "GO";
                    if (hl && name.includes(hl)) {
                      const parts = name.split(hl);
                      return (
                        <>
                          {parts[0]}
                          <span className="text-laterite-600 dark:text-amber-400">{hl}</span>
                          {parts.slice(1).join(hl)}
                        </>
                      );
                    }
                    return name;
                  })()}
                </span>
                <span className="hidden sm:block text-[10px] sm:text-[11px] font-sans font-medium text-stone-500 leading-none mt-0.5">
                  {km ? (settings.site_tagline_km || "ព្រះរាជាណាចក្រកម្ពុជា") : (settings.site_tagline_en || "Kingdom of Cambodia")}
                </span>
              </div>
            </Link>
          </div>

          {/* ================================================================= */}
          {/* 2. MIDDLE: Clean Horizontal Navigation Links                      */}
          {/* ================================================================= */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
            {primaryLinks.map((link) => {
              const isActive =
                link.to === "/"
                  ? location.pathname === "/"
                  : location.pathname === link.to || location.pathname.startsWith(link.to + "/");

              if (link.isDest) {
                return (
                  <div
                    key={link.to}
                    id="destination-menu-container"
                    className="relative"
                    onMouseEnter={() => setDestDropdownOpen(true)}
                    onMouseLeave={() => setDestDropdownOpen(false)}
                  >
                    <button
                      type="button"
                      onClick={() => setDestDropdownOpen((prev) => !prev)}
                      className={`px-3 py-1.5 rounded-lg text-small font-sans font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${isActive || destDropdownOpen
                        ? "text-laterite-600 dark:text-laterite-400 bg-laterite-600/10 border border-laterite-600/30"
                        : "text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/60 dark:hover:bg-stone-800"
                        }`}
                    >
                      <span>{link.label}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 opacity-70 transition-transform duration-200 ${destDropdownOpen ? "rotate-180" : ""
                          }`}
                      />
                    </button>

                    {/* Destination Dropdown Menu */}
                    {destDropdownOpen && (
                      <div className="absolute top-full left-0 mt-1 w-60 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 shadow-xl py-1.5 z-50 animate-fade-in text-stone-900 dark:text-stone-100">
                        {destinationDropdownItems.map((item) => (
                          <Link
                            key={item.to}
                            to={item.to}
                            onClick={() => setDestDropdownOpen(false)}
                            className="flex items-center justify-between px-4 py-2.5 text-small font-sans font-semibold hover:text-laterite-600 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                          >
                            <span>{item.label}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-1.5 rounded-lg text-small font-sans font-semibold transition-all whitespace-nowrap ${isActive
                    ? "text-laterite-600 dark:text-laterite-400 bg-laterite-600/10 border border-laterite-600/30"
                    : "text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/60 dark:hover:bg-stone-800"
                    }`}
                >
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* ================================================================= */}
          {/* 3. FAR RIGHT: Utility Controls + PRIMARY CTA BUTTON               */}
          {/* ================================================================= */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Search Trigger Button */}
            <button
              id="navbar-search-trigger"
              type="button"
              onClick={() => setDesktopSearchOpen((prev) => !prev)}
              className={`h-9 px-2.5 sm:px-3 rounded-lg border transition-colors cursor-pointer flex items-center gap-1.5 ${desktopSearchOpen
                ? "border-laterite-600 text-laterite-600 bg-laterite-50 dark:bg-laterite-950/40"
                : "border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:border-laterite-500/40"
                }`}
              aria-label={km ? "ស្វែងរក" : "Search"}
              title={km ? "ស្វែងរក" : "Search"}
            >
              <Search className="w-4 h-4 text-stone-500 dark:text-stone-400" />
              <span className="hidden xl:inline text-small font-sans font-semibold">
                {km ? "ស្វែងរក" : "Search"}
              </span>
            </button>

            {/* Wishlist Button */}
            <Link
              to="/favorites"
              aria-label={km ? "បញ្ជីចំណូលចិត្ត" : "Wishlist"}
              title={km ? `បញ្ជីចំណូលចិត្ត (${toKm(favoritesCount)})` : `Wishlist (${favoritesCount})`}
              className={`hidden sm:flex relative h-9 px-2 sm:px-2.5 rounded-lg border bg-white dark:bg-stone-800 transition-colors items-center justify-center gap-1.5 cursor-pointer group ${favoritesCount > 0
                ? "border-red-500/40 text-red-500 hover:border-red-500"
                : "border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:text-red-500 hover:border-red-400"
                }`}
            >
              <Heart
                className={`w-4 h-4 transition-transform group-hover:scale-110 ${favoritesCount > 0 ? "fill-red-500 text-red-500" : ""
                  }`}
              />
              {favoritesCount > 0 && (
                <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center leading-none">
                  {km ? toKm(favoritesCount) : favoritesCount}
                </span>
              )}
            </Link>

            {/* Dark and Light Mode Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="h-9 w-9 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:border-stone-400 dark:hover:border-stone-600 transition-colors flex items-center justify-center cursor-pointer"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              title={
                theme === "dark"
                  ? km
                    ? "ប្តូរទៅពន្លឺ (Light mode)"
                    : "Switch to Light mode"
                  : km
                    ? "ប្តូរទៅងងឹត (Dark mode)"
                    : "Switch to Dark mode"
              }
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-stone-600 dark:text-stone-300 transition-transform hover:-rotate-12" />
              )}
            </button>

            {/* Language Switcher */}
            <button
              type="button"
              onClick={() => switchLanguage(i18n.language === "km" ? "en" : "km")}
              className="h-9 px-2 sm:px-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs sm:text-small font-sans font-semibold text-stone-800 dark:text-stone-200 hover:text-laterite-600 transition-all cursor-pointer flex items-center gap-1 shrink-0"
              title={i18n.language === "km" ? "Switch to English" : "ប្តូរទៅភាសាខ្មែរ"}
            >
              <Globe className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
              <span className="font-mono text-[11px]">{i18n.language === "km" ? "ខ្មែរ" : "EN"}</span>
            </button>

            {/* User Profile / Auth Action */}
            {isAuthenticated && user ? (
              <div id="profile-menu-container" className="hidden sm:block relative">
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="h-9 px-2 sm:px-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-small font-sans font-semibold text-stone-800 dark:text-stone-200 hover:text-laterite-600 flex items-center gap-1.5 transition-all cursor-pointer"
                  aria-label={km ? "គណនីអ្នកប្រើប្រាស់" : "User Profile"}
                  title={user?.name || "User"}
                >
                  <UserAvatar user={user} size="w-6 h-6" textSize="text-[11px]" />
                  <span className="hidden md:inline max-w-[80px] lg:max-w-[110px] truncate">
                    {user?.name?.split(" ")[0] || "User"}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 opacity-70 transition-transform duration-200 ${profileDropdownOpen ? "rotate-180" : ""
                      }`}
                  />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 shadow-xl p-2 z-50 animate-fade-in text-small font-sans">
                    <div className="p-2 border-b border-stone-200 dark:border-stone-800 flex items-center gap-2.5">
                      <UserAvatar user={user} size="w-10 h-10" textSize="text-sm" />
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-stone-900 dark:text-stone-100 truncate">
                          {user?.name || "Explorer"}
                        </p>
                        <p className="text-[11px] text-stone-500 truncate">{user?.email || ""}</p>
                      </div>
                    </div>

                    <div className="py-1 space-y-0.5">
                      {isAdmin && (
                        <a
                          href="http://localhost:5174"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center justify-between px-2.5 py-2 rounded-lg text-stone-900 dark:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 font-bold"
                        >
                          <span className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-laterite-600" />
                            <span>{km ? "ផ្ទាំងគ្រប់គ្រង Admin" : "Admin Dashboard"}</span>
                          </span>
                          <span className="text-xs">↗</span>
                        </a>
                      )}

                      <Link
                        to="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center justify-between px-2.5 py-2 rounded-lg text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 font-semibold"
                      >
                        <span className="flex items-center gap-2">
                          <User className="w-4 h-4 text-stone-500" />
                          <span>{km ? "ព័ត៌មានគណនី" : "My Profile"}</span>
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
                      </Link>

                      <Link
                        to="/favorites"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center justify-between px-2.5 py-2 rounded-lg text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 font-semibold"
                      >
                        <span className="flex items-center gap-2">
                          <Heart className="w-4 h-4 text-stone-500" />
                          <span>
                            {km ? `បានរក្សាទុក (${toKm(favoritesCount)})` : `Saved (${favoritesCount})`}
                          </span>
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-stone-200 dark:border-stone-800">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-950/40 cursor-pointer font-bold"
                      >
                        <LogOut className="w-4 h-4 text-danger-600" />
                        <span>{km ? "ចាកចេញ" : "Sign Out"}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1 sm:gap-1.5">
                <Link
                  to="/login"
                  state={{ from: location }}
                  className="h-9 px-2.5 sm:px-3 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-small font-sans font-semibold text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 transition-colors flex items-center gap-1.5 shadow-2xs"
                  title={km ? "ចូលប្រើ" : "Log In"}
                >
                  <User className="w-3.5 h-3.5 text-stone-500" />
                  <span className="hidden sm:inline">{km ? "ចូល" : "Log In"}</span>
                </Link>
              </div>
            )}


          </div>
        </div>
      </div>

      {/* Dropdown Search Panel Underneath the Navbar */}
      {desktopSearchOpen && (
        <div
          id="navbar-search-bar"
          className="border-b border-stone-300 dark:border-stone-800 bg-white/98 dark:bg-stone-900/98 backdrop-blur-md shadow-lg animate-fade-in"
        >
          <div className="max-w-4xl mx-auto px-4 py-3 sm:py-3.5">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={km ? "ស្វែងរកគោលដៅទេសចរណ៍ ប្រាសាទ កោះ ឆ្នេរ..." : "Search destinations, temples, islands, beaches..."}
                  className="w-full h-11 pl-10 pr-9 rounded-xl bg-stone-100 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 text-small text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:border-laterite-500 focus:ring-2 focus:ring-laterite-500/20 font-sans"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSuggestions([]);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="h-11 px-4 sm:px-5 rounded-xl bg-laterite-600 hover:bg-laterite-700 text-white text-small font-sans font-semibold shadow-sm cursor-pointer flex items-center gap-1.5 transition-colors shrink-0"
              >
                <Search className="w-4 h-4" />
                <span>{km ? "ស្វែងរក" : "Search"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDesktopSearchOpen(false);
                  setSuggestions([]);
                  setSearchQuery("");
                }}
                className="h-11 w-11 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 transition-colors flex items-center justify-center cursor-pointer shrink-0"
                aria-label={km ? "បិទ" : "Close"}
                title={km ? "បិទ" : "Close"}
              >
                <X className="w-5 h-5" />
              </button>
            </form>

            {/* Suggestions Dropdown Underneath Search Bar */}
            {searchQuery.trim().length >= 1 && (suggestions.length > 0 || isSearching) && (
              <div className="mt-2.5 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl shadow-xl overflow-hidden text-stone-900 dark:text-stone-100 animate-fade-in">
                {isSearching && suggestions.length === 0 ? (
                  <div className="p-3 text-small text-stone-500 text-center font-sans">
                    {km ? "កំពុងស្វែងរក..." : "Searching..."}
                  </div>
                ) : (
                  <div>
                    <div className="divide-y divide-stone-200 dark:divide-stone-800 max-h-64 overflow-y-auto">
                      {suggestions.map((sug) => {
                        const destName = km && sug.name_km ? sug.name_km : sug.name_en;
                        const provName = sug.province
                          ? km && sug.province.name_km
                            ? sug.province.name_km
                            : sug.province.name_en
                          : null;
                        return (
                          <Link
                            key={sug.id}
                            to={`/destinations/${sug.slug}`}
                            onClick={() => {
                              setDesktopSearchOpen(false);
                              setSearchQuery("");
                              setSuggestions([]);
                            }}
                            className="flex items-center gap-3 p-2.5 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                          >
                            {sug.cover_image && (
                              <img
                                src={sug.cover_image}
                                alt=""
                                className="w-9 h-9 rounded-lg object-cover bg-stone-200 shrink-0 border border-stone-300 dark:border-stone-700"
                              />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-small font-sans font-semibold text-stone-900 dark:text-stone-100 truncate">
                                {destName}
                              </p>
                              {provName && (
                                <p className="text-xs text-stone-500 truncate">
                                  {provName}
                                </p>
                              )}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                    <Link
                      to={`/destinations?search=${encodeURIComponent(searchQuery.trim())}`}
                      onClick={() => {
                        setDesktopSearchOpen(false);
                        setSearchQuery("");
                        setSuggestions([]);
                      }}
                      className="block p-2.5 text-center text-small font-sans font-semibold text-laterite-600 hover:bg-laterite-600 hover:text-white transition-colors border-t border-stone-200 dark:border-stone-800"
                    >
                      {km ? "មើលលទ្ធផលទាំងអស់ →" : "See all results →"}
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Navigation Drawer Modal */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex justify-start"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-stone-950/75 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Left Drawer Panel */}
          <div className="relative z-10 w-80 max-w-[85vw] h-[100dvh] flex flex-col bg-stone-100 dark:bg-stone-900 border-r border-stone-300 dark:border-stone-800 shadow-2xl p-4 sm:p-5 space-y-4">

            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800 shrink-0">
              <div className="flex items-center gap-2.5">
                {(settings.logo_url || !logoImgError) ? (
                  <img
                    src={resolveAssetUrl(settings.logo_url || "/logo.png")}
                    alt={settings.site_name_en || "Logo"}
                    className="h-10 sm:h-12 w-auto max-w-[140px] object-contain rounded-lg shadow-xs"
                    onError={(e) => {
                      if (!e.currentTarget.src.endsWith('/logo.png')) {
                        e.currentTarget.src = '/logo.png';
                      } else {
                        setLogoImgError(true);
                      }
                    }}
                  />
                ) : (
                  <div className="h-10 px-2.5 rounded-xl bg-laterite-600 text-white flex items-center justify-center font-heading font-bold text-lg shadow-sm shrink-0">
                    {settings.logo_badge_text || "CG"}
                  </div>
                )}
                <span className="font-heading font-bold text-lg text-stone-900 dark:text-stone-100">
                  {km ? (
                    settings.site_name_km || "CamGO Travel"
                  ) : (() => {
                    const name = settings.site_name_en || "CamGO";
                    const hl = settings.site_name_highlight || "GO";
                    if (hl && name.includes(hl)) {
                      const parts = name.split(hl);
                      return (
                        <>
                          {parts[0]}
                          <span className="text-laterite-600 dark:text-laterite-400">{hl}</span>
                          {parts.slice(1).join(hl)}
                        </>
                      );
                    }
                    return name;
                  })()}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="w-8 h-8 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 flex items-center justify-center cursor-pointer transition-colors"
                aria-label="Close Navigation"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Search inside Drawer */}
            <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full shrink-0">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={km ? "ស្វែងរកប្រាសាទ កោះ ឆ្នេរ..." : "Search sights, islands..."}
                className="w-full h-10 pl-9 pr-14 rounded-xl bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:border-laterite-500"
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-2.5 rounded-lg bg-laterite-600 hover:bg-laterite-700 text-white text-small font-sans font-semibold flex items-center gap-1 transition-colors"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{km ? "រក" : "Go"}</span>
              </button>
            </form>

            {/* Scrollable Links List */}
            <div className="space-y-1 overflow-y-auto flex-1 overscroll-contain pr-1">
              {/* Primary Plan Your Trip CTA Card */}
              <Link
                to="/trip-planner"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between min-h-[44px] px-3.5 rounded-xl text-small font-sans font-bold bg-laterite-600 hover:bg-laterite-700 text-white shadow-xs transition-colors mb-2 group"
              >
                <span className="flex items-center gap-2">
                  <Compass className="w-4 h-4 group-hover:rotate-45 transition-transform" />
                  <span>{km ? "រៀបចំកាលវិភាគធ្វើដំណើរ" : "Plan Your Trip"}</span>
                </span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              {/* Quick Wishlist Link inside drawer */}
              <Link
                to="/favorites"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between min-h-[40px] px-3.5 rounded-xl text-small font-sans font-medium bg-laterite-600/5 hover:bg-laterite-600/10 text-stone-900 dark:text-stone-100 border border-laterite-600/20 transition-colors mb-2"
              >
                <span className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-laterite-600 dark:text-laterite-400" />
                  <span>{km ? "បញ្ជីចំណូលចិត្ត" : "My Wishlist"}</span>
                </span>
                <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-laterite-600 text-white text-xs font-bold flex items-center justify-center">
                  {km ? toKm(favoritesCount) : favoritesCount}
                </span>
              </Link>

              {drawerLinks.map((link) => {
                const isActive =
                  link.to === "/"
                    ? location.pathname === "/"
                    : location.pathname === link.to || location.pathname.startsWith(link.to + "/");

                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between min-h-[40px] px-3.5 rounded-xl text-small font-sans font-medium transition-colors ${isActive
                      ? "bg-laterite-600/10 text-laterite-600 dark:text-laterite-400 border border-laterite-600/30"
                      : "text-stone-900 dark:text-stone-100 hover:bg-stone-200/70 dark:hover:bg-stone-800"
                      }`}
                  >
                    <span>{link.label}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
                  </Link>
                );
              })}
            </div>

            {/* Mobile Drawer Auth Footer */}
            <div className="pt-3 border-t border-stone-200 dark:border-stone-800">
              {isAuthenticated && user ? (
                <div className="space-y-2">
                  <div className="px-2 py-1 flex items-center gap-2.5">
                    <UserAvatar user={user} size="w-9 h-9" textSize="text-xs" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-small text-stone-900 dark:text-stone-100 truncate font-sans">
                        {user?.name || "Explorer"}
                      </p>
                      <p className="text-small text-stone-500 truncate">
                        {user?.email || ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex-1 min-h-[40px] rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-small font-sans font-medium flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <User className="w-4 h-4 text-stone-500" />
                      <span>{km ? "ប្រវត្តិរូប" : "Profile"}</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="min-h-[40px] px-3.5 rounded-xl border border-danger-600/30 text-danger-600 text-small font-sans font-medium flex items-center justify-center gap-1.5 cursor-pointer hover:bg-danger-50 dark:hover:bg-danger-950/40 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{km ? "ចាកចេញ" : "Logout"}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    state={{ from: location }}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 min-h-[40px] rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-small font-sans font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <LogIn className="w-4 h-4 text-stone-500" />
                    <span>{km ? "ចូល" : "Log In"}</span>
                  </Link>
                  <Link
                    to="/register"
                    state={{ from: location }}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 min-h-[40px] rounded-xl bg-laterite-600 hover:bg-laterite-700 text-white text-small font-sans font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>{km ? "ចុះឈ្មោះ" : "Register"}</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
