import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Home, Crown, CreditCard, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from "@/components/LoadingSpinner";
import { ProfileInfoSection } from "@/components/profile/ProfileInfoSection";
import { ActivityCalendar } from "@/components/profile/ActivityCalendar";
import { ProgressOverviewCards } from "@/components/profile/ProgressOverviewCards";
import { ProgressDeepDive } from "@/components/profile/ProgressDeepDive";
import { WhatsWorkingSection } from "@/components/profile/WhatsWorkingSection";
import { useProgressData } from "@/hooks/useProgressData";
import BottomNavigation from "@/components/BottomNavigation";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { dateFnsLocale } from "@/lib/dateFnsLocale";

interface ProfileData {
  first_name: string;
  last_name: string;
  username: string;
  avatar_url: string;
  email: string;
}

export default function Profile() {
  const { t, i18n } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const { hasAdminRole } = useAdminAccess();
  const { subscription, openPortal } = useSubscription();
  const isPremium = hasAdminRole || subscription.subscribed;
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [openSection, setOpenSection] = useState<"habits" | "triggers" | "challenges" | "mood" | null>(null);
  const [timeRange, setTimeRange] = useState<"recent" | "annual">("recent");
  const days = timeRange === "recent" ? 14 : 365;
  const dfLocale = dateFnsLocale(i18n.resolvedLanguage || i18n.language);

  const { overview, habitDetails, triggerDetails, challengeDetails, moodDetails, loading: progressLoading } =
    useProgressData(days);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);
  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    setLoading(false);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("first_name, last_name, username, avatar_url")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      setProfile({
        first_name: data?.first_name || "",
        last_name: data?.last_name || "",
        username: data?.username || "",
        avatar_url: data?.avatar_url || "",
        email: user.email || "",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      await openPortal();
    } catch (error) {
      toast({ title: t("common.error"), description: t("profile.portal_error"), variant: "destructive" });
    } finally {
      setPortalLoading(false);
    }
  };

  const periodEndLabel = subscription.currentPeriodEnd
    ? format(new Date(subscription.currentPeriodEnd), "PPP", { locale: dfLocale })
    : "";

  if (authLoading || loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner />
      </div>
    );
  if (!user) return null;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F8FAFC] dark:bg-[#0f1419] pb-app-main relative">
      {/* Background blur circles for dark mode */}
      <div className="hidden dark:block bg-blur-circle bg-[#4b9b75] -top-20 -left-20" />
      <div className="hidden dark:block bg-blur-circle bg-[#8b5cf6] top-1/2 -right-20" />
      <header className="sticky top-0 safe-area-header z-40 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">{t("profile.title")}</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} title={t("profile.view_site")}>
            <Home className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="container px-4 py-8 max-w-4xl mx-auto">
        <div className="space-y-8">
          <ProfileInfoSection profile={profile} onProfileUpdate={fetchProfile} />

          <Card className="glass border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Crown className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {isPremium ? t("profile.premium_plan") : t("profile.free_plan")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isPremium
                        ? hasAdminRole && !subscription.subscribed
                          ? t("profile.admin_access")
                          : subscription.cancelAtPeriodEnd
                            ? t("profile.cancels_on", { date: periodEndLabel })
                            : t("profile.renews_on", { date: periodEndLabel })
                        : t("profile.upgrade_unlock")}
                    </p>
                  </div>
                </div>
                {subscription.subscribed ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleManageSubscription}
                    disabled={portalLoading}
                    className="gap-1.5"
                  >
                    {portalLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                    {t("profile.manage")}
                  </Button>
                ) : !isPremium ? (
                  <Button size="sm" onClick={() => navigate("/pricing")} className="gradient-primary text-primary-foreground gap-1.5">
                    <Crown className="h-4 w-4" />
                    {t("profile.upgrade")}
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">{t("profile.progress_overview")}</h2>
            <div className="flex items-center gap-1 bg-muted/60 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setTimeRange("recent")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  timeRange === "recent" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t("profile.time_range_recent")}
              </button>
              <button
                type="button"
                onClick={() => setTimeRange("annual")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  timeRange === "annual" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t("profile.time_range_annual")}
              </button>
            </div>
          </div>

          {!progressLoading && overview && (
            <>
              <ProgressOverviewCards
                overview={overview}
                onCardTap={(section) => setOpenSection(openSection === section ? null : section)}
                timeRange={timeRange}
              />
              {openSection && (
                <ProgressDeepDive
                  section={openSection}
                  onClose={() => setOpenSection(null)}
                  habitDetails={habitDetails}
                  triggerDetails={triggerDetails}
                  challengeDetails={challengeDetails}
                  moodDetails={moodDetails}
                  days={days}
                />
              )}
            </>
          )}
          {progressLoading && (
            <div className="glass rounded-2xl p-8 flex items-center justify-center">
              <LoadingSpinner />
            </div>
          )}

          <WhatsWorkingSection />
          <ActivityCalendar />
        </div>
      </main>
      <BottomNavigation />
    </div>
  );
}
