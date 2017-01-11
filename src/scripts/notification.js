import badiCalc from './badiCalc'
import storage from './storage'
import * as shared from './shared'
require('../scripts/stringExt')
  // const moment = require('moment-timezone');

// var image = null;

export function showNow() {
  show(shared.formats.noticationMain.filledWith(badiCalc.di),
    shared.formats.noticationSub.filledWith(badiCalc.di),
    shared.formats.statusIconText.filledWith(badiCalc.di),
    badiCalc.di.bDay,
    false)
}

export function show(note1, note2, iconText, iconDayNum, makeSound) {
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
      (note1, note2, iconText, iconDayNum, makeSound);
    });
  }
  // If the user has granted permission for this domain to send notifications...
  else if (Notification.permission === 'granted') {
    console.log('showing notification', note1)

    var html = document.createElement('div')
    html.innerHTML = note1;
    note1 = html.innerText;

    html.innerHTML = note2;
    note2 = html.innerText;

    html.innerHTML = iconText;
    iconText = html.innerText;

    // prepareImage(function () {
    // var icon = generateOnImage(iconDayNum);

    navigator.serviceWorker.ready.then(function (registration) {
      var options = {
        body: note2,
        // icon: icon,
        icon: '/statics/images/d{0}.png'.filledWith(iconDayNum),
        //image: '/images/badiIcon32.png',
        //badge: '/images/19.png',
        badge: generateStatusIcon(iconText, iconDayNum, 'center', 128),
        tag: 'badi',
        data: {
          url: location.origin
        },
        //vibrate: makeSound ? [200, 100, 200, 100, 200, 100, 400] : null,
        silent: !makeSound,
        renotify: !makeSound,
        requireInteraction: true
      };
      if (makeSound) {
        options.vibrate = [200, 100, 200, 100, 200, 100, 400]
      }
      var n = registration.showNotification(note1, options);
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
    // })
  }
  // If the user does not want notifications to come from this domain...
  else if (Notification.permission === 'denied') {
    // ...remain silent.
    console.log('permission to notify - denied')
    return;
  }
};

// function prepareImage(cb) {
//   image = new Image();
//   image.onload = cb;
//   image.src = '/statics/images/badiIconBlank.png'; // 192x192
// }

// function generateOnImage(num) {
//   var canvas = document.createElement('canvas');
//   var size = 192;
//   canvas.height = size;
//   canvas.width = size;
//   var context = canvas.getContext('2d');
//   context.drawImage(image, 0, 0);

//   var fontName = 'Roboto, sans-serif';

//   context.fillStyle = 'rgba(0,0,0,0.5)'

//   var fontBasis = size * 0.6;
//   var fontSize = fontBasis / 1.9;

//   fontSize = fontBasis / 1.2;
//   context.font = `${fontSize}px ${fontName}`;
//   context.textAlign = 'center';
//   context.textBaseline = 'alphabetic';
//   var x = size / 2;
//   var y = size / 2 + fontSize / 2.75; // magic numbers that work

//   context.fillText(num, x, y, size * 0.5);

//   return canvas.toDataURL();
// }

function generateStatusIcon(iconText, iconDayNum, line2Alignment, size) {
  var canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  console.log('generating new status icon')
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
  context.fillText(iconText, -2, 0);

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
  context.fillText(iconDayNum, x, size);

  // return context.getImageData(0, 0, size, size);
  return canvas.toDataURL();
}
