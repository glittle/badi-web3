<template>
  <article class="layout-padding About">
    <h1>{{this.title}}</h1>
    <p>This web app is all about the Wondrous calendar!</p>
    <p>It is developed and maintained by Glen Little (<a href="mailto:glen.little@gmail.com">email</a>). Please share suggestions
      and comments with him!</p>
    <p><span>Version {{version}}</span></p>
    <iframe class="statusDoc" src="https://docs.google.com/document/d/1Q1RtnOocBjW917CHceBbJPSljlDSN5GaZLBp5pu2inA/pub?embedded=false"></iframe>
  </article>
</template>
<style>
  .statusDoc {
    margin: 25px 0 0 0;
    width: 100%;
    height: 100%;
    box-sizing: content-box;
    box-shadow: 1px 3px 4px 0px black;
    border: none;
  }

</style>
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
