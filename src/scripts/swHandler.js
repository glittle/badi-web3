import storage from './storage'
import { doPulse } from './store';

if ('serviceWorker' in navigator) {
    // console.log('service workers supported')
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('sw-badi-web4.js', {
                scope: '/'
            }).then(function(registration) {
                console.log("'sw-badi-web4.js' active with scope: ", registration.scope);

                setupMessaging(registration);




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

// function sendTokenToServer(token) {
//     console.log('send token', token)
// }

// function setTokenSentToServer(wasSent) {
//     console.log('setToken', wasSent)
// }

// function showToken(msg, err) {
//     console.log('showtoken', msg, err)
// }

// function updateUIForPushEnabled(token) {
//     console.log('updateUI token', token)
// }

// function updateUIForPushPermissionRequired() {
//     console.log('updateUI req')
// }

function setupMessaging(registration) {
    const messaging = window.firebase.messaging();

    messaging.useServiceWorker(registration);

    messaging.requestPermission()
        .then(function() {
            console.log('Notification permission granted.');

            messaging.getToken()
                .then(function(currentToken) {
                    if (currentToken) {
                        console.log('my token', currentToken.substring(0, 20) + '...')
                        storage.set('firebaseToken', currentToken);

                        doPulse();
                    } else {
                        // Show permission request.
                        console.log('No Instance ID token available. Request permission to generate one.');
                        // Show permission UI.
                        //  updateUIForPushPermissionRequired();
                        // setTokenSentToServer(false);
                    }
                })
                .catch(function(err) {
                    console.log('An error occurred while retrieving token. ', err);
                    // showToken('Error retrieving Instance ID token. ', err);
                    // setTokenSentToServer(false);
                });
        })
        .catch(function(err) {
            console.log('Unable to get permission to notify. Notification is not supported in Incognito/Private tabs.');
            console.log(err);
        });

    messaging.onTokenRefresh(function() {
        messaging.getToken()
            .then(function(refreshedToken) {
                console.log('Token refreshed.');
                storage.set('firebaseToken', refreshedToken);
                // Indicate that the new Instance ID token has not yet been sent to the
                // app server.
                // setTokenSentToServer(false);
                // Send Instance ID token to app server.
                // sendTokenToServer(refreshedToken);
                // ...
            })
            .catch(function(err) {
                console.log('Unable to retrieve refreshed token ', err);
                // showToken('Unable to retrieve refreshed token ', err);
            });
    });

    messaging.onMessage(function(payload) {
        console.log("Message received! ", payload);

        if (payload.data.doPulse) {
            console.log('calling doPulse due to server message')
            doPulse();
            //window._messageBus.$emit('serverPulse');
            window._messageBus.serverCallbackLog.push('Received at ' + new Date());
        }
    })
}
