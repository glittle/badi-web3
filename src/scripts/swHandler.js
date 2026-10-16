// The dev server is left uncached. Preview and production register the worker.
// localStorage keys (the __q_*| values) are not part of the worker and stay put.

// How long the reload notice shows before the page reloads.
export const RELOAD_NOTICE_MS = 1800

let reloadPending = false

// Show a calm notice, then reload. Counts and settings are already saved in
// localStorage, so they come back after the reload.
export function reloadWithNotice(message) {
    if (reloadPending) return
    reloadPending = true
    showReloadNotice(message || 'Reloading…')
    window.setTimeout(function () {
        window.location.reload()
    }, RELOAD_NOTICE_MS)
}

function showReloadNotice(message) {
    if (typeof document === 'undefined' || document.getElementById('reloadNotice')) return
    const style = document.createElement('style')
    style.textContent =
        '#reloadNotice{position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;' +
        'background:var(--overlay,rgba(255,255,255,0.72));opacity:0;transition:opacity .25s ease;}' +
        '#reloadNotice.shown{opacity:1;}' +
        '#reloadNotice .rnCard{display:flex;align-items:center;gap:12px;max-width:92%;box-sizing:border-box;padding:16px 20px;border-radius:12px;' +
        'background:var(--surface,#fff);border:1px solid rgba(var(--brand-rgb,36,113,163),0.32);box-shadow:0 2px 12px rgba(var(--brand-rgb,36,113,163),0.12);' +
        'color:var(--brand,#2471a3);font-size:1rem;font-weight:500;line-height:1.3;}' +
        '#reloadNotice .rnSpin{flex:0 0 auto;width:18px;height:18px;border-radius:50%;border:2px solid rgba(var(--brand-rgb,36,113,163),0.2);' +
        'border-top-color:var(--brand,#2471a3);animation:rnSpin 1s linear infinite;}' +
        '@keyframes rnSpin{to{transform:rotate(360deg)}}' +
        '@media (prefers-reduced-motion: reduce){#reloadNotice .rnSpin{animation:none}#reloadNotice{transition:none}}'
    document.head.appendChild(style)
    const notice = document.createElement('div')
    notice.id = 'reloadNotice'
    // role=alert: the page reloads within two seconds, so this must not wait
    // behind other speech. The text is set after the region is in the page,
    // because many screen readers ignore a live region that arrives already filled.
    notice.setAttribute('role', 'alert')
    const card = document.createElement('div')
    card.className = 'rnCard'
    const spin = document.createElement('span')
    spin.className = 'rnSpin'
    spin.setAttribute('aria-hidden', 'true')
    const text = document.createElement('span')
    card.appendChild(spin)
    card.appendChild(text)
    notice.appendChild(card)
    document.body.appendChild(notice)
    window.setTimeout(function () {
        text.textContent = message
    }, 50)
    window.requestAnimationFrame(function () {
        notice.classList.add('shown')
    })
}

if (!import.meta.env.DEV && 'serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        // First visit has no controller yet. Claiming that worker must not reload
        // the page the person just opened. A later controller is an update.
        let hadController = !!navigator.serviceWorker.controller
        navigator.serviceWorker.addEventListener('controllerchange', function () {
            if (!hadController) {
                hadController = true
                return
            }
            reloadWithNotice('New version found — reloading…')
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
