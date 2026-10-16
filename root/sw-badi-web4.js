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
      if (!precacheListed(request.url)) return precache.delete(request)
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

function isCounterSound(url) {
  return url.pathname === '/statics/each.mp3' ||
    url.pathname === '/statics/each19.mp3' ||
    url.pathname === '/statics/each95.mp3'
}

function leaveToNetwork(url, request) {
  if (request.method !== 'GET') return true
  // Other Range requests stay on the network. Counter sounds are precached,
  // and an <audio> element asks for a byte range when it loads or seeks.
  if (request.headers.has('range') && !isCounterSound(url)) return true
  if (!sameOrigin(url)) return true
  if (url.pathname === '/sw-badi-web4.js') return true
  if (url.pathname === '/version.json') return true
  if (url.pathname === '/badiService' || url.pathname.indexOf('/badiService/') === 0) return true
  return false
}

function cacheable(response) {
  return response && response.ok && response.type === 'basic' && !response.redirected
}

function precacheListed(requestUrl) {
  const cachedUrl = new URL(requestUrl)
  const full = cachedUrl.pathname + cachedUrl.search
  return PRECACHE_URLS.indexOf(cachedUrl.pathname) !== -1 || PRECACHE_URLS.indexOf(full) !== -1
}

function unsatisfiableRange(size) {
  return new Response(null, {
    status: 416,
    statusText: 'Range Not Satisfiable',
    headers: { 'Content-Range': 'bytes */' + size }
  })
}

// Audio seeks with one `bytes=` range. Answer from the cached file so an
// offline reload can still play. A range this worker cannot read gets the
// whole cached file instead of a network error.
async function counterSoundResponse(cached, request) {
  const range = request.headers.get('range')
  const headers = new Headers(cached.headers)
  headers.delete('content-encoding')
  headers.set('Accept-Ranges', 'bytes')
  headers.set('Content-Type', 'audio/mpeg')
  if (!range) {
    return new Response(cached.body, {
      status: cached.status,
      statusText: cached.statusText,
      headers: headers
    })
  }
  const body = await cached.arrayBuffer()
  const size = body.byteLength
  const match = /^bytes=(\d*)-(\d*)$/i.exec(range.trim())
  if (!match) {
    headers.set('Content-Length', String(size))
    return new Response(body, { status: 200, statusText: 'OK', headers: headers })
  }
  let start
  let end
  if (match[1] === '') {
    const suffix = Number(match[2])
    if (!suffix) return unsatisfiableRange(size)
    start = Math.max(size - suffix, 0)
    end = size - 1
  } else {
    start = Number(match[1])
    end = match[2] === '' ? size - 1 : Number(match[2])
    if (end >= size) end = size - 1
  }
  if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || start >= size || end < start) {
    return unsatisfiableRange(size)
  }
  const slice = body.slice(start, end + 1)
  headers.set('Content-Length', String(slice.byteLength))
  headers.set('Content-Range', 'bytes ' + start + '-' + end + '/' + size)
  return new Response(slice, {
    status: 206,
    statusText: 'Partial Content',
    headers: headers
  })
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
    const precache = await caches.open(PRECACHE)
    // Match the stored URL. A Range request is a different request and would
    // miss the full file cache.add stored at install.
    const precached = await precache.match(url.pathname + url.search) || await precache.match(request)
    if (precached && isCounterSound(url)) return counterSoundResponse(precached, request)
    if (precached) return precached
    const cache = await caches.open(RUNTIME)
    const hit = await cache.match(request)
    const network = fetch(request).then(async (response) => {
      if (cacheable(response)) await cache.put(request, response.clone())
      return response
    }).catch(() => hit || Response.error())
    return hit || network
  })())
})
