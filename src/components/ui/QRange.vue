<template>
  <div
    class="q-range"
    role="slider"
    :aria-valuemin="min"
    :aria-valuemax="max"
    :aria-valuenow="numeric"
    tabindex="0"
    @pointerdown="onDown"
    @keydown="onKey"
  >
    <div class="q-range-handle-container">
      <div class="q-range-track"></div>
      <div class="q-range-track active-track" :style="{ width: pct + '%' }"></div>
      <div
        class="q-range-handle"
        :class="{ dragging: dragging, 'handle-at-minimum': numeric <= min }"
        :style="{ left: pct + '%' }"
      ></div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'QRange',
  props: {
    modelValue: { default: 0 },
    min: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
    step: { type: Number, default: 1 }
  },
  emits: ['update:modelValue'],
  data() {
    return { dragging: false }
  },
  computed: {
    numeric() {
      const n = Number(this.modelValue)
      return Number.isFinite(n) ? n : this.min
    },
    pct() {
      const span = this.max - this.min
      if (!span) return 0
      return ((this.numeric - this.min) / span) * 100
    }
  },
  methods: {
    snap(value) {
      const step = this.step || 1
      let n = this.min + Math.round((value - this.min) / step) * step
      if (n < this.min) n = this.min
      if (n > this.max) n = this.max
      const decimals = (String(step).split('.')[1] || '').length
      return Number(n.toFixed(decimals))
    },
    valueFromEvent(event) {
      const box = this.$el.getBoundingClientRect()
      const x = Math.min(Math.max(event.clientX - box.left, 0), box.width)
      const ratio = box.width ? x / box.width : 0
      return this.snap(this.min + ratio * (this.max - this.min))
    },
    onDown(event) {
      if (event.pointerType === 'touch' && !event.isPrimary) return
      this.dragging = true
      this.$emit('update:modelValue', this.valueFromEvent(event))
      window.addEventListener('pointermove', this.onMove)
      window.addEventListener('pointerup', this.onUp)
    },
    onMove(event) {
      if (!this.dragging) return
      this.$emit('update:modelValue', this.valueFromEvent(event))
    },
    onUp() {
      this.dragging = false
      window.removeEventListener('pointermove', this.onMove)
      window.removeEventListener('pointerup', this.onUp)
    },
    onKey(event) {
      if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
        this.$emit('update:modelValue', this.snap(this.numeric + this.step))
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
        this.$emit('update:modelValue', this.snap(this.numeric - this.step))
      }
    }
  },
  beforeUnmount() {
    this.onUp()
  }
}
</script>
