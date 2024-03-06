import routeList from './pages/routes'
import badiCalc from './scripts/badiCalc'
import * as notificationHelper from './scripts/notificationHelper'
import * as _shared from './scripts/shared'
import * as store from './scripts/store'
// import storage from './scripts/storage'
// import axios from 'axios'

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
            // sharedWorker: null,
            lastNotificationKey: null,
            lastServerCall: moment(),
            lastTimeout: null,
            _serverCallbackLog: [],
            // oldRedirectCountdown: 20
        }
    },
    computed: {
        shared() {
            return _shared;
        },
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
            var dummy = this.$store.state.pulseNum;

            if (!di || !di.stamp) return '';

            var template = di.bNow.eve ? this.shared.formats.topTitleEve : this.shared.formats.topTitleDay;
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
        // var vue = this;

        document.addEventListener('pulsed', this.doWorkOnPulse, false);

        store.doPulse();

        // _messageBus.$on('serverPulse', function() {
        //     console.log('server pulse')
        // });

        // this.prepareWorker();
    },
    watch: {
        '$route' (to, from) {
            this.routeName = to.name;
            // console.log('route change to', to);
        }
    },
    methods: {
        // prepareWorker() {
        // var vue = this;

        // this.myWorker = new Worker('/ww.js'); // ?' + Math.random().toString().slice(2, 7));

        // prepareForMessagesFromWebWorker();
        // vue.myWorker.postMessage('start');

        // function prepareForMessagesFromWebWorker() {
        //     vue.myWorker.onmessage = function(ev) {
        //         switch (ev.data) {
        //             case 'pulse':
        //                 console.log('ww requesting pulse');
        //                 store.doPulse();
        //                 break;
        //                 // case 'checkVersion':
        //                 //     if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        //                 //         console.log('checking version');
        //                 //         navigator.serviceWorker.controller.postMessage('checkVersion');
        //                 //     } else {
        //                 //         console.log('sw not active, cannot check version');
        //                 //     }
        //                 //     break;
        //         }
        //     }
        // }

        // if ('SharedWorker' in window) {
        //     // console.log('create shared worker')
        //     vue.sharedWorker = new SharedWorker("shared-worker.js");

        //     vue.sharedWorker.port.onmessage = function(e) {
        //         switch (e.data.code) {
        //             case 'message':
        //                 console.log('Received from shared worker', e.data.code);
        //                 console.log(e.data.message);
        //                 break;
        //             case 'pulse':
        //                 console.log('*** shared worker requested pulse');
        //                 store.doPulse();
        //                 break;
        //             case 'pulseRequested':
        //                 console.log('*** shared worker set lastNotificationKey', e.data.key);
        //                 window._messageBus.serverCallbackLog.push('shared worker set lastNotificationKey');
        //                 vue.lastNotificationKey = e.data.key;
        //                 break;
        //         }
        //     }

        //     vue.sharedWorker.port.postMessage({
        //         code: 'hello'
        //     });
        // }
        // console.log('worker loaded', this.myWorker)
        // },
        scheduleNextNotification(di) {
            // at next midnight or sunset
            if (!di || !di.stamp) {
                window._messageBus.serverCallbackLog.push('No di - cannot call');
                return;
            }
            var sunset = moment(di.frag2SunTimes.sunset);
            var midnight = moment().startOf('day').add(1, 'day');
            var next = moment.min(sunset, midnight);

            var delay = next.valueOf() - moment().valueOf();

            // delay = 5000; // for testing

            var vue = this;

            // if this window is still active, this may work
            clearTimeout(vue.lastTimeout);

            vue.lastTimeout = setTimeout(function() {
                console.log('calling doPulse from local setTimeout')
                window.doPulse();
            }, delay);

            if (vue.lastServerCall.format() === next.format()) {
                //console.log('server callback already requested')
                window._messageBus.serverCallbackLog.push('Callback already requested');

                // } else {
                // var firebaseToken = storage.get('firebaseToken', '')
                // if (firebaseToken) {
                //     console.log('asking server to call back in', moment.duration(delay, 'ms').humanize(), 'at', next.format());
                //     console.log('with token', firebaseToken.substring(0, 20) + '...')
                //     var host = window.location.hostname;
                //     var url = host === 'localhost' ?
                //         'http://localhost:8003' :
                //         (window.location.origin + '/wc-notifier');
                //     axios.post(url, {
                //             token: firebaseToken,
                //             delay: delay,
                //             where: shared.coords.name,
                //             geo: '@{1},{2},10z'.filledWith(shared.coords.name, shared.coords.lat, shared.coords.lng)
                //                 //place/Castleridge/@51.1052703,-113.9671456
                //         })
                //         .then(function(response) {
                //             if (response.data.status === 'received') {
                //                 vue.lastServerCall = next;
                //                 console.log('server confirmed... will call back at', next.format());
                //                 window._messageBus.serverCallbackLog.push('At ' + new Date());
                //                 window._messageBus.serverCallbackLog.push('...requested for ' + next.toDate());
                //             }
                //         }).catch(function(error) {
                //             console.log('axios error', error.message);
                //             window._messageBus.serverCallbackLog.push(error.message);
                //         });
                // }
            }
            // if (vue.sharedWorker) {
            //     console.log('scheduling sw pulse at', next.format(), 'in', moment.duration(delay, 'ms').humanize())
            //     setTimeout(function() {
            //         vue.sharedWorker.port.postMessage({
            //             code: 'doCallback',
            //             cbCode: 'pulse',
            //             delay: delay,
            //             key: di.stamp
            //         });
            //     }, 0)
            // }
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
            var vue = this;
            // console.log('app pulse')
            // notification icon
            if (!vue.setupDone) {
                if (vue.shared.coords.sourceIsSet && vue.shared.coords.lat) {
                    vue.setupDone = true;
                }
            }
            var di = badiCalc.di;
            if (!di) {
                return;
            }
            var key = di.stamp;

            if (!key) {
                badiCalc.refreshDateInfo();
                di = badiCalc.di;
                key = di.stamp;
            }

            // console.log('keys', key, vue.lastNotificationKey);
            if (!key || key !== vue.lastNotificationKey) {
                // console.log('do notify, schedule next')
                vue.di = di;
                notificationHelper.showNow(di);

                vue.scheduleNextNotification(di);

                vue.lastNotificationKey = key;
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

//setTimeout(function() {
//(adsbygoogle = window.adsbygoogle || []).push({});
//}, 0);
