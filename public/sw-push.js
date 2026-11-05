// Service Worker Notification & Schedule Engine for InnerBuild PWA

let scheduledItems = [];
let firedMap = {};
let checkIntervalId = null;

function getTodayDateStr() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseTimeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== "string") return -1;
  const parts = timeStr.split(":");
  if (parts.length < 2) return -1;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return -1;
  return h * 60 + m;
}

function checkScheduledNotificationsInSW() {
  if (!scheduledItems || scheduledItems.length === 0) return;

  const now = new Date();
  const todayStr = getTodayDateStr();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  if (!firedMap[todayStr]) {
    firedMap = { [todayStr]: {} };
  }

  scheduledItems.forEach((item) => {
    if (!item || !item.enabled || !item.time) return;
    const schedMinutes = parseTimeToMinutes(item.time);
    if (schedMinutes < 0) return;

    const uniqueKey = `${item.key}_${item.time}`;
    if (firedMap[todayStr][uniqueKey]) return;

    // Fire if current time matches or is within 60 minutes after scheduled time
    const diff = currentMinutes - schedMinutes;
    if (diff >= 0 && diff <= 60) {
      firedMap[todayStr][uniqueKey] = true;

      self.registration.showNotification(item.title, {
        body: item.body,
        icon: "/pwa-icon-192.png",
        badge: "/badge-96x96.png",
        tag: `${uniqueKey}_${todayStr}`,
        renotify: true,
        silent: false,
        vibrate: [200, 100, 200],
        data: { url: item.url || "/dashboard" },
        actions: [
          { action: "open", title: "Apri App" },
          { action: "dismiss", title: "Ignora" },
        ],
      }).catch(() => {});
    }
  });
}

function ensureSwInterval() {
  if (!checkIntervalId) {
    checkIntervalId = setInterval(checkScheduledNotificationsInSW, 15000);
  }
}

// Handle incoming Web Push Notifications from server
self.addEventListener("push", (event) => {
  let notificationData = {
    title: "InnerBuild Reminder",
    body: "Prenditi un momento per la tua crescita oggi!",
    icon: "/pwa-icon-192.png",
    badge: "/badge-96x96.png",
    data: { url: "/dashboard" },
  };

  if (event.data) {
    try {
      notificationData = { ...notificationData, ...event.data.json() };
    } catch (e) {
      notificationData.body = event.data.text();
    }
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon || "/pwa-icon-192.png",
    badge: notificationData.badge || "/badge-96x96.png",
    tag: notificationData.tag || `innerbuild-push-${Date.now()}`,
    renotify: true,
    silent: false,
    vibrate: [200, 100, 200],
    data: notificationData.data || { url: "/dashboard" },
    actions: notificationData.actions || [
      { action: "open", title: "Apri App" },
      { action: "dismiss", title: "Ignora" },
    ],
  };

  event.waitUntil(self.registration.showNotification(notificationData.title, options));
});

// Handle messages from the client app (immediate notifications & schedule sync)
self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || typeof data !== "object") return;

  if (data.type === "SHOW_NOTIFICATION" && data.payload) {
    const { title, body, tag, url } = data.payload;
    const options = {
      body: body || "",
      icon: "/pwa-icon-192.png",
      badge: "/badge-96x96.png",
      tag: tag || `innerbuild-local-${Date.now()}`,
      renotify: true,
      silent: false,
      vibrate: [200, 100, 200],
      data: { url: url || "/dashboard" },
      actions: [
        { action: "open", title: "Apri App" },
        { action: "dismiss", title: "Ignora" },
      ],
    };
    event.waitUntil(self.registration.showNotification(title, options));
  } else if (data.type === "SYNC_SCHEDULE") {
    scheduledItems = Array.isArray(data.items) ? data.items : [];
    const todayStr = getTodayDateStr();
    if (!firedMap[todayStr]) {
      firedMap = { [todayStr]: {} };
    }
    if (data.firedToday && typeof data.firedToday === "object") {
      firedMap[todayStr] = { ...firedMap[todayStr], ...data.firedToday };
    }
    ensureSwInterval();
  } else if (data.type === "MARK_FIRED" && data.uniqueKey) {
    const todayStr = getTodayDateStr();
    if (!firedMap[todayStr]) {
      firedMap = { [todayStr]: {} };
    }
    firedMap[todayStr][data.uniqueKey] = true;
  }
});

// Handle notification click event
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const targetUrl = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          if ("navigate" in client) {
            client.navigate(targetUrl).catch(() => {});
          }
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
