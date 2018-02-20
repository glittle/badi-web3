import messages from '../scripts/messages'
import badiCalc from '../scripts/badiCalc'
import sunCalc from '../scripts/sunCalc'
import storage from '../scripts/storage'
import Grid19 from '../components/Grid19';
import Verse from './Verse';
import prayerHelper from '../scripts/prayerLinkHelper'
import dateLinksInfo from '../assets/datelinks.json'
import * as notificationHelper from '../scripts/notificationHelper'


import * as shared from '../scripts/shared'
require('../scripts/stringExt')
const moment = require('moment-timezone');
const Highcharts = require('highcharts');

var routeList = require('./routes');

export default {
    data() {
        return {
            title: messages.get('HomePage', null, 'Today'),
            icon: '../statics/sunWhite.png',
            location: shared.coords.name,
            setupDone: false,
            notificationStatus: shared.notifications.wanted,
            toggleVerseSpeech: false,
            tapNum: 0,
            tapBtnText: '',
            tapLastTime: 0,
            tapAutoRunning: false,
            tapAutoTimer: null,
            tapChimeAfter: true, // dev only - after or instead of regular sound?
            tapAutoDelay: storage.get('tapAutoDelay', 2000),
            tapAuto: storage.get('tapAuto', true),
            tapSounds: storage.get('tapSounds', true),
            prayer: prayerHelper.getRandom()
        }
    },
    components: {
        Grid19,
        Verse
    },
    computed: {
        verseTime() {
            return (this.di.bNow ? (this.di.bNow.eve ? 'Evening' : 'Daytime') : 'A') + " <u>V</u>erse from Bahá'u'lláh";
        },
        position() {
            return null;
        },
        tapSoundForSteps() {
            return document.getElementById('tapSoundForSteps');
        },
        tapSoundForSteps19() {
            return document.getElementById('tapSoundForSteps19');
        },
        tapSoundForEnd() {
            return document.getElementById('tapSoundForEnd');
        },
        di() {
            var dummy = this.$store.state.pulseNum;
            // this.$store.commit('newDate', badiCalc.di);
            return badiCalc.di;
        },
        timeFormat() {
            return storage.get('use24hour', false) ? 'HH:mm' : 'h:mm a';
        },
        // dayDisplay() {
        //   /*
        //   <div class="card">
        //         <div class="card-content" v-html="dayDisplay"></div>
        //       </div>
        //   */

        //   var html = this.fillDayDisplay(this.di);
        //   return html;
        // },
        sunDisplay() {
            //var now = moment(di.currentTime);
            // var info = [
            //   di.bNow.eve ? 'Eve' : 'Day',
            //   now.format('H:mm')
            // ];
            // if (now.hour() > 11) {
            //   info.push(now.format('h:mma'))
            // }
            // return info.join(' – ');

            // return 'Today in '
            //   + this.location
            //   + '<span> – ' + now.format(this.timeFormat)

            // + ' – {bWeekdayNamePri} ({bWeekdayNameSec})'.filledWith(di)
            // + '</span>';
            return 'Time in'; // in <strong>' + this.location + '</strong>';
        },
        pageList() {
            return routeList.default.menuPages.filter(function(p) {
                return p.to !== '/'
            });
        },
        shortDay() {
            return shared.formats.shortDay.filledWith(this.di)
        },
        thisMonthImage() {
            //sample: M-174-09
            var id = 'M-{bYear}-{bMonth00}'.filledWith(this.di);
            var info = dateLinksInfo[id];
            if (!info) {
                return '';
            }
            var link = info[0].url;
            var url = link[0] === '/' ? link : '/images/' + link;
            return url;
        }
    },
    watch: {
        tapSounds: function(a) {
            storage.set('tapSounds', a);
        },
        tapAutoRunning: function(a) {
            this.updateTapDisplay();
            if (!a) {
                clearTimeout(this.tapAutoTimer);
            }
        },
        tapAuto: function(a) {
            storage.set('tapAuto', a);
            this.tapAuto = a;
            if (!a) {
                clearTimeout(this.tapAutoTimer);
                this.tapAutoRunning = false;
            }
            this.updateTapDisplay();
        },
        tapAutoDelay: function(a, b) {
                if (isNaN(a)) {
                    // not sure why, but sometimes get isNaN
                    // reset it from last known good value
                    console.log('bad delay', a, b)
                    this.tapAutoDelay = storage.get('tapAutoDelay', 2000);
                    return;
                }
                storage.set('tapAutoDelay', a);
                clearTimeout(this.tapAutoTimer);
                if (this.tapAutoRunning) {
                    // determine time since last tap
                    var elapsed = new Date().getTime() - this.tapLastTime;
                    var timeTillNext = Math.max(0, this.tapAutoDelay - elapsed);
                    // console.log('new delay', elapsed, timeTillNext, this.tapAutoDelay);

                    this.tapAutoTimer = setTimeout(this.doTap, timeTillNext);
                }
            }
            //   di: function () {
            //     console.log('di changed')
            //     // fillDayDisplay(this)
            //     // prepareSunDisplay(this)
            //   }
    },
    methods: {
        info: function(mode) {
            var di = this.di;
            var type, type2, desc, num;
            var mid = '';
            var ayyamiha = false;
            switch (mode) {
                // case 'week':
                //   type = '…in this Week';
                //   desc = 'Day – <b>{bWeekday}</b> – {bWeekdayNamePri} ({bWeekdayNameSec})'.filledWith(di);
                //   num = di.bWeekday;
                //   break;
                case 'month':
                    if (di.bMonth) {
                        desc = 'Day {bDay}'.filledWith(di);
                        mid = '<b>{bDayNamePri}</b> ({bDayNameSec})'.filledWith(di);
                        type = '…in this Month';
                    } else {
                        // ayyam-i-ha
                        type = '…in the <b>{bMonthNamePri}</b> ({bMonthNameSec})'.filledWith(di);
                        ayyamiha = di.numDaysInAyyamiHa;
                        desc = 'Day <b>{bDay}</b>'.filledWith(di);
                    }
                    num = di.bDay;
                    break;
                case 'year':
                    type = '…in this Year';
                    num = di.bMonth;
                    if (num) {
                        desc = 'Month {bMonth}'.filledWith(di);
                        mid = '<b>{bMonthNamePri}</b> ({bMonthNameSec})'.filledWith(di);
                    } else {
                        desc = '<b>{bMonthNamePri}</b> ({bMonthNameSec})'.filledWith(di);
                        num = 18.5;
                    }
                    break;
                case 'vahid':
                    type = '…in this ' + di.VahidLabelPri;
                    type2 = di.VahidLabelSec;
                    desc = 'Year {bYearInVahid} ({bYear} BE)'.filledWith(di)
                    mid = '{bYearInVahidNamePri} ({bYearInVahidNameSec})'.filledWith(di)
                    num = di.bYearInVahid;
                    break;
                case 'kull':
                    type = '…in this ' + di.KullishayLabelPri;
                    type2 = di.KullishayLabelSec;
                    num = di.bVahid;
                    // desc = '{VahidLabelPri} ({VahidLabelSec}) – {bVahid}'.filledWith(di)
                    desc = '{VahidLabelPri} {bVahid}'.filledWith(di)
                    break;
                    // case 'kull2':
                    //   type = '??';
                    //   desc = '{bKullishay} ({KullishayLabelSec})'.filledWith(di);
                    //   num = 1;
                    //   break;
            }
            return {
                num: num,
                mode: mode,
                desc: desc,
                mid: mid,
                elementNum: di.elementNum,
                type: type,
                type2: type2,
                ayyamiha: ayyamiha
            };
        },
        handleResize: function(event) {
            var vue = this;
            setTimeout(function() {
                drawChart(local.sun, vue.timeFormat, true)
            }, 0);
        },
        refresh: function() {
            window.doPulse();
            notificationHelper.showNow();
        },
        showPrayerOnline: function(link) {
            // read 'prayers.json'; json created with:
            // JSON.stringify($('.prayerlinks tr:not(.headingrow)').map(function(i,el){ var tr=$(el); var a = tr.find('a'); return { link: 'http://www.bahaiprayers.org/' + a.attr('href'), text: a.text(), by: tr.find('.cauthor').text() }}).get())
            window.open(link, '_blank');
            this.$ga.event('prayer', 'viewed');
        },
        getNewPrayer: function() {
            this.prayer = prayerHelper.getRandom()
        },
        // fillDayDisplay: function (di) {
        //   var answers = [];
        //   // var di = badiCalc.di;

        //   answers.push({
        //     t: 'Day of Month',
        //     v: '{bDayNamePri} – {bDayNameSec} – <b>{bDay}</b>'.filledWith(di)
        //   });
        //   answers.push({
        //     t: 'Day of Week',
        //     v: '{bWeekdayNamePri} – {bWeekdayNameSec} – {bWeekday}'.filledWith(di)
        //   });
        //   answers.push({
        //     t: 'Month',
        //     v: '<b>{bMonthNamePri}</b> – {bMonthNameSec} – {bMonth}'.filledWith(di)
        //   });
        //   answers.push({
        //     t: 'Section of Year',
        //     v: '{element}'.filledWith(di)
        //   });
        //   answers.push({
        //     t: 'Year',
        //     v: 'Year {bYearInVahid} of Vahid {bVahid} – <b>{bYear}</b>'.filledWith(di)
        //   });

        //   return answers.map(function (ans) {
        //     return `<div class="line ${ans.c || ''}"><label>${ans.t}</label> <span>${ans.v}</span></div>`;
        //   }).join('');

        // },
        updateTapDisplay: function() {
            if (this.tapAuto) {
                this.tapBtnText = this.tapAutoRunning ? 'Pau<u>s</u>e' : this.tapNum === 0 ? '<u>S</u>tart' : 'Re<u>s</u>ume';
            } else {
                this.tapBtnText = '<u>T</u>ap';
            }
        },
        tap95: function() {
            this.initializeSounds();
            if (this.tapAuto) {
                clearTimeout(this.tapAutoTimer);
                if (this.tapAutoRunning) {
                    this.tapAutoRunning = false;
                } else {
                    this.tapAutoTimer = setTimeout(this.doTap, 200);
                    this.tapAutoRunning = true;
                }
                this.updateTapDisplay();
            } else {
                this.doTap();
            }
        },
        initializeSounds: function() {
            // only do once
            // if (!this.tapNum && this.tapSounds) {
            // this.playSound(this.tapSoundForSteps19, .1);
            // this.playSound(this.tapSoundForEnd, .1);
            // this.playSound(this.tapSoundForSteps, .1);
            // }
            if (!this.tapNum) {
                console.log('tap ga')
                this.$ga.event('tap95', 'started', this.tapAuto ? 'auto' : 'manual');
            }
        },
        doTap: function() {
            clearTimeout(this.tapAutoTimer);
            if (this.tapNum >= 95) {
                this.tapAutoRunning = false;
                this.updateTapDisplay();
                return;
            }
            this.tapNum++;
            document.getElementById('tap_' + this.tapNum).classList.add('tapped');
            if (this.tapSounds) {
                // if (this.tapNum === 95) {
                //   this.playSound(this.tapSoundForEnd);
                // } else if (this.tapNum % 19 === 0) {
                //   this.playSound(this.tapSoundForSteps19);
                // } else {
                // }
                if (this.tapChimeAfter) {
                    this.playSound(this.tapSoundForSteps);
                } else {
                    if (this.tapNum === 95) {
                        this.playSound(this.tapSoundForEnd);
                    } else if (this.tapNum % 19 === 0) {
                        this.playSound(this.tapSoundForSteps19);
                    } else {
                        this.playSound(this.tapSoundForSteps);
                    }
                }
            }
            if (this.tapNum >= 95) {
                this.tapAutoRunning = false;
            }
            if (this.tapAutoRunning) {
                this.tapAutoTimer = setTimeout(this.doTap, this.tapAutoDelay);
            }
            this.tapLastTime = new Date().getTime();
        },
        playSound: function(s, volume) {
            // console.log('play sound', s)
            try {
                s.currentTime = 0;
                s.pause();
                s.currentTime = 0;
            } catch (e) {
                console.log('catch 1', e)
            }
            try {
                s.volume = volume || 1;
                s.play().catch(function(e) {
                    console.log('catch 2', e)
                });
            } catch (e) {
                console.log('catch 3', e)
            }
        },
        reset95: function() {
            this.tapNum = 0;
            clearTimeout(this.tapAutoTimer);
            this.tapAutoRunning = false;
            var blocks = document.getElementsByClassName('tapped');
            for (var b = blocks.length; b--; b > 0) {
                blocks[b].classList.remove('tapped');
            }
            this.updateTapDisplay();
        },
        makeTapBlocks: function() {
            var html = [];
            var perRow = 19;
            for (var r = 0; r < 5; r++) {
                html.push('<div>');
                for (var c = 0; c < perRow; c++) {
                    var num = (1 + r * perRow + c);
                    if (num > 95) {
                        // if not 19 per row
                        break;
                    }
                    var classes = num % 5 === 0 ? ' class=five' : '';
                    html.push('<span id=tap_' + num + classes + '></span>')
                }
                html.push('</div>');
            }
            var host = document.getElementById('tapBlocks');
            host.innerHTML = html.join('');
        },
        drawChart: function() {
            drawChart(local.sun, this.timeFormat, true);
        },
        keyup: function(ev) {
            switch (ev.code) {
                case 'KeyV':
                    this.toggleVerseSpeech = !this.toggleVerseSpeech;
                    break;

                case 'KeyT':
                    if (!this.tapAuto) {
                        this.tap95(); // do the tap
                    }
                    break;

                case 'KeyS':
                    if (this.tapAuto) {
                        this.tap95(); // start/stop
                    }
                    break;
            }
        },
        changeLocation() {
            shared.coords.source = '?';
            this.setupDone = false;
        },
        afterSetupDone() {
            var vue = this;

            vue.setupDone = true;

            vue.$store.state.pulseNum++;

            prepareSunDisplay(vue.di, vue.timeFormat);
            setTimeout(function() {
                drawChart(local.sun, vue.timeFormat, true);
            }, 10);
        }
    },
    beforeMount() {
        // console.log('before mount', routeList)
        // this.pages = routeList.default.named;
        // this.pageList = routeList.default.menuPages;
    },
    mounted() {
        var vue = this;

        _messageBus.$on('setupDone', function() {
            vue.afterSetupDone();
        });

        if (shared.coords.sourceIsSet) {
            console.log('emit setupDone 2')
            _messageBus.$emit('setupDone');
        }

        if (!shared.coords.tz) {
            shared.coords.tz = new Date().getTimezoneOffset();
        }

        // (adsbygoogle = window.adsbygoogle || []).push({});

        window.addEventListener('resize', this.handleResize)
        window.addEventListener('keyup', this.keyup)

        this.makeTapBlocks();
        this.updateTapDisplay();
        this.tapSoundForSteps.addEventListener("ended", function() {
            // console.log('sounded', vue.tapNum, vue.tapSounds)
            if (vue.tapChimeAfter) {
                if (vue.tapNum === 95) {
                    // console.log('play 95');
                    vue.playSound(vue.tapSoundForEnd);
                } else if (vue.tapNum % 19 === 0) {
                    // console.log('play', 19, vue.tapNum);
                    vue.playSound(vue.tapSoundForSteps19);
                }
            }
        });

        _messageBus.$on('notificationPermissionChanged', function() {
            vue.notificationStatus = shared.notifications.wanted;
        });

        _messageBus.$on('locationChanged', function() {
            vue.$store.state.pulseNum++;

            prepareSunDisplay(vue.di, vue.timeFormat);

            vue.location = shared.coords.name
                // console.log(shared.coords.source)
                // if (!vue.setupDone) {
                //     if (shared.coords.sourceIsSet) {
                //         console.log('emit setupDone 1')
                //         _messageBus.$emit('setupDone');
                //     }
                // }
        });


    },
    activated() {
        var vue = this;
        if (shared.coords.tz && shared.coords.tz !== new Date().getTimezoneOffset()) {
            shared.coords.source = 'tz?';
            vue.setupDone = false;
        }
        drawChart(local.sun, this.timeFormat, true)
        setTimeout(function() {
            vue.$ga.event('stillOn', 'home');
        }, 30000)
    },
    // doWorkOnPulse() {
    //   console.log('pulse in home');
    //   drawChart(local.sun)
    // },
    // updated() {
    // console.log('mounted', routeList)
    // this.$nextTick(() => {
    // })
    // this.pulseNumber = pulse.pulseNumber
    // fillDayDisplay(this)
    // prepareSunDisplay(this)
    //   drawChart(local.sun)
    // },
    beforeUpdate() {
        // console.log('update', routeList)
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.handleResize)
    },
}

