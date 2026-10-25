import { create } from "zustand";
import { contentApi } from "@/lib/api/content";

const DEFAULT_SETTINGS = {
  site_name_en: "CamGO",
  site_name_highlight: "GO",
  site_name_km: "CamGO",
  site_tagline_en: "Trusted Local. Direct Connection.",
  site_tagline_km: "ទំនុកចិត្តក្នុងស្រុក ទំនាក់ទំនងផ្ទាល់",
  logo_badge_text: "CG",
  logo_url: "",
  favicon_url: "/favicon.ico",
  contact_email: "contact@camgo.com",
  contact_phone: "+855 23 888 777",
  contact_address_en: "No. 88, Preah Norodom Blvd, Daun Penh, Phnom Penh, Cambodia",
  contact_address_km: "អគារលេខ ៨៨ មហាវិថីព្រះនរោត្តម ខណ្ឌដូនពេញ រាជធានីភ្នំពេញ",
  social_facebook: "https://facebook.com/camgo",
  social_instagram: "https://instagram.com/camgo",
  social_telegram: "https://t.me/camgo",
  social_youtube: "https://youtube.com/@camgo",
};

export const resolveAssetUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:") || url.startsWith("blob:")) {
    return url;
  }
  return url;
};

export const updateFavicon = (url) => {
  if (!url || typeof document === "undefined") return;
  const resolved = resolveAssetUrl(url);
  let link = document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.type = resolved.endsWith(".svg") ? "image/svg+xml" : "image/png";
  link.href = resolved;
};

export const useSettingsStore = create((set, get) => ({
  settings: DEFAULT_SETTINGS,
  isLoaded: false,
  isLoading: false,

  fetchSettings: async () => {
    if (get().isLoading) return;
    set({ isLoading: true });
    try {
      const res = await contentApi.getSettings();
      const data = res?.data || res || {};
      if (typeof data === "object" && data !== null) {
        if (data.favicon_url) updateFavicon(data.favicon_url);
        else if (data.logo_url) updateFavicon(data.logo_url);
        set((state) => ({
          settings: {
            ...state.settings,
            ...data,
          },
          isLoaded: true,
          isLoading: false,
        }));
      }
    } catch (err) {
      console.warn("Could not load dynamic site settings, using defaults:", err);
      set({ isLoaded: true, isLoading: false });
    }
  },

  getSiteName: (isKm = false) => {
    const s = get().settings;
    return isKm ? (s.site_name_km || s.site_name_en || DEFAULT_SETTINGS.site_name_km) : (s.site_name_en || DEFAULT_SETTINGS.site_name_en);
  },

  getTagline: (isKm = false) => {
    const s = get().settings;
    return isKm ? (s.site_tagline_km || DEFAULT_SETTINGS.site_tagline_km) : (s.site_tagline_en || DEFAULT_SETTINGS.site_tagline_en);
  },
}));
