import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

const languages = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
];

export default function LanguageSelector() {
  const currentLang = languages.find(lang => lang.code === (i18n.language?.substring(0, 2) || "en"));

  return (
    <Select value={i18n.language?.substring(0, 2) || "en"} onValueChange={(val) => i18n.changeLanguage(val)}>
      <SelectTrigger className="w-auto h-9 rounded-full border-border/50 bg-transparent px-2.5 gap-1.5 items-center justify-start">
        <div className="md:hidden">
          <span className="text-lg">{currentLang?.flag}</span>
        </div>
        <div className="hidden md:flex items-center gap-1.5">
          <Globe className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="text-xs">{currentLang?.label}</span>
        </div>
      </SelectTrigger>
      
      <SelectContent side="top" align="start" className="max-w-32">
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
