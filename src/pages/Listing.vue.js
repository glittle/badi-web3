import badi from '../scripts/badiCalc'
var cloneDeep = require('lodash/cloneDeep');

export default {
  name: 'listing', // for Vue debugger
  data() {
    return {
      title: "Bahá'í Holy Days and Feasts",
      icon: 'people',
      includeHolyDays: true,
      includeFeasts: true,
      num: 0,
      list: [],
      config: {
        // [REQUIRED] Set the row height
        //          rowHeight: '50px',
        // (optional) Title to display
        // title: this.title,
        // (optional) Display refresh button
        // refresh: true,
        // (optional)
        // User will be able to choose which columns
        // should be displayed
        // columnPicker: true,
        // (optional) How many columns from the left are sticky
        // leftStickyColumns: 0,
        // (optional) How many columns from the right are sticky
        // rightStickyColumns: 2,
        // (optional)
        // Styling the body of the data table;
        // "minHeight", "maxHeight" or "height" are important
        bodyStyle: {
          // maxHeight: '500px'
        },
        // (optional) By default, Data Table is responsive,
        // but you can disable this by setting the property to "false"
        //responsive: true,
        // (optional) Use pagination. Set how many rows per page
        // and also specify an additional optional parameter ("options")
        // which forces user to make a selection of how many rows per
        // page he wants from a specific list
        // pagination: {
        //   rowsPerPage: 15,
        //   options: [5, 10, 15, 30, 50, 500]
        // },
        // (optional) User can make selections. When "single" is specified
        // then user will be able to select only one row at a time.
        // Otherwise use "multiple".
        selection: false, //'multiple',
        // (optional) Override default messages when no data is available
        // or the user filtering returned no results.
        message: {
          noData: 'Please choose what to show!',
          noDataAfterFiltering: 'Please choose what to show!'
        }
      },
      columns: [{
        label: 'What',
        field: 'Type',
        width: '80px'
      }, {
        label: 'Year',
        field: 'di',
        width: '',
        classes: '',
        format(di) {
          return '{bYear} ({currentYear})'.filledWith(di)
        }
      }, {
        label: 'Day',
        field: 'D',
        width: '',
        classes: ''
      }, {
        label: 'Suspend Work',
        field: 'NoWork',
        width: '',
        classes: ''
      }, {
        label: 'Meeting/Special Time',
        field: 'TimeReason',
        width: '',
        classes: ''
      }, {
        label: 'Start of Day',
        field: 'Sunset',
        width: '',
        classes: ''
      }, {
        label: '',
        field: '',
      }]
    }
  },
  created: function () {
    this.loadDates();
  },
  computed: {
    filteredList: function () {
      var filter = [];
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
      year = year || badi.di.bYear;
      var info = badi.buildSpecialDaysTable(year);
      window.dis = cloneDeep(info);
      this.num = info.length;
      this.list = info.map(function (d) {
        return extendDayInfo(d)
      });
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

function extendDayInfo(d) {
  d.Month = '{bMonthNamePri} {bYear}'.filledWith(d.di)
  return d;
}
