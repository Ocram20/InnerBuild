import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Shield, TrendingUp, AlertTriangle, Sparkles } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { useRecoveryJourney } from "@/hooks/useRecoveryJourney";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LockedPreview } from "@/components/recovery/LockedPreview";
import { UnderstandingSection } from "@/components/recovery/UnderstandingSection";
import { StrategiesSection, LearnGuideCTACard } from "@/components/recovery/StrategiesSection";
import { CravingActionsSection } from "@/components/recovery/CravingActionsSection";
import { TriggersSection } from "@/components/recovery/TriggersSection";
import { AntiTriggerPlanSection } from "@/components/recovery/AntiTriggerPlanSection";
import { ReasonsSection } from "@/components/recovery/ReasonsSection";
import { RecoveryOnboarding } from "@/components/recovery/RecoveryOnboarding";
import { RecoveryTracker } from "@/components/recovery/RecoveryTracker";
import { FailureDebriefSection } from "@/components/recovery/FailureDebriefSection";
import { EmergencyUrgeModal } from "@/components/recovery/EmergencyUrgeModal";
import { RecoveryJourneyPath } from "@/components/recovery/RecoveryJourneyPath";
import { RecoveryImpactCard } from "@/components/recovery/RecoveryImpactCard";
import { useRecoveryPhase } from "@/hooks/useRecoveryPhase";
import { useTranslation } from "react-i18next";

export default function TheForge() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { subscription, loading: subLoading } = useSubscription();
  const { journey, checkIns, loading: journeyLoading, declined, hasCheckedInToday, startJourney, declineJourney, checkIn, resetJourney, resumeJourney, abandonJourney } = useRecoveryJourney();
  const [showEmergency, setShowEmergency] = useState(false);
  const { phaseProgress, loading: phaseLoading } = useRecoveryPhase(journey?.started_at || null, journey?.id || null);
  const { hasAdminRole } = useAdminAccess();
  const isPremium = hasAdminRole || subscription.subscribed;
  const loading = subLoading || journeyLoading || phaseLoading;
  const fromExplore = location.state?.from === "explore";
  const handleBack = () => navigate(fromExplore ? "/explore" : "/dashboard");

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><LoadingSpinner /></div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 safe-area-header z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={handleBack} className="h-9 w-9"><ArrowLeft className="h-5 w-5" /></Button>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#4D87D9]" />
                  {t("the_forge.title")}
                </h1>
                <p className="text-sm text-muted-foreground">{t("the_forge.subtitle")}</p>
              </div>
            </div>
            {isPremium && journey && (
              <motion.div
                whileTap={{ scale: 0.94 }}
                transition={{ duration: 0.1 }}
              >
                <Button type="button" size="sm" variant="destructive" onClick={() => setShowEmergency(true)} className="gap-1.5 bg-rose-600 hover:bg-rose-700 text-white shadow-lg">
                  <AlertTriangle className="h-4 w-4 animate-bounce" />
                  <span className="hidden sm:inline">{t("the_forge.emergency")}</span>
                  <span className="sm:hidden">{t("the_forge.sos")}</span>
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-6 pb-scroll-safe">
        {!isPremium ? <LockedPreview /> : (
          <Tabs defaultValue="progress" className="w-full">
            <TabsList className="w-full grid grid-cols-3 mb-6 h-11 bg-[#192028]/80 border border-[#252d37] rounded-xl p-1">
              <TabsTrigger value="progress" className="text-xs sm:text-sm gap-1.5 rounded-lg text-[#6c8093] data-[state=active]:bg-[#4D87D9] dark:data-[state=active]:bg-[#619BF0] data-[state=active]:text-white"><TrendingUp className="h-3.5 w-3.5" /><span>{t("the_forge.progress")}</span></TabsTrigger>
              <TabsTrigger value="manage" className="text-xs sm:text-sm gap-1.5 rounded-lg text-[#6c8093] data-[state=active]:bg-[#4D87D9] dark:data-[state=active]:bg-[#619BF0] data-[state=active]:text-white"><Shield className="h-3.5 w-3.5" /><span>{t("the_forge.manage_tab")}</span></TabsTrigger>
              <TabsTrigger value="learn" className="text-xs sm:text-sm gap-1.5 rounded-lg text-[#6c8093] data-[state=active]:bg-[#4D87D9] dark:data-[state=active]:bg-[#619BF0] data-[state=active]:text-white"><BookOpen className="h-3.5 w-3.5" /><span>{t("the_forge.learn_tab")}</span></TabsTrigger>
            </TabsList>

            <TabsContent value="progress" className="space-y-6 animate-in fade-in duration-150">
              {journey && phaseProgress && <RecoveryJourneyPath progress={phaseProgress} />}
              {journey && (
                <RecoveryImpactCard
                  journeyId={journey.id}
                  currentStreak={journey.current_streak}
                  jokersRemaining={journey.jokers_remaining}
                  status={journey.status}
                />
              )}
              {!journey && !declined ? <RecoveryOnboarding onStart={startJourney} onDecline={declineJourney} /> : journey ? <RecoveryTracker startedAt={journey.started_at} checkIns={checkIns} onCheckIn={checkIn} onReset={resetJourney} onAbandon={abandonJourney} onResume={resumeJourney} hasCheckedInToday={hasCheckedInToday} currentStreak={journey.current_streak} longestStreak={journey.longest_streak} jokersRemaining={journey.jokers_remaining} status={journey.status} /> : null}
              <FailureDebriefSection />
              <ReasonsSection />
            </TabsContent>

            <TabsContent value="manage" className="space-y-6 animate-in fade-in duration-150">
              {/* Emergency Impulse SOS Button with short bounce and subtle pulsing glow */}
              <motion.div
                initial={{ scale: 1 }}
                animate={{
                  scale: [1, 1.02, 1],
                  boxShadow: [
                    "0 0 0px rgba(225,29,72,0)",
                    "0 0 18px rgba(225,29,72,0.5)",
                    "0 0 0px rgba(225,29,72,0)",
                  ],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.8,
                  ease: "easeInOut",
                }}
                whileTap={{ scale: 0.96 }}
              >
                <Button
                  type="button"
                  size="lg"
                  variant="destructive"
                  onClick={() => setShowEmergency(true)}
                  className="w-full h-14 text-base font-bold gap-2.5 bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 text-white shadow-xl shadow-rose-950/60 rounded-2xl border border-rose-400/30"
                >
                  <AlertTriangle className="h-5 w-5 text-rose-100 animate-bounce" />
                  <span>{t("dashboard.emergency_urge")}</span>
                </Button>
              </motion.div>

              <CravingActionsSection />
              <StrategiesSection />
              <AntiTriggerPlanSection />
            </TabsContent>

            <TabsContent value="learn" className="space-y-6 animate-in fade-in duration-150">
              <UnderstandingSection />
              <TriggersSection />
              <LearnGuideCTACard />
            </TabsContent>
          </Tabs>
        )}
      </main>
      <EmergencyUrgeModal
        open={showEmergency}
        onClose={() => setShowEmergency(false)}
        journey={journey}
        hasCheckedInToday={hasCheckedInToday}
        onDeclareRelapse={() => {
          checkIn("failed");
          setShowEmergency(false);
        }}
      />
    </div>
  );
}

