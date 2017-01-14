// import moment from 'moment'
// import talk from '../scripts/talkify'
import badiCalc from '../scripts/badiCalc'
import verseHelper from '../scripts/verseHelper'

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
      var info = verseHelper.forDi(di);
      if (info.verse) {
        var isEve = di.bNow.eve;
        this.timeOfDay = (isEve ? 'the evening' : 'the morning') + ' of {currentMonthLong} {currentDay}'.filledWith(di)
        this.suffix = info.suffix;
        this.verse = info.verse;
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
