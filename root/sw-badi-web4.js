console.log('loading workbox')
importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.0.0-beta.0/workbox-sw.js');

if (workbox) {
    console.log(`Yay! Workbox is loaded 🎉`);

    if (location.hostname === 'localhost') {
        console.log('Not caching on localhost')
    } else {

        workbox.routing.registerRoute(
            new RegExp('.*'),
            workbox.strategies.staleWhileRevalidate()
        );

        workbox.skipWaiting();

        workbox.googleAnalytics.initialize();
    }

} else {
    console.log(`Boo! Workbox didn't load 😬`);
}
