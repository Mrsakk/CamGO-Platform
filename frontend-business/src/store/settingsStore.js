import { create } from "zustand";
import api from "@/lib/axios";

const DEFAULT_SETTINGS = {
  site_name_en: "CamGO",
  site_name_highlight: "GO",
  site_name_km: "CamGO",
  site_tagline_en: "Trusted Local. Direct Connection.",
  site_tagline_km: "ទំនុកចិត្តក្នុងស្រុក ទំនាក់ទំនងផ្ទាល់",
  logo_badge_text: "CG",
  logo_url: "",
  favicon_url: "/favicon.svg",
  contact_email: "contact@camgo.com",
  contact_phone: "+855 23 888 777",
};

export const resolveAssetUrl = (url) => {
  if (!url) return "";
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:") ||
    url.startsWith("blob:")
  ) {
    return url;
  }
  return url.startsWith("/") ? url : `/${url}`;
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
}));
