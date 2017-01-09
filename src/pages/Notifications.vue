<template>
  <article class="Notifications layout-padding">
    <h2>Notifications</h2>
    <div class="section">
      <button class="small primary" v-on:click="testNotification">Show Now</button>
    </div>
  </article>
</template>
<style src="./Notifications.vue.css"></style>
<script>
  // import * as shared from '../scripts/shared'
  // import * as storage from '../scripts/storage'
  import * as notify from '../scripts/notification'

  export default {
    name: 'Notifications',
    created() {},
    data() {
      return {
        title: 'Notifications',
        icon: 'message'
      }
    },
    methods: {
      testNotification() {
        notify.showNow();
      },
    },
    mounted() {
      // var host = document.getElementById('images');
      // notify.makeImage(host, 1);
      // notify.makeImage(host, 2);
    }
  }

</script>
