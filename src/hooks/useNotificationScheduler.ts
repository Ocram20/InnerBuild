import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { localizeSuggestedHabitTitle } from "@/lib/templateLocalization";

export function useNotificationScheduler() {
  const { t } = useTranslation();

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;

    const checkAndTriggerNotifications = async () => {
      try {
        if (Notification.permission !== "granted") return;

        const savedPreferencesStr = localStorage.getItem("innerbuild_notification_preferences");
        if (!savedPreferencesStr) return;

        const prefs = JSON.parse(savedPreferencesStr);
        const now = new Date();
        const currentHours = String(now.getHours()).padStart(2, "0");
        const currentMinutes = String(now.getMinutes()).padStart(2, "0");
        const currentTimeStr = `${currentHours}:${currentMinutes}`;
        
        // Format YYYY-MM-DD local date string
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const todayDateStr = `${year}-${month}-${day}`;

        const storageKey = `innerbuild_fired_notifications_${todayDateStr}`;
        const firedToday: Record<string, boolean> = JSON.parse(
          localStorage.getItem(storageKey) || "{}"
        );

        const dispatchNotification = (key: string, title: string, body: string, url = "/dashboard") => {
          const uniqueKey = `${key}_${currentTimeStr}`;
          if (firedToday[uniqueKey]) return; // Already fired for this minute today

          firedToday[uniqueKey] = true;
          try {
            localStorage.setItem(storageKey, JSON.stringify(firedToday));
          } catch (e) {
            console.error("Failed to write fired notifications to localStorage:", e);
          }

          // Try Service Worker registration showNotification first (native mobile push behavior)
          if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.ready
              .then((reg) => {
                reg.showNotification(title, {
                  body,
                  icon: "/pwa-icon-192.png",
                  badge: "/badge-96x96.png",
                  vibrate: [100, 50, 100],
                  data: { url },
                } as NotificationOptions);
              })
              .catch(() => {
                // Fallback to standard Notification API
                try {
                  new Notification(title, {
                    body,
                    icon: "/pwa-icon-192.png",
                    badge: "/badge-96x96.png",
                  });
                } catch (e) {
                  console.error("Standard notification fallback error:", e);
                }
              });
          } else {
            try {
              new Notification(title, {
                body,
                icon: "/pwa-icon-192.png",
                badge: "/badge-96x96.png",
              });
            } catch (e) {
              console.error("Standard notification creation error:", e);
            }
          }
        };

        // 1. Check Habits Notification Configs
        if (prefs.habits && Array.isArray(prefs.habits)) {
          prefs.habits.forEach((h: any) => {
            if (h.enabled && h.time === currentTimeStr) {
              const habitTitle = h.rawTitle
                ? localizeSuggestedHabitTitle(t, h.rawTitle)
                : t("notifications_settings.habits_title", "Abitudine");
              const body = t(
                "notifications_settings.templates.habit",
                `È ora di ${habitTitle}. Bastano pochi minuti per costruire costanza!`,
                { title: habitTitle }
              );
              dispatchNotification(`habit_${h.id}`, `Promemoria: ${habitTitle}`, body, "/habits");
            }
          });
        }

        // 2. Check Detox Challenge Notification Config
        if (prefs.detox?.enabled && prefs.detox?.time === currentTimeStr && prefs.hasActiveDetoxChallenges) {
          dispatchNotification(
            "detox",
            t("notifications_settings.detox_title", "Check-in Sfida Detox"),
            t("notifications_settings.templates.detox", "Non dimenticare il tuo check-in Detox di oggi. Come sta andando la tua sfida?"),
            "/challenges"
          );
        }

        // 3. Check Evening Reflection Notification Config
        if (prefs.evening?.enabled && prefs.evening?.time === currentTimeStr) {
          dispatchNotification(
            "evening",
            t("notifications_settings.evening_title", "Riflessione Serale"),
            t("notifications_settings.templates.evening", "Prenditi un momento per riflettere sulla tua giornata. Scrivi la tua gratitudine quotidiana."),
            "/evening-reflection"
          );
        }

        // 4. Check Daily Planning Notification Config
        if (prefs.dailyPlanning?.enabled && prefs.dailyPlanning?.time === currentTimeStr) {
          dispatchNotification(
            "dailyPlanning",
            t("notifications_settings.daily_planning_title", "Pianificazione Giornaliera"),
            t("notifications_settings.templates.daily_planning", "Dai un'occhiata alla tua lista di cose da fare. Qual è il tuo obiettivo principale per oggi?"),
            "/daily-planning"
          );
        }

        // 5. Check Renewal Notification Config
        if (prefs.renewal?.enabled && prefs.renewal?.time === currentTimeStr && prefs.hasActiveRenewalJourney) {
          dispatchNotification(
            "renewal",
            t("notifications_settings.renewal_title", "Programma The Renewal"),
            t("notifications_settings.templates.renewal", "Il tuo programma The Renewal ha un nuovo step. Fai il check-in per vedere i progressi."),
            "/the-forge"
          );
        }
      } catch (err) {
        console.error("Error in notification scheduler loop:", err);
      }
    };

    // Run initial check immediately
    checkAndTriggerNotifications();

    // Re-check every 15 seconds so we don't miss minute transitions
    const intervalId = setInterval(checkAndTriggerNotifications, 15000);

    return () => clearInterval(intervalId);
  }, [t]);
}
