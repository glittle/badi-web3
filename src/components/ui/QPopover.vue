<template>
  <span ref="anchor" class="q-popover-anchor"></span>
  <teleport to="body">
    <div
      v-show="open"
      ref="panel"
      :id="panelId"
      class="q-popover"
      role="dialog"
      :aria-label="label || null"
      :style="style"
      @click.stop
      @focusout="onFocusOut"
    >
      <slot></slot>
    </div>
  </teleport>
</template>
<script>
let popoverCount = 0

export default {
  name: 'QPopover',
  props: {
    label: { type: String, default: '' }
  },
  data() {
    popoverCount += 1
    return {
      open: false,
      panelId: 'qPopover' + popoverCount,
      style: { left: '0px', top: '0px' }
    }
  },
  watch: {
    open(value) {
      if (this.trigger) this.trigger.setAttribute('aria-expanded', value ? 'true' : 'false')
    }
  },
  mounted() {
    this.trigger = this.$refs.anchor.parentElement
    if (this.trigger) {
      this.trigger.setAttribute('aria-haspopup', 'dialog')
      this.trigger.setAttribute('aria-expanded', 'false')
      this.trigger.setAttribute('aria-controls', this.panelId)
    }
    this.onTrigger = (event) => {
      event.stopPropagation()
      if (this.open) {
        this.close()
      } else {
        this.show()
      }
    }
    this.onDoc = (event) => {
      if (!this.open) return
      if (this.$refs.panel && this.$refs.panel.contains(event.target)) return
      if (this.trigger && this.trigger.contains(event.target)) return
      this.close()
    }
    this.onKey = (event) => {
      if (event.key !== 'Escape' || !this.open) return
      const inside = this.$refs.panel && this.$refs.panel.contains(document.activeElement)
      this.close()
      if (inside || document.activeElement === document.body) this.returnFocus()
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
    // Tabbing out of the menu closes it.
    onFocusOut(event) {
      const next = event.relatedTarget
      if (!next) return
      if (this.$refs.panel && this.$refs.panel.contains(next)) return
      if (this.trigger && this.trigger.contains(next)) return
      this.close()
    },
    returnFocus() {
      if (this.trigger && typeof this.trigger.focus === 'function') this.trigger.focus()
    },
    close() {
      this.open = false
    },
    show() {
      this.open = true
      this.$nextTick(() => {
        this.position()
        const first = this.$refs.panel && this.$refs.panel.querySelector('a[href], button:not([disabled]), [tabindex="0"]')
        if (first) first.focus()
      })
    }
  }
}
</script>
