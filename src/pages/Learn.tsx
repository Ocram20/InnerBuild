import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, BookOpen, Clock, FileText } from "lucide-react";
import { RecoveryEducation } from "@/components/RecoveryEducation";
import { RecoveryTimeline } from "@/components/RecoveryTimeline";
import { ArticlesList } from "@/components/articles/ArticlesList";
import BottomNavigation from "@/components/BottomNavigation";
import { LearnLockedPreview } from "@/components/learn/LearnLockedPreview";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { useTranslation } from "react-i18next";

export default function Learn() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("articles");
  const { user, loading: authLoading } = useAuth();
  const { hasAdminRole, loading: roleLoading } = useAdminAccess();
  const { subscription, loading: subLoading } = useSubscription({ enabled: !!user && !hasAdminRole });

  const isPremium = hasAdminRole || subscription.subscribed;
  const isLoading = authLoading || roleLoading || (!hasAdminRole && subLoading);
  const fromExplore = location.state?.from === "explore";
  const handleBack = () => navigate(fromExplore ? "/explore" : "/dashboard");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-app-main flex items-center justify-center">
        <LoadingSpinner />
        <BottomNavigation />
      </div>
    );
  }

  if (!isPremium) {
    return (
      <div className="min-h-screen bg-background pb-app-main">
        <header className="sticky top-0 safe-area-header z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
          <div className="container max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBack}
                  className="h-9 w-9"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-xl font-bold">{t("learn.title")}</h1>
                  <p className="text-sm text-muted-foreground">{t("learn.subtitle")}</p>
                </div>
              </div>
            </div>
          </div>
        </header>
        <LearnLockedPreview />
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-app-main">
      <header className="sticky top-0 safe-area-header z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="h-9 w-9"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">{t("learn.title")}</h1>
                <p className="text-sm text-muted-foreground">{t("learn.subtitle")}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="articles" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>{t("learn.articles")}</span>
            </TabsTrigger>
            <TabsTrigger value="education" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>{t("learn.guides")}</span>
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{t("learn.timeline")}</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="articles" className="mt-0">
            <ArticlesList category="article" />
          </TabsContent>
          <TabsContent value="education" className="mt-0 space-y-8">
            <ArticlesList 
              category="guide" 
              icon={<BookOpen className="h-5 w-5 text-primary" />} 
              descriptionKey="learn_content.guides_description"
              emptyTitleKey="learn_content.no_articles_title"
              emptyDescKey="learn_content.no_articles_description"
            />
            <div className="pt-4 border-t border-border/50">
              <h3 className="font-semibold text-lg mb-4 text-foreground">
                {t("learn_content.core_principles", "Core Principles")}
              </h3>
              <RecoveryEducation />
            </div>
          </TabsContent>
          <TabsContent value="timeline" className="mt-0">
            <RecoveryTimeline />
          </TabsContent>
        </Tabs>
      </main>
      <BottomNavigation />
    </div>
  );
}
