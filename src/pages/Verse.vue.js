import moment from 'moment'
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
      player: null,
      historyStack: [badiCalc.di],
      historyIndex: 0,
      originalStamp: badiCalc.di.stamp
    }
  },
  created() {
    this.showVerse()
    this.addPrevious()

    document.addEventListener('pulsed', this.onPulse, false)
  },
  computed: {
    searchUrl: function () {
      return 'https://www.google.com/search?q=' +
        "Bahá'u'lláh+" +
        this.verse.replace(/ /g, '+') +
        '+youtube' // hint to find at youtube
    },
    canShowNext: function () {
      return this.historyIndex > 0;
    }
  },
  mounted: function () {
    // this.player = talk.player();
  },
  methods: {
    showPrevious() {
      if (this.historyIndex + 1 >= this.historyStack.length) {
        this.addPrevious();
      }

      this.historyIndex++;
      this.showVerse();
    },
    onPulse() {
      // console.log("PULSE")
      var di = badiCalc.di;
      if (di.stamp !== this.originalStamp) {
        // console.log('reset verse history')
        this.historyStack.splice(0);
        this.historyStack.push(di);
        this.historyIndex = 0;
        this.originalStamp = di.stamp;
        this.showVerse();
      }
    },
    showNext() {
      // page starts with current time's verse, and can only go backwards
      // each time we move back, store the old DI and use it here
      if (this.historyIndex > 0) {
        this.historyIndex--;
        this.showVerse()
      }
    },
    showVerse() {
      var thisDi = this.historyStack[this.historyIndex];
      var info = verseHelper.forDi(thisDi);
      if (info.verse) {
        // console.log(info, thisDi.bNow)
        this.timeOfDay = (thisDi.bNow.eve ? 'the evening' : 'the morning') + ' of {currentMonthLong} {currentDay}'.filledWith(thisDi)
        this.suffix = info.suffix;
        this.verse = info.verse;
      }
    },
    addPrevious: function () {
      var newDi = {};
      // console.log('add prev')
      var showing = this.historyStack[this.historyIndex];
      if (showing.bNow.eve) {
        var noon = moment(showing.currentTime).set({
          hour: 12
        });
        badiCalc.generateDateInfo(newDi, noon.toDate())
      } else {
        // move to previous eve
        var almostMidnight = moment(showing.frag1).set({
          hour: 23,
          minute: 55
        });
        badiCalc.generateDateInfo(newDi, almostMidnight.toDate())
      }
      this.historyStack.push(newDi);
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
