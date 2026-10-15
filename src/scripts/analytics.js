const GA_ID = 'UA-1312528-11'

export function installAnalytics(router) {
  window.ga = window.ga || function () {
    (window.ga.q = window.ga.q || []).push(arguments)
  }
  window.ga.l = +new Date()
  const script = document.createElement('script')
  script.async = true
  script.src = 'https://www.google-analytics.com/analytics.js'
  document.head.appendChild(script)
  window.ga('create', GA_ID, 'auto')
  window.ga('set', 'anonymizeIp', true)

  router.afterEach(function (to) {
    window.ga('set', 'page', to.fullPath)
    window.ga('send', 'pageview')
  })
}

export const gaHelper = {
  event(category, action, label) {
    if (typeof window.ga === 'function') {
      window.ga('send', 'event', category, action, label)
    }
  }
}
