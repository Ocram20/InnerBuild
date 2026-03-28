import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import it from "./locales/it.json";
import en from "./locales/en.json";
import es from "./locales/es.json";
import de from "./locales/de.json";
import fr from "./locales/fr.json";
import ru from "./locales/ru.json";
import ro from "./locales/ro.json";

const STORAGE_KEY = "innerbloom-language";

function getInitialLanguage(): string {
  // 1. Check localStorage
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && ["it", "en", "es", "de", "fr", "ru", "ro"].includes(saved)) {
    return saved;
  }
  // 2. Browser language fallback
  const browserLang = navigator.language?.split("-")[0];
  if (browserLang && ["it", "en", "es", "de", "fr", "ru", "ro"].includes(browserLang)) {
    return browserLang;
  }
  return "it";
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      it: { translation: it },
      en: { translation: en },
      es: { translation: es },
      de: { translation: de },
      fr: { translation: fr },
      ru: { translation: ru },
      ro: { translation: ro },
    },
    lng: getInitialLanguage(),
    fallbackLng: "it",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
