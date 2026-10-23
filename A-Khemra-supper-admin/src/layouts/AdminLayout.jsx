import { useState, useEffect } from "react";
import { Outlet, NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  MapPin,
  Compass,
  Tag,
  Star,
  Users,
  FileText,
  Calendar,
  Image as ImageIcon,
  HelpCircle,
  Layers,
  Mail,
  UserCheck,
  Shield,
  Settings,
  Activity,
  Menu,
  X,
  LogOut,
  Sun,
  Moon,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Store,
  CreditCard
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";
import { useAdminSettingsStore } from "@/store/settingsStore";
import { ToastContainer } from "@/components/common/ToastContainer";
import { toast } from "@/store/toastStore";

const AdminLayout = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { settings, fetchSettings } = useAdminSettingsStore();
  const [logoImgError, setLogoImgError] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Lock body scroll and listen for Escape when sidebar drawer is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e) => {
        if (e.key === "Escape") setSidebarOpen(false);
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [sidebarOpen]);

  const handleLogout = async () => {
    await logout();
    toast.success(t("auth.logout_success", "Successfully logged out"));
    navigate("/login");
  };

  const navSections = [
    {
      title: "Core Management",
      items: [
        { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
        { to: "/admin/destinations", icon: Compass, label: "Destinations" },
        { to: "/admin/provinces", icon: MapPin, label: "Provinces (25)" },
        { to: "/admin/categories", icon: Tag, label: "Categories" },
        { to: "/admin/reviews", icon: Star, label: "Reviews Moderation" },
        { to: "/admin/testimonials", icon: Sparkles, label: "Website Reviews" }
      ]
    },
    {
      title: "Business Directory & Monetization",
      items: [
        { to: "/admin/business-portal", icon: Store, label: "Businesses & Tiers", badge: "2B" },
        { to: "/admin/billing", icon: CreditCard, label: "Plans & Billing", badge: "1" }
      ]
    },
    {
      title: "Content & Media",
      items: [
        { to: "/admin/blog", icon: FileText, label: "Blog & Articles" },
        { to: "/admin/events", icon: Calendar, label: "Events & Festivals" },
        { to: "/admin/banners", icon: ImageIcon, label: "Hero Banners" },
        { to: "/admin/faqs", icon: HelpCircle, label: "FAQs" },
        { to: "/admin/pages", icon: Layers, label: "Static Pages" }
      ]
    },
    {
      title: "Communication & Users",
      items: [
        { to: "/admin/contacts", icon: Mail, label: "Contact Messages" },
        { to: "/admin/subscribers", icon: UserCheck, label: "Subscribers" },
        { to: "/admin/users", icon: Users, label: "User Accounts" },
        { to: "/admin/roles", icon: Shield, label: "Roles & Permissions" }
      ]
    },
    {
      title: "System",
      items: [
        { to: "/admin/settings", icon: Settings, label: "Site Settings" },
        { to: "/admin/audit-logs", icon: Activity, label: "Audit Logs" }
      ]
    }
  ];

  return (
    <div className="min-h-[100dvh] bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-900 flex flex-col lg:flex-row font-sans">
      {/* Sidebar Overlay for mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-stone-950/60 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-[100dvh] w-72 max-w-[85vw] bg-stone-100 dark:bg-stone-100 border-r border-stone-200 dark:border-stone-800 flex flex-col transition-transform duration-300 overscroll-contain ${
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="h-14 px-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between shrink-0">
          <Link to="/admin" className="flex items-center gap-2.5 min-w-0 py-0.5">
            {settings.logo_url && !logoImgError ? (
              <img
                src={settings.logo_url}
                alt={settings.site_name_en || "Logo"}
                className="h-9 sm:h-10 w-auto max-w-[110px] object-contain rounded-lg p-0.5 shadow-xs shrink-0"
                onError={() => setLogoImgError(true)}
              />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-laterite-600 flex items-center justify-center text-white font-bold text-sm tracking-wider shadow-xs shrink-0">
                {settings.logo_badge_text || "CG"}
              </div>
            )}
            <div className="min-w-0 truncate">
              <span className="font-bold text-sm tracking-tight text-stone-900 dark:text-stone-100 block truncate">
                {settings.site_name_en || "CamGO"}
              </span>
              <span className="block text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                Admin Control
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="w-11 h-11 flex items-center justify-center rounded-lg text-stone-500 hover:text-stone-800 dark:hover:text-stone-700 lg:hidden cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Nav List */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <span className="px-3 text-small font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 block">
                {section.title}
              </span>
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-xl text-small font-medium transition-all ${
                        isActive
                          ? "bg-laterite-600 text-white font-semibold shadow-xs"
                          : "text-stone-700 dark:text-stone-700 hover:bg-stone-200 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-900"
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer with Public link & User info */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-100 space-y-2">
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-300 text-stone-800 dark:text-stone-700 text-small font-medium transition-colors"
          >
            <span className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-laterite-600 dark:text-laterite-400" />
              <span>Public Travel Site</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <div className="pt-2 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-laterite-600 text-white font-bold text-small flex items-center justify-center shrink-0">
                {(user?.name || user?.user?.name || user?.email || "A").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-small font-bold text-stone-900 dark:text-stone-900 truncate">
                  {user?.name || user?.user?.name || "Admin"}
                </p>
                <p className="text-small text-stone-500 truncate">
                  {user?.roles?.[0] || "Admin"}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Logout"
              className="w-11 h-11 flex items-center justify-center rounded-xl text-stone-500 hover:text-danger-600 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-14 px-4 sm:px-6 bg-stone-100 dark:bg-stone-100 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-11 h-11 flex items-center justify-center rounded-xl text-stone-600 dark:text-stone-700 hover:bg-stone-200 dark:hover:bg-stone-800 lg:hidden cursor-pointer"
              aria-label="Open sidebar"
            >
              <svg
                className="w-5 h-5 text-current"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="16" y2="12" />
                <line x1="4" y1="18" x2="11" y2="18" />
              </svg>
            </button>
            <div className="hidden sm:flex items-center gap-2 text-small text-stone-500">
              <span>Admin</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="font-semibold text-stone-800 dark:text-stone-700 capitalize">
                {location.pathname.replace("/admin", "").replace("/", "") || "Dashboard"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language switch */}
            <div className="flex items-center bg-stone-200 dark:bg-stone-800 rounded-xl p-0.5 border border-stone-300 dark:border-stone-300 text-small font-semibold">
              <button
                onClick={() => i18n.changeLanguage("km")}
                className={`min-h-[36px] px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  i18n.language === "km" ? "bg-laterite-600 text-white font-bold" : "text-stone-600 dark:text-stone-400"
                }`}
              >
                KM
              </button>
              <button
                onClick={() => i18n.changeLanguage("en")}
                className={`min-h-[36px] px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  i18n.language === "en" ? "bg-laterite-600 text-white font-bold" : "text-stone-600 dark:text-stone-400"
                }`}
              >
                EN
              </button>
            </div>

            {/* Dark/Light mode */}
            <button
              onClick={toggleTheme}
              className="w-11 h-11 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-700 hover:text-laterite-600 dark:hover:text-laterite-400 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};

export { AdminLayout };
