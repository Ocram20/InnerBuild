import { useEffect, useState, useCallback } from "react";
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

function setGoogTransCookie(langCode: string) {
  const value = langCode === "it" ? "" : `/it/${langCode}`;
  // Set on current domain and root
  document.cookie = `googtrans=${value}; path=/;`;
  document.cookie = `googtrans=${value}; path=/; domain=${window.location.hostname};`;
  // Also set with dot prefix for subdomains
  const parts = window.location.hostname.split(".");
  if (parts.length >= 2) {
    const rootDomain = parts.slice(-2).join(".");
    document.cookie = `googtrans=${value}; path=/; domain=.${rootDomain};`;
  }
}

function getCurrentLangFromCookie(): string {
  const match = document.cookie.match(/googtrans=\/it\/(\w+)/);
  return match ? match[1] : "it";
}

function initGoogleTranslate() {
  if (document.getElementById("google-translate-script")) return;

  // Create the hidden container for Google Translate widget
  if (!document.getElementById("google_translate_element")) {
    const div = document.createElement("div");
    div.id = "google_translate_element";
    div.style.display = "none";
    document.body.appendChild(div);
  }

  window.googleTranslateElementInit = () => {
    if (window.google?.translate) {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "it",
          includedLanguages: "it,en,de,fr,es,ru,ro",
          autoDisplay: false,
          layout: 0, // HIDDEN layout
        },
        "google_translate_element"
      );
    }
  };

  const script = document.createElement("script");
  script.id = "google-translate-script";
  script.src =
    "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  script.async = true;
  document.body.appendChild(script);
}

export default function LanguageSelector() {
  const [currentLang, setCurrentLang] = useState(() => {
    // Check localStorage first, then cookie
    const saved = localStorage.getItem("innerbloom-language");
    if (saved) return saved;
    return getCurrentLangFromCookie();
  });

  useEffect(() => {
    initGoogleTranslate();
  }, []);

  const handleLanguageChange = useCallback((langCode: string) => {
    setCurrentLang(langCode);
    localStorage.setItem("innerbloom-language", langCode);
    setGoogTransCookie(langCode);
    
    // If switching to Italian (base language), reset Google Translate before reload
    if (langCode === "it") {
      const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo");
      if (combo) {
        combo.value = "it";
        combo.dispatchEvent(new Event("change"));
      }
      // Clear all googtrans cookies
      document.cookie = "googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = `googtrans=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      const parts = window.location.hostname.split(".");
      if (parts.length >= 2) {
        const rootDomain = parts.slice(-2).join(".");
        document.cookie = `googtrans=; path=/; domain=.${rootDomain}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      }
    }
    
    // Reload to apply translation
    window.location.reload();
  }, []);

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
