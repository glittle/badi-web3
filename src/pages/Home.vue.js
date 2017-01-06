import messages from '../scripts/messages'
import badiCalc from '../scripts/badiCalc'
import sunCalc from '../scripts/sunCalc'
require('../scripts/stringExt')
const moment = require('moment-timezone');
const Highcharts = require('highcharts');
var versionInfo = require('../../version.json')

var routeList = require('./routes');

export default {
  data() {
    return {
      title: messages.get('HomePage', null, 'Home'),
      icon: 'home',
    }
  },
  computed: {
    position() {
      return null;
    },
    di() {
      this.$store.state.pulseNum;
      this.$store.commit('newDate', badiCalc.di);
      return badiCalc.di;
    },
    dayDisplay() {
      return fillDayDisplay(this.di)
    },
    sunDisplay() {
      return fillSunDisplay(this.di)
    },
    pageList() {
      return routeList.default.menuPages.filter(function (p) {
        return p.to !== '/'
      });
    },
    version() {
      var age = moment(versionInfo.buildDate, "_ MMM D YYYY HH:mm:ss _Z").fromNow();

      // var buildDi = {}
      // badiCalc.generateDateInfo(buildDi, buildDate.toDate());

      return '{0} ({1})'.filledWith(versionInfo.version, age)
    }
  },
  methods: {},
  // watch: {
  //   di: function () {
  //     console.log('di changed')
  //     // fillDayDisplay(this)
  //     // fillSunDisplay(this)
  //   }
  // },
  beforeMount() {
    // console.log('before mount', routeList)
    // this.pages = routeList.default.named;
    // this.pageList = routeList.default.menuPages;
    // debugger;
  },
  mounted() {
    // console.log('mounted', routeList)
    // this.$nextTick(() => {
    // })
    // debugger;
    // this.pulseNumber = pulse.pulseNumber
    // fillDayDisplay(this)
    // fillSunDisplay(this)
    drawChart(local.sun)
  },
  beforeUpdate() {
    // console.log('update', routeList)
  },
  beforeDestroy() {},
}

var local = {
  sun: null
};

function fillDayDisplay(di) {
  var answers = [];
  // var di = badiCalc.di;

  answers.push({
    t: 'Day of Month',
    v: '{bDayNamePri} / {bDayNameSec} / <b>{bDay}</b>'.filledWith(di)
  });
  answers.push({
    t: 'Day of Week',
    v: '{bWeekdayNamePri} / {bWeekdayNameSec} / {bWeekday}'.filledWith(di)
  });
  answers.push({
    t: 'Month',
    v: '<b>{bMonthNamePri}</b> / {bMonthNameSec} / {bMonth}'.filledWith(di)
  });
  answers.push({
    t: 'Section of Year',
    v: '{element}'.filledWith(di)
  });
  answers.push({
    t: 'Year',
    v: 'Year {bYearInVahid} of Vahid {bVahid} / <b>{bYear}</b>'.filledWith(di)
  });

  return answers.map(function (ans) {
    return `<div class="line ${ans.c || ''}"><label>${ans.t}</label> <span>${ans.v}</span></div>`;
  }).join('');
}

function fillSunDisplay(di) {
  var answers = [];

  const readableFormat = 'ddd, MMM D [at] HH:mm';
  const nowFormat = readableFormat; // 'ddd, MMM D [at] HH:mm:ss';

  const now = moment(di.currentTime);
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
        v: now.format(nowFormat),
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
        v: now.format(nowFormat),
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
        v: now.format(nowFormat),
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
        v: now.format(nowFormat),
        c: 'now'
      });
    }
    answers.push({
      t: `Ending Sunset:`,
      v: sunset1.format(readableFormat)
    });

    setNextRefreshAt(sunset1);
  }

  local.sun = sun;

  return answers.map(function (ans) {
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

  var yFactor = 10;
  var v = [];

  function addPoint(m, n) {
    var t = m.toDate();
    v.push({
      x: t,
      y: sunCalc.getPosition(t).altitude * yFactor,
      name: n
    });
  }

  addPoint(sun.setStart, 'Sunset');
  addPoint(sun.setEnd, 'Sunset');
  addPoint(sun.rise, 'Sunrise');
  addPoint(sun.now, 'Now');
  addPoint(moment(sun.rise).set({
    hour: 12,
    minute: 0,
    second: 0
  }), 'Noon');
  addPoint(moment(sun.rise).set({
    hour: 0,
    minute: 0,
    second: 0
  }), 'Midnight');

  // fill in the rest
  var minutesBetweenPoints = 20;
  var firstPlot = moment(sun.setStart).add(minutesBetweenPoints, 'm'); // don't go past the end!
  var lastPlot = moment(sun.setEnd).subtract(minutesBetweenPoints, 'm'); // don't go past the end!
  /* eslint-disable no-unmodified-loop-condition */
  // eslint doesn't know that `time.add` mutates `time`
  for (var time = firstPlot; time <= lastPlot;) {
    addPoint(time, null) // nameless points
    time.add(minutesBetweenPoints, 'm')
  }
  v.sort(function (a, b) {
    return a.x < b.x ? -1 : 1
  })
//   console.table(v);

  Highcharts.chart('sunChart', {
    chart: {
      type: 'area'
    },
    title: {
      text: null
    },
    credits: {
      enabled: false
    },
    legend: {
      enabled: false
    },
    xAxis: {
      type: 'datetime',
      dateTimeLableFormats: {
        hour: '%H:%M',
        day: '%H:%M',
      },
      plotLines: v
        .filter(function (p) {
          return p.name
        }).map(function (p) {
          return {
            value: p.x,
            width: 1,
            zIndex: 1,
            color: 'red',
            label: {
              rotation: 0,
              text: p.name,
              align: 'center',
              style: {
                "color": "contrast",
                "fontSize": "11px",
                "fontWeight": "normal",
                "textOutline": "1px 1px contrast"
              }
            }
          }
        })
    },
    yAxis: {
      visible: false,
      maxPadding: 0,
      minPadding: 0,
    },
    plotOptions: {
      area: {
        marker: {
          enabled: false
        }
      }
    },

    series: [{
      data: v,
      dataLabels: {
        enabled: true,
        format: '{point.name}',
        //rotation: -45,
        align: 'center',
        // x: 2,
        // y: -10,
        style: {
          "color": "contrast",
          "fontSize": "11px",
          "fontWeight": "normal",
          "textOutline": "1px 1px contrast"
        }
      },
      color: 'yellow',
      negativeColor: 'black'
    }]
  });

}
