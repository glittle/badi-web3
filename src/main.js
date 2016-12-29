// === DEFAULT / CUSTOM STYLE ===
// WARNING! always comment out ONE of the two require() calls below.
// 1. use next line to activate CUSTOM STYLE (./src/themes)
require(`./themes/app.${__THEME}.styl`)
// 2. or, use next line to activate DEFAULT QUASAR STYLE
//require(`quasar/dist/quasar.${__THEME}.css`)
  // ==============================

import Vue from 'vue'
import Quasar from 'quasar'
import router from './router'
import VueHead from 'vue-head'

import './scripts/swHandler';

Vue.use(VueHead)
Vue.use(Quasar) // Install Quasar Framework

Quasar.start(() => {
  /* eslint-disable no-new */
  new Vue({
    el: '#q-app',
    router,
    render: h => h(require('./App'))
  })
})

// custom
import * as notify from './scripts/notification'
notify.showNow();

// onesignal
var OneSignal = window.OneSignal || [];
var onesignalOptions = {
  appId: "2b535ce7-1ca1-4950-813f-2d89c9f281c2", // get an ID at OneSignal.com
  autoRegister: false,
  notifyButton: {
    enable: false
  },
  welcomeNotification: {
    message: 'You are ready for notifications!'
  },
  safari_web_id: 'web.onesignal.auto.2c31ff0c-1624-4aec-8f89-a4f0b1da0ea1'
};
if (process.env.NODE_ENV === 'development') {
  onesignalOptions.allowLocalhostAsSecureOrigin = true;
}
OneSignal.push(["init", onesignalOptions]);

// analytics
/* eslint-disable no-sequences, no-undef */
(function (i, s, o, g, r, a, m) {
  i['GoogleAnalyticsObject'] = r;
  i[r] = i[r] || function () {
    (i[r].q = i[r].q || []).push(arguments)
  }, i[r].l = 1 * new Date();
  a = s.createElement(o),
    m = s.getElementsByTagName(o)[0];
  a.async = 1;
  a.src = g;
  m.parentNode.insertBefore(a, m)
})(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');
ga('create', 'UA-1312528-11', 'auto');
ga('send', 'pageview');
