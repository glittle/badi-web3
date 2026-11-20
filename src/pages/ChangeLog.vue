<template>
  <article class="layout-padding docPage">
    <h1 data-page-heading>Change log</h1>
    <p>What's new in each version of <router-link to="/">Wondrous-Badi.Today</router-link>, newest first. The version you are using is shown on the site's About page.</p>
    <div class="versions">
      <h2>Version 2.4.14 (November 2026)</h2>
      <p>The app opens faster. Lettering and icons load without holding up the first paint, less unused code is downloaded on the first page, and the share code is a smaller image.</p>

      <h2>Version 2.4.13 (November 2026)</h2>
      <p>Search engines and other automated visitors see today's date, Holy Days and Feasts instead of the first-time location page. A plain-text guide for AI agents is at /llms.txt. When a place name can't be looked up because there is no internet, the location shows "(No internet)" and is tried again when the connection returns.</p>

      <h2>Version 2.4.12 (November 2026)</h2>
      <p>Holy Days kept at a standard-time hour, including the Ascension of ʿAbdu'l-Bahá at 1:00 am, stay at that hour where clocks no longer change for daylight time. South of the equator, that hour follows local standard time, so it is one hour later during daylight time.</p>

      <h2>Version 2.4.11 (November 2026)</h2>
      <p>Count page: song links under verses that have been set to music. Each one opens in the YouTube app or a new tab.</p>

      <h2>Version 2.4.10 (November 2026)</h2>
      <p>Location: place names now come from the site's own server (using OpenStreetMap), because the old Google lookup stopped working.</p>

      <h2>Version 2.4.9 (October 2026)</h2>
      <p>Count page: added the prayer for the deliverance of the loved ones (repeated nine times). The Count page drops the top date bar and uses a smaller font and narrower margins, so long verses fit.</p>

      <h2>Version 2.4.8 (October 2026)</h2>
      <p>The first-visit location guess now comes from the site's own server instead of a third-party lookup service.</p>

      <h2>Version 2.4.7 (October 2026)</h2>
      <p>Site tidy-ups: home-screen and browser icons are at the standard addresses, missing files now report "not found" instead of loading the app, and www.wondrous-badi.today goes to wondrous-badi.today.</p>

      <h2>Version 2.4.6 (October 2026)</h2>
      <p>iPhone and iPad: instructions for adding the app to the Home Screen, a clearer note that notifications need the Home Screen app on iOS 16.4 or later, no page zoom when typing in a field, and the header colour fills the notch area. The app refreshes the date and checks for updates when you come back to it. A friendly message appears if the location lookup is blocked or fails. The notification is no longer posted again each time the app opens on the same day.</p>

      <h2>Version 2.4.5 (October 2026)</h2>
      <p>Installed Android app: a dark start-up (splash) screen to match the dark strip below the bottom bar. The app always fetches a fresh copy of its app settings (manifest), so a reinstall never picks up old colours.</p>

      <h2>Version 2.4.4 (October 2026)</h2>
      <p>Installed Android app: the strip below the bottom bar is now a neutral dark colour instead of blue, so it suits every colour palette. Reinstall the app to see it straight away.</p>

      <h2>Version 2.4.3 (October 2026)</h2>
      <p>Show Now on the Notifications page asks for permission if needed. In the installed Android app, the strip below the bottom bar now matches your colours.</p>

      <h2>Version 2.4.2 (October 2026)</h2>
      <p>Removed an old, unused push-messaging library, for a smaller, faster download.</p>

      <h2>Version 2.4.1 (October 2026)</h2>
      <p>Page-view statistics now use Vercel Web Analytics (no cookies), replacing the old statistics service that Google retired.</p>

      <h2>Version 2.4 (October 2026)</h2>
      <p>Theme: choose a colour palette and Light, Dark or Auto (follows your device), on the Today page and in Other Settings.</p>

      <h2>Version 2.3 (October 2026)</h2>
      <p>Easier to use with screen readers and the keyboard. Colour palettes and counter announcements were added to Other Settings.</p>

      <h2>Version 2.2 (October 2026)</h2>
      <p>The Count page uses the Today page's counter layout, without a back button or page heading.</p>

      <h2>Version 2.1 (October 2026)</h2>
      <p>A verse carousel beside the 95 counter, with a separate count for each verse.</p>

      <h2>Version 2.0 (October 2026)</h2>
      <p>Rebuilt on Vue 3 and Vite. Pinch-zoom and browser zoom now work.</p>

      <h2>Version 1.21 (June 2023)</h2>
      <p>Removed old links and improved the date listing.</p>
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
// For a new release, add a section at the top of .versions (newest first).
export default {
  data() {
    return {
      title: 'Change log',
      icon: 'history'
    }
  }
}
</script>
