import badi from '../scripts/badiCalc'
import * as shared from '../scripts/shared'
var cloneDeep = require('lodash/cloneDeep');

export default {
  name: 'listing', // for Vue debugger
  data() {
    return {
      title: "Bahá'í Dates",
      icon: 'people',
      includeHolyDays: true,
      includeFeasts: true,
      includeOther: true,
      includeFast: false,
      originalYear: 0,
      firstYear: 9999,
      lastYear: -1,
      list: [],
      location: shared.coords.name,
      suggestedStart: '1930'
    }
  },
  created: function () {
    this.originalYear = badi.di.bYear;
    this.loadDates(this.originalYear);
  },
  computed: {
    nextYear: function () {
      return this.lastYear + 1;
    },
    prevYear: function () {
      return this.firstYear - 1;
    },
    filteredList: function () {
      var filter = ['Today'];
      if (this.includeHolyDays) {
        filter.push('HS');
        filter.push('HO');
      }
      if (this.includeFeasts) {
        filter.push('M');
      }
      if (this.includeOther) {
        filter.push('OtherRange');
        filter.push('OtherDay');
      }
      if (this.includeFast) {
        filter.push('Fast');
      }
      return this.list.filter(item => filter.includes(item.Type));
    }
  },
  watch: {
    suggestedStart: function () {
      var vue = this;
      vue.list = [];
      // TODO: does not redisplay if reusing previous year
      for (var i = vue.firstYear; i <= vue.lastYear; i++) {
        vue.loadDates(i);
      }
    }
  },
  methods: {
    resetToFirstYear: function(){
      var vue = this;
      vue.list = [];
      this.firstYear = this.originalYear;
      this.lastYear = this.originalYear;
      vue.loadDates(this.originalYear);
    },
    getSpecialTime: function (day) {
      var prefix = 'Suggested start at';
      var list = ['SpecialTime'];

      switch (day.EventType) {
        case 'Tablet':
          prefix = 'Recite tablet at';
          list.push('setTime')
          break;

        case 'Celebrate':
          prefix = 'Celebrate at';
          list.push('setTime')
          break;
      }

      return {
        // TODO: must be a better way to bind to two values...
        classes: list,
        html: prefix + ' ' + day.EventTime
      }
    },
    getNoWork: function (v) {
      if (v) {
        return 'Suspend work on ' + v
      }
    },
    getNoWorkClass: function (weekday) {
      var list = ['NoWork'];
      if (weekday > 0 && weekday < 6) {
        // very simple M - F. Should be settable by user!
        list.push('Workday')
      }
      return list;
    },
    loadDates: function (year) {
      var vue = this;
      if (year < vue.firstYear) {
        vue.firstYear = year
      }
      if (year > vue.lastYear) {
        vue.lastYear = year
      }
      console.log('loading', year)
      var info = badi.buildSpecialDaysTable(year, this.suggestedStart);
      window.dis = cloneDeep(info); // for developer access in console
      vue.list = vue.list.concat(info.map(function (d) {
        return extendDayInfo(d, year - vue.originalYear)
      }));
      vue.list.sort(sortDates)
    },
    test: function (cell) {
      switch (cell.data) {
        case 'M':
          return "Feast"
        case 'HS':
        case 'HD':
          return "Holy Day"
        default:
          return cell;
      }
    }
  },
  head: {
    title: function () {
      return {
        inner: this.title
      }
    },
    meta: [{
      name: 'description2',
      content: 'My description',
      //id: 'desc'
    }, {
      itemprop: 'name',
      content: 'Content Title'
    }]
  },

}

function extendDayInfo(d, diff) {
  d.Month = '{bMonthNamePri} {bYear}'.filledWith(d.di)
  if (Math.abs(diff) % 2 === 1) {
    d.RowClass.push('oddYear')
  }
  return d;
}

function sortDates(a, b) {
  return a.GDate < b.GDate ? -1 :
    a.GDate > b.GDate ? 1 :
    a.Type === 'M' ? -1 :
    a.Type === 'HS' ? -1 :
    a.Type === 'HO' ? -1 :
    a.Type === 'Fast' ? -1 :
    1;
}