var local = {
    sun: null,
    chart: null
};

function prepareSunDisplay(di, timeFormat) {
    var answers = [];

    const readableFormat = 'ddd, MMM D [at] ' + timeFormat;
    const nowFormat = readableFormat; // 'ddd, MMM D [at] HH:mm:ss';

    const now = moment(di.currentTime);
    const noon = moment(now).hour(12).minute(0).second(0);
    const tomorrowNoon = moment(noon).add(24, 'hours');

    const sun1 = sunCalc.getTimes(noon);
    const sunrise1 = moment(sun1.sunrise);
    const sunset1 = moment(sun1.sunset);

    var sun = {
        setStart: null,
        nadir: null,
        rise: null,
        noon: null,
        setEnd: null,
        now: now,
        diStamp: di.stamp
    };

    if (now.isAfter(sunset1)) {
        // eve of day1 into day2
        // answers.push({
        //   t: `Starting Sunset:`,
        //   v: sunset1.format(readableFormat)
        // });

        var sun2 = sunCalc.getTimes(tomorrowNoon);
        var sunrise2 = moment(sun2.sunrise);
        var sunset2 = moment(sun2.sunset);

        sun.setStart = sunset1;
        sun.rise = sunrise2;
        sun.noon = moment(sun2.solarNoon);
        sun.nadir = moment(sun2.nadir);
        sun.setEnd = sunset2;

        // if (now.isBefore(sunrise2)) {
        //   answers.push({
        //     t: `Now:`,
        //     v: now.format(nowFormat),
        //     c: 'now'
        //   });
        //   answers.push({
        //     t: `Sunrise:`,
        //     v: sunrise2.format(readableFormat)
        //   });
        // } else {
        //   answers.push({
        //     t: `Sunrise:`,
        //     v: sunrise2.format(readableFormat)
        //   });
        //   answers.push({
        //     t: `Now:`,
        //     v: now.format(nowFormat),
        //     c: 'now'
        //   });
        // }
        // answers.push({
        //   t: `Ending Sunset:`,
        //   v: sunset2.format(readableFormat)
        // });

        setNextRefreshAt(sunset2);
    } else {
        // get prior sunset
        var sun0 = sunCalc.getTimes(moment(noon).subtract(24, 'hours'));
        var sunset0 = moment(sun0.sunset);

        sun.setStart = sunset0;
        sun.rise = sunrise1;
        sun.noon = moment(sun1.solarNoon)
        sun.nadir = moment(sun1.nadir)
        sun.setEnd = sunset1;

        // answers.push({
        //   t: `Starting Sunset:`,
        //   v: sunset0.format(readableFormat)
        // });
        // if (now.isBefore(sunrise1)) {
        //   answers.push({
        //     t: `Now:`,
        //     v: now.format(nowFormat),
        //     c: 'now'
        //   });
        //   answers.push({
        //     t: `Sunrise:`,
        //     v: sunrise1.format(readableFormat)
        //   });
        // } else {
        //   answers.push({
        //     t: `Sunrise:`,
        //     v: sunrise1.format(readableFormat)
        //   });
        //   answers.push({
        //     t: `Now:`,
        //     v: now.format(nowFormat),
        //     c: 'now'
        //   });
        // }
        // answers.push({
        //   t: `Ending Sunset:`,
        //   v: sunset1.format(readableFormat)
        // });

        setNextRefreshAt(sunset1);
    }

    local.sun = sun;

    return '';
    //   return answers.map(function (ans) {
    //     return `<div class="line ${ans.c || ''}"><label>${ans.t}</label> <span>${ans.v}</span></div>`;
    //   }).join('');
}

