import { useEffect, useState } from "react";
import { Outlet, NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Menu,
  X,
  LogOut,
  Sun,
  Moon,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Store,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";
import { useSettingsStore, resolveAssetUrl } from "@/store/settingsStore";
import { ToastContainer } from "@/components/common/ToastContainer";
import { toast } from "@/store/toastStore";

const shared = {
  header:
    "border-line/80 bg-paper/85 dark:border-white/10 dark:bg-stone-900/85",
  chip: "border-brand-200 bg-brand-50 text-brand-800 dark:border-white/10 dark:bg-white/5 dark:text-brand-300",
  headerTitle: "text-forest dark:text-cream",
  iconBtn:
    "border-line bg-cream/80 text-forest hover:border-brand-300 hover:bg-brand-50 dark:border-white/10 dark:bg-white/5 dark:text-stone-300 dark:hover:bg-white/10",
  toggleWrap:
    "border-line bg-cream/80 dark:border-white/10 dark:bg-white/5",
  toggleActive:
    "bg-forest text-cream shadow-sm dark:bg-brand-500 dark:text-forest",
  toggleIdle:
    "text-muted hover:text-forest dark:text-stone-400 dark:hover:text-white",
  mobileTop:
    "border-line bg-paper/95 dark:border-white/10 dark:bg-stone-900/95",
  mobileMenu:
    "text-forest hover:bg-brand-50 dark:text-stone-300 dark:hover:bg-white/5",
};

const palettes = {
  gold: {
    ...shared,
    sidebar: "border-white/10 bg-forest text-cream",
    logo: "bg-brand-500 text-forest shadow-gold",
    active: "bg-brand-500 text-forest shadow-gold",
    badge: "border-brand-200/30 bg-white/10 text-brand-200",
    subtitle: "text-brand-300/90",
    title: "text-cream",
    navIdle: "text-white/55 hover:bg-white/5 hover:text-white",
    divider: "border-white/10",
    section: "text-white/30",
    userBox: "bg-white/[0.06]",
    userName: "text-cream",
    userMuted: "text-white/45",
    logout:
      "bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 hover:text-rose-200",
    close: "text-white/50 hover:bg-white/5 hover:text-white",
    external:
      "text-white/45 hover:bg-white/5 hover:text-brand-300",
    externalIcon: "text-white/30",
    avatar: "bg-brand-500 text-forest",
    pageChip:
      "border-brand-200 bg-brand-50 text-brand-700 dark:border-white/10 dark:bg-white/5 dark:text-brand-300",
    pageChipStrong: "text-forest dark:text-cream",
  },
  amber: {
    ...shared,
    sidebar: "border-line bg-cream dark:border-white/10 dark:bg-stone-850",
    logo: "bg-forest text-brand-200 shadow-premium",
    active: "bg-brand-500 text-forest shadow-gold",
    badge:
      "border-brand-200 bg-brand-50 text-brand-800 dark:border-white/10 dark:bg-white/5 dark:text-brand-300",
    subtitle: "text-brand-700 dark:text-brand-300",
    title: "text-forest dark:text-cream",
    navIdle:
      "text-muted hover:bg-brand-50 hover:text-forest dark:text-white/50 dark:hover:bg-white/5 dark:hover:text-white",
    divider: "border-line dark:border-white/10",
    section: "text-stone-400 dark:text-white/30",
    userBox: "bg-brand-50/80 dark:bg-white/5",
    userName: "text-forest dark:text-cream",
    userMuted: "text-muted dark:text-white/45",
    logout:
      "bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/20",
    close:
      "text-muted hover:bg-brand-50 hover:text-forest dark:text-white/50 dark:hover:bg-white/5",
    external:
      "text-muted hover:bg-brand-50 hover:text-forest dark:text-white/45 dark:hover:bg-white/5 dark:hover:text-brand-300",
    externalIcon: "text-stone-400 dark:text-white/30",
    avatar: "bg-forest text-brand-200",
    pageChip: "border-brand-200 bg-brand-50 text-brand-700 dark:border-white/10 dark:bg-white/5 dark:text-brand-300",
    pageChipStrong: "text-forest dark:text-cream",
  },
};

const getInitials = (name) => {
  const clean = (name || "CG").trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length > 1) {
    return parts.map((part) => part[0]).join("").slice(0, 2);
  }
  return clean.slice(0, 2);
};

