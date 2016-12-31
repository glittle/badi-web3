<template>
  <article class="layout-padding">
    <h1>{{this.title}}</h1>
    <select size=2 multiple v-model="listFilter">
      <option value="HS">Holy Days</option>
      <option value="M">Months</option>
    </select>
    <!--<div v-for="item in filteredList">
      {{item.Type}} {{item.NameEn}} <span v-html="item.NameAr"></span> {{item.BMonthDay.d}}
    </div>-->
    <q-data-table :data="filteredList" :config="config" :columns="columns">
    </q-data-table>
  </article>
</template>
<script>
  import badi from '../scripts/badiCalc'
  var cloneDeep = require('lodash/cloneDeep');

  export default {
    name: 'listing', // for Vue debugger
    data() {
      return {
        title: "Bahá'í Holy Days and Feasts",
        icon: 'people',
        listFilter: ['HS'],
        num: 0,
        list: [],
        config: {
          // [REQUIRED] Set the row height
          rowHeight: '50px',
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
            maxHeight: '500px'
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
          messages: {
            noData: '<i>warning</i> No data available to show.',
            noDataAfterFiltering: '<i>warning</i> No results. Please refine your search terms.'
          }
        },
        columns: [{
          label: 'Day',
          field: '',
          width: '',
          classes: ''
        }, {
          label: 'Name',
          field: 'NameEn',
          format(value) {
            switch (value) {
              case 'M':
                return "Feast"
              case 'HS':
              case 'HD':
                return "Holy Day"
              default:
                return value;
            }
          },
          width: '80px'
        }, {
          label: 'Suspend Work',
          field: '',
          width: '',
          classes: ''
        }, {
          label: 'Meeting/Special Time',
          field: '',
          width: '',
          classes: ''
        }, {
          label: 'Start of Day',
          field: '',
          width: '',
          classes: ''
        }, {
          label: 'Type',
          field: 'Type',
          width: '20px',
          filter: true,
          sort: true,
          format(value) {
            switch (value) {
              case 'M':
                return "Feast"
              case 'HS':
              case 'HD':
                return "Holy Day"
              default:
                return value;
            }
          }
        }, {
          label: 'What',
          field: 'BMonthDay',
          format(value) {
            return value.d
          },
          width: '80px'
        }]
      }
    },
    created: function () {
      this.getDateInfos(173);
    },
    computed: {
      filteredList: function () {
        return this.list.filter(item => this.listFilter.includes(item.Type));
      }
    },
    methods: {
      getDateInfos: function (year) {
        var info = badi.prepareDateInfos(year);
        window.dis = cloneDeep(info);
        this.num = info.length;
        this.list = info;
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

</script>
<style scoped>


</style>
