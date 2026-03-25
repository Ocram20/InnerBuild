import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";

export interface Article {
  id: string;
  title: string;
  content: string;
  summary: string;
  title_it: string;
  content_it: string;
  summary_it: string;
  published_at: string;
  is_published: boolean;
  created_at: string;
}

export interface LocalizedArticle {
  id: string;
  title: string;
  content: string;
  summary: string;
  published_at: string;
  is_published: boolean;
  created_at: string;
}

function localizeArticle(article: Article, lang: string): LocalizedArticle {
  const isIt = lang === "it";
  return {
    id: article.id,
    title: (isIt && article.title_it) ? article.title_it : article.title,
    content: (isIt && article.content_it) ? article.content_it : article.content,
    summary: (isIt && article.summary_it) ? article.summary_it : article.summary,
    published_at: article.published_at,
    is_published: article.is_published,
    created_at: article.created_at,
  };
}

export function useArticles() {
  const { i18n } = useTranslation();
  return useQuery({
    queryKey: ["articles", i18n.language],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .order("published_at", { ascending: false });

      if (error) throw error;
      return (data as Article[]).map(a => localizeArticle(a, i18n.language));
    },
  });
}

export function useArticle(id: string | undefined) {
  const { i18n } = useTranslation();
  return useQuery({
    queryKey: ["article", id, i18n.language],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return localizeArticle(data as Article, i18n.language);
    },
    enabled: !!id,
  });
}
