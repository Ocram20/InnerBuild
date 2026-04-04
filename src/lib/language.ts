/** App locale from localStorage + browser — single source for i18n, Stripe, and <html lang>. */
export const STORAGE_KEY = "innerbloom-language";

export const supportedTranslationLanguages = [
  "it",
  "en",
  "de",
  "fr",
  "es",
  "ru",
  "ro",
  "pt",
  "zh",
] as const;

export type SupportedTranslationLanguage = (typeof supportedTranslationLanguages)[number];

function isSupported(value: string): value is SupportedTranslationLanguage {
  return (supportedTranslationLanguages as readonly string[]).includes(value);
}

/**
 * Resolves initial UI language: saved preference, else first matching browser language, else Italian.
 * Used by i18n init and should match the inline script in index.html.
 */
export function getInitialLanguage(): SupportedTranslationLanguage {
  if (typeof window === "undefined") return "it";

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved && isSupported(saved)) return saved;
  } catch {
    /* private mode */
  }

  const nav = (typeof navigator !== "undefined" ? navigator.language : "it").toLowerCase();
  if (nav.startsWith("zh")) return "zh";

  for (const code of supportedTranslationLanguages) {
    if (nav.startsWith(code)) return code;
  }

  return "it";
}

/** BCP 47 tag for <html lang> and Intl */
export function htmlLangFromAppCode(code: string): string {
  if (code === "zh") return "zh-CN";
  return code;
}

export function getPreferredTranslationLanguage(): SupportedTranslationLanguage {
  return getInitialLanguage();
}
