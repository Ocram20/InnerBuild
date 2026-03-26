import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen, 
  Brain, 
  Heart, 
  Zap, 
  RefreshCw,
  Clock,
  ChevronDown,
  ChevronUp,
  Lightbulb
} from "lucide-react";
import { useTranslation } from "react-i18next";
interface Article {
  id: string;
  icon: React.ReactNode;
}

const articleMeta: Article[] = [
  { id: "dopamine", icon: <Brain className="h-5 w-5 text-violet-500" /> },
  { id: "relapses", icon: <RefreshCw className="h-5 w-5 text-amber-500" /> },
  { id: "withdrawal", icon: <Zap className="h-5 w-5 text-rose-500" /> },
  { id: "habits", icon: <Heart className="h-5 w-5 text-emerald-500" /> },
  { id: "neuroplasticity", icon: <Lightbulb className="h-5 w-5 text-sky-500" /> },
];

export function RecoveryEducation() {
  const { t } = useTranslation();
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);
  const toggleArticle = (id: string) => {
    setExpandedArticle(expandedArticle === id ? null : id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <BookOpen className="h-5 w-5 text-primary" />
        <p className="text-muted-foreground">
          {"Letture brevi per capire il tuo percorso e costruire consapevolezza."}
        </p>
      </div>

      {articleMeta.map((article) => {
        const title = t(`learn_content.guides.${article.id}.title`);
        const category = t(`learn_content.guides.${article.id}.category`);
        const readTime = t(`learn_content.guides.${article.id}.read_time`);
        const summary = t(`learn_content.guides.${article.id}.summary`);
        const content = t(`learn_content.guides.${article.id}.content`, { returnObjects: true }) as string[];
        const keyTakeaways = t(`learn_content.guides.${article.id}.key_takeaways`, { returnObjects: true }) as string[];

        return (
          <Card 
            key={article.id} 
            className={`transition-all duration-300 ${
              expandedArticle === article.id ? "ring-2 ring-primary/20" : ""
            }`}
          >
            <CardHeader 
              className="pb-2 cursor-pointer hover:bg-muted/30 transition-colors rounded-t-lg"
              onClick={() => toggleArticle(article.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{article.icon}</div>
                  <div>
                    <CardTitle className="text-base">{title}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">{category}</Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {readTime}
                      </span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  {expandedArticle === article.id ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2 ml-8">{summary}</p>
            </CardHeader>

            {expandedArticle === article.id && (
              <CardContent className="pt-2 border-t border-border/50">
                <div className="space-y-4 ml-8">
                  {Array.isArray(content) && content.map((paragraph, i) => (
                    <p key={i} className="text-sm text-foreground/90 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}

                  <div className="bg-primary/5 rounded-lg p-4 mt-4">
                    <p className="font-medium text-sm mb-2 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-primary" />
                      {"Punti Chiave"}
                    </p>
                    <ul className="space-y-1.5">
                      {Array.isArray(keyTakeaways) && keyTakeaways.map((takeaway, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          {takeaway}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
