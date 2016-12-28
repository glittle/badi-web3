<template>
  <article class="Page1">
    <p>List of Holy Days, Feasts and other events</p>
    <select size=2 multiple v-model="listFilter">
      <option value="HS">Holy Days</option>
      <option value="M">Months</option>
    </select>
    <div v-for="item in filteredList">
      {{item.Type}} {{item.NameEn}} <span v-html="item.NameAr"></span> {{item.BMonthDay.d}}
    </div>
  </article>
</template>
<script>
  import * as badi from '../scripts/badiCalc'
  export default {
    name: 'listing', // for Vue debugger
    created: function () {
      this.getDateInfos(173);
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
    data() {
      return {
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
