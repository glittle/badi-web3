/*
 * Wondrous-Badíʿ Today service worker.
 * The filename stays sw-badi-web4.js so browsers that already registered it
 * (including the v1 Workbox worker) update this registration instead of
 * keeping an orphaned one. localStorage is never touched.
 *
 * The build replaces CACHE_VERSION and PRECACHE_URLS from package.json and
 * the Vite asset manifest. Do not hand-maintain that list.
 */
const CACHE_VERSION = '0.0.0-dev'
const PRECACHE_URLS = []
const PRECACHE = 'badi-precache-' + CACHE_VERSION
const RUNTIME = 'badi-runtime-' + CACHE_VERSION

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(PRECACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => {
        // Take over as soon as this worker is installed so a v1 client, which
        // has no update listener, is not left on the old worker until every
        // tab is closed. The page reloads itself once it is already controlled.
        return self.skipWaiting()
      })
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys()
    const fromLegacy = keys.some((name) => name.indexOf('workbox') !== -1)
    await Promise.all(
      keys
        .filter((name) => name !== PRECACHE && name !== RUNTIME)
        .map((name) => caches.delete(name))
    )
    const precache = await caches.open(PRECACHE)
    const cached = await precache.keys()
    await Promise.all(cached.map((request) => {
      const pathname = new URL(request.url).pathname
      if (PRECACHE_URLS.indexOf(pathname) === -1) return precache.delete(request)
    }))
    await self.clients.claim()
    // Pages still running the v1 script do not listen for controllerchange.
    // Reload them once. Later updates reload from the page instead, so this
    // does not fire twice.
    if (fromLegacy) {
      const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      await Promise.all(clients.map((client) => client.navigate ? client.navigate(client.url) : Promise.resolve()))
    }
  })())
})

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

self.addEventListener('notificationclick', (event) => {
  event.waitUntil(clients.matchAll({ type: 'window' }).then((list) => {
    for (let i = 0; i < list.length; i++) {
      if (list[i].focus) return list[i].focus()
    }
    if (clients.openWindow) return clients.openWindow('/')
  }))
})

function sameOrigin(url) {
  return url.origin === self.location.origin
}

function leaveToNetwork(url, request) {
  if (request.method !== 'GET') return true
  if (request.headers.has('range')) return true
  if (!sameOrigin(url)) return true
  if (url.pathname === '/sw-badi-web4.js') return true
  if (url.pathname === '/version.json') return true
  if (url.pathname === '/badiService' || url.pathname.indexOf('/badiService/') === 0) return true
  return false
}

function cacheable(response) {
  return response && response.ok && response.type === 'basic' && !response.redirected
}

self.addEventListener('fetch', (event) => {
  const request = event.request
  let url
  try {
    url = new URL(request.url)
  } catch (e) {
    return
  }
  if (leaveToNetwork(url, request)) return

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(PRECACHE)
      try {
        // Bypass the browser HTTP cache so a long-lived index.html cannot
        // pin an open install to the previous build.
        const fresh = await fetch(request, { cache: 'no-store' })
        if (cacheable(fresh)) {
          await cache.put('/index.html', fresh.clone())
        }
        return fresh
      } catch (err) {
        const cached = await cache.match('/index.html')
        return cached || Response.error()
      }
    })())
    return
  }

  if (url.pathname.indexOf('/assets/') === 0) {
    event.respondWith((async () => {
      const cache = await caches.open(PRECACHE)
      const hit = await cache.match(request)
      if (hit) return hit
      const response = await fetch(request)
      if (cacheable(response)) await cache.put(request, response.clone())
      return response
    })())
    return
  }

  event.respondWith((async () => {
    const cache = await caches.open(RUNTIME)
    const hit = await cache.match(request)
    const network = fetch(request).then(async (response) => {
      if (cacheable(response)) await cache.put(request, response.clone())
      return response
    }).catch(() => hit || Response.error())
    return hit || network
  })())
})
