import type { Locale } from "date-fns";
import { enUS, it as itLocale, zhCN, de, fr, es, ptBR, ru, ro } from "date-fns/locale";

const DATE_FNS_LOCALES: Record<string, Locale> = {
  en: enUS,
  it: itLocale,
  zh: zhCN,
  de,
  fr,
  es,
  pt: ptBR,
  ru,
  ro,
};

/** Maps app i18n language code (e.g. zh-CN → zh) to date-fns locale. */
export function dateFnsLocale(code: string | undefined): Locale {
  const base = (code || "it").split("-")[0];
  return DATE_FNS_LOCALES[base] ?? itLocale;
}
