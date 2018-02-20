if ('serviceWorker' in navigator) {
    // console.log('service workers supported')
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('sw-badi-web4.js', {
                scope: '/'
            }).then(function(registration) {
                console.log("'sw-badi-web4.js' active with scope: ", registration.scope);
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
