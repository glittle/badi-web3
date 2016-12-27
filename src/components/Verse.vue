<template>
  <div>
    <h1>A Verse for Today</h1>
    <p class="verse">
      <span class="verseText">{{verse}}</span>
      <span class="suffix">{{suffix}}</span>
    </p>
    <button v-on:click="showToday">Refresh</button>
  </div>
</template>
<script>
  import verses from '../assets/verses.json'
  import moment from 'moment'
  export default {
    created() {
      this.showToday()
    },
    data() {
      return {
        path: 'verse',
        title: 'Verses of God',
        verse: '',
        suffix: ''
      }
    },
    methods: {
      showToday() {
        var now = moment();
        var hour = now.hour(); // server time
        var isAm = hour < 12;
        var key = now.format('M.D');
        var dayVerses = verses[key];
        if (dayVerses) {
          var verseInfo = dayVerses[isAm ? 'am' : 'pm'];
          if (verseInfo) {
            this.suffix = `(Bahá'u'lláh, ${verseInfo.r})`;
            this.verse = verseInfo.q;
          }
        }
      }
    }
  }

</script>
<style scoped>
  .verse {
    font-size: 2em;
    padding: .5em;
    font-family: 'Gentium Book Basic', serif;
    line-height: 1.2;
  }
  
  .suffix {
    font-size: .5em;
    white-space: nowrap;
  }

</style>
