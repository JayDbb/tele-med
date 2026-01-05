const CACHE_NAME = 'telemed-static-v3'
const OFFLINE_URL = '/offline.html'

// Only cache static assets, not HTML pages or Next.js data
const PRECACHE_URLS = [
  OFFLINE_URL,
  '/manifest.json'
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
  const { request } = event
  const url = new URL(request.url)

  // Skip service worker for API routes - they should always go to network
  if (url.pathname.startsWith('/api/')) {
    return
  }

  // Skip service worker for Next.js data routes - these should never be cached
  if (url.pathname.startsWith('/_next/data/')) {
    return
  }

  // Skip service worker for HTML pages - use network-first to avoid stale content
  if (request.method === 'GET' && request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => caches.match(OFFLINE_URL))
    )
    return
  }

  // Only cache static assets (JS, CSS, images, fonts)
  if (request.method !== 'GET') return

  // Network-first strategy for static assets (but don't cache HTML)
  const isStaticAsset =
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/static/') ||
    url.pathname.match(/\.(js|css|woff|woff2|ttf|eot|png|jpg|jpeg|gif|svg|webp|ico)$/)

  if (!isStaticAsset) {
    // For non-static assets, just fetch without caching
    return
  }

  // Network-first strategy: try network first, fall back to cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Only cache successful responses
        if (response.status === 200) {
          const copy = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
        }
        return response
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(request).then((cached) => {
          if (cached) {
            return cached
          }
          // If it's a navigation request and cache fails, show offline page
          if (request.mode === 'navigate') {
            return caches.match(OFFLINE_URL)
          }
          throw new Error('Network and cache failed')
        })
      })
  )
})
