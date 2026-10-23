import { create } from "zustand";
import { adminApi } from "@/lib/api/admin";

const DEFAULT_SETTINGS = {
  site_name_en: "CamGO",
  site_name_highlight: "GO",
  site_name_km: "CamGO",
  site_tagline_en: "Trusted Local. Direct Connection.",
  site_tagline_km: "ទំនុកចិត្តក្នុងស្រុក ទំនាក់ទំនងផ្ទាល់",
  logo_badge_text: "CG",
  logo_url: "",
  favicon_url: "/favicon.ico",
};

export const useAdminSettingsStore = create((set, get) => ({
  settings: DEFAULT_SETTINGS,
  isLoaded: false,
  isLoading: false,

  fetchSettings: async () => {
    if (get().isLoading) return;
    set({ isLoading: true });
    try {
      const res = await adminApi.getSettings();
      const items = res?.data?.items || (Array.isArray(res?.data) ? res.data : []);
      if (Array.isArray(items)) {
        const map = {};
        items.forEach((s) => {
          map[s.key] = typeof s.value === "string" ? s.value : (s.value === null || s.value === undefined ? "" : JSON.stringify(s.value));
        });
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
