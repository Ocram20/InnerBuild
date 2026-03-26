import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Globe } from "lucide-react";

const languages = [
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "ro", label: "Română", flag: "🇷🇴" },
];

declare global {
  interface Window {
    google?: {
      translate: {
        TranslateElement: new (options: any, elementId: string) => void;
      };
    };
    googleTranslateElementInit?: () => void;
  }
}

function triggerGoogleTranslate(langCode: string) {
  const frame = document.querySelector<HTMLIFrameElement>(".goog-te-menu-frame");
  if (frame) {
    const items = frame.contentDocument?.querySelectorAll(".goog-te-menu2-item span.text");
    items?.forEach((item) => {
      const langMap: Record<string, string> = {
        it: "Italian", en: "English", de: "German", fr: "French",
        es: "Spanish", ru: "Russian", ro: "Romanian",
      };
      if (item.textContent === langMap[langCode]) {
        (item as HTMLElement).click();
      }
    });
  }
  // Fallback: use the select combo
  const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo");
  if (combo) {
    combo.value = langCode;
    combo.dispatchEvent(new Event("change"));
  }
}

export default function LanguageSelector() {
  const [currentLang, setCurrentLang] = useState("it");

  useEffect(() => {
    // Load Google Translate script
    if (!document.getElementById("google-translate-script")) {
      window.googleTranslateElementInit = () => {
        new window.google!.translate.TranslateElement(
          {
            pageLanguage: "it",
            includedLanguages: "it,en,de,fr,es,ru,ro",
            autoDisplay: false,
          },
          "google_translate_element"
        );
      };

      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }

    // Restore saved language
    const saved = localStorage.getItem("innerbloom-language");
    if (saved && saved !== "it") {
      setCurrentLang(saved);
      // Delay to allow Google Translate to load
      setTimeout(() => triggerGoogleTranslate(saved), 2000);
    }
  }, []);

  const handleLanguageChange = (langCode: string) => {
    setCurrentLang(langCode);
    localStorage.setItem("innerbloom-language", langCode);

    if (langCode === "it") {
      // Reset to original language
      const banner = document.querySelector<HTMLIFrameElement>(".goog-te-banner-frame");
      if (banner?.contentDocument) {
        const restoreBtn = banner.contentDocument.querySelector<HTMLElement>(".goog-te-banner .goog-te-button button");
        restoreBtn?.click();
      }
      // Also try via combo
      const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo");
      if (combo) {
        combo.value = "";
        combo.dispatchEvent(new Event("change"));
      }
      // Clean cookies
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=." + window.location.hostname;
      window.location.reload();
    } else {
      triggerGoogleTranslate(langCode);
    }
  };

  const selected = languages.find((l) => l.code === currentLang) || languages[0];

  return (
    <>
      <div id="google_translate_element" className="hidden" />
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
    </>
  );
}
