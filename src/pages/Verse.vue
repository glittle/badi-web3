<template>
  <article class="layout-padding">
    <p class="verse">
      <span class="verseText">{{verse}}</span>
      <span class="suffix">{{suffix}}</span>
    </p>
    <div class="speakButtons">
      <button id="btnRead" class="push small" v-if="online" @click="speak">
          <i>record_voice_over</i>
        </button>
    </div>
    <p class="source">
      A verse for this date from <cite>Reciting the Verses of God</cite>
      <br> by Shahin Vafai & Dwight W. Allen.
    </p>
    <div class="reciting">
      <div></div>
    </div>
  </article>
</template>
<script>
  import verses from '../assets/verses.json'
  import moment from 'moment'
  // import talk from '../scripts/talkify'
  // require('../scripts/talkify')

  export default {
    name: 'verse', // for Vue debugger
    data() {
      return {
        title: "Bahá'í Verse for Today",
        icon: 'import_contacts',
        verse: '',
        suffix: '',
        online: false// tts not working...  navigator.onLine
      }
    },
    created() {
      this.showToday()
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
      },
      speak() {
        // var P = talk.Player;
        // var x = new P()
        //   .forceVoice('Microsoft Hazel Desktop');

        // x.playText('Hello world')

        // var player = new TtsPlayer()
        //   // .withTextHighlighting()
        //   .forceVoice('Microsoft Hazel Desktop');

        // var talkify = new talkifyPlaylist()
        //   .begin()
        //   .usingPlayer(player)
        //   // .withTextInteraction()
        //   .withElements($('.verseText'))
        //   .build()
        //   .play();
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
    /*font-family: 'Gentium Book Basic', serif;*/
    line-height: 1.3;
  }
  
  .suffix {
    font-size: 1rem;
    white-space: nowrap;
  }
  
  .source {
    margin-top: 4em;
    margin-bottom: 0;
    font-size: 0.75rem;
    line-height: normal;
    color: grey;
    text-align: center;
  }
  
  .reciting {
    display: flex;
    justify-content: center;
  }
  
  .reciting div {
    background-image: url('~assets/reciting.jpg');
    width: 200px;
    height: 150px;
    box-shadow: 0 0 8px 8px white inset;
    margin-left: 1px;
  }

</style>
