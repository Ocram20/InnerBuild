import { useState } from "react";
import { useArticles, useArticle } from "@/hooks/useArticles";
import { ArticleCard } from "./ArticleCard";
import { ArticleDetail } from "./ArticleDetail";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ArticlesListProps {
  category?: "article" | "guide";
  icon?: React.ReactNode;
  descriptionKey?: string;
  emptyTitleKey?: string;
  emptyDescKey?: string;
}

export function ArticlesList({ 
  category = "article",
  icon = <FileText className="h-5 w-5 text-primary" />,
  descriptionKey = "learn_content.articles_description",
  emptyTitleKey = "learn_content.no_articles_title",
  emptyDescKey = "learn_content.no_articles_description"
}: ArticlesListProps) {
  const { t } = useTranslation();
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const { data: articles, isLoading: isLoadingList } = useArticles(category);
  const { data: selectedArticle, isLoading: isLoadingDetail } = useArticle(selectedArticleId ?? undefined);

  if (selectedArticleId) {
    return (
      <ArticleDetail 
        article={selectedArticle} 
        isLoading={isLoadingDetail}
        onBack={() => setSelectedArticleId(null)} 
      />
    );
  }

  if (isLoadingList) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          {icon}
          <p className="text-muted-foreground">{t(descriptionKey)}</p>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg p-6 space-y-3 bg-card">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (!articles || articles.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          {icon}
          <p className="text-muted-foreground">{t(descriptionKey)}</p>
        </div>
        <div className="text-center py-12 px-4 border rounded-lg bg-muted/30">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="font-medium text-lg mb-2">{t(emptyTitleKey)}</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            {t(emptyDescKey)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <p className="text-muted-foreground">{t(descriptionKey)}</p>
      </div>
      
      <div className="space-y-3">
        {articles.map((article) => (
          <ArticleCard 
            key={article.id} 
            article={article} 
            onClick={() => setSelectedArticleId(article.id)}
          />
        ))}
      </div>
    </div>
  );
}
