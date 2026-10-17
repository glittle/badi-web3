// iPhone / iPad detection for the iOS install hint and the Notifications page (2.4.6).

// iPhone, iPod, iPad, and iPadOS 13+ (which reports itself as a Mac but has touch).
export function isIos() {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent || ''
  if (/iPad|iPhone|iPod/.test(ua)) return true
  const touch = (navigator.maxTouchPoints || 0) > 1
  return touch && (navigator.platform === 'MacIntel' || /Macintosh/.test(ua))
}

// Running as an installed (home-screen) app rather than in a browser tab.
export function isStandalone() {
  if (typeof window === 'undefined') return false
  if (window.navigator && window.navigator.standalone === true) return true
  return !!(window.matchMedia && window.matchMedia('(display-mode: standalone)').matches)
}

// In an iPhone/iPad browser tab, not yet added to the Home Screen.
export function isIosBrowserTab() {
  return isIos() && !isStandalone()
}
