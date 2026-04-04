import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { STORAGE_KEY, htmlLangFromAppCode, supportedTranslationLanguages } from "@/lib/language";

/** Keeps <html lang>, localStorage, and i18n aligned (also when another tab changes language). */
export default function I18nDocumentSync() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const sync = () => {
      const code = (i18n.resolvedLanguage || i18n.language || "it").split("-")[0];
      document.documentElement.lang = htmlLangFromAppCode(code);
    };
    sync();

    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || !e.newValue) return;
      if ((supportedTranslationLanguages as readonly string[]).includes(e.newValue) && e.newValue !== i18n.language) {
        void i18n.changeLanguage(e.newValue);
      }
    };
    window.addEventListener("storage", onStorage);
    i18n.on("languageChanged", sync);
    return () => {
      window.removeEventListener("storage", onStorage);
      i18n.off("languageChanged", sync);
    };
  }, [i18n]);

  return null;
}
