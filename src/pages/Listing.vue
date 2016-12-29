<template>
  <article class="layout-padding">
    <h3>{{this.title}}</h3>
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
    data() {
      return {
        title: "Bahá'í Holy Days and Feasts",
        listFilter: ['HS'],
        num: 0,
        list: []
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
