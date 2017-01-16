<template>
  <div class="About">
    <article class="layout-padding">
      <div class=ShareThis>
        <h2>Share this App!</h2>
        <img class=qr src="~statics/qr.png">
        <a href="https://www.wondrous-badi.ga/" itemprop="url">
          <span>Open in your web browser</span>
          <span class=underline>Wondrous-Badi.ga</span>
        </a>
      </div>
      <h1>{{this.title}}</h1>
      <p>This web app is all about the <span itemprop="applicationCategory">Wondrous calendar</span>!</p>
      <p>It is developed and maintained by
        <span itemprop="author" itemscope itemtype="http://schema.org/Person">
        <span itemprop="name">Glen Little</span> (<a href="mailto:glen.little@gmail.com">email</a>).</span>
        Please share suggestions and comments with him! 
      </p>
      <p class="pp">
        <a href="https://www.paypal.me/GlenLittle/19" target="_blank"></a>
        <span>If you find this web app to be useful for making the Wondrous-Badí' 
          calendar a part of your daily life, please click the 
          <a href="https://www.paypal.me/GlenLittle/19" target="_blank">PayPal icon</a> and pay whatever
          you feel is appropriate!
      </p>
      <p><span>Version <span itemprop="softwareVersion">{{version}}</span> ({{versionAge}})</span>
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
    }
  }

</script>
