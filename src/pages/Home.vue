<template>
  <article class="layout-padding">
    <div class="card">
      <div class="card-content">
        Information about today...
      </div>
    </div>
    <div class="card">
      <div class="card-content">
        <p>Temporary page list...</p>
        <div class="list no-border">
          <router-link tag="button" class="item item-link" v-for="page in pages2" :to="page.to">
            {{page.text}}
          </router-link>
        </div>
      </div>
    </div>
  </article>
</template>
<style src="./Home.vue.css"></style>
<script>
  // import routeList from './routes'
  var routeList = require('./routes');

  export default {
    data() {
      return {
        title: 'Home',
        pages: {}, // error if directly assign imported item
        pages2: []
      }
    },
    computed: {
      position() {
        return null;
      }
    },
    methods: {
      move(event) {}
    },
    beforeMount() {
      // console.log('before mount', routeList)
      this.pages = routeList.default.named;
      this.pages2 = routeList.default.menuPages;
      // debugger;
    },
    mounted() {
      console.log('mounted', routeList)
        // this.$nextTick(() => {
        // })
    },
    beforeUpdate() {
      // console.log('update', routeList)
    },
    beforeDestroy() {},
  }

</script>