function setNextRefreshAt(refreshTime, midnightUpdate) {
    // if (!midnightUpdate && moment().date() !== refreshTime.date()) {
    //   // update at midnight before the next sunset
    //   var midnight = moment(refreshTime).set('hour', 0);
    //   midnight.set('minute', 0);
    //   midnight.set('second', 1);

    //   setNextRefreshAt(midnight, true);
    //   setNextRefreshAt(refreshTime, true);
    //   return;
    // }

    // console.log('setting refresh for ' + refreshTime.toString());

    // setFocusTime(refreshTime.toDate());
    // refreshDateInfo();

    // var options = {
    //   id: 0,
    //   title: '{bDay} {bMonthNamePri} {bYear}'.filledWith(_di),
    //   text: '{nearestSunset}'.filledWith(_di),
    //   at: refreshTime.toDate(),
    //   icon: 'res://ic_stat_18.png', //?? not working
    //   ongoing: true
    // };

    // if (midnightUpdate) {
    //   options.sound = null;
    // }

    // cordova.plugins.notification.local.schedule(options);

    //  chrome.alarms.create('refresh', { when: m.valueOf() });
    //    var ms = m.diff(moment());
    //    log('timeout in ' + ms);
    //    clearTimeout(settings.refreshTimeout);
    //    settings.refreshTimeout = setTimeout(function () {
    //      refreshDateInfo();
    //      doNotification();
    //      show(); // will set next timeout
    //    }, ms);
}


