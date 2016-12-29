<template>
  <article class="layout-padding">
    <h3>{{this.title}}</h3>
  </article>
</template>
<script>
  export default {
    data() {
      return {
        title: 'Home Test',
      }
    },
    computed: {
      position() {
        return null;
      }
    },
    methods: {
      move(event) {}
    },
    mounted() {
      this.$nextTick(() => {})
    },
    beforeDestrxoy() {}
  }

</script>