export const PortalLayout = ({
  brandTitle,
  brandSubtitle,
  portalName,
  roleLabel,
  userSubtitle,
  navItems,
  mode = "staff",
  accent = "gold",
  ownerBadgeLabel,
  externalLink = null,
}) => {
  const { i18n } = useTranslation();
  const isKm = i18n.language === "km";
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { settings, fetchSettings } = useSettingsStore();
  const [logoImgError, setLogoImgError] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const palette = palettes[accent] || palettes.gold;
  const isOwnerMode = mode === "owner";
  const displayName = user?.name || roleLabel;
  const initials = getInitials(displayName);
  const workspaceName = isOwnerMode
    ? user?.business?.name_km || user?.business?.name_en || portalName
    : portalName;

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    toast.success(
      isKm
        ? "ចាកចេញពីប្រព័ន្ធដោយជោគជ័យ / Successfully logged out"
        : "Successfully logged out"
    );
    navigate("/login");
  };

  const pageLabel =
    location.pathname
      .replace(/^\/(admin|owner)\/?/, "")
      .split("/")
      .filter(Boolean)
      .join(" / ") || "Dashboard";

  return (
    <div className="flex min-h-screen flex-col bg-stone-100 dark:bg-stone-900 md:flex-row">
      <ToastContainer />

      <div
        className={`sticky top-0 z-40 flex items-center justify-between border-b p-4 backdrop-blur-xl md:hidden ${palette.mobileTop}`}
      >
        <div className="flex min-w-0 items-center gap-2">
          <button
            onClick={() => setSidebarOpen(true)}
            className={`rounded-full p-2 transition ${palette.mobileMenu}`}
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link to={isOwnerMode ? "/owner" : "/admin"} className="flex min-w-0 items-center gap-2.5">
            {settings.logo_url && !logoImgError ? (
              <img
                src={resolveAssetUrl(settings.logo_url)}
                alt={settings.site_name_en || "Logo"}
                className="h-8 w-auto max-w-[110px] object-contain drop-shadow-sm"
                onError={() => setLogoImgError(true)}
              />
            ) : (
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 text-xs font-bold ${palette.logo}`}>
                <Store className="h-4 w-4" />
              </span>
            )}
            <div className="min-w-0">
              <span className="block max-w-[150px] truncate font-serif text-base font-semibold text-forest dark:text-cream sm:max-w-[240px]">
                {workspaceName}
              </span>
              <span className="block text-xs font-bold uppercase tracking-[0.16em] text-brand-700 dark:text-brand-300">
                {brandSubtitle}
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-1.5">
          <div
            className={`flex items-center rounded-full border p-0.5 ${palette.toggleWrap}`}
          >
            <button
              onClick={() => i18n.changeLanguage("km")}
              aria-label="Switch to Khmer"
              className={`rounded-full px-2 py-1 text-xs font-bold transition ${
                i18n.language === "km"
                  ? palette.toggleActive
                  : palette.toggleIdle
              }`}
            >
              KM
            </button>
            <button
              onClick={() => i18n.changeLanguage("en")}
              aria-label="Switch to English"
              className={`rounded-full px-2 py-1 text-xs font-bold transition ${
                i18n.language === "en"
                  ? palette.toggleActive
                  : palette.toggleIdle
              }`}
            >
              EN
            </button>
          </div>

          <button
            onClick={toggleTheme}
            className={`rounded-full p-2 transition ${palette.mobileMenu}`}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-forest/60 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r transition-transform duration-200 md:sticky ${palette.sidebar} ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-400/70 to-transparent" />

        <div
          className={`flex items-center justify-between border-b px-5 py-5 ${palette.divider}`}
        >
          <Link
            to={isOwnerMode ? "/owner" : "/admin"}
            className="group flex min-w-0 items-center gap-3 py-1"
          >
            {settings.logo_url && !logoImgError ? (
              <img
                src={resolveAssetUrl(settings.logo_url)}
                alt={settings.site_name_en || "Logo"}
                className="h-10 w-auto max-w-[140px] object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
                onError={() => setLogoImgError(true)}
              />
            ) : (
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 font-serif text-base font-bold shadow-premium ${palette.logo}`}
              >
                <Store className="h-5 w-5" />
              </div>
            )}
            <div className="min-w-0">
              <div
                className={`truncate font-serif text-base font-semibold leading-tight ${palette.title}`}
              >
                {isKm ? (settings.site_name_km || brandTitle) : (settings.site_name_en || brandTitle)}
              </div>
              <div
                className={`mt-1 text-xs font-bold uppercase tracking-[0.18em] ${palette.subtitle}`}
              >
                {brandSubtitle}
              </div>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className={`rounded-full p-1.5 transition md:hidden ${palette.close}`}
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3.5">
          <div
            className={`mb-2 px-4 text-xs font-bold uppercase tracking-[0.18em] ${palette.section}`}
          >
            {isKm ? "ផ្ទាំងគ្រប់គ្រង" : "Workspace"}
          </div>

          <div className="space-y-1.5">
            {navItems.filter((item) => item.show !== false).map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `group flex items-center justify-between gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? `${palette.active} font-semibold`
                        : palette.navIdle
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex min-w-0 items-center gap-3">
                        <Icon className="h-[18px] w-[18px] shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge ? (
                        <span className="rounded-full bg-rose-500 px-2 py-0.5 text-xs font-bold text-white shadow-sm">
                          {item.badge}
                        </span>
                      ) : isActive ? (
                        <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" />
                      ) : null}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>

          {externalLink ? (
            <div className={`mt-5 border-t pt-4 ${palette.divider}`}>
              <a
                href={externalLink.href}
                target="_blank"
                rel="noreferrer"
                className={`flex items-center justify-between rounded-2xl px-4 py-2.5 text-xs font-medium transition ${palette.external}`}
              >
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  <span>{externalLink.label}</span>
                </div>
                <ExternalLink className={`h-3.5 w-3.5 ${palette.externalIcon}`} />
              </a>
            </div>
          ) : null}
        </nav>

        <div className={`border-t p-4 ${palette.divider}`}>
          <div
            className={`mb-3 flex items-center gap-3 rounded-2xl p-3 ${palette.userBox}`}
          >
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${palette.avatar}`}
            >
              {initials}
            </span>
            <div className="min-w-0 flex-1">
              <div
                className={`truncate text-sm font-semibold ${palette.userName}`}
              >
                {displayName}
              </div>
              <div className={`truncate text-xs ${palette.userMuted}`}>
                {userSubtitle}
              </div>
            </div>
            <span
              className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-bold ${palette.badge}`}
            >
              {roleLabel}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className={`flex w-full items-center justify-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition ${palette.logout}`}
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>{isKm ? "ចាកចេញ" : "Logout"}</span>
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className={`sticky top-0 z-30 hidden items-center justify-between border-b px-6 py-4 backdrop-blur-xl md:flex lg:px-8 ${palette.header}`}
        >
          {isOwnerMode ? (
            <div className="flex min-w-0 items-center gap-3">
              <span
                className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${palette.badge}`}
              >
                {ownerBadgeLabel}
              </span>
              <div className="min-w-0">
                <div
                  className={`truncate font-serif text-lg font-semibold ${palette.headerTitle}`}
                >
                  {workspaceName}
                </div>
                <div className="text-xs font-medium capitalize text-muted dark:text-white/40">
                  {pageLabel}
                </div>
              </div>
            </div>
          ) : (
            <div
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs ${palette.pageChip}`}
            >
              <Sparkles className="h-3.5 w-3.5 text-brand-500" />
              <span className="font-medium">
                {isKm ? "បុគ្គលិក" : "Staff"}
              </span>
              <ChevronRight className="h-3.5 w-3.5 opacity-40" />
              <span
                className={`font-semibold capitalize ${palette.pageChipStrong}`}
              >
                {pageLabel}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2.5">
            <div
              className={`flex items-center rounded-full border p-0.5 ${palette.toggleWrap}`}
            >
              <button
                onClick={() => i18n.changeLanguage("km")}
                className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                  i18n.language === "km"
                    ? palette.toggleActive
                    : palette.toggleIdle
                }`}
              >
                ខ្មែរ
              </button>
              <button
                onClick={() => i18n.changeLanguage("en")}
                className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                  i18n.language === "en"
                    ? palette.toggleActive
                    : palette.toggleIdle
                }`}
              >
                EN
              </button>
            </div>

            <button
              onClick={toggleTheme}
              className={`rounded-full border p-2 transition ${palette.iconBtn}`}
              title="Toggle Theme"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>

            <div className="hidden h-8 w-px bg-line dark:bg-white/10 lg:block" />

            <div className="hidden items-center gap-2.5 lg:flex">
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${palette.avatar}`}
              >
                {initials}
              </span>
              <div className="max-w-[160px]">
                <div className="truncate text-xs font-semibold text-forest dark:text-cream">
                  {displayName}
                </div>
                <div className="truncate text-xs text-muted dark:text-white/40">
                  {userSubtitle}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="premium-workspace flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1280px] p-4 md:p-7 lg:p-9">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
