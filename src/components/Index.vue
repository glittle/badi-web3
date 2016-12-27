<template>
  <q-layout>
    <div slot="header" class="toolbar">
      <q-toolbar-title :padding="1">
        Quasar Framework v{{quasarVersion}}
      </q-toolbar-title>
    </div>

  </q-layout>
</template>

<script>
import Quasar, { Utils } from 'quasar'

export default {
  data () {
    return {
      path: '/',
      title: 'Home Test',
      quasarVersion: Quasar.version
    }
  },
  computed: {
    position () {
      return null;
    }
  },
  methods: {
    move (event) {
    }
  },
  mounted () {
    this.$nextTick(() => {
    })
  },
  beforeDestroy () {
  }
}
</script>
