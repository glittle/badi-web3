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
    <h4>Coming Soon</h4>
    <ul>
      <li>List Bahá'í Feast and Holy Day dates </li>
      <li>Work off-line for Chrome on desktops and Android</li>
      <li>Showcase the monthly calendars produced by Joe Paczkowski</li>
      <li>Multi-lingual</li>
    </ul>
    <h4>Recent Changes</h4>
    <dl>
      <dt>19 Questions 173 - 28 December 2016</dt>
      <dd>
        <ul>
          <li>First version that works! :)</li>
        </ul>
      </dd>
    </dl>
  </article>
</template>
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
