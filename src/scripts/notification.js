import dateInfo from './dateInfo'
import storage from './storage'
require('../scripts/stringExt')
const moment = require('moment-timezone');

export function showNow() {
  show('{bMonthNamePri} {bDay} ⇨ {endingSunsetDesc}'
    .filledWith(dateInfo.di),
    'It is now ' + moment().format('hh:mm:ss'),
    dateInfo.di.bMonthNamePri,
    dateInfo.di.bDay,
    false)
}

export function show(note1, note2, icon1, icon2, makeSound) {
  // Check for notification compatibility.
  if (!('Notification' in window)) {
    // If the browser version is unsupported, remain silent.
    return;
  }

  // If the user has not been asked to grant or deny notifications
  // from this domain...
  if (Notification.permission === 'default') {
    console.log('asking for permission to notify');
    Notification.requestPermission(function () {
      // ...callback this function once a permission level has been set.
      (note1, note2, icon1, icon2, makeSound);
    });
  }
  // If the user has granted permission for this domain to send notifications...
  else if (Notification.permission === 'granted') {
    console.log('showing notification', note1)
    navigator.serviceWorker.ready.then(function (registration) {
      var n = registration.showNotification(note1, {
        body: note2,
        // icon: draw('Questions', '7', 'center', 128),
        icon: '/statics/images/badiIcon192.png',
        //image: '/images/badiIcon32.png',
        //badge: '/images/19.png',
        badge: draw(icon1, icon2, 'center', 128),
        tag: 'badi',
        silent: !makeSound,
        renotify: true,
        requireInteraction: true
      });
      // Remove the notification from Notification Center when clicked.
      n.onclick = function () {
        console.log('Notification clicked');
        // registration.cl
        this.close();
      };
      // Callback function when the notification is closed.
      n.onclose = function () {
        console.log('Notification closed');
      };
    });
  }
  // If the user does not want notifications to come from this domain...
  else if (Notification.permission === 'denied') {
    // ...remain silent.
    console.log('permission to notify - denied')
    return;
  }
};


function draw(line1, line2, line2Alignment, size) {
  var canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  console.log('drawing new image')
  var context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);

  var fontName = 'Roboto, sans-serif';

  context.fillStyle = storage.get('iconTextColor', 'black');

  //http://tutorials.jenkov.com/html5-canvas/text.html

  var fontBasis = size * 0.9;

  var fontSize = fontBasis / 1.9;
  // var vOffset = fontSize * 0.3;
  context.font = `${fontSize}px ${fontName}`;
  context.textBaseline = 'hanging';
  context.fillText(line1, -2, 0);

  fontSize = fontBasis / 1.2;
  //vOffset = fontSize * .05;
  context.font = `bold ${fontSize}px ${fontName}`;
  context.textAlign = line2Alignment;
  context.textBaseline = 'alphabetic';
  var x = 0;
  switch (line2Alignment) {
    case 'center':
      x = size / 2;
      break;
  }
  context.fillText(line2, x, size);

  // return context.getImageData(0, 0, size, size);
  return canvas.toDataURL();
}

// function drawLargeIcon(number) {

// }
