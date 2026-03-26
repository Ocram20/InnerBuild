import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ChevronRight } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { it, enUS } from "date-fns/locale";
import type { LocalizedArticle } from "@/hooks/useArticles";
import { useTranslation } from "react-i18next";

interface ArticleCardProps {
  article: LocalizedArticle;
  onClick: () => void;
}

export function ArticleCard({ article, onClick }: ArticleCardProps) {
  const { i18n } = useTranslation();
  const dateLocale = i18n.language === "it" ? it : enUS;
  const publishedDate = new Date(article.published_at);
  const isRecent = Date.now() - publishedDate.getTime() < 7 * 24 * 60 * 60 * 1000;

  return (
    <Card 
      className="cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/20 group"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {isRecent && (
                <Badge variant="default" className="text-xs bg-primary/10 text-primary border-0">
                  {"Nuovo"}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(publishedDate, "PPP", { locale: dateLocale })}
              </span>
            </div>
            <h3 className="font-semibold text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {article.title}
            </h3>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
          {article.summary}
        </p>
        <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{formatDistanceToNow(publishedDate, { addSuffix: true, locale: dateLocale })}</span>
        </div>
      </CardContent>
    </Card>
  );
}
