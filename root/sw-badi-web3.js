// with this empty file in place, we can do notifications

self.addEventListener('push', event => {
  console.log('pushed', event.notification)
    //   event.waitUntil(
    //     // Process the event and display a notification.

  //   );
});

self.addEventListener('install', function (event) {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('notificationclick', function (event) {
  // Close notification.
  // event.notification.close();
  var url = event.notification.data.url;

  // Example: Open window after 3 seconds.
  // (doing so is a terrible user experience by the way, because
  //  the user is left wondering what happens for 3 seconds.)
  var promise = new Promise(function () {
    // return the promise returned by openWindow, just in case.
    // Opening any origin only works in Chrome 43+.
    var found = false;

    clients.matchAll().then(function (cList) {
      for (i = 0; i < cList.length; i++) {
        if (cList[i].url.startsWith(url)) {
          found = true;
          cList[i].focus();
          break;
        }
      }
      if (!found) {
        clients.openWindow(url).then(function (windowClient) {
          //   do something with the windowClient.
        });
      }
    });
  });

  // Now wait for the promise to keep the permission alive.
  event.waitUntil(promise);
});

self.addEventListener('notificationclose', event => {
  // Do something with the event  
  console.log('closed', event.notification)
});
