<template>
  <article class="layout-padding">
    <h1>{{this.title}}</h1>
    <p>This web app is all about the Wondrous calendar!</p>
    <p>It is developed and maintained by Glen Little (<a href="mailto:glen.little@gmail.com">email</a>). Please share suggestions
      and comments with him!</p>
    <h4>Working</h4>
    <ul>
      <li>Show today's date in the Wondrous calendar</li>
      <li>Show today's verse from "Reciting the Verses of God" </li>
      <li>Add today's date to the Android system status bar </li>
      <li>Show today's date as an Android notification</li>
    </ul>
    <iframe class="statusDoc" src="https://docs.google.com/document/d/1Q1RtnOocBjW917CHceBbJPSljlDSN5GaZLBp5pu2inA/pub?embedded=false"></iframe>
  </article>
</template>
<style>
.statusDoc{
  width: 100%;
}
</style>
<script>
  export default {
    data() {
      return {
        title: 'About',
        icon: 'info'
      }
    }
  }

</script>
