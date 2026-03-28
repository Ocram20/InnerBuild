import { useState, useEffect } from "react";
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
export default function Learn() {
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
      <div className="min-h-screen bg-background pb-24 flex items-center justify-center">
        <LoadingSpinner />
        <BottomNavigation />
      </div>
    );
  }

  if (!isPremium) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
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
                  <h1 className="text-xl font-bold">{"Impara"}</h1>
                  <p className="text-sm text-muted-foreground">{"Educazione e conoscenze sul recovery"}</p>
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
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
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
                <h1 className="text-xl font-bold">{"Impara"}</h1>
                <p className="text-sm text-muted-foreground">{"Educazione e conoscenze sul recovery"}</p>
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
              <span>{"Articoli"}</span>
            </TabsTrigger>
            <TabsTrigger value="education" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>{"Guide"}</span>
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{"Timeline"}</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="articles" className="mt-0">
            <ArticlesList />
          </TabsContent>
          <TabsContent value="education" className="mt-0">
            <RecoveryEducation />
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
