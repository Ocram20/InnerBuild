import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import de from "./locales/de.json";
import fr from "./locales/fr.json";
import es from "./locales/es.json";
import ru from "./locales/ru.json";
import ro from "./locales/ro.json";
import pt from "./locales/pt.json";
import zh from "./locales/zh.json";
import it from "./locales/it.json";
import { getInitialLanguage, htmlLangFromAppCode } from "@/lib/language";

const resources = {
  it: { translation: it },
  en: { translation: en },
  de: { translation: de },
  fr: { translation: fr },
  es: { translation: es },
  ru: { translation: ru },
  ro: { translation: ro },
  pt: { translation: pt },
  zh: { translation: zh },
} as const;

const supportedLngs = Object.keys(resources) as Array<keyof typeof resources>;

function syncDocumentLang(code: string) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = htmlLangFromAppCode(code);
}

export async function initI18n() {
  if (i18n.isInitialized) return i18n;

  const lng = getInitialLanguage();

  await i18n.use(initReactI18next).init({
    resources,
    lng,
    fallbackLng: "it",
    supportedLngs: supportedLngs as string[],
    load: "languageOnly",
    nonExplicitSupportedLngs: true,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

  syncDocumentLang(i18n.resolvedLanguage || i18n.language || lng);

  return i18n;
}

export default i18n;
