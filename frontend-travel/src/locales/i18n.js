import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import km from "./km.json";
import en from "./en.json";
const savedLanguage = localStorage.getItem("km_travel_lang") || "km";
i18n.use(LanguageDetector).use(initReactI18next).init({
  resources: {
    km: { translation: km },
    en: { translation: en }
  },
  lng: savedLanguage,
  fallbackLng: "km",
  interpolation: {
    escapeValue: false
  },
  detection: {
    order: ["localStorage", "navigator"],
    lookupLocalStorage: "km_travel_lang",
    caches: ["localStorage"]
  }
});
if (typeof document !== "undefined") {
  document.documentElement.lang = savedLanguage;
}
i18n.on("languageChanged", (lng) => {
  localStorage.setItem("km_travel_lang", lng);
  if (typeof document !== "undefined") {
    document.documentElement.lang = lng;
  }
});
var stdin_default = i18n;
export {
  stdin_default as default
};
