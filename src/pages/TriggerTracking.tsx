import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Plus, Zap } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import BottomNavigation from "@/components/BottomNavigation";
import TriggerLogModal from "@/components/triggers/TriggerLogModal";
import TriggerHeatmap from "@/components/triggers/TriggerHeatmap";
import RecentTriggersCard from "@/components/triggers/RecentTriggersCard";
import TriggerReportCard from "@/components/TriggerReportCard";
import { useTriggerTracking } from "@/hooks/useTriggerTracking";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { TriggerLockedPreview } from "@/components/triggers/TriggerLockedPreview";
import "./TriggerTracking.css";
import { useTranslation } from "react-i18next";
export default function TriggerTracking() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { subscription, loading: subLoading } = useSubscription();
  const { hasAdminRole, loading: roleLoading } = useAdminAccess();
  const fromExplore = location.state?.from === "explore";
  const isPremium = hasAdminRole || subscription.subscribed;
  const accessLoading = subLoading || roleLoading;

  const { logs, insights, loading, analyzing, logTrigger, analyzePatterns, getHeatmapData, deleteTrigger } = useTriggerTracking();
  const [showLogModal, setShowLogModal] = useState(false);
  const heatmapData = getHeatmapData();

  if (accessLoading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;

  if (!isPremium) {
    return (
      <div className="min-h-screen pb-app-main trigger-tracking-page">
        <header className="sticky top-0 safe-area-header z-50 glass border-b border-border/50">
          <div className="flex items-center gap-3 p-4 max-w-lg mx-auto">
            <Button variant="ghost" size="icon" onClick={() => navigate(fromExplore ? "/explore" : "/dashboard")} className="rounded-full h-9 w-9"><ArrowLeft className="h-5 w-5" /></Button>
            <div className="flex-1">
              <h1 className="font-bold text-foreground">{t("trigger_tracking.title")}</h1>
              <p className="text-xs text-muted-foreground">{t("trigger_tracking.subtitle")}</p>
            </div>
          </div>
        </header>
        <TriggerLockedPreview />
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-app-main trigger-tracking-page">
      <header className="sticky top-0 safe-area-header z-50 glass border-b border-border/50">
        <div className="flex items-center gap-3 p-4 max-w-lg mx-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate(fromExplore ? "/explore" : "/dashboard")} className="rounded-full h-9 w-9"><ArrowLeft className="h-5 w-5" /></Button>
          <div className="flex-1">
            <h1 className="font-bold text-foreground">{t("trigger_tracking.title")}</h1>
            <p className="text-xs text-muted-foreground">{t("trigger_tracking.subtitle")}</p>
          </div>
          <Button onClick={() => setShowLogModal(true)} className="gradient-primary text-primary-foreground rounded-xl shadow-soft">
            <Plus className="h-4 w-4 mr-1" />{t("common.log")}
          </Button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        {loading ? <LoadingSpinner className="py-20" /> : (
          <>
            {logs.length === 0 && (
              <div className="glass rounded-2xl p-6 text-center animate-fade-in">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4"><Zap className="h-8 w-8 text-primary" /></div>
                <h3 className="font-semibold text-foreground mb-2">{t("trigger_tracking.start_tracking")}</h3>
                <p className="text-sm text-muted-foreground mb-4">{t("trigger_tracking.start_tracking_desc")}</p>
                <Button onClick={() => setShowLogModal(true)} className="gradient-primary text-primary-foreground rounded-xl shadow-soft">
                  <Plus className="h-4 w-4 mr-2" />{t("trigger_tracking.log_first")}
                </Button>
              </div>
            )}
            <section className="animate-fade-in" style={{ animationDelay: "50ms" }}><TriggerReportCard /></section>
            <section className="animate-fade-in" style={{ animationDelay: "75ms" }}><TriggerHeatmap data={heatmapData} /></section>
            <section className="animate-fade-in" style={{ animationDelay: "100ms" }}><RecentTriggersCard logs={logs} onDelete={deleteTrigger} /></section>
          </>
        )}
      </main>
      <TriggerLogModal open={showLogModal} onOpenChange={setShowLogModal} onSubmit={logTrigger} />
      <BottomNavigation />
    </div>
  );
}
