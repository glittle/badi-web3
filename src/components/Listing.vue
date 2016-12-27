<template>
  <div class="Page1">
    <p>List of Holy Days, Feasts and other events</p>
    <select size=2 multiple v-model="listFilter">
      <option value="HS">Holy Days</option>
      <option value="M">Months</option>
    </select>
    <div v-for="item in filteredList">
      {{item.Type}} {{item.NameEn}} <span v-html="item.NameAr"></span> {{item.BMonthDay.d}}
    </div>
  </div>
</template>
<script>
  import * as badi from '../scripts/badiCalc'
  export default {
    name: 'Page1',
    created: function () {
      this.getDateInfos(173);
    },
    data() {
      return {
        path: 'listing',
        title: 'The Listing',
        listFilter: ['HS'],
        num: 0,
        list: []
      }
    },
    computed: {
      filteredList: function () {
        return this.list.filter(item => this.listFilter.includes(item.Type));
      }
    },
    methods: {
      getDateInfos: function (year) {
        var info = badi.prepareDateInfos(year);
        this.num = info.length;
        this.list = info;
      }
    }
  }

</script>
<style scoped>


</style>
