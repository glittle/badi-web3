<template>
  <article class="layout-padding">
    <h2>Language</h2>
    <div class="section">
      <!--<label>
        <q-radio disable v-model="languageCode" val="en"></q-radio>
        English
      </label>-->
      <div>
        <label>
          <q-toggle v-model="useArNames" class="teal"></q-toggle>
          <span>Use Arabic month names first</span>
        </label>
      </div>
    </div>
    <h2>Date Formats</h2>
    <div class="section formats">
      <div>
        <b>Top of App:</b>
        <span v-html="get('topTitle')"></span> </div>
      <div>
        <b>Notification Title:</b>
        <span v-html="get('noticationMain')"></span> </div>
      <div>
        <b>Notification Text:</b>
        <span v-html="get('noticationSub')"></span> </div>
    </div>
    <div class="card">
      <div class="card-content">
        These will configurable in a future version.
      </div>
    </div>
  </article>
</template>
<style src="./OtherSetup.vue.css"></style>
<script>
  import * as shared from '../scripts/shared'
  import * as store from '../scripts/store'
  import badiCalc from '../scripts/badiCalc'
  import storage from '../scripts/storage'

  export default {
    name: 'OtherSetup',
    data() {
      return {
        title: 'Other Settings',
        icon: 'language',
        languageCode: 'en',
      }
    },
    created() {},
    computed: {
      useArNames: {
        get: function () {
          return storage.get('useArNames', false)
        },
        set: function (v) {
          storage.set('useArNames', v);
          window.location.reload();
        }
      }
    },
    watch: {},
    methods: {
      get(key) {
        return shared.formats[key].filledWith(badiCalc.di)
      }
    }
  }

</script>
