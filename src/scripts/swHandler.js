// The dev server is left uncached. Preview and production register the worker.
// localStorage keys (the __q_*| values) are not part of the worker and stay put.

if (!import.meta.env.DEV && 'serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        // First visit has no controller yet. Claiming that worker must not reload
        // the page the person just opened. A later controller is an update.
        let hadController = !!navigator.serviceWorker.controller
        let reloading = false
        navigator.serviceWorker.addEventListener('controllerchange', function () {
            if (!hadController) {
                hadController = true
                return
            }
            if (reloading) return
            reloading = true
            window.location.reload()
        })

        navigator.serviceWorker.register('/sw-badi-web4.js', {
            scope: '/',
            updateViaCache: 'none'
        }).then(function (registration) {
            function requestSkip(worker) {
                if (!worker || !navigator.serviceWorker.controller) return
                worker.postMessage({ type: 'SKIP_WAITING' })
            }
            requestSkip(registration.waiting)
            registration.addEventListener('updatefound', function () {
                const worker = registration.installing
                if (!worker) return
                worker.addEventListener('statechange', function () {
                    if (worker.state === 'installed') requestSkip(worker)
                })
            })
        }).catch(function (error) {
            console.log(error)
        })
    })
}
