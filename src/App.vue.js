import routeList from './pages/routes'
import badiCalc from './scripts/badiCalc'
import * as notificationHelper from './scripts/notificationHelper'
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
            myWorker: null,
            sharedWorker: null,
            lastNotificationKey: null

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
        topDate: function() {
            var di = this.di;
            if (!di || !di.stamp) return '';

            var template = di.bNow.eve ? shared.formats.topTitleEve : shared.formats.topTitleDay;
            return template.filledWith(di)
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
        '$route' (to, from) {
            this.routeName = to.name;
            // console.log('route change to', to);
        }
    },
    methods: {
        prepareWorker() {
            var vue = this;

            this.myWorker = new Worker('/ww.js'); // ?' + Math.random().toString().slice(2, 7));

            prepareForMessagesFromWebWorker();
            vue.myWorker.postMessage('start');

            function prepareForMessagesFromWebWorker() {
                vue.myWorker.onmessage = function(ev) {
                    switch (ev.data) {
                        case 'pulse':
                            console.log('ww requesting pulse');
                            store.doPulse();
                            break;
                            // case 'checkVersion':
                            //     if (navigator.serviceWorker && navigator.serviceWorker.controller) {
                            //         console.log('checking version');
                            //         navigator.serviceWorker.controller.postMessage('checkVersion');
                            //     } else {
                            //         console.log('sw not active, cannot check version');
                            //     }
                            //     break;
                    }
                }

            }

            if ('SharedWorker' in window) {
                // console.log('create shared worker')
                vue.sharedWorker = new SharedWorker("shared-worker.js");

                vue.sharedWorker.port.onmessage = function(e) {
                    switch (e.data.code) {
                        case 'message':
                            console.log('Received from shared worker', e.data.code);
                            console.log(e.data.message);
                            break;
                        case 'pulse':
                            console.log('*** shared worker requested pulse');
                            store.doPulse();
                            break;
                        case 'pulseRequested':
                            console.log('*** shared worker set lastNotificationKey', e.data.key);
                            vue.lastNotificationKey = e.data.key;
                            break;
                    }
                }

                vue.sharedWorker.port.postMessage({ code: 'hello' });
            }
            // console.log('worker loaded', this.myWorker)
        },
        scheduleNextNotification(di) {
            // at next midnight or sunset
            if (!di || !di.stamp) {
                return;
            }
            var sunset = moment(di.frag2SunTimes.sunset);
            var midnight = moment().startOf('day').add(1, 'day');
            var next = moment.min(sunset, midnight);

            var delay = next.valueOf() - moment().valueOf();


            var vue = this;
            if (vue.sharedWorker) {
                console.log('scheduling sw pulse at', next.format(), 'in', moment.duration(delay, 'ms').humanize())
                setTimeout(function() {
                    vue.sharedWorker.port.postMessage({
                        code: 'doCallback',
                        cbCode: 'pulse',
                        delay: delay,
                        key: di.stamp
                    });
                }, 0)
            }
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
                if (shared.coords.sourceIsSet && shared.coords.lat) {
                    this.setupDone = true;
                }
            }
            var di = badiCalc.di;
            if (!di) {
                return;
            }
            var key = di.stamp;
            // console.log(key, lastNotificationKey);
            if (key !== this.lastNotificationKey) {
                // console.log('do notify, schedule next')
                this.di = di;
                notificationHelper.showNow(di);

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
        title: function() {
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


function checkLocation(vue) {
    //TODO: don't send robots to the setup pages

    if (!vue.setupDone) {
        // if (vue.$router.currentRoute.path !== '/locationsetup' &&
        //   vue.$router.currentRoute.path !== '/initialsetup') {

        //   storage.set('initialSetup', true);

        //   vue.$router.push('/locationsetup');
        // }

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

setTimeout(function() {
    //(adsbygoogle = window.adsbygoogle || []).push({});
}, 0);
