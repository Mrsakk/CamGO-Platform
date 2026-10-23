import { create } from "zustand";

const savedTheme = typeof localStorage !== "undefined" ? localStorage.getItem("km_travel_theme") : null;
const initialIsDark = savedTheme ? savedTheme === "dark" : false;

const savedVisualStyle = typeof localStorage !== "undefined" ? localStorage.getItem("km_visual_style") : null;
// Default to sandstone as requested
const initialVisualStyle = savedVisualStyle || "sandstone";

if (typeof document !== "undefined") {
  if (initialIsDark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  document.documentElement.setAttribute("data-theme", initialVisualStyle);
}

const useThemeStore = create((set) => ({
  theme: initialIsDark ? "dark" : "light",
  isDark: initialIsDark,
  visualStyle: initialVisualStyle, // 'sandstone' | 'blueprint'

  toggleTheme: () => {
    set((state) => {
      const next = !state.isDark;
      const nextTheme = next ? "dark" : "light";
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("km_travel_theme", nextTheme);
      }
      if (typeof document !== "undefined") {
        if (next) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
      return { isDark: next, theme: nextTheme };
    });
  },

  setTheme: (val) => {
    const isDark = typeof val === "boolean" ? val : val === "dark";
    const nextTheme = isDark ? "dark" : "light";
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("km_travel_theme", nextTheme);
    }
    if (typeof document !== "undefined") {
      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
    set({ isDark, theme: nextTheme });
  },

  toggleVisualStyle: () => {
    set((state) => {
      const nextStyle = state.visualStyle === "sandstone" ? "blueprint" : "sandstone";
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("km_visual_style", nextStyle);
      }
      if (typeof document !== "undefined") {
        document.documentElement.setAttribute("data-theme", nextStyle);
      }
      return { visualStyle: nextStyle };
    });
  },

  setVisualStyle: (style) => {
    const validStyle = style === "blueprint" ? "blueprint" : "sandstone";
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("km_visual_style", validStyle);
    }
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", validStyle);
    }
    set({ visualStyle: validStyle });
  },
}));

export { useThemeStore };

