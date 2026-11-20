<template>
  <article class="layout-padding docPage">
    <h1 data-page-heading>Change log</h1>
    <p>What's new in each version of <router-link to="/">Wondrous-Badi.Today</router-link>, newest first. The version you are using is marked on its entry.</p>
    <p v-if="newerAvailable" class="updateNote">A newer version is available (<button type="button" class="reload" @click="reload">force a reload now</button>).</p>
    <div class="versions">
      <h2>Version 2.5.0 (November 2026) <span v-if="isYours('2.5.0')" class="yourVersion">Your version</span></h2>
      <p>The app opens faster. Added a Guide and this Change Log page. Some technical improvements.</p>

      <h2>Version 2.4.13 (November 2026) <span v-if="isYours('2.4.13')" class="yourVersion">Your version</span></h2>
      <p>When there is no internet, the location shows "(No internet)" and is tried again when you are back online. Some technical improvements.</p>

      <h2>Version 2.4.12 (November 2026) <span v-if="isYours('2.4.12')" class="yourVersion">Your version</span></h2>
      <p>Holy Day times stay correct where clocks no longer change for daylight time. South of the equator, that hour is one hour later during daylight time.</p>

      <h2>Version 2.4.11 (November 2026) <span v-if="isYours('2.4.11')" class="yourVersion">Your version</span></h2>
      <p>Song links on the Count page, for verses that have been set to music.</p>

      <h2>Version 2.4.10 (November 2026) <span v-if="isYours('2.4.10')" class="yourVersion">Your version</span></h2>
      <p>Place names work again.</p>

      <h2>Version 2.4.9 (October 2026) <span v-if="isYours('2.4.9')" class="yourVersion">Your version</span></h2>
      <p>The Count page adds the prayer for the deliverance of the loved ones, repeated nine times. Long verses fit on the page.</p>

      <h2>Version 2.4.8 (October 2026) <span v-if="isYours('2.4.8')" class="yourVersion">Your version</span></h2>
      <p>Some technical improvements.</p>

      <h2>Version 2.4.7 (October 2026) <span v-if="isYours('2.4.7')" class="yourVersion">Your version</span></h2>
      <p>A missing page says it was not found. www.wondrous-badi.today opens wondrous-badi.today. Some technical improvements.</p>

      <h2>Version 2.4.6 (October 2026) <span v-if="isYours('2.4.6')" class="yourVersion">Your version</span></h2>
      <p>On iPhone and iPad, the app explains how to add it to the Home Screen, and notifications work from that Home Screen app. Typing in a field no longer zooms the page, and the header colour fills the top of the screen. Coming back to the app refreshes the date. If the location lookup is blocked or fails, a message says so. The day's notification is not posted again each time you open the app.</p>

      <h2>Version 2.4.5 (October 2026) <span v-if="isYours('2.4.5')" class="yourVersion">Your version</span></h2>
      <p>The installed Android app starts on a dark screen that matches the bar under the tabs. Some technical improvements.</p>

      <h2>Version 2.4.4 (October 2026) <span v-if="isYours('2.4.4')" class="yourVersion">Your version</span></h2>
      <p>In the installed Android app, the strip under the tabs is a neutral dark colour that suits every palette. Reinstall the app to see it.</p>

      <h2>Version 2.4.3 (October 2026) <span v-if="isYours('2.4.3')" class="yourVersion">Your version</span></h2>
      <p>Show Now asks for permission if notifications are not allowed yet. In the installed Android app, the strip under the tabs matches your colours.</p>

      <h2>Version 2.4.2 (October 2026) <span v-if="isYours('2.4.2')" class="yourVersion">Your version</span></h2>
      <p>Some technical improvements.</p>

      <h2>Version 2.4.1 (October 2026) <span v-if="isYours('2.4.1')" class="yourVersion">Your version</span></h2>
      <p>Page visits are counted without cookies. Some technical improvements.</p>

      <h2>Version 2.4 (October 2026) <span v-if="isYours('2.4')" class="yourVersion">Your version</span></h2>
      <p>Choose a colour palette, and Light, Dark, or Auto, on Today and in Other Settings.</p>

      <h2>Version 2.3 (October 2026) <span v-if="isYours('2.3')" class="yourVersion">Your version</span></h2>
      <p>Easier with a screen reader and the keyboard. Other Settings adds colour palettes and what is spoken while you count.</p>

      <h2>Version 2.2 (October 2026) <span v-if="isYours('2.2')" class="yourVersion">Your version</span></h2>
      <p>The Count page uses the same counter as Today, with no back button or page heading.</p>

      <h2>Version 2.1 (October 2026) <span v-if="isYours('2.1')" class="yourVersion">Your version</span></h2>
      <p>Each verse on the Count page keeps its own count.</p>

      <h2>Version 2.0 (October 2026) <span v-if="isYours('2.0')" class="yourVersion">Your version</span></h2>
      <p>Pinch to zoom, and browser zoom, both work. Some technical improvements.</p>

      <h2>Version 1.21 (June 2023) <span v-if="isYours('1.21')" class="yourVersion">Your version</span></h2>
      <p>Old links are gone, and the date list is clearer.</p>
    </div>
    <p class="docBack">
      <router-link to="/">Back to the app</router-link>
      · <router-link to="/guide">Guide to this website</router-link>
    </p>
  </article>
</template>
<style src="./DocPage.css"></style>
<script>
// Version notes live in this file, not on the About page.
// For a new release, add a heading at the top of .versions (newest first)
// and the same number at the top of listedVersions.
// Write what people will notice, in short sentences. Fold the rest into
// "Some technical improvements."
import versionInfo from '../../root/version.json'
import { reloadWithNotice } from '../scripts/swHandler'
import { compareVersions } from '../scripts/versionCompare.js'

const listedVersions = [
    '2.5.0',
    '2.4.13',
    '2.4.12',
    '2.4.11',
    '2.4.10',
    '2.4.9',
    '2.4.8',
    '2.4.7',
    '2.4.6',
    '2.4.5',
    '2.4.4',
    '2.4.3',
    '2.4.2',
    '2.4.1',
    '2.4',
    '2.3',
    '2.2',
    '2.1',
    '2.0',
    '1.21'
]

export default {
  data() {
    return {
      title: 'Change log',
      icon: 'history'
    }
  },
  computed: {
    running() {
      return versionInfo.version
    },
    newerAvailable() {
      return listedVersions.length > 0 && compareVersions(this.running, listedVersions[0]) < 0
    }
  },
  methods: {
    isYours(version) {
      return compareVersions(version, this.running) === 0
    },
    reload() {
      try {
        navigator.serviceWorker.controller.postMessage('reloading')
      } catch (error) {
        // ignore errors
      }
      reloadWithNotice('Reloading…')
      return false
    }
  }
}
</script>
