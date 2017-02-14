<template>
  <div class="About">
    <article class="layout-padding">
      <div class=ShareThis>
        <h2>Share this App!</h2>
        <img class=qr src="~statics/qr.png">
        <a href="https://www.wondrous-badi.today/" itemprop="url">
          <span>Open in any web browser:</span>
          <span class=underline>Wondrous-Badi.Today</span>
        </a>
      </div>
      <h1>{{this.title}}</h1>
      <p>This web app is all about the <span itemprop="applicationCategory">Wondrous calendar</span>! It is free to use - share
        it with others!</p>
      <p>It is developed and maintained by
        <span itemprop="author" itemscope itemtype="http://schema.org/Person">
        <span itemprop="name">Glen Little</span>.</span>
        Please share suggestions and comments with him (<a href="mailto:glen.little@gmail.com">email</a>) and considering
        becoming a development patron! Visit
        <a href="https://patreon.com/GlenLittle" target="_blank"><img class="pat" src="https://www.patreon.com/images/patreon_navigation_logo_mini_orange.png"> Patreon.com/GlenLittle
        </a> for details!
      </p>
      <p>
        <span>Version <span itemprop="softwareVersion">{{version}}</span> ({{versionAge}} - <span class="reload" v-on:click="reload">reload now</span>)</span>
      </p>
    </article>
    <iframe class="statusDoc" src="https://docs.google.com/document/d/1Q1RtnOocBjW917CHceBbJPSljlDSN5GaZLBp5pu2inA/pub?embedded=false"></iframe>
  </div>
</template>
<style src="./About.vue.css"></style>
<script>
  const moment = require('moment-timezone');
  var versionInfo = require('../../root/version.json')

  export default {
    data() {
      return {
        title: 'About',
        icon: 'info'
      }
    },
    computed: {
      version() {
        return versionInfo.version;
      },
      versionAge() {
        var age = moment(versionInfo.buildDate, "_ MMM D YYYY HH:mm:ss _Z").fromNow();
        return age;
      }
    },
    methods: {
      reload() {
        window.location.reload();
        return false;
      }
    }
  }

</script>
