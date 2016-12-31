<template>
  <article class="layout-padding">
    <h2>Language</h2>
    <div class="section">
      <label>
        <q-radio disable v-model="languageCode" val="en"></q-radio>
        English
      </label>
    </div>
  </article>
</template>
<style></style>
<script>
  // import * as shared from '../scripts/shared'
  // import * as storage from '../scripts/storage'

  export default {
    name: 'OtherSetup',
    data() {
      return {
        title: 'Setup Other',
        icon: 'language',
        languageCode: 'en'
      }
    },
    created() {},
    watch: {
    },
    methods: {
    }
  }

</script>
