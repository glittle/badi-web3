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
      routeName: this.$route.name,
      myWorker: null
      // oldRedirectCountdown: 20
    }
  },
  computed: {
    //     oldHost: function () {
    //       var host = window.location.hostname;
    //       return host.endsWith('.ga');//  || host === 'localhost';
    // /*
    //       <h2 v-if="oldHost" class="alert">Effective immediately, this app has moved to 
    //           <br><a href="https://wondrous-badi.today">https://wondrous-badi.today</a>!
    //           <br>Please update your bookmarks!
    //           <br>Going there in <b v-html="oldRedirectCountdown"></b> seconds... 
    //         </h2>*/
    //     },
    topDate: function () {
      var template = this.di.bNow.eve ? shared.formats.topTitleEve : shared.formats.topTitleDay;
      return template.filledWith(this.di)
    },
    version() {
      var age = moment(versionInfo.buildDate, "_ MMM D YYYY HH:mm:ss _Z").fromNow();
      return '{0} ({1})'.filledWith(versionInfo.version, age)
    },
    // routeName() {
    //   console.log('getname', this.$router.currentRoute.Name)
    //   return this.$router.currentRoute.Name;
    // }
  },
  created() {
    document.addEventListener('pulsed', this.doWorkOnPulse, false);
    store.doPulse();

    this.prepareWorker();
  },
  watch: {
    '$route'(to, from) {
      this.routeName = to.name;
      // console.log('route change to', to);
    }
  },
  methods: {
    prepareWorker() {
      this.myWorker = new Worker('/ww.js'); // ?' + Math.random().toString().slice(2, 7));
      this.myWorker.onmessage = function (ev) {
        // console.log('received from ww', ev.data);

        switch (ev.data.msg) {
          case 'callingBack':
            console.log('called back at', new Date());
            store.doPulse();
            break;
        }
      }
      console.log('worker loaded', this.myWorker)
    },
    scheduleNextNotification(di) {
      // at next midnight or sunset
      var sunset = moment(di.frag2SunTimes.sunset);
      var midnight = moment().startOf('day').add(1, 'day');
      var next = moment.min(sunset, midnight);

      var delay = next.valueOf() - moment().valueOf();
      console.log('scheduled update for', next.format(), 'in', moment.duration(delay, 'ms').humanize())

      var vue = this;
      setTimeout(function () {
        vue.myWorker.postMessage({
          msg: 'doCallback',
          delay: delay
        });
      }, 0)
    },
    // goToNewSite() {
    //   var vue = this;
    //   if (this.oldHost) {
    //     var i = setInterval(function () {
    //       vue.oldRedirectCountdown--;
    //       if (vue.oldRedirectCountdown <= 0) {
    //         clearInterval(i);
    //         window.location.href = 'https://wondrous-badi.today/';
    //       }
    //     }, 1000);
    //   }
    // },
    doWorkOnPulse() {
      // console.log('app pulse')
      // notification icon
      if (!this.setupDone) {
        if (shared.coords.sourceIsSet) {
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

        this.scheduleNextNotification(di);
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
    // this.goToNewSite();
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
  //TODO: don't send robots to the setup pages

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
