import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { it, enUS } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import type { LocalizedArticle } from "@/hooks/useArticles";
import { useTranslation } from "react-i18next";
import { useUiBatchTranslation } from "@/hooks/useUiBatchTranslation";

interface ArticleDetailProps {
  article: LocalizedArticle | null | undefined;
  isLoading: boolean;
  onBack: () => void;
}

export function ArticleDetail({ article, isLoading, onBack }: ArticleDetailProps) {
  const { i18n, t } = useTranslation();
  const dateLocale = i18n.language === "it" ? it : enUS;
  const shouldTranslateContent = (i18n.resolvedLanguage || i18n.language || "it").toLowerCase().split("-")[0] !== "it";
  const contentBlocks = article?.content ? article.content.split("\\n\\n") : [];
  const rawStrings = article
    ? [article.title, article.summary, ...contentBlocks]
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
    : [];
  const { display } = useUiBatchTranslation(rawStrings, shouldTranslateContent && rawStrings.length > 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          {t("learn_content.back_to_articles")}
        </Button>
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/3" />
          <Separator />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          {t("learn_content.back_to_articles")}
        </Button>
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t("learn_content.no_articles_title")}</p>
        </div>
      </div>
    );
  }

  const publishedDate = new Date(article.published_at);

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 -ml-2">
        <ArrowLeft className="h-4 w-4" />
        {t("learn_content.back_to_articles")}
      </Button>

      <article className="space-y-6">
        {article.cover_image_url && (
          <div className="w-full h-64 sm:h-80 overflow-hidden rounded-xl bg-muted border border-border">
            <img 
              src={article.cover_image_url} 
              alt={article.title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <header className="space-y-4">
          <h1 className="text-2xl font-bold leading-tight tracking-tight">
            {shouldTranslateContent ? display(article.title) : article.title}
          </h1>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {format(publishedDate, "PPP", { locale: dateLocale })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {formatDistanceToNow(publishedDate, { addSuffix: true, locale: dateLocale })}
            </span>
          </div>

          <p className="text-muted-foreground leading-relaxed text-base italic border-l-2 border-primary/30 pl-4">
            {shouldTranslateContent ? display(article.summary) : article.summary}
          </p>
        </header>

        <Separator />

        <div className="space-y-4">
          {contentBlocks.map((block, index) => {
            const trimmed = block.trim();
            const shown = shouldTranslateContent ? display(trimmed) : trimmed;
            
            if (shown.startsWith('## ')) {
              return (
                <h2 key={index} className="text-xl font-bold text-foreground mt-6 mb-2">
                  {shown.replace(/^##\s*/, '')}
                </h2>
              );
            }
            
            if (shown.startsWith('### ')) {
              return (
                <h3 key={index} className="text-lg font-semibold text-foreground mt-4 mb-1">
                  {shown.replace(/^###\s*/, '')}
                </h3>
              );
            }

            if (shown.startsWith('# ')) {
              return (
                <h2 key={index} className="text-xl font-bold text-foreground mt-6 mb-2">
                  {shown.replace(/^#\s*/, '')}
                </h2>
              );
            }

            if (shown.split("\\n").every(line => /^[\-\*]\s/.test(line.trim()) || line.trim() === '')) {
              return (
                <ul key={index} className="list-disc pl-5 space-y-1 text-foreground/90 leading-relaxed text-sm">
                  {shown.split("\\n").filter(l => l.trim()).map((item, i) => (
                    <li key={i}>{item.replace(/^[\-\*]\s*/, '')}</li>
                  ))}
                </ul>
              );
            }

            if (/^\*\*(.+)\*\*$/.test(shown) && !shown.includes('\n')) {
              return (
                <p key={index} className="text-base font-semibold text-foreground mt-4 mb-1">
                  {shown.replace(/^\*\*|\*\*$/g, '')}
                </p>
              );
            }

            const renderInlineFormatting = (text: string) => {
              const parts = text.split(/(\*\*[^*]+\*\*)/g);
              return parts.map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
                }
                return part;
              });
            };

            return (
              <p key={index} className="text-sm leading-relaxed text-foreground/90">
                {renderInlineFormatting(shown)}
              </p>
            );
          })}
        </div>
      </article>
    </div>
  );
}
