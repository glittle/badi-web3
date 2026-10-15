<template>
  <div class="q-toggle">
    <!-- Quasar hides this input, so it has to cover the switch or clicks do nothing. -->
    <input type="checkbox" :checked="!!modelValue" @change="onChange">
    <div></div>
    <i v-if="icon">{{ icon }}</i>
  </div>
</template>
<script>
export default {
  name: 'QToggle',
  props: {
    modelValue: { default: false },
    icon: { type: String, default: '' }
  },
  emits: ['update:modelValue'],
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