var _chart = null;
var _lastChartDay = null;
var _fontSize = '11px';
var _fontColor = '#666';

function drawChart(sun, timeFormat, redraw) {
    //   setStart: null,
    //   rise: null,
    //   setEnd: null,
    //   now: now
    if (!document.getElementById('sunChart')) {
        console.log('sunChart does not exist')
        return;
    }

    var key = sun.diStamp;
    if (_lastChartDay === key && !redraw) {
        showNowLine(_chart, sun, timeFormat);
        return;
    } else {
        _lastChartDay = key;
    }
    // console.log('drawing chart')


    // var weekDayInfo = '<span class="wk1">Weekday – <b>{bWeekday}</b> – {bWeekdayNamePri} ({bWeekdayNameSec})</span> &nbsp; <span class="wk2">…in this Week</span>'.filledWith(_nowDi);
    var weekDayInfo = 'Weekday {bWeekday}<br>{bWeekdayNamePri} ({bWeekdayNameSec})'.filledWith(_nowDi);

    var yFactor = 5;
    var twilight = yFactor * 2; // adjusted after
    var colorFullSun = '#ffff00';
    var colorFullDark = '#444';
    var points = [];
    var chartMin = sun.setStart.valueOf();
    var chartMax = sun.setEnd.valueOf();
    var chartRange = chartMax - chartMin;
    var maxY = 0;
    var minY = 0;

    function addPoint(m, name, color, underAxis) {
        var t = m.toDate();
        var o = {
            x: t,
            y: sunCalc.getPosition(t).altitude * yFactor,
            name: name,
            time: m.format(timeFormat),
            color: color,
            pct: (t.getTime() - chartMin) / chartRange
        };

        if (o.y > twilight) {
            o.color = colorFullSun;
        }
        if (o.y < -1 * twilight) {
            o.color = colorFullDark;
        }
        if (underAxis) {
            o.name = '<br>' + o.name;
            o.dataLabels = { verticalAlign: 'bottom' };
            o.color = colorFullSun; // hack for solar noon
        }
        if (o.y > maxY) maxY = o.y;
        if (o.y < minY) minY = o.y;
        points.push(o);
    }

    addPoint(sun.setStart, 'Sunset', 'lightgrey');
    addPoint(sun.setEnd, 'Sunset', 'lightgrey');
    addPoint(sun.rise, 'Sunrise', 'lightgrey');
    addPoint(sun.noon, 'Solar Noon', 'lightgrey', true);
    addPoint(sun.nadir, null);

    // console.log('min', minY, 'max', maxY, 'twi', twilight)
    twilight = 0.3 * maxY;
    // console.log(JSON.stringify(points));

    // fill in the rest
    var minutesBetweenPoints = 60;
    var firstPlot = moment(sun.setStart).add(minutesBetweenPoints, 'm'); // don't go past the end!
    var lastPlot = moment(sun.setEnd).subtract(minutesBetweenPoints, 'm'); // don't go past the end!
    /* eslint-disable no-unmodified-loop-condition */
    // eslint doesn't know that `time.add` mutates `time`
    for (var time = firstPlot; time <= lastPlot;) {
        addPoint(time, null) // nameless points
        time.add(minutesBetweenPoints, 'm')
    }
    // console.log('min', minY, 'max', maxY, 'twi', twilight)

    var minSun = 99;
    var maxSun = -99;
    for (var i = 0; i < points.length; i++) {
        var y = points[i].y;
        if (y < minSun) {
            minSun = y;
        }
        if (y > maxSun) {
            maxSun = y;
        }
    }

    points.sort(function(a, b) {
        return a.x < b.x ? -1 : 1
    })

    // console.table(v);

    Highcharts.setOptions({
        global: {
            useUTC: false
        }
    });

    var midnight = moment(sun.rise).set({
        hour: 0,
        minute: 0,
        second: 0
    });

    var midnightMs = midnight.toDate().getTime();

    var options = {
        chart: {
            type: 'areaspline',
            //spacingBottom: 50
            style: {
                fontFamily: 'Roboto, "Helvetica Neue", "Calibri Light", sans-serif'
            }
        },
        title: {
            align: 'right',
            floating: true,
            style: {
                fontWeight: 'normal',
                color: _fontColor,
                fontSize: _fontSize,
                textAlign: 'right'
            },
            text: weekDayInfo,
            useHTML: true,
            verticalAlign: 'bottom',
            x: 0,
            y: -21
        },
        credits: {
            enabled: false
        },
        legend: {
            enabled: false
        },
        tooltip: {
            enabled: false
        },
        enableMouseTracking: false,
        xAxis: {
            type: 'datetime',
            tickLength: 35,
            tickPositions: [
                midnightMs - 60000,
                midnightMs + 60000
            ],
            labels: {
                useHTML: true,
                y: 14,
                x: 0,
                style: {
                    fontSize: _fontSize
                },
                formatter: function() {
                    var tickMs = this.value;
                    var before = tickMs < midnight;
                    var tickTime = moment(tickMs);
                    var html = '{0}<br>{1}'.filledWith(tickTime.format('MMM D'), tickTime.format('ddd'));
                    // return '<span class="XLabel {0}" data-text="{^1}" data-before={0}>{^1}</span>'.filledWith(before ? "before" : "after", html);
                    return '<span class="XLabel {0}" data-before={0}>{^1}</span>'.filledWith(before ? "before" : "after", html);
                }
            },
        },
        yAxis: {
            visible: false,
            max: maxSun + 5, // leave room for 'now'
            min: minSun - 0.5, // small gap under plot
            startOnTick: false,
            endOnTick: false
        },
        plotOptions: {
            areaspline: {
                enableMouseTracking: false,
                marker: {
                    enabled: false
                }
            }
        },
        series: [{
            data: points,
            tooltip: {
                enabled: false
            },
            dataLabels: {
                enabled: true,
                useHTML: true,
                allowOverlap: true,
                verticalAlign: 'bottom',
                formatter: function() {
                    var point = this.point;
                    var label = point.name ? (point.name + '<br>' + point.time) : null;
                    // (point.color ? point.color : '') +
                    // ' x ' +
                    // (point.name ? (point.name + '<br>' + point.time) : '');
                    // console.log('point', point, 'label', label, 'color', point.color)
                    return label;
                },
                align: 'center',
                zIndex: 4,
                style: {
                    color: _fontColor,
                    fontSize: _fontSize,
                    fontWeight: "normal",
                    textOutline: "1px 1px contrast",
                    backgroundColor: '#ffffff'
                }
            },
            fillColor: {
                linearGradient: {
                    x1: 0,
                    y1: 0,
                    x2: 1,
                    y2: 0
                },
                stops: points
                    .filter(function(p) {
                        return p.color
                    }).map(function(p) {
                        return [
                            p.pct,
                            p.color,
                        ]
                    }),
            },
            lineWidth: 0
        }]
    };

    try {
        _chart = Highcharts.chart('sunChart', options, function(chart) {
            showNowLine(chart, sun, timeFormat);
            alignLabels();
        });
    } catch (error) {
        // catch highcharts error to ensure it doesn't kill javascript
        console.log(error);
        console.log(sun);
    }
}

