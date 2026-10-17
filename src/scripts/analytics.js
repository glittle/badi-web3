// Vercel Web Analytics (2.4.1; replaces the retired Google Universal Analytics).
// No cookies: Vercel tells visitors apart by a hash of the request that is
// reset daily. Page views only (custom events need a paid plan).
//
// The app uses hash routes (/#/counters), and the Vercel script only notices
// changes to the path, so auto-tracking is off and each route change sends
// its own page view with the route as the path
// (https://wondrous-badi.today/counters). beforeSend drops any query or hash
// so no other detail leaves the device; unknown routes count as /404.
// If the script cannot load (offline, ad blocker, Analytics not enabled)
// nothing else is affected.
import { inject, pageview } from '@vercel/analytics'

function cleanPath(to) {
  if (to.name === 'Error404') return '/404'
  return (to.path || '/').split('?')[0] || '/'
}

// pageview({ path }) has already put the route in the path; drop the query
// and the hash (#/route?…) so nothing else is sent.
export function viewUrl(href) {
  const url = new URL(href)
  url.hash = ''
  url.search = ''
  return url.href
}

export function installAnalytics(router) {
  try {
    inject({
      mode: import.meta.env.PROD ? 'production' : 'development',
      debug: false,
      disableAutoTrack: true,
      beforeSend: function (event) {
        try {
          return Object.assign({}, event, { url: viewUrl(event.url) })
        } catch (e) {
          return event
        }
      }
    })
  } catch (e) {
    return
  }

  router.afterEach(function (to, from, failure) {
    if (failure) return
    const path = cleanPath(to)
    try {
      pageview({ route: path, path: path })
    } catch (e) { }
  })
}
