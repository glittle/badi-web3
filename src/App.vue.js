// --> Toast failing in quasar 0.12
// import {
//   Toast
// } from 'quasar'

import routeList from './pages/routes'
import badiCalc from './scripts/badiCalc'
import * as notify from './scripts/notification'
import * as shared from './scripts/shared'
import * as store from './scripts/store'
import storage from './scripts/storage'
const moment = require('moment-timezone');
var versionInfo = require('../root/version.json')

require('./scripts/stringExt')

export default {
  data() {
    return {
      pages: routeList.menuPages,
      di: badiCalc.di,
      setupDone: false,
      oldRedirectCountdown: 20
    }
  },
  computed: {
    oldHost: function () {
      var host = window.location.hostname;
      return host.endsWith('.ga');//  || host === 'localhost';
    },
    topDate: function () {
      var template = this.di.bNow.eve ? shared.formats.topTitleEve : shared.formats.topTitleDay;
      return template.filledWith(this.di)
    },
    version() {
      var age = moment(versionInfo.buildDate, "_ MMM D YYYY HH:mm:ss _Z").fromNow();
      return '{0} ({1})'.filledWith(versionInfo.version, age)
    }

  },
  created() {
    document.addEventListener('pulsed', this.doWorkOnPulse, false);
    store.doPulse();
  },
  methods: {
    goToNewSite() {
      var vue = this;
      if (this.oldHost) {
        var i = setInterval(function () {
          vue.oldRedirectCountdown--;
          if (vue.oldRedirectCountdown <= 0) {
            clearInterval(i);
            window.location.href = 'https://wondrous-badi.today/';
          }
        }, 1000);
      }
    },
    doWorkOnPulse() {
      // console.log('app pulse')
      // notification icon
      if (!this.setupDone) {
        if (shared.coords.source !== 'not set') {
          this.setupDone = true;
        }
      }
      var di = badiCalc.di;
      var key = di.stamp;
      // console.log(key, lastNotificationKey);
      if (key !== lastNotificationKey) {
        // console.log('do notify')
        this.di = di;
        notify.showNow(di);
        lastNotificationKey = key;
      }
    },
    swipePage(obj) {
      // console.log(obj)
      var delta;
      var doNormalAction = false;
      switch (obj.direction) {
        case 'right':
          delta = -1;
          break;
        case 'left':
          delta = 1;
          break;
        default:
          return doNormalAction;
      }

      if (Math.abs(obj.distance.x) < 0.5 * screen.width) {
        // ignore if not a wide swipe!
        return doNormalAction;
      }

      var goto = routeList.getNext(delta, this.$router.currentRoute);
      if (goto) {
        this.$router.push(goto);
        return;
      }
      return doNormalAction;
    }
  },
  mounted() {
    checkLocation(this);
    this.goToNewSite();
  },
  head: {
    title: function () {
      return {
        inner: 'Home',
        separator: '-'
      }
    },
    meta: [{
      name: 'description2',
      content: 'My description',
    }, {
      itemprop: 'name',
      content: 'Content Title'
    }]
  }
}

var lastNotificationKey = null;

function checkLocation(vue) {
  //TODO: don't robots to the setup pages

  if (!vue.setupDone) {
    if (vue.$router.currentRoute.path !== '/locationsetup' &&
      vue.$router.currentRoute.path !== '/initialsetup') {

      storage.set('initialSetup', true);

      vue.$router.push('/initialsetup');
    }

    // Toast.create.negative({
    //   html: 'Location must be set for dates and times to be correct!',
    //   timeout: 1e11, // very long
    //   button: {
    //     label: 'Fix Now',
    //     handler() {
    //       vue.$router.push('locationsetup')
    //     },
    //     onDismiss() {
    //       vue.$router.push('locationsetup')
    //     }
    //   }
    // })
  }
}