function alignLabels() {
    var labels = document.getElementsByClassName('XLabel');
    for (var i = 0; i < labels.length; i++) {
        var label = labels[i];
        // label.innerHTML = label.dataset.text;
        var before = label.dataset.before;
        if (before === 'before') {
            label.style.right = '5px';
        } else {
            label.style.left = '6px';
        }
    }
}

function showNowLine(chart, sun, timeFormat) {
    // console.log('updating now line');
    if (!chart.xAxis) {
        return;
    }

    var now = sun.now;
    chart.xAxis[0].removePlotLine('now');

    var timeFromSunset = sun.now.diff(sun.setStart, 'h', true);
    var timeToSunset = sun.setEnd.diff(sun.now, 'h', true);
    var align = 'center';
    if (timeFromSunset < 4) align = 'left';
    if (timeToSunset < 4) align = 'right';

    chart.xAxis[0].addPlotLine({
        value: now.toDate(),
        color: '#027be3',
        width: 1,
        id: 'now',
        zIndex: 5, //    zIndex: 0,
        label: {
            rotation: 0,
            text: 'Now ' + now.format(timeFormat),
            align: align,
            x: -1,
            style: {
                color: _fontColor,
                fontSize: _fontSize,
                fontWeight: "normal",
                textOutline: "2px 2px contrast",
                backgroundColor: '#ffffff'
            }
        }
    });
}
