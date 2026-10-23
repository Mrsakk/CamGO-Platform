import { create } from "zustand";

export const useThemeStore = create((set) => {
  const saved = localStorage.getItem("km_biz_theme") || "light";
  if (saved === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }

  return {
    theme: saved,
    toggleTheme: () => {
      set((state) => {
        const next = state.theme === "dark" ? "light" : "dark";
        localStorage.setItem("km_biz_theme", next);
        if (next === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
        return { theme: next };
      });
    },
  };
});
