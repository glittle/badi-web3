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
      originalYear: 0,
      firstYear: 9999,
      lastYear: -1,
      num: 0,
      list: [],
      location: shared.coords.name
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
      return this.list.filter(item => filter.includes(item.Type));
    }
  },
  methods: {
    loadDates: function (year) {
      var vue = this;
      if (year < vue.firstYear) {
        vue.firstYear = year
      }
      if (year > vue.lastYear) {
        vue.lastYear = year
      }
      console.log('loading', year)
      var info = badi.buildSpecialDaysTable(year);
      window.dis = cloneDeep(info);
      vue.list = vue.list.concat(info.map(function (d) {
        return extendDayInfo(d, year - vue.originalYear)
      }));
      vue.list.sort(sortDates)
      vue.num = vue.list.length;
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
