console.log('loading workbox')

// self.addEventListener('push', function(event) {
//     console.log('push event', event);
// });

self.addEventListener('notificationclose', function(event) {
    console.log('notification closed', event)
});

self.addEventListener('notificationclick', function(event) {
    // console.log('On notification click: ', event.notification.tag);

    // This looks to see if the current is already open and
    // focuses if it is
    event.waitUntil(clients.matchAll({
        type: "window"
    }).then(function(clientList) {
        for (var i = 0; i < clientList.length; i++) {
            var client = clientList[i];
            if ('focus' in client) {
                return client.focus();
            }
        }
        if (clients.openWindow) {
            return clients.openWindow('/');
        }
    }));
});


//importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.3.1/workbox-sw.js');
var workbox = (function() {
    "use strict";
    try {
        self.workbox.v["workbox:sw:3.3.1"] = 1
    } catch (t) {}
    const t = "https://storage.googleapis.com/workbox-cdn/releases/3.3.1",
        e = {
            backgroundSync: "background-sync",
            broadcastUpdate: "broadcast-cache-update",
            cacheableResponse: "cacheable-response",
            core: "core",
            expiration: "cache-expiration",
            googleAnalytics: "google-analytics",
            precaching: "precaching",
            rangeRequests: "range-requests",
            routing: "routing",
            strategies: "strategies",
            streams: "streams"
        };
    return new class {
        constructor() {
            return this.v = {}, this.t = {
                debug: true, // "localhost" === self.location.hostname,
                modulePathPrefix: null,
                modulePathCb: null
            }, this.e = this.t.debug ? "dev" : "prod", this.s = !1, new Proxy(this, {
                get(t, s) {
                    if (t[s]) return t[s];
                    const o = e[s];
                    return o && t.loadModule(`workbox-${o}`), t[s]
                }
            })
        }
        setConfig(t = {}) {
            if (this.s) throw new Error("Config must be set before accessing workbox.* modules");
            Object.assign(this.t, t);
            this.e = this.t.debug ? "dev" : "prod";
        }
        skipWaiting() {
            self.addEventListener("install", () => self.skipWaiting())
        }
        clientsClaim() {
            self.addEventListener("activate", () => self.clients.claim())
        }
        loadModule(t) {
            const e = this.o(t);
            try {
                importScripts(e);
                this.s = !0
            } catch (s) {
                throw console.error(`Unable to import module '${t}' from '${e}'.`)
            }
        }
        o(e) {
            if (this.t.modulePathCb) return this.t.modulePathCb(e, this.t.debug);
            let s = [t];
            const o = `${e}.${this.e}.js`,
                r = this.t.modulePathPrefix;
            return r && (s = r.split("/"))[s.length - 1] === "" && s.splice(s.length - 1, 1), s.push(o), s.join("/")
        }
    }()
}());
//# sourceMappingURL=workbox-sw.js.map



const matchCb = ({
    url,
    event
}) => {
    return (url.pathname === '/special/url');
};

if (workbox) {
    workbox.setConfig({
        debug: true // false
    });
    workbox.core.setLogLevel(workbox.core.LOG_LEVELS.warn);

    workbox.skipWaiting();
    workbox.clientsClaim();

    console.log(`Yay! Workbox is loaded 🎉`);

    if (location.hostname === 'localhost') {
        console.log('Not caching on localhost')
    } else {
        workbox.routing.registerRoute(
            new RegExp('/images/.*\.png'),
            workbox.strategies.staleWhileRevalidate()
        );
        workbox.routing.registerRoute(
            new RegExp('/.*'),
            workbox.strategies.staleWhileRevalidate()
        );


        workbox.googleAnalytics.initialize();

        // Shows logs, warnings and errors.
        // workbox.core.setLogLevel(workbox.core.LOG_LEVELS.log);

        // Show warnings and errors.
        //workbox.core.setLogLevel(workbox.core.LOG_LEVELS.warn);
    }
} else {
    console.log(`Boo! Workbox didn't load 😬`);
}

// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase libraries
// are not available in the service worker.
// importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-app.js');
// importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
// firebase.initializeApp({
//     'messagingSenderId': '201027632116'
// });

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
// const messaging = firebase.messaging();

// messaging.setBackgroundMessageHandler(function(payload) {
//     console.log('Received background message ', payload);
//     // Customize notification here
// });
