<template>
  <div class="q-layout layout">
    <a class="skipLink" href="#main" @click.prevent="skipToMain">{{ $msg('a11ySkipToContent') }}</a>
    <header class="layout-header">
      <slot name="header"></slot>
    </header>
    <main id="main" class="layout-content">
      <slot></slot>
    </main>
    <footer class="layout-footer">
      <slot name="footer"></slot>
    </footer>
  </div>
</template>
<script>
export default {
  name: 'QLayout',
  methods: {
    // A hash link would change the route, so move focus by script.
    skipToMain() {
      const main = document.getElementById('main')
      const heading = main && Array.from(main.querySelectorAll('[data-page-heading]'))
        .find(function (el) { return el.closest('.layout-view') && el.closest('.layout-view').offsetParent !== null })
      const target = heading || main
      if (!target) return
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
      target.focus()
    }
  }
}
</script>
