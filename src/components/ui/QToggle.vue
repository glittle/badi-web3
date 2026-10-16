<template>
  <div class="q-toggle" :class="$attrs.class" :style="$attrs.style">
    <!-- Quasar hides this input, so it has to cover the switch or clicks do nothing.
         Other attributes (id, aria-label) go on the input so it has a name. -->
    <input type="checkbox" role="switch" v-bind="inputAttrs" :checked="!!modelValue" @change="onChange">
    <div></div>
    <i v-if="icon" aria-hidden="true">{{ icon }}</i>
  </div>
</template>
<script>
export default {
  name: 'QToggle',
  inheritAttrs: false,
  props: {
    modelValue: { default: false },
    icon: { type: String, default: '' }
  },
  emits: ['update:modelValue'],
  computed: {
    inputAttrs() {
      const attrs = Object.assign({}, this.$attrs)
      delete attrs.class
      delete attrs.style
      return attrs
    }
  },
  methods: {
    onChange(event) {
      this.$emit('update:modelValue', event.target.checked)
    }
  }
}
</script>
<style>
/* The material stylesheet sets display:none on the checkbox, which also
   drops it out of hit testing. Cover the switch so the click reaches it.
   The :checked styles still come from that same input. */
.q-toggle input {
  display: block;
  position: absolute;
  opacity: 0;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  cursor: pointer;
}
</style>
