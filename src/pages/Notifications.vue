<template>
  <article class="Notifications layout-padding">
    <h2>Notifications</h2>
    <div class="section">
      <button class="small primary" v-on:click="testNotification">Test Notification</button>
    </div>
  </article>
</template>
<style src="./Notifications.vue.css"></style>
<script>
  import * as shared from '../scripts/shared'
  import * as storage from '../scripts/storage'
  import * as notify from '../scripts/notification'

  export default {
    name: 'Notifications',
    created() {},
    data() {
      return {
        title: 'Setup Notifications',
      }
    },
    methods: {
      testNotification() {
        notify.showNow();
      }
    }
  }

</script>
