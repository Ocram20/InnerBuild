const STORAGE_KEY = "innerbloom-language";

export const supportedTranslationLanguages = ["it", "en", "de", "fr", "es", "ru", "ro"] as const;

export type SupportedTranslationLanguage = (typeof supportedTranslationLanguages)[number];

declare global {
  interface Window {
    google?: {
      translate: {
        TranslateElement: new (options: unknown, elementId: string) => void;
      };
    };
    googleTranslateElementInit?: () => void;
  }
}

function isSupportedTranslationLanguage(value: string): value is SupportedTranslationLanguage {
  return (supportedTranslationLanguages as readonly string[]).includes(value);
}

export function setGoogTransCookie(langCode: SupportedTranslationLanguage) {
  if (typeof document === "undefined" || typeof window === "undefined") return;

  const value = langCode === "it" ? "" : `/it/${langCode}`;
  document.cookie = `googtrans=${value}; path=/;`;
  document.cookie = `googtrans=${value}; path=/; domain=${window.location.hostname};`;

  const parts = window.location.hostname.split(".");
  if (parts.length >= 2) {
    const rootDomain = parts.slice(-2).join(".");
    document.cookie = `googtrans=${value}; path=/; domain=.${rootDomain};`;
  }
}

function getCurrentLangFromCookie(): SupportedTranslationLanguage {
  if (typeof document === "undefined") return "it";

  const match = document.cookie.match(/googtrans=\/it\/(\w+)/);
  const cookieLanguage = match?.[1];

  return cookieLanguage && isSupportedTranslationLanguage(cookieLanguage)
    ? cookieLanguage
    : "it";
}

export function getPreferredTranslationLanguage(): SupportedTranslationLanguage {
  if (typeof window === "undefined") return "it";

  const savedLanguage = window.localStorage.getItem(STORAGE_KEY);
  if (savedLanguage && isSupportedTranslationLanguage(savedLanguage)) {
    return savedLanguage;
  }

  return getCurrentLangFromCookie();
}

export function initGoogleTranslate() {
  if (typeof document === "undefined" || typeof window === "undefined") return;
  if (document.getElementById("google-translate-script")) return;

  if (!document.getElementById("google_translate_element")) {
    const container = document.createElement("div");
    container.id = "google_translate_element";
    container.style.display = "none";
    document.body.appendChild(container);
  }

  window.googleTranslateElementInit = () => {
    if (!window.google?.translate) return;

    new window.google.translate.TranslateElement(
      {
        pageLanguage: "it",
        includedLanguages: supportedTranslationLanguages.join(","),
        autoDisplay: false,
        layout: 0,
      },
      "google_translate_element",
    );
  };

  const script = document.createElement("script");
  script.id = "google-translate-script";
  script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  script.async = true;
  document.body.appendChild(script);
}

export function reapplyGoogleTranslate(language = getPreferredTranslationLanguage()) {
  if (typeof document === "undefined" || typeof window === "undefined") return;
  if (language === "it") return;

  setGoogTransCookie(language);
  initGoogleTranslate();

  const applyTranslation = () => {
    const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo");
    if (!combo) return false;

    combo.value = language;
    combo.dispatchEvent(new Event("change"));
    return true;
  };

  if (applyTranslation()) return;

  window.setTimeout(applyTranslation, 150);
  window.setTimeout(applyTranslation, 500);
}
