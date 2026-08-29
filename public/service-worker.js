// App-shell service worker for the Family Calendar PWA.
// Strategy: NETWORK-FIRST. Always try to fetch the latest version from the
// server; only fall back to the cached copy if there's no network (offline).
// This matters a lot for an app that gets updated often — a cache-first
// strategy would keep serving old, stale JavaScript indefinitely, which is
// especially easy to get stuck on with an installed/home-screen PWA where
// there's no obvious "hard refresh" button like on desktop.
//
// Bump CACHE_NAME whenever you want to force every existing installation to
// drop its old cached files.
const CACHE_NAME = "family-calendar-v2";
const APP_SHELL = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return; // don't intercept Firebase/Google requests

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
