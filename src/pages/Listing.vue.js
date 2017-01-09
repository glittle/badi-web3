import badi from '../scripts/badiCalc'
var cloneDeep = require('lodash/cloneDeep');

var _extraYearToggle = false;

export default {
  name: 'listing', // for Vue debugger
  data() {
    return {
      title: "Bahá'í Holy Days and Feasts",
      icon: 'people',
      includeHolyDays: true,
      includeFeasts: true,
      currentYear: 0,
      num: 0,
      list: [],
    }
  },
  created: function () {
    this.loadDates();
  },
  computed: {
    nextYear: function () {
      return this.currentYear + 1;
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
      this.currentYear = year || badi.di.bYear;
      console.log('loading', this.currentYear)
      var info = badi.buildSpecialDaysTable(this.currentYear);
      window.dis = cloneDeep(info);
      this.list = this.list.concat(info.map(function (d) {
        return extendDayInfo(d, _extraYearToggle)
      }));
      this.num = this.list.length;
      _extraYearToggle = !_extraYearToggle;
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

function extendDayInfo(d, isOddExtraYear) {
  d.Month = '{bMonthNamePri} {bYear}'.filledWith(d.di)
  if (isOddExtraYear) {
    d.RowClass.push('oddYear')
  }
  return d;
}
