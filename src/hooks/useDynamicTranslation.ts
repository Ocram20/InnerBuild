import { useUiBatchTranslation } from "./useUiBatchTranslation";
import { useTranslation } from "react-i18next";

/**
 * A wrapper around useUiBatchTranslation that automatically enables/disables
 * translation based on whether the current UI language matches the content's original language.
 */
export function useDynamicTranslation(strings: string[], originalLanguage?: string | null) {
  const { i18n } = useTranslation();
  const currentLang = (i18n.resolvedLanguage || i18n.language || "it").toLowerCase().split("-")[0];
  const contentLang = (originalLanguage || "it").toLowerCase().split("-")[0];

  // Enable translation only if languages differ
  const shouldTranslate = currentLang !== contentLang;

  return useUiBatchTranslation(strings, shouldTranslate);
}
