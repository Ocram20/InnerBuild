import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { localizeSuggestedHabitTitle } from "@/lib/templateLocalization";
import {
  ArrowLeft,
  Bell,
  BellRing,
  CheckCircle2,
  Clock,
  Flame,
  Moon,
  Shield,
  Target,
  Calendar,
  Save,
  Send,
} from "lucide-react";
import BottomNavigation from "@/components/BottomNavigation";

interface HabitNotificationConfig {
  id: string;
  rawTitle: string;
  enabled: boolean;
  time: string;
}

interface ToolNotificationConfig {
  enabled: boolean;
  time: string;
}

export default function NotificationSettings() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(() => {
    try {
      return typeof window !== "undefined" && "Notification" in window && Notification?.permission
        ? Notification.permission
        : "default";
    } catch {
      return "default";
    }
  });

  const [saving, setSaving] = useState(false);
  const [testingNotification, setTestingNotification] = useState<string | null>(null);

  // Status flags for active features
  const [hasActiveDetoxChallenges, setHasActiveDetoxChallenges] = useState<boolean>(false);
  const [hasActiveRenewalJourney, setHasActiveRenewalJourney] = useState<boolean>(false);

  // Granular Tool Notification Configurations
  const [detoxConfig, setDetoxConfig] = useState<ToolNotificationConfig>({
    enabled: true,
    time: "12:00",
  });

  const [eveningConfig, setEveningConfig] = useState<ToolNotificationConfig>({
    enabled: true,
    time: "21:30",
  });

  const [dailyPlanningConfig, setDailyPlanningConfig] = useState<ToolNotificationConfig>({
    enabled: true,
    time: "08:00",
  });

  const [renewalConfig, setRenewalConfig] = useState<ToolNotificationConfig>({
    enabled: true,
    time: "20:00",
  });

  // Active User Habits Notification Configurations
  const [habitConfigs, setHabitConfigs] = useState<HabitNotificationConfig[]>([]);

  // Snapshot tracking for Dirty State (Save button active only if modified)
  const [initialSnapshot, setInitialSnapshot] = useState<string>("");
  const [isDirty, setIsDirty] = useState<boolean>(false);

  // Fetch active habits, detox challenges, and recovery journey status from Supabase
  useEffect(() => {
    if (!user) return;
    fetchUserDataAndSettings();
  }, [user]);

  const fetchUserDataAndSettings = async () => {
    if (!user) return;
    try {
      // 1. Fetch ACTIVE habits (is_active = true)
      const { data: habitsData } = await supabase
        .from("habits")
        .select("id, title, is_active")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      const activeHabits = habitsData || [];

      // 2. Fetch ACTIVE Detox Challenges (status = 'active')
      const { data: challengesData } = await supabase
        .from("detox_challenges")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "active");

      const activeDetoxCount = (challengesData || []).length;
      setHasActiveDetoxChallenges(activeDetoxCount > 0);

      // 3. Fetch ACTIVE Renewal Recovery Journey (is_active = true)
      const { data: journeyData } = await supabase
        .from("recovery_journey")
        .select("id, is_active")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();

      const activeJourneyStatus = Boolean(journeyData && journeyData.is_active);
      setHasActiveRenewalJourney(activeJourneyStatus);

      // 4. Load saved notification preferences from localStorage if present
      let loadedDetox = { enabled: true, time: "12:00" };
      let loadedEvening = { enabled: true, time: "21:30" };
      let loadedDailyPlanning = { enabled: true, time: "08:00" };
      let loadedRenewal = { enabled: true, time: "20:00" };
      let savedHabitsMap = new Map<string, { enabled: boolean; time: string }>();

      const savedPreferencesStr = localStorage.getItem("innerbuild_notification_preferences");

      if (savedPreferencesStr) {
        try {
          const parsed = JSON.parse(savedPreferencesStr);
          if (parsed.detox) loadedDetox = parsed.detox;
          if (parsed.evening) loadedEvening = parsed.evening;
          if (parsed.dailyPlanning) loadedDailyPlanning = parsed.dailyPlanning;
          if (parsed.renewal) loadedRenewal = parsed.renewal;
          if (parsed.habits && Array.isArray(parsed.habits)) {
            parsed.habits.forEach((h: any) => {
              savedHabitsMap.set(h.id, { enabled: h.enabled ?? true, time: h.time ?? "08:30" });
            });
          }
        } catch (e) {
          console.error("Error parsing saved notification preferences:", e);
        }
      }

      setDetoxConfig(loadedDetox);
      setEveningConfig(loadedEvening);
      setDailyPlanningConfig(loadedDailyPlanning);
      setRenewalConfig(loadedRenewal);

      // 5. Sync habits list: ONLY include habits that are currently ACTIVE!
      const syncedHabits: HabitNotificationConfig[] = activeHabits.map((h, idx) => {
        const saved = savedHabitsMap.get(h.id);
        return {
          id: h.id,
          rawTitle: h.title,
          enabled: saved ? saved.enabled : true,
          time: saved ? saved.time : idx % 2 === 0 ? "08:30" : "20:00",
        };
      });

      setHabitConfigs(syncedHabits);

      // 6. Record initial snapshot for dirty state check
      const snapshot = JSON.stringify({
        detox: loadedDetox,
        evening: loadedEvening,
        dailyPlanning: loadedDailyPlanning,
        renewal: loadedRenewal,
        habits: syncedHabits.map((h) => ({ id: h.id, enabled: h.enabled, time: h.time })),
      });

      setInitialSnapshot(snapshot);
      setIsDirty(false);
    } catch (err) {
      console.error("Error fetching user data for notification settings:", err);
    }
  };

  // Re-evaluate dirty state whenever any config changes
  useEffect(() => {
    if (!initialSnapshot) return;

    const currentSnapshot = JSON.stringify({
      detox: detoxConfig,
      evening: eveningConfig,
      dailyPlanning: dailyPlanningConfig,
      renewal: renewalConfig,
      habits: habitConfigs.map((h) => ({ id: h.id, enabled: h.enabled, time: h.time })),
    });

    setIsDirty(currentSnapshot !== initialSnapshot);
  }, [detoxConfig, eveningConfig, dailyPlanningConfig, renewalConfig, habitConfigs, initialSnapshot]);

  const handleRequestPermission = async () => {
    if (!("Notification" in window)) {
      toast({
        title: t("common.error", "Errore"),
        description: t("notifications_settings.not_supported", "Questo browser non supporta le notifiche Web Push."),
        variant: "destructive",
      });
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      if (permission === "granted") {
        toast({
          title: t("notifications_settings.permission_granted", "Notifiche Attivate! Ora riceverai i promemoria nei momenti pianificati."),
        });
      } else if (permission === "denied") {
        toast({
          title: t("notifications_settings.inactive", "Notifiche Bloccate"),
          description: t("notifications_settings.permission_denied", "Abilita i permessi dalle impostazioni del browser per ricevere i promemoria."),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Permission request error:", error);
    }
  };

  const handleSaveSettings = () => {
    if (!isDirty || saving) return;
    setSaving(true);

    const preferences = {
      detox: detoxConfig,
      evening: eveningConfig,
      dailyPlanning: dailyPlanningConfig,
      renewal: renewalConfig,
      habits: habitConfigs.map((h) => ({
        id: h.id,
        rawTitle: h.rawTitle,
        enabled: h.enabled,
        time: h.time,
      })),
      hasActiveDetoxChallenges,
      hasActiveRenewalJourney,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem("innerbuild_notification_preferences", JSON.stringify(preferences));

    const newSnapshot = JSON.stringify({
      detox: detoxConfig,
      evening: eveningConfig,
      dailyPlanning: dailyPlanningConfig,
      renewal: renewalConfig,
      habits: habitConfigs.map((h) => ({ id: h.id, enabled: h.enabled, time: h.time })),
    });

    setTimeout(() => {
      setSaving(false);
      setInitialSnapshot(newSnapshot);
      setIsDirty(false);
      toast({
        title: t("notifications_settings.saved_title", "Impostazioni Salvate"),
        description: t("notifications_settings.saved_success", "I tuoi orari e i promemoria sono stati aggiornati con successo."),
      });
    }, 400);
  };

  const handleTestNotification = (toolKey: string, title: string, body: string) => {
    setTestingNotification(toolKey);

    if (permissionStatus === "granted" && "Notification" in window) {
      try {
        new Notification(title, {
          body: body,
          icon: "/pwa-icon-192.png",
          badge: "/favicon.png",
        });
      } catch (e) {
        console.error("Failed to send browser notification:", e);
      }
    }

    toast({
      title: `🔔 ${title}`,
      description: body,
    });

    setTimeout(() => setTestingNotification(null), 1000);
  };

  return (
    <div className="min-h-screen pb-app-main bg-[#F8FAFC] dark:bg-[#0f1419] text-foreground relative overflow-x-hidden">
      {/* Background ambient blur circles matching dark mode */}
      <div className="hidden dark:block bg-blur-circle bg-[#4b9b75] -top-20 -left-20" />
      <div className="hidden dark:block bg-blur-circle bg-[#4D87D9] top-1/2 -right-20" />

      {/* Header */}
      <header className="sticky top-0 safe-area-header z-50 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="max-w-lg mx-auto w-full px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-card border border-border/50 text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="text-center">
            <h1 className="text-base font-extrabold text-foreground tracking-tight">
              {t("notifications_settings.title", "Impostazioni Notifiche")}
            </h1>
            <p className="text-[10px] text-muted-foreground font-medium">
              {t("notifications_settings.subtitle", "Controllo granulare promemoria PWA")}
            </p>
          </div>

          <Button
            size="sm"
            onClick={handleSaveSettings}
            disabled={!isDirty || saving}
            className={`h-8 rounded-full text-xs font-semibold px-3.5 transition-all ${
              isDirty && !saving
                ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft cursor-pointer opacity-100"
                : "bg-muted text-muted-foreground opacity-40 cursor-not-allowed pointer-events-none"
            }`}
          >
            <Save className="h-3.5 w-3.5 mr-1" />
            {t("notifications_settings.save", "Salva")}
          </Button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-5 space-y-5">
        {/* Permission Banner Card */}
        <section className="rounded-2xl border border-border/60 dark:border-white/5 bg-card dark:bg-[#1a212e]/80 p-4 shadow-elevated card-elevated">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  permissionStatus === "granted"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-amber-500/20 text-amber-400"
                }`}
              >
                {permissionStatus === "granted" ? <BellRing className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  {t("notifications_settings.web_push_status", "Stato Notifiche Web Push")}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {permissionStatus === "granted"
                    ? t("notifications_settings.active_device", "Notifiche attive sul tuo dispositivo")
                    : permissionStatus === "denied"
                    ? t("notifications_settings.blocked_browser", "Notifiche bloccate nelle impostazioni browser")
                    : t("notifications_settings.not_activated", "Notifiche non ancora attivate")}
                </p>
              </div>
            </div>

            {permissionStatus !== "granted" && (
              <Button
                size="sm"
                onClick={handleRequestPermission}
                className="rounded-xl bg-primary text-primary-foreground text-xs font-semibold px-3"
              >
                {t("notifications_settings.activate", "Attiva")}
              </Button>
            )}

            {permissionStatus === "granted" && (
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-extrabold flex items-center gap-1 shrink-0">
                <CheckCircle2 className="h-3 w-3" /> {t("notifications_settings.active", "Attivo")}
              </span>
            )}
          </div>
        </section>

        {/* SECTION 1: HABITS REMINDERS */}
        <section className="rounded-2xl border border-border/60 dark:border-white/5 bg-card dark:bg-[#1a212e]/80 p-4 space-y-3.5 shadow-elevated">
          <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#4b9b75]/20 text-[#4b9b75]">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-foreground">
                  {t("notifications_settings.habits_title", "Promemoria Abitudini")}
                </h2>
                <p className="text-[10px] text-muted-foreground">
                  {t("notifications_settings.habits_desc", "Orario personalizzato per ogni abitudine attiva")}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 pt-1">
            {habitConfigs.length > 0 ? (
              habitConfigs.map((habit) => {
                const localizedTitle = localizeSuggestedHabitTitle(t, habit.rawTitle);
                const habitTemplate = t(
                  "notifications_settings.templates.habit",
                  `È ora di ${localizedTitle}. Bastano pochi minuti per costruire costanza!`,
                  { title: localizedTitle }
                );

                return (
                  <div
                    key={habit.id}
                    className="p-3 rounded-xl bg-background/60 dark:bg-[#0f1419]/60 border border-border/50 dark:border-white/5 flex flex-col gap-2 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-foreground truncate min-w-0 flex-1">
                        {localizedTitle}
                      </span>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* UNCLIPPED Time Picker Box with style colorScheme: dark */}
                        <div className="flex items-center gap-1.5 bg-[#0f1419] dark:bg-[#0f1419] border border-border/80 dark:border-white/15 px-2.5 py-1 rounded-xl text-xs font-mono font-extrabold text-foreground shadow-inner min-w-[110px]">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <input
                            type="time"
                            value={habit.time}
                            disabled={!habit.enabled}
                            style={{ colorScheme: "dark" }}
                            onChange={(e) =>
                              setHabitConfigs((prev) =>
                                prev.map((h) => (h.id === habit.id ? { ...h, time: e.target.value } : h))
                              )
                            }
                            className="bg-transparent border-none outline-none text-xs w-full text-center font-mono font-bold text-foreground disabled:opacity-40"
                          />
                        </div>

                        {/* Toggle Switch */}
                        <Switch
                          checked={habit.enabled}
                          onCheckedChange={(checked) =>
                            setHabitConfigs((prev) =>
                              prev.map((h) => (h.id === habit.id ? { ...h, enabled: checked } : h))
                            )
                          }
                        />
                      </div>
                    </div>

                    {/* Notification Copy Preview */}
                    <div className="flex items-center justify-between text-[10.5px] text-muted-foreground bg-muted/30 p-2 rounded-lg gap-2">
                      <span className="italic truncate">"{habitTemplate}"</span>
                      <button
                        onClick={() =>
                          handleTestNotification(
                            `Habit-${habit.id}`,
                            `Promemoria: ${localizedTitle}`,
                            habitTemplate
                          )
                        }
                        className="text-primary hover:underline text-[10px] font-bold shrink-0 flex items-center gap-1"
                      >
                        <Send className="h-2.5 w-2.5" /> {t("notifications_settings.test", "Prova")}
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-muted-foreground italic text-center py-2">
                {t("notifications_settings.no_active_habits", "Nessuna abitudine attiva al momento.")}
              </p>
            )}
          </div>
        </section>

        {/* SECTION 2: DETOX CHALLENGES - ONLY SHOWN IF USER HAS ACTIVE DETOX CHALLENGES */}
        {hasActiveDetoxChallenges && (
          <section className="rounded-2xl border border-border/60 dark:border-white/5 bg-card dark:bg-[#1a212e]/80 p-4 space-y-3 shadow-elevated">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#4b9b75]/20 text-[#4b9b75]">
                  <Flame className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-foreground">
                    {t("notifications_settings.detox_title", "Check-in Sfide Detox")}
                  </h2>
                  <p className="text-[10px] text-muted-foreground">
                    {t("notifications_settings.detox_desc", "Verifica del progresso quotidiano detox")}
                  </p>
                </div>
              </div>

              <Switch
                checked={detoxConfig.enabled}
                onCheckedChange={(checked) => setDetoxConfig((prev) => ({ ...prev, enabled: checked }))}
              />
            </div>

            {detoxConfig.enabled && (
              <div className="pt-2 border-t border-border/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">
                    {t("notifications_settings.notification_time", "Orario Notifica")}
                  </span>
                  <div className="flex items-center gap-1.5 bg-[#0f1419] dark:bg-[#0f1419] border border-border/80 dark:border-white/15 px-2.5 py-1 rounded-xl text-xs font-mono font-extrabold text-foreground shadow-inner min-w-[110px]">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <input
                      type="time"
                      value={detoxConfig.time}
                      style={{ colorScheme: "dark" }}
                      onChange={(e) => setDetoxConfig((prev) => ({ ...prev, time: e.target.value }))}
                      className="bg-transparent border-none outline-none text-xs w-full text-center font-mono font-bold text-foreground"
                    />
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-muted/30 text-[11px] text-muted-foreground space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground text-[10px] uppercase tracking-wider">
                      {t("notifications_settings.notification_text", "Testo Notifica")}
                    </span>
                    <button
                      onClick={() =>
                        handleTestNotification(
                          "detox",
                          t("notifications_settings.detox_title", "Check-in Sfida Detox"),
                          t("notifications_settings.templates.detox", "Non dimenticare il tuo check-in Detox di oggi. Come sta andando la tua sfida?")
                        )
                      }
                      className="text-primary hover:underline text-[10px] font-bold flex items-center gap-1"
                    >
                      <Send className="h-2.5 w-2.5" /> {t("notifications_settings.test_notification", "Prova Notifica")}
                    </button>
                  </div>
                  <p className="italic">
                    "{t("notifications_settings.templates.detox", "Non dimenticare il tuo check-in Detox di oggi. Come sta andando la tua sfida?")}"
                  </p>
                </div>
              </div>
            )}
          </section>
        )}

        {/* SECTION 3: EVENING REFLECTION */}
        <section className="rounded-2xl border border-border/60 dark:border-white/5 bg-card dark:bg-[#1a212e]/80 p-4 space-y-3 shadow-elevated">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#C377D7]/20 text-[#C377D7]">
                <Moon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-foreground">
                  {t("notifications_settings.evening_title", "Riflessione Serale")}
                </h2>
                <p className="text-[10px] text-muted-foreground">
                  {t("notifications_settings.evening_desc", "Check-in serale dell'umore e gratitudine")}
                </p>
              </div>
            </div>

            <Switch
              checked={eveningConfig.enabled}
              onCheckedChange={(checked) => setEveningConfig((prev) => ({ ...prev, enabled: checked }))}
            />
          </div>

          {eveningConfig.enabled && (
            <div className="pt-2 border-t border-border/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">
                  {t("notifications_settings.notification_time", "Orario Notifica")}
                </span>
                <div className="flex items-center gap-1.5 bg-[#0f1419] dark:bg-[#0f1419] border border-border/80 dark:border-white/15 px-2.5 py-1 rounded-xl text-xs font-mono font-extrabold text-foreground shadow-inner min-w-[110px]">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <input
                    type="time"
                    value={eveningConfig.time}
                    style={{ colorScheme: "dark" }}
                    onChange={(e) => setEveningConfig((prev) => ({ ...prev, time: e.target.value }))}
                    className="bg-transparent border-none outline-none text-xs w-full text-center font-mono font-bold text-foreground"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-muted/30 text-[11px] text-muted-foreground space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground text-[10px] uppercase tracking-wider">
                    {t("notifications_settings.notification_text", "Testo Notifica")}
                  </span>
                  <button
                    onClick={() =>
                      handleTestNotification(
                        "evening",
                        t("notifications_settings.evening_title", "Riflessione Serale"),
                        t("notifications_settings.templates.evening", "Prenditi un momento per riflettere sulla tua giornata. Scrivi la tua gratitudine quotidiana.")
                      )
                    }
                    className="text-[#C377D7] hover:underline text-[10px] font-bold flex items-center gap-1"
                  >
                    <Send className="h-2.5 w-2.5" /> {t("notifications_settings.test_notification", "Prova Notifica")}
                  </button>
                </div>
                <p className="italic">
                  "{t("notifications_settings.templates.evening", "Prenditi un momento per riflettere sulla tua giornata. Scrivi la tua gratitudine quotidiana.")}"
                </p>
              </div>
            </div>
          )}
        </section>

        {/* SECTION 4: DAILY PLANNING */}
        <section className="rounded-2xl border border-border/60 dark:border-white/5 bg-card dark:bg-[#1a212e]/80 p-4 space-y-3 shadow-elevated">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#4b9b75]/20 text-[#4b9b75]">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-foreground">
                  {t("notifications_settings.daily_planning_title", "Pianificazione Giornaliera")}
                </h2>
                <p className="text-[10px] text-muted-foreground">
                  {t("notifications_settings.daily_planning_desc", "Promemoria mattutino per la lista To-Do")}
                </p>
              </div>
            </div>

            <Switch
              checked={dailyPlanningConfig.enabled}
              onCheckedChange={(checked) => setDailyPlanningConfig((prev) => ({ ...prev, enabled: checked }))}
            />
          </div>

          {dailyPlanningConfig.enabled && (
            <div className="pt-2 border-t border-border/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">
                  {t("notifications_settings.notification_time", "Orario Notifica")}
                </span>
                <div className="flex items-center gap-1.5 bg-[#0f1419] dark:bg-[#0f1419] border border-border/80 dark:border-white/15 px-2.5 py-1 rounded-xl text-xs font-mono font-extrabold text-foreground shadow-inner min-w-[110px]">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <input
                    type="time"
                    value={dailyPlanningConfig.time}
                    style={{ colorScheme: "dark" }}
                    onChange={(e) => setDailyPlanningConfig((prev) => ({ ...prev, time: e.target.value }))}
                    className="bg-transparent border-none outline-none text-xs w-full text-center font-mono font-bold text-foreground"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-muted/30 text-[11px] text-muted-foreground space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground text-[10px] uppercase tracking-wider">
                    {t("notifications_settings.notification_text", "Testo Notifica")}
                  </span>
                  <button
                    onClick={() =>
                      handleTestNotification(
                        "dailyPlanning",
                        t("notifications_settings.daily_planning_title", "Pianificazione Giornaliera"),
                        t("notifications_settings.templates.daily_planning", "Dai un'occhiata alla tua lista di cose da fare. Qual è il tuo obiettivo principale per oggi?")
                      )
                    }
                    className="text-[#4b9b75] hover:underline text-[10px] font-bold flex items-center gap-1"
                  >
                    <Send className="h-2.5 w-2.5" /> {t("notifications_settings.test_notification", "Prova Notifica")}
                  </button>
                </div>
                <p className="italic">
                  "{t("notifications_settings.templates.daily_planning", "Dai un'occhiata alla tua lista di cose da fare. Qual è il tuo obiettivo principale per oggi?")}"
                </p>
              </div>
            </div>
          )}
        </section>

        {/* SECTION 5: THE RENEWAL PROGRAM - ONLY SHOWN IF USER HAS ACTIVE RECOVERY JOURNEY */}
        {hasActiveRenewalJourney && (
          <section className="rounded-2xl border border-border/60 dark:border-white/5 bg-card dark:bg-[#1a212e]/80 p-4 space-y-3 shadow-elevated">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#4D87D9]/20 text-[#4D87D9]">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-foreground">
                    {t("notifications_settings.renewal_title", "Programma The Renewal")}
                  </h2>
                  <p className="text-[10px] text-muted-foreground">
                    {t("notifications_settings.renewal_desc", "Progresso e check-in di recovery")}
                  </p>
                </div>
              </div>

              <Switch
                checked={renewalConfig.enabled}
                onCheckedChange={(checked) => setRenewalConfig((prev) => ({ ...prev, enabled: checked }))}
              />
            </div>

            {renewalConfig.enabled && (
              <div className="pt-2 border-t border-border/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">
                    {t("notifications_settings.notification_time", "Orario Notifica")}
                  </span>
                  <div className="flex items-center gap-1.5 bg-[#0f1419] dark:bg-[#0f1419] border border-border/80 dark:border-white/15 px-2.5 py-1 rounded-xl text-xs font-mono font-extrabold text-foreground shadow-inner min-w-[110px]">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <input
                      type="time"
                      value={renewalConfig.time}
                      style={{ colorScheme: "dark" }}
                      onChange={(e) => setRenewalConfig((prev) => ({ ...prev, time: e.target.value }))}
                      className="bg-transparent border-none outline-none text-xs w-full text-center font-mono font-bold text-foreground"
                    />
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-muted/30 text-[11px] text-muted-foreground space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground text-[10px] uppercase tracking-wider">
                      {t("notifications_settings.notification_text", "Testo Notifica")}
                    </span>
                    <button
                      onClick={() =>
                        handleTestNotification(
                          "renewal",
                          t("notifications_settings.renewal_title", "The Renewal Program"),
                          t("notifications_settings.templates.renewal", "Il tuo programma The Renewal ha un nuovo step. Fai il check-in per vedere i progressi.")
                        )
                      }
                      className="text-[#4D87D9] hover:underline text-[10px] font-bold flex items-center gap-1"
                    >
                      <Send className="h-2.5 w-2.5" /> {t("notifications_settings.test_notification", "Prova Notifica")}
                    </button>
                  </div>
                  <p className="italic">
                    "{t("notifications_settings.templates.renewal", "Il tuo programma The Renewal ha un nuovo step. Fai il check-in per vedere i progressi.")}"
                  </p>
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
}
