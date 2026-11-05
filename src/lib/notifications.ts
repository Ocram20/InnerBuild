// PWA Notification & Sound Utility for InnerBuild

export interface ScheduledNotificationItem {
  key: string;
  title: string;
  body: string;
  time: string;
  enabled: boolean;
  url: string;
}

let swRegistrationPromise: Promise<ServiceWorkerRegistration | null> | null = null;

/**
 * Registers /sw.js (or returns existing registration) so ServiceWorkerRegistration.showNotification
 * works reliably on Android Chrome, iOS Safari Home Screen PWAs, and desktop browsers.
 */
export async function registerNotificationServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }

  try {
    const existing = await navigator.serviceWorker.getRegistration("/");
    if (existing) {
      return existing;
    }

    if (!swRegistrationPromise) {
      swRegistrationPromise = navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch((err) => {
          console.warn("Service worker registration warning:", err);
          swRegistrationPromise = null;
          return null;
        });
    }

    const reg = await swRegistrationPromise;
    return reg;
  } catch (err) {
    console.warn("Could not get/register service worker:", err);
    return null;
  }
}

/**
 * Plays a pleasant two-tone notification chime using the Web Audio API
 * and triggers haptic vibration on mobile devices.
 */
export function playNotificationSound(): void {
  if (typeof window === "undefined") return;

  // 1. Trigger vibration on supported mobile devices
  try {
    if ("vibrate" in navigator && typeof navigator.vibrate === "function") {
      navigator.vibrate([200, 100, 200]);
    }
  } catch {
    // Ignore vibration errors on unsupported devices
  }

  // 2. Synthesize a crisp, pleasant notification chime via Web Audio API
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // First note (E5 - 659.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.exponentialRampToValueAtTime(0.25, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.24);

    // Second note (A5 - 880 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880, now + 0.14);
    gain2.gain.setValueAtTime(0.001, now + 0.14);
    gain2.gain.exponentialRampToValueAtTime(0.3, now + 0.17);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.14);
    osc2.stop(now + 0.58);

    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 800);
  } catch {
    // Ignore audio context restrictions if no user gesture yet
  }
}

/**
 * Displays a native system/PWA notification + sound + vibration.
 * Uses ServiceWorkerRegistration.showNotification first (mandatory on mobile PWAs),
 * falling back to new Notification() on desktop browsers if SW is unavailable.
 */
export async function showAppNotification(options: {
  title: string;
  body: string;
  tag?: string;
  url?: string;
}): Promise<boolean> {
  const { title, body, tag, url = "/dashboard" } = options;

  // Always play chime + vibrate
  playNotificationSound();

  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }

  if (Notification.permission !== "granted") {
    return false;
  }

  const notificationTag = tag || `innerbuild-${Date.now()}`;
  const notifOptions: NotificationOptions & Record<string, unknown> = {
    body,
    icon: "/pwa-icon-192.png",
    badge: "/badge-96x96.png",
    tag: notificationTag,
    renotify: true,
    requireInteraction: false,
    silent: false,
    vibrate: [200, 100, 200],
    data: { url },
  };

  // 1. Try Service Worker showNotification (works on Android Chrome, iOS PWA, and Desktop)
  try {
    const reg = await registerNotificationServiceWorker();
    if (reg && typeof reg.showNotification === "function") {
      await reg.showNotification(title, notifOptions);
      return true;
    }

    if ("serviceWorker" in navigator) {
      const readyReg = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500)),
      ]);
      if (readyReg && typeof readyReg.showNotification === "function") {
        await readyReg.showNotification(title, notifOptions);
        return true;
      }
      if (readyReg?.active) {
        readyReg.active.postMessage({
          type: "SHOW_NOTIFICATION",
          payload: { title, body, tag: notificationTag, url },
        });
        return true;
      }
    }
  } catch (swErr) {
    console.warn("SW showNotification fallback:", swErr);
  }

  // 2. Fallback to standard Desktop Notification constructor
  try {
    const n = new Notification(title, {
      body,
      icon: "/pwa-icon-192.png",
      badge: "/badge-96x96.png",
      tag: notificationTag,
      silent: false,
    });
    n.onclick = () => {
      window.focus();
      if (url && window.location.pathname !== url) {
        window.location.href = url;
      }
      n.close();
    };
    return true;
  } catch (err) {
    console.warn("Notification constructor failed:", err);
    return false;
  }
}

export function getTodayLocalDateStr(now = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseTimeToMinutes(timeStr?: string): number {
  if (!timeStr || typeof timeStr !== "string") return -1;
  const [hStr, mStr] = timeStr.split(":");
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (Number.isNaN(h) || Number.isNaN(m)) return -1;
  return h * 60 + m;
}

/**
 * When the user saves or initializes preferences, mark any scheduled time strictly earlier
 * than the current minute today as already passed so it doesn't fire retroactively,
 * while keeping current/future minutes today ready to fire.
 */
export function markPastScheduledTimesAsFiredToday(prefs: {
  habits?: Array<{ id: string; enabled: boolean; time: string }>;
  detox?: { enabled: boolean; time: string };
  evening?: { enabled: boolean; time: string };
  dailyPlanning?: { enabled: boolean; time: string };
  renewal?: { enabled: boolean; time: string };
}): void {
  try {
    const now = new Date();
    const todayDateStr = getTodayLocalDateStr(now);
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const storageKey = `innerbuild_fired_notifications_${todayDateStr}`;
    const firedToday: Record<string, boolean> = JSON.parse(localStorage.getItem(storageKey) || "{}");

    const checkAndMarkIfPast = (key: string, timeStr?: string) => {
      const schedMins = parseTimeToMinutes(timeStr);
      if (schedMins >= 0 && schedMins < currentMinutes) {
        firedToday[`${key}_${timeStr}`] = true;
      }
    };

    if (Array.isArray(prefs.habits)) {
      prefs.habits.forEach((h) => checkAndMarkIfPast(`habit_${h.id}`, h.time));
    }
    if (prefs.detox?.time) checkAndMarkIfPast("detox", prefs.detox.time);
    if (prefs.evening?.time) checkAndMarkIfPast("evening", prefs.evening.time);
    if (prefs.dailyPlanning?.time) checkAndMarkIfPast("dailyPlanning", prefs.dailyPlanning.time);
    if (prefs.renewal?.time) checkAndMarkIfPast("renewal", prefs.renewal.time);

    localStorage.setItem(storageKey, JSON.stringify(firedToday));
  } catch (e) {
    console.warn("Could not mark past scheduled times:", e);
  }
}

/**
 * Sends the active schedule to the Service Worker so it can also monitor and fire notifications.
 */
export async function syncScheduleToServiceWorker(
  items: ScheduledNotificationItem[],
  firedToday: Record<string, boolean>
): Promise<void> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  try {
    const reg = await registerNotificationServiceWorker();
    const sw = reg?.active || navigator.serviceWorker.controller;
    if (sw) {
      sw.postMessage({
        type: "SYNC_SCHEDULE",
        items,
        firedToday,
      });
    }
  } catch {
    // Ignore SW postMessage errors
  }
}
