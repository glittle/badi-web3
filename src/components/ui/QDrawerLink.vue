<template>
  <router-link class="item item-link" :to="dest">
    <i v-if="!iconIsImage" class="item-primary" aria-hidden="true">{{ icon }}</i>
    <img v-else class="item-primary" :src="icon" alt="" :width="iconSize.width" :height="iconSize.height">
    <div class="item-content">
      <slot></slot>
    </div>
  </router-link>
</template>
<script>
export default {
  name: 'QDrawerLink',
  props: {
    icon: { type: String, default: '' },
    to: { type: String, default: '/' }
  },
  computed: {
    dest() {
      if (!this.to || this.to === '/') return '/'
      return this.to.charAt(0) === '/' ? this.to : '/' + this.to
    },
    iconIsImage() {
      return this.icon.indexOf('/') >= 0 || this.icon.indexOf('.') >= 0
    },
    iconSize() {
      return imageSize(this.icon)
    }
  }
}

// Intrinsic pixel size of each footer/menu image. The CSS height is fixed
// and width is auto, so these only reserve the real aspect ratio.
const IMAGE_SIZES = {
  '/statics/sunWhite.png': [64, 64],
  '/statics/calendarWhite.png': [64, 64],
  '/statics/verseWhite.png': [64, 64],
  '/statics/counter95.svg': [64, 64],
  '/statics/calendar.png': [64, 64],
  '/statics/sunset.png': [64, 64],
  '/statics/sunrise.png': [64, 64],
  '/statics/star.png': [64, 64],
  '/statics/sun.png': [64, 64],
  '/statics/verse.png': [64, 64],
  '/statics/qr.png': [200, 200],
  '/statics/patreon.png': [124, 40],
  '/statics/video.svg': [20, 20],
  '/statics/divider.png': [44, 26],
  '/statics/pdf.png': [48, 48],
  '/statics/web.png': [20, 20]
}

function imageSize(src) {
  const known = IMAGE_SIZES[src]
  if (known) return { width: known[0], height: known[1] }
  return { width: null, height: null }
}
</script>
<style>
/* Quasar sets both axes to 40px, which stretches a non-square file.
   Height stays 40; width follows the file's aspect ratio. */
a.item > img.item-primary {
  width: auto;
  height: 40px;
}
</style>
