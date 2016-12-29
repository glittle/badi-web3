<template>
  <article>
    <p class="verse">
      <span class="verseText">{{verse}}</span>
      <span class="suffix">{{suffix}}</span>
    </p>
    <p class="source">
      A verse for this date from <cite>Reciting the Verses of God</cite>
      <br> by Shahin Vafai & Dwight W. Allen.
    </p>
    <div class="reciting">
      <div>
  </article>
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
        title: 'Verse for Today',
        verse: '',
        suffix: ''
      }
    },
    methods: {
      showToday() {
        var now = moment();
        var key = now.format('M.D');
        var dayVerses = verses[key];
        if (dayVerses) {
          var hour = now.hour(); // server time
          var isAm = hour < 12;
          var verseInfo = dayVerses[isAm ? 'am' : 'pm'];
          // TODO: use sunset information for today
          if (verseInfo) {
            this.suffix = `(Bahá'u'lláh, ${verseInfo.r})`;
            this.verse = verseInfo.q;
          }
        }
      }
    },
    head: {
      title: function () {
        return {
          inner: this.title
        }
      }
    }
  }

</script>
<style scoped>
  .verse {
    font-size: 1.7rem;
    padding: .5em;
    font-family: 'Gentium Book Basic', serif;
    line-height: 1.3;
  }
  
  .suffix {
    font-size: 1rem;
    white-space: nowrap;
  }
  
  .source {
    font-size: 0.75rem;
    line-height: normal;
    color: grey;
    text-align: center;
  }
  
  .reciting {
    margin: 0 auto;
    background-image: url('~assets/reciting.jpg');
    box-shadow: 3px 3px #fcfcfc;
    width: 200px;
    height: 150px;
    /* you need to match the shadow color to your background or image border for the desired effect*/
    box-shadow: 0 0 8px 8px white inset;
  }

</style>
