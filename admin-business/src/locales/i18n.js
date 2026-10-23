import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import km from "./km.json";
import en from "./en.json";

const savedLng = localStorage.getItem("km_biz_lng") || "km";

i18n
  .use(LanguageDetector)
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
  localStorage.setItem("km_biz_lng", lng);
  document.documentElement.lang = lng;
});

export default i18n;
