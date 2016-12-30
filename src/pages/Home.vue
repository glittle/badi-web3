import sunCalc from './sunCalc'
<template>
  <article class="layout-padding">
    <div class="card">
      <div class="card-content" v-html="dayDisplay"></div>
    </div>
    <div class="card">
      <div id="sunChart"></div>
      <div class="card-content" v-html="sunDisplay"></div>
    </div>
    <div class="card">
      <div class="card-content">
        <p>Temporary page list...</p>
        <div class="list no-border">
          <router-link tag="button" class="item item-link" v-for="page in pages2" :to="page.to">
            {{page.text}}
          </router-link>
        </div>
      </div>
    </div>
  </article>
</template>
<style src="./Home.vue.css"></style>
<script>
  import messages from '../scripts/messages'
  import dateInfo from '../scripts/dateInfo'
  import sunCalc from '../scripts/sunCalc'
  require('../scripts/stringExt')
  const moment = require('moment-timezone');

  // import routeList from './routes'import messages from '../scripts/messages'
  var routeList = require('./routes');

  export default {
    data() {
      return {
        title: messages.get('HomePage', null, 'Home'),
        // pages: {}, // error if directly assign imported item
        pages2: [], // error if directly assign imported item
        di: dateInfo.di,
        dayDisplay: '',
        sunDisplay: ''
          // dayTitle: '{bDay} {bMonthNamePri} {bYear}'.filledWith(dateInfo.di)
      }
    },
    computed: {
      position() {
        return null;
      }
    },
    methods: {
      move(event) {}
    },
    beforeMount() {
      // console.log('before mount', routeList)
      // this.pages = routeList.default.named;
      this.pages2 = routeList.default.menuPages;
      // debugger;
    },
    mounted() {
      // console.log('mounted', routeList)
      // this.$nextTick(() => {
      // })
      fillDayDisplay(this)
      fillSunDisplay(this)
    },
    beforeUpdate() {
      // console.log('update', routeList)
    },
    beforeDestroy() {},
  }

  function fillDayDisplay(vue) {
    var answers = [];

    answers.push({
      t: 'Day of Month',
      v: '{bDayNamePri} / {bDayNameSec} / <b>{bDay}</b>'.filledWith(vue.di)
    });
    answers.push({
      t: 'Day of Week',
      v: '{bWeekdayNamePri} / {bWeekdayNameSec} / {bWeekday}'.filledWith(vue.di)
    });
    answers.push({
      t: 'Month',
      v: '<b>{bMonthNamePri}</b> / {bMonthNameSec} / {bMonth}'.filledWith(vue.di)
    });
    answers.push({
      t: 'Section of Year',
      v: '{element}'.filledWith(vue.di)
    });
    answers.push({
      t: 'Year',
      v: 'Year {bYearInVahid} of Vahid {bVahid} / <b>{bYear}</b>'.filledWith(vue.di)
    });

    vue.dayDisplay = answers.map(function (ans) {
      return `<div class="line ${ans.c || ''}"><label>${ans.t}</label> <span>${ans.v}</span></div>`;
    }).join('');
  }

  function fillSunDisplay(vue) {
    var answers = [];

    const readableFormat = 'ddd, MMM D [at] HH:mm';

    const now = moment(vue.di.currentTime);
    const noon = moment(now).hour(12).minute(0).second(0);
    const tomorrowNoon = moment(noon).add(24, 'hours');

    const sun1 = sunCalc.getTimes(noon);
    const sunrise1 = moment(sun1.sunrise);
    const sunset1 = moment(sun1.sunset);

    var sun = {
      setStart: null,
      rise: null,
      setEnd: null,
      now: now
    };

    if (now.isAfter(sunset1)) {
      // eve of day1 into day2
      answers.push({
        t: `Starting Sunset:`,
        v: sunset1.format(readableFormat)
      });

      var sun2 = sunCalc.getTimes(tomorrowNoon);
      var sunrise2 = moment(sun2.sunrise);
      var sunset2 = moment(sun2.sunset);

      sun.setStart = sunset1;
      sun.rise = sunrise2;
      sun.setEnd = sunset2;

      if (now.isBefore(sunrise2)) {
        answers.push({
          t: `Now:`,
          v: now.format(readableFormat),
          c: 'now'
        });
        answers.push({
          t: `Sunrise:`,
          v: sunrise2.format(readableFormat)
        });
      } else {
        answers.push({
          t: `Sunrise:`,
          v: sunrise2.format(readableFormat)
        });
        answers.push({
          t: `Now:`,
          v: now.format(readableFormat),
          c: 'now'
        });
      }
      answers.push({
        t: `Ending Sunset:`,
        v: sunset2.format(readableFormat)
      });

      setNextRefreshAt(sunset2);
    } else {
      // get prior sunset
      var sun0 = sunCalc.getTimes(moment(noon).subtract(24, 'hours'));
      var sunset0 = moment(sun0.sunset);

      sun.setStart = sunset0;
      sun.rise = sunrise1;
      sun.setEnd = sunset1;

      answers.push({
        t: `Starting Sunset:`,
        v: sunset0.format(readableFormat)
      });
      if (now.isBefore(sunrise1)) {
        answers.push({
          t: `Now:`,
          v: now.format(readableFormat),
          c: 'now'
        });
        answers.push({
          t: `Sunrise:`,
          v: sunrise1.format(readableFormat)
        });
      } else {
        answers.push({
          t: `Sunrise:`,
          v: sunrise1.format(readableFormat)
        });
        answers.push({
          t: `Now:`,
          v: now.format(readableFormat),
          c: 'now'
        });
      }
      answers.push({
        t: `Ending Sunset:`,
        v: sunset1.format(readableFormat)
      });

      setNextRefreshAt(sunset1);
    }

    drawChart(sun)

    vue.sunDisplay = answers.map(function (ans) {
      return `<div class="line ${ans.c || ''}"><label>${ans.t}</label> <span>${ans.v}</span></div>`;
    }).join('');
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

  function drawChart(sun) {
    //   setStart: null,
    //   rise: null,
    //   setEnd: null,
    //   now: now

    // window.sun = sun;
    // var numMinutes = sun.setEnd.diff(sun.setStart, 'minutes');
    // var minBeforeRise = sun.setStart.diff(sun.rise, 'minutes');
    // var minAfterRise = sun.setEnd.diff(sun.rise, 'minutes');
    // var stepSize = numMinutes / 20;

    // // adapted from http://jsfiddle.net/Murisaki/m1sdtejo/3/
    // var x = []; // for development
    // var y = [];
    // var v = [];

    // const amplitude = 5;
    // const aVelocity = numMinutes / (2 * Math.PI);
    // const pAngle = minBeforeRise;

    // var i = 0;
    // for (var xt = minBeforeRise; xt <= minAfterRise; xt += stepSize) {
    //   x[i] = xt;
    //   y[i] = amplitude * Math.sin(aVelocity * xt + pAngle);
    //   v[i] = [x[i], y[i]];
    //   i++;
    // }
    // console.table(v);
  }

</script>
