import { Quote } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";

interface QuoteData {
  id: number;
  quote: string;
  category: string;
}

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
      try {
        const language = i18n.language?.substring(0, 2) || "en";
        const quotesModule = await import(`@/data/motivational_quotes.${language}.json`);
        setQuotes(quotesModule.default);
      } catch (error) {
        // Fallback to English if language file doesn't exist
        try {
          const quotesModule = await import(`@/data/motivational_quotes.en.json`);
          setQuotes(quotesModule.default);
        } catch (fallbackError) {
          console.error("Failed to load quotes:", fallbackError);
          setQuotes([]);
        }
      } finally {
        setLoading(false);
      }
    };

    loadQuotes();
  }, [i18n.language]);

  if (loading || quotes.length === 0) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card p-4 relative overflow-hidden">
        <div className="flex items-center justify-center h-16">
          <div className="animate-pulse text-muted-foreground">Loading quote...</div>
        </div>
      </div>
    );
  }

  const quoteIndex = (dayOfYear % quotes.length);
  const dailyQuote = quotes[quoteIndex].quote;

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 relative overflow-hidden">
      <div className="absolute top-3 right-3 opacity-10">
        <Quote className="h-12 w-12 text-primary" />
      </div>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Quote className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 font-medium">
            {t("dashboard.quote_of_the_day")}
          </p>
          <p className="text-foreground font-medium italic leading-relaxed">
            "{dailyQuote}"
          </p>
        </div>
      </div>
    </div>
  );
}
