<template>
  <div class="themeChooser">
    <fieldset class="themeChoices">
      <legend class="themeLegend">{{ $msg('paletteHeading') }}</legend>
      <div class="themeOptions">
        <label v-for="p in palettes"
               v-bind:key="p.id"
               class="themeChoice"
               v-bind:class="{ active: palette === p.id }">
          <input type="radio"
                 v-bind:name="idPrefix + 'Palette'"
                 v-bind:value="p.id"
                 v-model="palette">
          <span class="themeSwatch"
                aria-hidden="true"
                v-bind:style="{ background: dark ? p.dark : p.color }"></span>
          <span>{{ $msg(p.nameKey) }}</span>
        </label>
      </div>
    </fieldset>
    <fieldset class="themeChoices" v-bind:aria-describedby="idPrefix + 'ModeHint'">
      <legend class="themeLegend">{{ $msg('themeModeHeading') }}</legend>
      <div class="themeOptions">
        <label v-for="m in modes"
               v-bind:key="m.id"
               class="themeChoice"
               v-bind:class="{ active: mode === m.id }">
          <input type="radio"
                 v-bind:name="idPrefix + 'Mode'"
                 v-bind:value="m.id"
                 v-model="mode">
          <span>{{ $msg(m.nameKey) }}</span>
        </label>
      </div>
      <p v-bind:id="idPrefix + 'ModeHint'" class="themeHint">{{ $msg('themeModeHint') }}</p>
    </fieldset>
  </div>
</template>
<script>
// Palette and Light / Dark / Auto choices, used on the Theme card (Today) and
// in Other Settings. Changes apply at once. markChosen: a change made here
// also counts as the visitor choosing a theme (Settings); the Theme card asks
// for an explicit confirm instead.
import { PALETTES, MODES, currentPaletteId, currentMode, effectiveMode, setPalette, setMode, setThemeChosen } from '../scripts/palette'

export default {
  name: 'ThemeChooser',
  props: {
    idPrefix: { type: String, default: 'theme' },
    markChosen: { type: Boolean, default: false }
  },
  data() {
    return {
      palettes: PALETTES,
      modes: MODES,
      palette: currentPaletteId(),
      mode: currentMode(),
      dark: effectiveMode() === 'dark'
    }
  },
  mounted() {
    this._onTheme = () => {
      this.palette = currentPaletteId()
      this.mode = currentMode()
      this.dark = effectiveMode() === 'dark'
    }
    window.addEventListener('themechange', this._onTheme)
  },
  beforeUnmount() {
    window.removeEventListener('themechange', this._onTheme)
  },
  watch: {
    palette(id) {
      if (id === currentPaletteId()) return
      setPalette(id)
      if (this.markChosen) setThemeChosen()
    },
    mode(id) {
      if (id === currentMode()) return
      setMode(id)
      this.dark = effectiveMode() === 'dark'
      if (this.markChosen) setThemeChosen()
    }
  }
}
</script>
