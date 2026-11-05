import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { localizeSuggestedHabitTitle } from "@/lib/templateLocalization";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  registerNotificationServiceWorker,
  showAppNotification,
  getTodayLocalDateStr,
  parseTimeToMinutes,
  markPastScheduledTimesAsFiredToday,
  syncScheduleToServiceWorker,
  type ScheduledNotificationItem,
} from "@/lib/notifications";

export function useNotificationScheduler() {
  const { t } = useTranslation();
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Ensure Service Worker is registered immediately for PWA notifications
    registerNotificationServiceWorker();

    // 2. Bootstrap default notification preferences if not yet saved in localStorage
    const ensurePreferencesInitialized = async () => {
      try {
        const existing = localStorage.getItem("innerbuild_notification_preferences");
        if (existing) return;

        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData?.session?.user;
        if (!user) return;

        const [habitsRes, challengesRes, journeyRes] = await Promise.all([
          supabase
            .from("habits")
            .select("id, title, is_active")
            .eq("user_id", user.id)
            .eq("is_active", true)
            .order("created_at", { ascending: false }),
          supabase
            .from("detox_challenges")
            .select("id")
            .eq("user_id", user.id)
            .eq("status", "active"),
          supabase
            .from("recovery_journey")
            .select("id, is_active")
            .eq("user_id", user.id)
            .eq("is_active", true)
            .maybeSingle(),
        ]);

        const activeHabits = habitsRes.data || [];
        const hasActiveDetoxChallenges = (challengesRes.data || []).length > 0;
        const hasActiveRenewalJourney = Boolean(journeyRes.data?.is_active);

        const defaultPrefs = {
          detox: { enabled: true, time: "12:00" },
          evening: { enabled: true, time: "21:30" },
          dailyPlanning: { enabled: true, time: "08:00" },
          renewal: { enabled: true, time: "20:00" },
          habits: activeHabits.map((h, idx) => ({
            id: h.id,
            rawTitle: h.title,
            enabled: true,
            time: idx % 2 === 0 ? "08:30" : "20:00",
          })),
          hasActiveDetoxChallenges,
          hasActiveRenewalJourney,
          updatedAt: new Date().toISOString(),
        };

        markPastScheduledTimesAsFiredToday(defaultPrefs);
        localStorage.setItem("innerbuild_notification_preferences", JSON.stringify(defaultPrefs));
      } catch (err) {
        console.warn("Could not bootstrap default notification preferences:", err);
      }
    };

    const checkAndTriggerNotifications = async () => {
      try {
        await ensurePreferencesInitialized();

        const savedPreferencesStr = localStorage.getItem("innerbuild_notification_preferences");
        if (!savedPreferencesStr) return;

        const prefs = JSON.parse(savedPreferencesStr);
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const todayDateStr = getTodayLocalDateStr(now);

        const storageKey = `innerbuild_fired_notifications_${todayDateStr}`;
        const firedToday: Record<string, boolean> = JSON.parse(
          localStorage.getItem(storageKey) || "{}"
        );

        // Build full list of scheduled items
        const items: ScheduledNotificationItem[] = [];

        // 1. Habits
        if (prefs.habits && Array.isArray(prefs.habits)) {
          prefs.habits.forEach((h: { id: string; rawTitle?: string; enabled: boolean; time: string }) => {
            if (!h || !h.id || !h.time) return;
            const habitTitle = h.rawTitle
              ? localizeSuggestedHabitTitle(t, h.rawTitle)
              : t("notifications_settings.habits_title", "Abitudine");
            const body = t(
              "notifications_settings.templates.habit",
              `È ora di ${habitTitle}. Bastano pochi minuti per costruire costanza!`,
              { title: habitTitle }
            );
            items.push({
              key: `habit_${h.id}`,
              title: `Promemoria: ${habitTitle}`,
              body,
              time: h.time,
              enabled: Boolean(h.enabled),
              url: "/habits",
            });
          });
        }

        // 2. Detox Challenges
        if (prefs.detox?.time && prefs.hasActiveDetoxChallenges) {
          items.push({
            key: "detox",
            title: t("notifications_settings.detox_title", "Check-in Sfida Detox"),
            body: t(
              "notifications_settings.templates.detox",
              "Non dimenticare il tuo check-in Detox di oggi. Come sta andando la tua sfida?"
            ),
            time: prefs.detox.time,
            enabled: Boolean(prefs.detox.enabled),
            url: "/challenges",
          });
        }

        // 3. Evening Reflection
        if (prefs.evening?.time) {
          items.push({
            key: "evening",
            title: t("notifications_settings.evening_title", "Riflessione Serale"),
            body: t(
              "notifications_settings.templates.evening",
              "Prenditi un momento per riflettere sulla tua giornata. Scrivi la tua gratitudine quotidiana."
            ),
            time: prefs.evening.time,
            enabled: Boolean(prefs.evening.enabled),
            url: "/evening-reflection",
          });
        }

        // 4. Daily Planning
        if (prefs.dailyPlanning?.time) {
          items.push({
            key: "dailyPlanning",
            title: t("notifications_settings.daily_planning_title", "Pianificazione Giornaliera"),
            body: t(
              "notifications_settings.templates.daily_planning",
              "Dai un'occhiata alla tua lista di cose da fare. Qual è il tuo obiettivo principale per oggi?"
            ),
            time: prefs.dailyPlanning.time,
            enabled: Boolean(prefs.dailyPlanning.enabled),
            url: "/daily-planning",
          });
        }

        // 5. Renewal Program
        if (prefs.renewal?.time && prefs.hasActiveRenewalJourney) {
          items.push({
            key: "renewal",
            title: t("notifications_settings.renewal_title", "Programma The Renewal"),
            body: t(
              "notifications_settings.templates.renewal",
              "Il tuo programma The Renewal ha un nuovo step. Fai il check-in per vedere i progressi."
            ),
            time: prefs.renewal.time,
            enabled: Boolean(prefs.renewal.enabled),
            url: "/the-forge",
          });
        }

        // Sync schedule with Service Worker so background checks have latest items
        syncScheduleToServiceWorker(items, firedToday);

        const canSendNative = "Notification" in window && Notification.permission === "granted";

        for (const item of items) {
          if (!item.enabled) continue;
          const schedMinutes = parseTimeToMinutes(item.time);
          if (schedMinutes < 0) continue;

          const uniqueKey = `${item.key}_${item.time}`;
          if (firedToday[uniqueKey]) continue;

          // Fire if current time matches or is within a 180-minute catch-up window after scheduled time
          const diff = currentMinutes - schedMinutes;
          if (diff >= 0 && diff <= 180) {
            firedToday[uniqueKey] = true;
            try {
              localStorage.setItem(storageKey, JSON.stringify(firedToday));
            } catch (e) {
              console.error("Failed to write fired notifications to localStorage:", e);
            }

            if (canSendNative) {
              await showAppNotification({
                title: item.title,
                body: item.body,
                tag: `${uniqueKey}_${todayDateStr}`,
                url: item.url,
              });
            }

            // Also show in-app toast + chime if app is visible
            toast({
              title: `🔔 ${item.title}`,
              description: item.body,
            });
          }
        }
      } catch (err) {
        console.error("Error in notification scheduler loop:", err);
      }
    };

    // Run initial check immediately
    checkAndTriggerNotifications();

    // Re-check every 10 seconds
    const intervalId = setInterval(checkAndTriggerNotifications, 10000);

    // Also check immediately when the app wakes up / returns to foreground or settings change
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === "visible") {
        checkAndTriggerNotifications();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityOrFocus);
    window.addEventListener("focus", checkAndTriggerNotifications);
    window.addEventListener("pageshow", checkAndTriggerNotifications);
    window.addEventListener("innerbuild-notifications-updated", checkAndTriggerNotifications);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
      window.removeEventListener("focus", checkAndTriggerNotifications);
      window.removeEventListener("pageshow", checkAndTriggerNotifications);
      window.removeEventListener("innerbuild-notifications-updated", checkAndTriggerNotifications);
    };
  }, [t, toast]);
}
