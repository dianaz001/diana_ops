/// Service Worker — version detection + basic caching
/* eslint-disable no-restricted-globals */

const CACHE_NAME = 'juliz-v1';
const VERSION_URL = '/version.json';
const POLL_INTERVAL = 60_000; // 60 seconds

let lastKnownVersion = null;

// ── Install ──────────────────────────────────────────
self.addEventListener('install', () => {
  // Don't skipWaiting automatically — wait for explicit message
});

// ── Activate ─────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Fetch strategy ───────────────────────────────────
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // version.json — always network, never cache
  if (url.pathname === VERSION_URL) {
    event.respondWith(fetch(event.request, { cache: 'no-store' }));
    return;
  }

  // Navigation — network-first, cache fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Static assets — cache-first
  if (url.pathname.match(/\.(js|css|png|jpg|svg|woff2?)$/)) {
    event.respondWith(
      caches.match(event.request).then(
        (cached) =>
          cached ||
          fetch(event.request).then((response) => {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            return response;
          })
      )
    );
    return;
  }
});

// ── Version polling ──────────────────────────────────
async function checkVersion() {
  try {
    const resp = await fetch(`${VERSION_URL}?_cb=${Date.now()}`, { cache: 'no-store' });
    if (!resp.ok) return;
    const data = await resp.json();
    if (!data.version) return;

    if (lastKnownVersion && lastKnownVersion !== data.version) {
      notifyClients(data);
    }
    lastKnownVersion = data.version;
  } catch {
    // Network error — ignore
  }
}

function notifyClients(data) {
  self.clients.matchAll({ type: 'window' }).then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: 'VERSION_UPDATE',
        version: data.version,
        buildTime: data.buildTime,
      });
    });
  });
}

// Poll every 60s
setInterval(checkVersion, POLL_INTERVAL);
// Initial check on SW activation
checkVersion();

// ── Messages from app ────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
  if (event.data === 'checkForUpdate') {
    checkVersion();
  }
});
