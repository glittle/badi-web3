<template>
  <article class="layout-padding">
    <h2>Language</h2>
    <div class="section">
      <label>
        <q-radio disable v-model="languageCode" val="en"></q-radio>
        English
      </label>
    </div>
    <h2>Date Formats</h2>
    <div class="section formats">
      <div><b>Top of App:</b><span v-html="get('topTitle')"></span></div>
      <div><b>Notification Title:</b><span v-html="get('noticationMain')"></span></div>
      <div><b>Notification Text:</b><span v-html="get('noticationSub')"></span></div>
    </div>
    <div class="card">
      <div class="card-content">
        These will configurable in a future version.
      </div>
    </div>
  </article>
</template>
<style>
  .formats b {
    margin-right: 1em;
  }
  
  .formats span {
    white-space: nowrap;
    padding: 0 3px;
    background-color: #f0f0f0;
  }

</style>
<script>
  import * as shared from '../scripts/shared'
  import badiCalc from '../scripts/badiCalc'
  // import * as storage from '../scripts/storage'

  export default {
    name: 'OtherSetup',
    data() {
      return {
        title: 'Other Settings',
        icon: 'language',
        languageCode: 'en'
      }
    },
    created() {},
    watch: {},
    methods: {
      get(key) {
        return shared.formats[key].filledWith(badiCalc.di)
      }
    }
  }

</script>
