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
    return (
      <div className="rounded-[32px] border border-gray-100 dark:border-white/5 bg-white dark:bg-[#1a212e]/50 dark:glass-card p-6 relative overflow-hidden card-glow dark:card-lift">
        <div className="flex items-center justify-center h-16">
          <div className="animate-pulse text-muted-foreground dark:text-[#6c8093]">{t("common.loading")}</div>
        </div>
      </div>
    );
  }

  const quoteIndex = (dayOfYear % quotes.length);
  const dailyQuote = quotes[quoteIndex].quote;

  return (
    <div className="rounded-[32px] border border-gray-100 dark:border-white/5 bg-white dark:bg-[#1a212e]/50 dark:glass-card p-6 relative overflow-hidden card-glow dark:card-lift">
      <div className="absolute top-0 right-0 w-24 h-24 bg-[#4b9b75]/5 dark:bg-[#4b9b75]/5 rounded-bl-[100px]" />
      <Quote className="text-3xl text-[#4b9b75]/20 dark:text-[#4b9b75]/40 mb-2 block" />
      <p className="text-lg font-semibold text-[#29333d] dark:text-white/90 leading-snug italic">
        "{dailyQuote}"
      </p>
      <div className="mt-4 flex items-center gap-2">
        <span className="text-[10px] font-bold text-[#4b9b75] uppercase tracking-widest">
          {t("dashboard.quote_of_the_day")}
        </span>
      </div>
    </div>
  );
}
