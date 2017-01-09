import messages from '../scripts/messages'
import badiCalc from '../scripts/badiCalc'
import sunCalc from '../scripts/sunCalc'
import * as shared from '../scripts/shared'
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
    shortDay() {
      return shared.formats.shortDay.filledWith(this.di)
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
    drawChart(local.sun)
  },
  updated() {
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
  sun: null,
  chart: null
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
    // answers.push({
    //   t: `Starting Sunset:`,
    //   v: sunset1.format(readableFormat)
    // });

    var sun2 = sunCalc.getTimes(tomorrowNoon);
    var sunrise2 = moment(sun2.sunrise);
    var sunset2 = moment(sun2.sunset);

    sun.setStart = sunset1;
    sun.rise = sunrise2;
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

function drawChart(sun) {
  //   console.log('drawing chart')
  //   setStart: null,
  //   rise: null,
  //   setEnd: null,
  //   now: now

  var key = sun.now.format('MMdd');
  if (_lastChartDay === key) {
    showNowLine(_chart, sun);
    return;
  } else {
    _lastChartDay = key;
  }

  var yFactor = 10;
  var twilight = 4;
  var colorFullSun = '#ffff00';
  var colorFullDark = '#000000';
  // var nowLabel = 'Now'; //<br>' + sun.now.format('HH:mm');
  var v = [];
  var chartMin = sun.setStart.valueOf();
  var chartMax = sun.setEnd.valueOf();
  var chartRange = chartMax - chartMin;

  function addPoint(m, name, color) {
    var t = m.toDate();
    var o = {
      x: t,
      y: sunCalc.getPosition(t).altitude * yFactor,
      name: name,
      time: m.format('H:mm'),
      color: color,
      pct: (t.getTime() - chartMin) / chartRange
    };
    if (o.y > twilight) {
      o.color = colorFullSun;
    }
    if (o.y < -1 * twilight) {
      o.color = colorFullDark;
    }
    v.push(o);
  }

  addPoint(sun.setStart, 'Sunset', 'lightgrey');
  addPoint(sun.setEnd, 'Sunset', 'lightgrey');
  addPoint(sun.rise, 'Sunrise', 'lightgrey');
  var midnight = moment(sun.rise).set({
    hour: 0,
    minute: 0,
    second: 0
  });

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

  var minSun = 99;
  var maxSun = -99;
  for (var i = 0; i < v.length; i++) {
    var y = v[i].y;
    if (y < minSun) {
      minSun = y;
    }
    if (y > maxSun) {
      maxSun = y;
    }
  }

  v.sort(function (a, b) {
    return a.x < b.x ? -1 : 1
  })

  //   console.table(v);

  Highcharts.setOptions({
    global: {
      useUTC: false
    }
  });

  _chart = Highcharts.chart('sunChart', {
    chart: {
      type: 'areaspline',
      //spacingBottom: 50
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
    tooltip: {
      enabled: false
    },
    enableMouseTracking: false,
    xAxis: {
      type: 'datetime',
      tickLength: 35,
      tickPositions: [midnight.toDate().getTime()],
      labels: {
        align: 'center',
        useHTML: true,
        y: 12,
        formatter: function () {
          // only one tick, at midnight
          var yesterday = moment(midnight).subtract(1, 's');
          var html = '<div class=left>{0}<br>{1}</div>'.filledWith(yesterday.format('MMM D'), yesterday.format('dddd')) +
            '<div>{0}<br>{1}</div>'.filledWith(midnight.format('MMM D'), midnight.format('dddd'));
          return html;
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
      area: {
        marker: {
          enabled: false
        }
      }
    },
    series: [{
      data: v,
      tooltip: {
        enabled: false
      },
      dataLabels: {
        enabled: true,
        useHTML: true,
        formatter: function () {
          var point = this.point;
          return point.name ? (point.name + '<br>' + point.time) : null;
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
        stops: v
          .filter(function (p) {
            return p.color
          }).map(function (p) {
            return [
              p.pct,
              p.color,
            ]
          }),
      },
      lineWidth: 0
    }]
  }, function (chart) {
    showNowLine(chart, sun);
  });
}

function showNowLine(chart, sun) {
  var now = sun.now;
  chart.xAxis[0].removePlotLine('now');

  var timeFromSunset = sun.now.diff(sun.setStart, 'h', true);
  var align = timeFromSunset < 3 ? 'left' :
    timeFromSunset > 21 ? 'right' :
    'center';

  chart.xAxis[0].addPlotLine({
    value: now.toDate(),
    color: '#027be3',
    width: 1,
    id: 'now',
    zIndex: 5, //    zIndex: 0,
    label: {
      rotation: 0,
      text: 'Now ' + now.format('H:mm'),
      align: align,
      style: {
        color: _fontColor,
        fontSize: _fontSize,
        fontWeight: "normal",
        textOutline: "1px 1px contrast",
        backgroundColor: '#ffffff'
      }
    }
  });
}
var _fontSize = '12px';
var _fontColor = '#212121';
