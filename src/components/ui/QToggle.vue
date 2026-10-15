<template>
  <div class="q-toggle">
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
