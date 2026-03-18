/* sw.js - cache básico (seguro e simples) */
const CACHE_NAME = "catrion-pwa-v1";

const CORE_ASSETS = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/shared/styles/tokens.css",
  "/shared/styles/base.css",
  "/shared/styles/components.css",
  "/pages/home/home.css",
  "/pages/home/home.js",
  "/shared/js/pwa.js",
  "/assets/catrion-logo.png",
  "/assets/core-logo.png",
  "/assets/icons/icon-192.png",
  "/assets/icons/icon-512.png",

  /* Portal */
  "/app/",
  "/app/index.html"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k))))
    )
  );
  self.clients.claim();
});

/**
 * Estratégia:
 * - Navegação (HTML) -> network-first (pra não servir HTML velho)
 * - Assets (css/js/img) -> cache-first (pra ficar rápido)
 */
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Só intercepta o próprio site
  if (url.origin !== self.location.origin) return;

  const isNavigation = req.mode === "navigate";

  if (isNavigation) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match("/index.html")))
    );
    return;
  }

  // Assets
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        return res;
      });
    })
  );
});