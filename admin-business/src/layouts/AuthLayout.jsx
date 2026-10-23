import { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle2, Store } from "lucide-react";
import { useSettingsStore, resolveAssetUrl } from "@/store/settingsStore";
import { ToastContainer } from "@/components/common/ToastContainer";

const highlights = [
  "0% booking commission",
  "Verified Cambodian businesses",
  "Direct customer conversations",
];

export const AuthLayout = () => {
  const { pathname } = useLocation();
  const { i18n } = useTranslation();
  const isKm = i18n.language === "km";
  const { settings, fetchSettings } = useSettingsStore();
  const [logoImgError, setLogoImgError] = useState(false);
  const isSetup = pathname === "/set-password";

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return (
    <div className="premium-workspace relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 dark:bg-stone-900 sm:px-6 lg:px-8">
      <ToastContainer />

      <div className="relative grid w-full max-w-4xl overflow-hidden rounded-card border border-line bg-cream shadow-premium dark:border-white/10 dark:bg-stone-850 lg:grid-cols-2">
        <aside className="relative hidden flex-col justify-between overflow-hidden bg-forest p-10 text-cream lg:flex xl:p-12">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-brand-500" />

          <div className="relative">
            <Link to="/" className="group flex items-center gap-3">
              {settings.logo_url && !logoImgError ? (
                <img
                  src={resolveAssetUrl(settings.logo_url)}
                  alt={settings.site_name_en || "Logo"}
                  className="h-11 w-auto max-w-[160px] object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
                  onError={() => setLogoImgError(true)}
                />
              ) : (
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-brand-300/20 bg-brand-500 font-serif text-base font-bold text-forest shadow-gold">
                  <Store className="h-5 w-5" />
                </span>
              )}
              <div>
                <p className="font-serif text-lg font-semibold text-cream">
                  {isKm ? (settings.site_name_km || "CamGO") : (settings.site_name_en || "CamGO")}
                </p>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-300">
                  Admin Portal
                </p>
              </div>
            </Link>

            <h1 className="mt-12 max-w-sm text-2xl leading-tight text-cream xl:text-3xl">
              Keep every listing accurate and trusted.
            </h1>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/55">
              Review business profiles, verify partners, and support the CamGO
              directory team.
            </p>
          </div>

          <div className="relative mt-12 space-y-4">
            {highlights.map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-white/70">
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-brand-300/20 bg-brand-500/10 text-brand-300">
                  <CheckCircle2 className="h-4 w-4" />
                </span>
                {item}
              </div>
            ))}
            <div className="pt-8">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/40">
                Phnom Penh · Siem Reap · Cambodia
              </p>
            </div>
          </div>
        </aside>

        <main className="p-6 sm:p-10 lg:p-12">
          <div className="mb-8 lg:hidden">
            <Link to="/" className="mb-5 flex items-center gap-3">
              {settings.logo_url && !logoImgError ? (
                <img
                  src={resolveAssetUrl(settings.logo_url)}
                  alt={settings.site_name_en || "Logo"}
                  className="h-10 w-auto max-w-[140px] object-contain drop-shadow-sm"
                  onError={() => setLogoImgError(true)}
                />
              ) : (
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-forest font-serif text-sm font-bold text-brand-200 shadow-premium">
                  <Store className="h-5 w-5" />
                </span>
              )}
              <div>
                <p className="font-serif text-base font-semibold text-forest dark:text-white">
                  {isKm ? (settings.site_name_km || "CamGO") : (settings.site_name_en || "CamGO")}
                </p>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-700 dark:text-brand-300">
                  Admin Portal
                </p>
              </div>
            </Link>
          </div>

          <div className="mb-8 hidden lg:block">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-brand-700 dark:text-brand-300">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              {isSetup ? "Owner onboarding" : "Welcome back"}
            </p>
            <h2 className="mt-3 text-3xl text-forest dark:text-white">
              {isSetup ? "Create your password" : "Sign in to your portal"}
            </h2>
            <p className="mt-2 text-sm text-muted dark:text-stone-400">
              {isSetup
                ? "Finish setting up your business owner account."
                : "Staff access only. Business owners use the CamGO Business portal."}
            </p>
          </div>

          <Outlet />
        </main>
      </div>
    </div>
  );
};
