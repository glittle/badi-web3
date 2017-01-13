<template>
  <article class="layout-padding Verse">
    <div class="verseHost">
      <div class="verseText" v-html="verse"></div>
      <div class="suffix" v-html="suffix"></div>
      <div class="webSearch" v-if="online">
        <a target="_blank" v-bind:href="searchUrl">
          <i>search</i> Find this verse on the Internet
        </a>
      </div>
      <div class="speakButtons">
        <button id="btnRead" class="push small" v-show="offerVoice" @click="speak">
          <i>record_voice_over</i>
        </button>
      </div>
    </div>
    <p class="source">
      A verse for {{timeOfDay}}
      <br>from <cite>Reciting the Verses of God</cite>
      <br>compiled by Shahin Vafai & Dwight W. Allen.
    </p>
    <div class="reciting">
      <div></div>
    </div>
  </article>
</template>
<style src="./Verse.vue.css"></style>
<script>
  import verses from '../assets/verses.json'
  import moment from 'moment'
  // import talk from '../scripts/talkify'
  import badiCalc from '../scripts/badiCalc'

  export default {
    name: 'verse', // for Vue debugger
    data() {
      return {
        title: "Verse",
        icon: '../statics/verseWhite.png',
        verse: '',
        suffix: '',
        timeOfDay: '',
        offerVoice: false, // tts not working...  // navigator.onLine
        online: navigator.onLine,
        player: null
      }
    },
    created() {
      this.showToday()
    },
    computed: {
      searchUrl: function () {
        return 'https://www.google.com/search?q=' +
          "Bahá'u'lláh+" +
          this.verse.replace(/ /g, '+') +
          '+youtube' // hint to find at youtube
      },
    },
    mounted: function () {
      // this.player = talk.player();
    },
    methods: {
      showToday() {
        var now = moment();
        var key = now.format('M.D');
        var dayVerses = verses[key];
        if (dayVerses) {
          // var hour = now.hour();
          // var isAm = hour < 12;
          var isEve = badiCalc.di.bNow.eve;
          this.timeOfDay = (isEve ? 'the evening' : 'the morning') + ' of ' + now.format("MMMM D")

          var verseInfo = dayVerses[isEve ? 'pm' : 'am'];
          // TODO: use sunset information for today
          if (verseInfo) {
            this.suffix = `Bahá'u'lláh, ${verseInfo.r}`;
            this.verse = verseInfo.q;
          }
        }
      },
      speak() {
        // console.log(badiCalc.di.bMonth)
        this.player.playText('Hello world')

        // var P = talk.Player;
        // var x = new P()
        //   .forceVoice('Microsoft Hazel Desktop');


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
