<template>
  <article class="layout-padding otherSetup">
    <h1 class="sr-only" data-page-heading>{{ $msg('pageTitleOtherSetup') }}</h1>
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
            <div>Use Arabic month names first?</div>
            <span v-bind:class="{active: useArNames }">Yes: Bahá</span>
            <span v-bind:class="{active: !useArNames }">No: Splendor</span>
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
            <div>Use 24 hour time?</div>
            <span v-bind:class="{active: use24hour }">Yes: 17:00</span>
            <span v-bind:class="{active: !use24hour }">No: 5:00 pm</span>
          </div>
        </label>
      </div>
    </div>
    <h2 id="paletteHeading">{{ $msg('paletteHeading') }}</h2>
    <div class="section">
      <fieldset class="paletteChoices">
        <legend class="sr-only">{{ $msg('paletteHeading') }}</legend>
        <label v-for="p in palettes"
               v-bind:key="p.id"
               class="paletteChoice"
               v-bind:class="{ active: palette === p.id }">
          <input type="radio"
                 name="palette"
                 v-bind:value="p.id"
                 v-model="palette">
          <span class="paletteSwatch"
                aria-hidden="true"
                v-bind:style="{ background: p.color }"></span>
          <span class="paletteName">{{ $msg(p.nameKey) }}</span>
        </label>
      </fieldset>
    </div>
    <h2 id="announceHeading">{{ $msg('announceHeading') }}</h2>
    <div class="section">
      <p id="announceHint" class="announceHint">{{ $msg('announceHint') }}</p>
      <fieldset class="paletteChoices announceChoices" aria-describedby="announceHint">
        <legend class="sr-only">{{ $msg('announceHeading') }}</legend>
        <label v-for="m in announceModes"
               v-bind:key="m.id"
               class="paletteChoice announceChoice"
               v-bind:class="{ active: announceMode === m.id }">
          <input type="radio"
                 name="tapAnnounce"
                 v-bind:value="m.id"
                 v-model="announceMode">
          <span>{{ $msg(m.nameKey) }}</span>
        </label>
      </fieldset>
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
import { PALETTES, currentPaletteId, setPalette } from '../scripts/palette'
import { ANNOUNCE_MODES, currentAnnounceMode, setAnnounceMode } from '../scripts/announce'
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
      palettes: PALETTES,
      palette: currentPaletteId(),
      announceModes: ANNOUNCE_MODES,
      announceMode: currentAnnounceMode(),
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
  watch: {
    palette: function (id) {
      setPalette(id)
    },
    announceMode: function (id) {
      setAnnounceMode(id)
    }
  },
  methods: {
    get(key) {
      return shared.formats[key].filledWith(badiCalc.di)
    }
  }
}

</script>
