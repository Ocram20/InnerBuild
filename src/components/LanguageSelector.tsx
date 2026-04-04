import { useCallback, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { STORAGE_KEY, supportedTranslationLanguages } from "@/lib/language";

const languages = [
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "ro", label: "Română", flag: "🇷🇴" },
  { code: "pt", label: "Português", flag: "🇵🇹" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
];

export default function LanguageSelector() {
  const { i18n } = useTranslation();

  const currentLang = useMemo(
    () => (i18n.resolvedLanguage || i18n.language || "it").split("-")[0],
    [i18n.resolvedLanguage, i18n.language],
  );

  const handleLanguageChange = useCallback(
    (langCode: string) => {
      if (
        !supportedTranslationLanguages.includes(
          langCode as (typeof supportedTranslationLanguages)[number],
        )
      )
        return;
      localStorage.setItem(STORAGE_KEY, langCode);
      void i18n.changeLanguage(langCode);
    },
    [i18n],
  );

  const selected = languages.find((l) => l.code === currentLang) || languages[0];

  return (
    <Select value={currentLang} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-auto h-9 rounded-full border-border/50 bg-transparent px-2.5 gap-1.5 items-center justify-start">
        <div className="md:hidden">
          <span className="text-lg">{selected.flag}</span>
        </div>
        <div className="hidden md:flex items-center gap-1.5">
          <Globe className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="text-xs">{selected.label}</span>
        </div>
      </SelectTrigger>

      <SelectContent side="top" align="start" className="max-w-36">
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code} className="text-xs md:text-sm">
            <span className="mr-2">{lang.flag}</span>
            {lang.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
