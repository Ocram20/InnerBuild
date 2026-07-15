import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSubscription } from "@/hooks/useSubscription";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { useCategoryPreferences } from "@/hooks/useCategoryPreferences";
import {
  Bot, ChevronRight, Sparkles, Lock, Zap, Calendar, Flame, ArrowLeft, Target, Moon,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import PaywallModal from "@/components/PaywallModal";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import BottomNavigation from "@/components/BottomNavigation";

type ToolDef = {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: typeof Target;
  path: string;
  iconBg: string;
  iconColor: string;
  premium?: boolean;
};

const freeTools: ToolDef[] = [
  { id: "habits", titleKey: "explore.tools.habits", descriptionKey: "explore.tools.habits_desc", icon: Target, path: "/habits", iconBg: "bg-[#d4f5ea] dark:bg-[#4b9b75]/20", iconColor: "text-[#4b9b75]" },
  { id: "challenges", titleKey: "explore.tools.detox_challenges", descriptionKey: "explore.tools.detox_challenges_desc", icon: Flame, path: "/challenges", iconBg: "bg-[#ffe8cc] dark:bg-[#ee9d2b]/20", iconColor: "text-[#ee9d2b]" },
  { id: "evening-reflection", titleKey: "explore.tools.evening_reflection", descriptionKey: "explore.tools.evening_reflection_desc", icon: Moon, path: "/evening-reflection", iconBg: "bg-[#ede5ff] dark:bg-[#8b5cf6]/20", iconColor: "text-[#8b5cf6]" },
  { id: "daily-planning", titleKey: "explore.tools.daily_planning", descriptionKey: "explore.tools.daily_planning_desc", icon: Calendar, path: "/daily-planning", iconBg: "bg-[#f0f9f6] dark:bg-[#4b9b75]/20", iconColor: "text-[#4b9b75]" },
];

const premiumTools: ToolDef[] = [
  { id: "the-forge", titleKey: "explore.tools.the_forge", descriptionKey: "explore.tools.the_forge_desc", icon: Sparkles, path: "/the-forge", iconBg: "bg-[#fde8f5] dark:bg-[#d946ef]/20", iconColor: "text-[#d946ef]", premium: true },
  { id: "trigger-tracking", titleKey: "explore.tools.trigger_tracking", descriptionKey: "explore.tools.trigger_tracking_desc", icon: Zap, path: "/trigger-tracking", iconBg: "bg-[#ffe8cc] dark:bg-[#ee9d2b]/20", iconColor: "text-[#ee9d2b]", premium: true },
  { id: "coach", titleKey: "explore.tools.ai_coach", descriptionKey: "explore.tools.ai_coach_desc", icon: Bot, path: "/coach", iconBg: "bg-[#d0e8ff] dark:bg-[#3b82f6]/20", iconColor: "text-[#3b82f6]", premium: true },
];

const Explore = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { subscription } = useSubscription();
  const { hasAdminRole } = useAdminAccess();
  const { preferences, updatePreference } = useCategoryPreferences();
  const [showPaywall, setShowPaywall] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const isPremium = hasAdminRole || subscription.subscribed;

  const handleNavigate = (path: string, premium: boolean) => {
    if (premium && !isPremium) {
      setShowPaywall(true);
    } else {
      navigate(path, { state: { from: "explore" } });
    }
  };

  const handleToggle = (id: string, currentStatus: boolean, isPremiumTool: boolean) => {
    if (!currentStatus && isPremiumTool && !isPremium) {
      setShowPaywall(true);
    } else {
      updatePreference(id as any, !currentStatus);
    }
  };

  const visibleFreeTools = freeTools.filter(item => preferences[item.id as keyof typeof preferences]);
  const visiblePremiumTools = premiumTools.filter(item => preferences[item.id as keyof typeof preferences]);

  return (
    <div className="min-h-screen overflow-x-hidden pb-app-main bg-[#F8FAFC] dark:bg-[#0f1419] relative">
      {/* Background blur circles for dark mode */}
      <div className="hidden dark:block bg-blur-circle bg-[#4b9b75] -top-20 -left-20" />
      <div className="hidden dark:block bg-blur-circle bg-[#8b5cf6] top-1/2 -right-20" />

      {/* Header */}
      <header className="pt-14 pb-4 z-30">
        <div className="max-w-lg mx-auto w-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              id="back-btn"
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="h-6 w-6 text-[#29333d] dark:text-white" />
            </button>
            <div>
              <h1 className="text-xl font-extrabold text-[#29333d] dark:text-white">{t("explore.title")}</h1>
              <p className="text-xs font-medium text-[#6c8093]">{t("explore.subtitle")}</p>
            </div>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            id="settings-btn"
            className={cn(
              "w-10 h-10 rounded-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center premium-shadow",
              showSettings && "bg-primary/10 text-primary"
            )}
          >
            <SlidersHorizontal className="h-5 w-5 text-[#4b9b75]" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-lg mx-auto px-6 py-6 space-y-12 relative z-10">
        {/* Settings display preferences section */}
        {showSettings && (
          <section className="animate-in fade-in slide-in-from-top-4 duration-300 bg-white dark:bg-white/5 rounded-[32px] border border-gray-100 dark:border-white/10 p-6 space-y-4 premium-shadow">
            <div className="space-y-1">
              <h2 className="font-semibold text-sm text-[#29333d] dark:text-white">{t("explore.display_settings.title")}</h2>
              <p className="text-xs text-[#6c8093]">{t("explore.display_settings.subtitle")}</p>
            </div>
            <div className="space-y-3 pt-2">
              {[...freeTools, ...premiumTools].map((tool) => (
                <div key={tool.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 shadow-sm")}>
                      <tool.icon className={cn("h-4 w-4", tool.iconColor)} />
                    </div>
                    <Label htmlFor={`toggle-${tool.id}`} className="text-sm cursor-pointer text-[#29333d] dark:text-white font-medium">
                      {t(tool.titleKey)}
                      {tool.premium && !isPremium && (
                        <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                          PRO
                        </span>
                      )}
                    </Label>
                  </div>
                  <Switch
                    id={`toggle-${tool.id}`}
                    checked={!!preferences[tool.id as keyof typeof preferences]}
                    onCheckedChange={() => handleToggle(tool.id, !!preferences[tool.id as keyof typeof preferences], !!tool.premium)}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* STRUMENTI GRATUITI (Free Tools) */}
        {(preferences.habits || preferences.challenges || preferences["evening-reflection"] || preferences["daily-planning"]) && (
          <section className="relative">
            <h2 className="text-xs font-bold text-[#6c8093] uppercase tracking-[0.2em] mb-8 ml-1">
              {t("explore.free_tools")}
            </h2>
            <div className="relative flex flex-col gap-6">
              {/* Habits Card */}
              {preferences.habits && (
                <button
                  type="button"
                  onClick={() => handleNavigate("/habits", false)}
                  id="tool-habits"
                  className="block text-left w-full p-6 rounded-[32px] bg-[#d4f5ea] dark:bg-[#4b9b75]/10 border border-teal-200 dark:border-[#4b9b75]/25 premium-shadow relative z-10 transition-transform active:scale-95"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#4b9b75]/20 border border-teal-100 dark:border-[#4b9b75]/30 flex items-center justify-center shrink-0">
                      <Target className="h-7 w-7 text-[#4b9b75]" />
                    </div>
                    <div>
                      <h3 className="text-[17px] font-extrabold text-[#29333d] dark:text-white mb-1">
                        {t("explore.tools.habits")}
                      </h3>
                      <p className="text-sm text-[#6c8093] leading-snug">
                        {t("explore.tools.habits_desc")}
                      </p>
                    </div>
                  </div>
                </button>
              )}

              {/* Asymmetric Flex Row for Detox and Reflection */}
              {(preferences.challenges || preferences["evening-reflection"]) && (
                <div className="flex gap-4 w-full">
                  {/* Detox Challenges */}
                  {preferences.challenges && (
                    <button
                      type="button"
                      onClick={() => handleNavigate("/challenges", false)}
                      id="tool-detox"
                      className="flex-1 text-left p-5 rounded-[28px] bg-[#ffe8cc] dark:bg-[#ee9d2b]/10 border border-orange-200 dark:border-[#ee9d2b]/25 premium-shadow active:scale-95 transition-transform"
                    >
                      <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#ee9d2b]/20 border border-orange-100 dark:border-[#ee9d2b]/30 flex items-center justify-center mb-4 shrink-0">
                        <Flame className="h-6 w-6 text-[#ee9d2b]" />
                      </div>
                      <h3 className="text-base font-extrabold text-[#29333d] dark:text-white mb-1">
                        {t("explore.tools.detox_challenges")}
                      </h3>
                      <p className="text-[12px] text-[#6c8093] leading-tight">
                        {t("explore.tools.detox_challenges_desc")}
                      </p>
                    </button>
                  )}

                  {/* Evening Reflection */}
                  {preferences["evening-reflection"] && (
                    <button
                      type="button"
                      onClick={() => handleNavigate("/evening-reflection", false)}
                      id="tool-evening"
                      className="flex-1 text-left p-5 rounded-[28px] bg-[#ede5ff] dark:bg-[#8b5cf6]/10 border border-purple-200 dark:border-[#8b5cf6]/25 premium-shadow mt-4 active:scale-95 transition-transform"
                    >
                      <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#8b5cf6]/20 border border-purple-100 dark:border-[#8b5cf6]/30 flex items-center justify-center mb-4 shrink-0">
                        <Moon className="h-6 w-6 text-[#8b5cf6]" />
                      </div>
                      <h3 className="text-base font-extrabold text-[#29333d] dark:text-white mb-1">
                        {t("explore.tools.evening_reflection")}
                      </h3>
                      <p className="text-[12px] text-[#6c8093] leading-tight">
                        {t("explore.tools.evening_reflection_desc")}
                      </p>
                    </button>
                  )}
                </div>
              )}

              {/* Daily Planning */}
              {preferences["daily-planning"] && (
                <button
                  type="button"
                  onClick={() => handleNavigate("/daily-planning", false)}
                  id="tool-planning"
                  className="block text-left w-full p-5 rounded-[32px] bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 premium-shadow z-20 active:scale-95 transition-transform"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#f0f9f6] dark:bg-[#4b9b75]/20 flex items-center justify-center shrink-0">
                      <Calendar className="h-5 w-5 text-[#4b9b75]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#29333d] dark:text-white">
                        {t("explore.tools.daily_planning")}
                      </h3>
                      <p className="text-[11px] text-[#6c8093]">
                        {t("explore.tools.daily_planning_desc")}
                      </p>
                    </div>
                  </div>
                </button>
              )}
            </div>
          </section>
        )}

        {/* STRUMENTI PREMIUM (Premium Tools) */}
        {(preferences["the-forge"] || preferences["trigger-tracking"] || preferences.coach) && (
          <section className="relative">
            <h2 className="text-xs font-bold text-[#6c8093] uppercase tracking-[0.2em] mb-8 ml-1">
              {t("explore.premium_tools")}
            </h2>
            <div className="space-y-6">
              {/* The Forge / La Rinascita */}
              {preferences["the-forge"] && (
                <button
                  type="button"
                  onClick={() => handleNavigate("/the-forge", true)}
                  id="tool-rebirth"
                  className="block text-left w-full p-6 rounded-[36px] bg-[#fde8f5] dark:bg-[#d946ef]/10 border border-pink-200 dark:border-[#d946ef]/20 premium-shadow relative overflow-hidden active:scale-95 transition-transform"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="relative shrink-0">
                        <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#d946ef]/20 border border-pink-100 dark:border-[#d946ef]/30 flex items-center justify-center shrink-0">
                          <Sparkles className="h-7 w-7 text-[#d946ef]" />
                        </div>
                        {!isPremium && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center border-2 border-white dark:border-[#0f1419] z-20">
                            <Lock className="h-2.5 w-2.5 text-slate-500 dark:text-slate-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#29333d] dark:text-white">
                          {t("explore.tools.the_forge")}
                        </h3>
                        <p className="text-xs text-[#6c8093]">
                          {t("explore.tools.the_forge_desc")}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-6 w-6 text-[#d946ef] shrink-0" />
                  </div>
                </button>
              )}

              {/* Grid Row for Trigger and Coach AI */}
              {(preferences["trigger-tracking"] || preferences.coach) && (
                <div className="grid grid-cols-2 gap-4">
                  {/* Trigger Tracking */}
                  {preferences["trigger-tracking"] && (
                    <button
                      type="button"
                      onClick={() => handleNavigate("/trigger-tracking", true)}
                      id="tool-trigger"
                      className="p-6 text-left rounded-[32px] bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 premium-shadow active:scale-95 transition-transform"
                    >
                      <div className="relative mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#ffe8cc] dark:bg-[#ee9d2b]/20 border border-transparent dark:border-[#ee9d2b]/30 flex items-center justify-center shrink-0">
                          <Zap className="h-6 w-6 text-[#ee9d2b]" />
                        </div>
                        {!isPremium && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center border-2 border-white dark:border-[#0f1419] z-20">
                            <Lock className="h-2.5 w-2.5 text-slate-500 dark:text-slate-400" />
                          </div>
                        )}
                      </div>
                      <h3 className="text-base font-extrabold text-[#29333d] dark:text-white">
                        {t("explore.tools.trigger_tracking")}
                      </h3>
                      <p className="text-[11px] text-[#6c8093] mt-1">
                        {t("explore.tools.trigger_tracking_desc")}
                      </p>
                    </button>
                  )}

                  {/* Coach AI */}
                  {preferences.coach && (
                    <button
                      type="button"
                      onClick={() => handleNavigate("/coach", true)}
                      id="tool-ai"
                      className="p-5 text-center rounded-[32px] bg-[#d0e8ff] dark:bg-[#3b82f6]/10 border border-blue-200 dark:border-[#3b82f6]/20 premium-shadow flex flex-col items-center justify-center active:scale-95 transition-transform"
                    >
                      <div className="relative mb-3">
                        <div className="w-14 h-14 rounded-full bg-white dark:bg-[#3b82f6]/20 border border-blue-100 dark:border-[#3b82f6]/30 flex items-center justify-center shrink-0">
                          <Bot className="h-7 w-7 text-[#3b82f6]" />
                        </div>
                        {!isPremium && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center border-2 border-white dark:border-[#0f1419] z-20">
                            <Lock className="h-2.5 w-2.5 text-slate-500 dark:text-slate-400" />
                          </div>
                        )}
                      </div>
                      <h3 className="text-sm font-extrabold text-[#29333d] dark:text-white">
                        {t("explore.tools.ai_coach")}
                      </h3>
                      <p className="text-[10px] text-[#6c8093] uppercase font-bold tracking-tighter">
                        {t("explore.tools.ai_coach_desc")}
                      </p>
                    </button>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Fallback layout if all tools are hidden */}
        {visibleFreeTools.length === 0 && visiblePremiumTools.length === 0 && !showSettings && (
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 bg-muted dark:bg-white/5 rounded-full flex items-center justify-center mx-auto">
              <SlidersHorizontal className="h-8 w-8 text-[#6c8093]" />
            </div>
            <p className="text-sm text-muted-foreground">{t("explore.no_visible_tools")}</p>
            <Button variant="outline" onClick={() => setShowSettings(true)}>
              {t("explore.display_settings.title")}
            </Button>
          </div>
        )}
      </main>

      <BottomNavigation />
      <PaywallModal open={showPaywall} onOpenChange={setShowPaywall} reason="general" />
    </div>
  );
};

export default Explore;

