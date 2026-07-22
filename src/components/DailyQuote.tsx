import { Quote } from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

interface QuoteData {
  id: number;
  quote: string;
  category: string;
}

// Paths must be relative to this file so Vite records correct glob keys (alias keys are unreliable).
const quoteModules = import.meta.glob<{ default: QuoteData[] }>("../data/motivational_quotes.*.json");

export default function DailyQuote() {
  const { t, i18n } = useTranslation();
  const [quotes, setQuotes] = useState<QuoteData[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 0);
  const diff = today.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  // Load quotes based on current language
  useEffect(() => {
    const loadQuotes = async () => {
      setLoading(true);
      try {
        const lang = (i18n.resolvedLanguage || i18n.language || "it").toLowerCase().split("-")[0];
        const langPath = `../data/motivational_quotes.${lang}.json`;
        const fallbackPath = "../data/motivational_quotes.it.json";
        const loadForLang = quoteModules[langPath];
        const loadFallback = quoteModules[fallbackPath];

        if (loadForLang) {
          const quotesModule = await loadForLang();
          const list = quotesModule.default;
          if (Array.isArray(list) && list.length > 0) {
            setQuotes(list);
            return;
          }
        }

        if (loadFallback) {
          const fallbackModule = await loadFallback();
          setQuotes(fallbackModule.default);
          return;
        }

        setQuotes([]);
      } catch (error) {
        console.error("Failed to load quotes:", error);
        setQuotes([]);
      } finally {
        setLoading(false);
      }
    };

    loadQuotes();
  }, [i18n.resolvedLanguage, i18n.language]);

  if (loading || quotes.length === 0) {
    return null;
  }

  const quoteIndex = (dayOfYear % quotes.length);
  const dailyQuote = quotes[quoteIndex].quote;

  return (
    <div className="mt-6 text-center">
      <p className="text-sm italic text-muted-foreground max-w-md mx-auto leading-relaxed">
        "{dailyQuote}"
      </p>
    </div>
  );
}
