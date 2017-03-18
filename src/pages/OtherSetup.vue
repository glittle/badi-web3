<template>
  <article class="layout-padding otherSetup">
    <h2>Language</h2>
    <div class="section">
      <!--<label>
                          <q-radio disable v-model="languageCode" val="en"></q-radio>
                          English
                        </label>-->
      <div>
        <label>
          <q-toggle v-model="useArNames"
                    class="teal"></q-toggle>
          <div>
            <div>Use Arabic month names first</div>
            <span v-bind:class="{active: !useArNames }">Off: Splendor</span>
            <span v-bind:class="{active: useArNames }">On: Bahá</span>
          </div>
        </label>
      </div>
    </div>
    <h2>Time Format</h2>
    <div class="section">
      <div>
        <label>
          <q-toggle v-model="use24hour"
                    class="teal"></q-toggle>
          <div>
            <div>Use 24 hour time</div>
            <span v-bind:class="{active: !use24hour }">Off: 5:00 pm</span>
            <span v-bind:class="{active: use24hour }">On: 17:00</span>
          </div>
        </label>
      </div>
    </div>
    <!--<h2>Date Formats</h2>
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
                      </div>-->
  </article>
</template>
<style src="./OtherSetup.vue.css"></style>
<script>
import * as shared from '../scripts/shared'
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
  created() { },
  computed: {
    useArNames: {
      get: function () {
        return storage.get('useArNames', false)
      },
      set: function (v) {
        storage.set('useArNames', v);
        setTimeout(function () {
          window.location.reload();
        }, 300) // let user see button change before reloading
      }
    },
    use24hour: {
      get: function () {
        return storage.get('use24hour', false)
      },
      set: function (v) {
        storage.set('use24hour', v)
        setTimeout(function () {
          window.location.reload();
        }, 300) // let user see button change before reloading
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
