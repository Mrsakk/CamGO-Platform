import { create } from "zustand";
import api from "@/lib/axios";

const DEFAULT_SETTINGS = {
  site_name_en: "CamGO",
  site_name_highlight: "GO",
  site_name_km: "CamGO",
  site_tagline_en: "Trusted Local. Direct Connection.",
  site_tagline_km: "ទំនុកចិត្តក្នុងស្រុក ទំនាក់ទំនងផ្ទាល់",
  logo_badge_text: "CG",
  logo_url: "/logo.png",
  favicon_url: "/favicon.svg",
  contact_email: "contact@camgo.com",
  contact_phone: "+855 23 888 777",
};

export const resolveAssetUrl = (url) => {
  if (!url) return "/logo.png";
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:") ||
    url.startsWith("blob:")
  ) {
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

export const useSettingsStore = create((set, get) => ({
  settings: DEFAULT_SETTINGS,
  isLoaded: false,
  isLoading: false,

  fetchSettings: async () => {
    if (get().isLoading) return;
    set({ isLoading: true });
    try {
      const res = await api.get("/settings");
      const data = res?.data?.data || res?.data || {};
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
      console.warn("Could not load dynamic site settings in admin-business, using defaults:", err);
      set({ isLoaded: true, isLoading: false });
    }
  },
}));
