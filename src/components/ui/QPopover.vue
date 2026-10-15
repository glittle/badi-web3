<template>
  <span ref="anchor" class="q-popover-anchor"></span>
  <teleport to="body">
    <div
      v-show="open"
      ref="panel"
      class="q-popover"
      :style="style"
      @click.stop
    >
      <slot></slot>
    </div>
  </teleport>
</template>
<script>
export default {
  name: 'QPopover',
  data() {
    return {
      open: false,
      style: { left: '0px', top: '0px' }
    }
  },
  mounted() {
    this.trigger = this.$refs.anchor.parentElement
    this.onTrigger = (event) => {
      event.stopPropagation()
      this.open = !this.open
      if (this.open) this.$nextTick(this.position)
    }
    this.onDoc = (event) => {
      if (!this.open) return
      if (this.$refs.panel && this.$refs.panel.contains(event.target)) return
      if (this.trigger && this.trigger.contains(event.target)) return
      this.close()
    }
    this.onKey = (event) => {
      if (event.key === 'Escape') this.close()
    }
    if (this.trigger) this.trigger.addEventListener('click', this.onTrigger)
    document.addEventListener('click', this.onDoc)
    document.addEventListener('keydown', this.onKey)
    window.addEventListener('resize', this.position)
  },
  beforeUnmount() {
    if (this.trigger) this.trigger.removeEventListener('click', this.onTrigger)
    document.removeEventListener('click', this.onDoc)
    document.removeEventListener('keydown', this.onKey)
    window.removeEventListener('resize', this.position)
  },
  methods: {
    position() {
      if (!this.open || !this.trigger || !this.$refs.panel) return
      const rect = this.trigger.getBoundingClientRect()
      const panel = this.$refs.panel
      const width = panel.offsetWidth
      const height = panel.offsetHeight
      let left = rect.right - width
      let top = rect.top - height - 6
      if (left < 8) left = 8
      if (left + width > window.innerWidth - 8) left = window.innerWidth - width - 8
      if (top < 8) top = rect.bottom + 6
      this.style = { left: left + 'px', top: top + 'px' }
    },
    close() {
      this.open = false
    },
    show() {
      this.open = true
      this.$nextTick(this.position)
    }
  }
}
</script>
