import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import km from "./km.json";
import en from "./en.json";

const savedLng = localStorage.getItem("i18nextLng") || "km";
if (typeof document !== "undefined") {
  document.documentElement.lang = savedLng;
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      km: { translation: km },
      en: { translation: en },
    },
    lng: savedLng,
    fallbackLng: "km",
    interpolation: {
      escapeValue: false,
    },
  });

i18n.on("languageChanged", (lng) => {
  localStorage.setItem("i18nextLng", lng);
  if (typeof document !== "undefined") {
    document.documentElement.lang = lng;
  }
});

export default i18n;
