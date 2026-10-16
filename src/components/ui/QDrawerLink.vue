<template>
  <router-link class="item item-link" :to="dest">
    <i v-if="!iconIsImage" class="item-primary" aria-hidden="true">{{ icon }}</i>
    <img v-else class="item-primary" :src="icon" alt="">
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
    }
  }
}
</script>
