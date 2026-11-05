// Service Worker for InnerBuild PWA Web Push & Local Scheduled Notifications

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

try {
  importScripts("/sw-push.js");
} catch (e) {
  console.error("Failed to import /sw-push.js in sw.js:", e);
}
