if ('serviceWorker' in navigator) {
    // console.log('service workers supported')
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('sw-badi-web4.js', {
                scope: '/'
            }).then(function(registration) {
                console.log("'sw-badi-web4.js' active with scope: ", registration.scope);

                // var serviceWorker;
                // if (registration.installing) {
                //     serviceWorker = registration.installing;
                // } else if (registration.waiting) {
                //     serviceWorker = registration.waiting;
                // } else if (registration.active) {
                //     serviceWorker = registration.active;
                // }

                // if (serviceWorker) {
                //     console.log(serviceWorker)
                //     serviceWorker.skipWaiting();
                // }

                // return navigator.serviceWorker.ready;
            })
            .catch(function(error) {
                // Something went wrong during registration. The service-worker.js file
                // might be unavailable or contain a syntax error.
                console.log(error);
            });
    });
} else {
    console.log('service workers NOT supported')
}
