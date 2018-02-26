console.log('loading workbox')
importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.0.0-beta.0/workbox-sw.js');

if (workbox) {
    workbox.skipWaiting();

    console.log(`Yay! Workbox is loaded 🎉`);

    // if (location.hostname === 'localhost') {
    //     console.log('Not caching on localhost')
    // } else {

    workbox.routing.registerRoute(
        new RegExp('.*'),
        workbox.strategies.networkFirst()
    );


    workbox.googleAnalytics.initialize();

    // Shows logs, warnings and errors.
    // workbox.core.setLogLevel(workbox.core.LOG_LEVELS.log);

    // Show warnings and errors.
    workbox.core.setLogLevel(workbox.core.LOG_LEVELS.warn);

    // }

} else {
    console.log(`Boo! Workbox didn't load 😬`);
}
