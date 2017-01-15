<template>
  <div class="About">
    <article class="layout-padding">
      <div class=ShareThis>
        <h2>Share this App!</h2>
        <img class=qr src="~statics/qr.png">
        <a href="https://www.wondrous-badi.ga/">
          <span>Open in your web browser</span>
          <span class=underline>Wondrous-Badi.ga</span>
        </a>
      </div>
      <h1>{{this.title}}</h1>
      <p>This web app is all about the Wondrous calendar!</p>
      <p>It is developed and maintained by Glen Little (<a href="mailto:glen.little@gmail.com">email</a>). Please share suggestions
        and comments with him!</p>
      <p><span>Version {{version}}</span></p>
    </article>
    <iframe class="statusDoc" src="https://docs.google.com/document/d/1Q1RtnOocBjW917CHceBbJPSljlDSN5GaZLBp5pu2inA/pub?embedded=false"></iframe>
  </div>
</template>
<style src="./About.vue.css"></style>
<script>
  const moment = require('moment-timezone');
  var versionInfo = require('../../version.json')

  export default {
    data() {
      return {
        title: 'About',
        icon: 'info'
      }
    },
    computed: {
      version() {
        var age = moment(versionInfo.buildDate, "_ MMM D YYYY HH:mm:ss _Z").fromNow();
        return '{0} ({1})'.filledWith(versionInfo.version, age)
      }
    }
  }

</script>
