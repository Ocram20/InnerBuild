// Service Worker for InnerBuild PWA Web Push Notifications

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

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
    vibrate: [100, 50, 100],
    data: notificationData.data || { url: "/dashboard" },
    actions: notificationData.actions || [
      { action: "open", title: "Apri App" },
      { action: "dismiss", title: "Ignora" },
    ],
  };

  event.waitUntil(self.registration.showNotification(notificationData.title, options));
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
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
