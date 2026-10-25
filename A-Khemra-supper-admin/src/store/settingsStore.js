import { create } from "zustand";
import { adminApi } from "@/lib/api/admin";

const DEFAULT_SETTINGS = {
  site_name_en: "CamGO",
  site_name_highlight: "GO",
  site_name_km: "CamGO",
  site_tagline_en: "Trusted Local. Direct Connection.",
  site_tagline_km: "ទំនុកចិត្តក្នុងស្រុក ទំនាក់ទំនងផ្ទាល់",
  logo_badge_text: "CG",
  logo_url: "/logo.png",
  favicon_url: "/favicon.ico",
};

export const resolveAssetUrl = (url) => {
  if (!url) return "/logo.png";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:") || url.startsWith("blob:")) {
    return url;
  }
  if (url === "/logo.png" || url === "logo.png") {
    return "/logo.png";
  }
  const storageBase =
    import.meta.env.VITE_STORAGE_URL ||
    import.meta.env.VITE_API_URL?.replace(/\/api\/v1\/?$/, "") ||
    "";
  const cleanPath = url.startsWith("/") ? url : `/${url}`;
  return storageBase ? `${storageBase.replace(/\/+$/, "")}${cleanPath}` : cleanPath;
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

export const useAdminSettingsStore = create((set, get) => ({
  settings: DEFAULT_SETTINGS,
  isLoaded: false,
  isLoading: false,

  fetchSettings: async () => {
    if (get().isLoading || get().isLoaded) return;
    set({ isLoading: true });
    try {
      const res = await adminApi.getSettings();
      const items = res?.data?.items || (Array.isArray(res?.data) ? res.data : []);
      if (Array.isArray(items)) {
        const map = {};
        items.forEach((s) => {
          map[s.key] = typeof s.value === "string" ? s.value : (s.value === null || s.value === undefined ? "" : JSON.stringify(s.value));
        });
        if (map.favicon_url) updateFavicon(map.favicon_url);
        else if (map.logo_url) updateFavicon(map.logo_url);
        set((state) => ({
          settings: {
            ...state.settings,
            ...map,
          },
          isLoaded: true,
          isLoading: false,
        }));
      }
    } catch (err) {
      console.warn("Could not load admin platform settings:", err);
      set({ isLoaded: true, isLoading: false });
    }
  },

  updateSettingState: (key, val) => {
    set((state) => ({
      settings: {
        ...state.settings,
        [key]: val,
      },
    }));
  },
}));
