const CACHE_NAME = 'telemed-shell-v2'
const OFFLINE_URL = '/offline.html'

const PRECACHE_URLS = [
  '/',
  OFFLINE_URL,
  '/manifest.json',
  '/login',
  '/doctor',
  '/doctor/dashboard',
  '/patients',
  '/doctor/calendar',
  '/doctor/inbox',
  '/nurse-portal',
  '/nurse-portal/schedule',
  '/nurse-portal/messages'
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  // Skip service worker for API routes - they should always go to network
  if (event.request.url.includes('/api/')) {
    return // Let the request go through normally without interception
  }

  if (event.request.method !== 'GET') return

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy))
          return response
        })
        .catch(() =>
          caches.match(event.request).then((cached) => cached || caches.match(OFFLINE_URL))
        )
    )
    return
  }

  event.respondWith(
    caches.match(event.request).then((cached) =>
      cached || fetch(event.request).then((response) => {
        const copy = response.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy))
        return response
      })
    )
  )
})
