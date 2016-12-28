<template>
  <q-layout>
    <div slot="header" class="toolbar">
      <q-toolbar-title :padding="1">
        Index
      </q-toolbar-title>
    </div>
  </q-layout>
</template>

<script>

export default {
  data () {
    return {
      title: 'Home Test',
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
