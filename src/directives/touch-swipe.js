/*
 * Replacement for Quasar 0.13 v-touch-swipe.
 * Listeners are passive and ignore a second finger so pinch-zoom is not cancelled.
 * The handler receives { direction, distance: { x, y } } like the old directive.
 */
export default {
  mounted(el, binding) {
    let startX = 0
    let startY = 0
    let tracking = false

    function onStart(event) {
      if (event.touches.length !== 1) {
        tracking = false
        return
      }
      tracking = true
      startX = event.touches[0].clientX
      startY = event.touches[0].clientY
    }

    function onEnd(event) {
      if (!tracking || !event.changedTouches.length) return
      tracking = false
      const touch = event.changedTouches[0]
      const dx = touch.clientX - startX
      const dy = touch.clientY - startY
      if (binding.modifiers.horizontal && Math.abs(dx) <= Math.abs(dy)) return
      if (typeof binding.value !== 'function') return
      binding.value({
        direction: dx < 0 ? 'left' : 'right',
        distance: { x: dx, y: dy }
      })
    }

    el.addEventListener('touchstart', onStart, { passive: true })
    el.addEventListener('touchend', onEnd, { passive: true })
    el.addEventListener('touchcancel', function () { tracking = false }, { passive: true })
    el._badiSwipe = { onStart, onEnd }
  },
  unmounted(el) {
    if (!el._badiSwipe) return
    el.removeEventListener('touchstart', el._badiSwipe.onStart)
    el.removeEventListener('touchend', el._badiSwipe.onEnd)
  }
}
