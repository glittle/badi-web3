import moment from 'moment'
// import talk from '../scripts/talkify'
import badiCalc from '../scripts/badiCalc'
import verseHelper from '../scripts/verseHelper'
import * as shared from '../scripts/shared'

export default {
    name: 'verse', // for Vue debugger
    props: {
        toggleVerseSpeech: Boolean
    },
    data() {
        return {
            title: "Verse",
            icon: '../statics/verseWhite.png',
            verse: '',
            suffix: '',
            timeOfDay: '',
            offerVoice: ('speechSynthesis' in window), //false, // tts not working...  // navigator.onLine
            volume: shared.speech.volume,
            speechMsg: null,
            speakingNow: false, // could use window.speechSynthesis.speaking but this also cancels next phrase
            // voice: storage.get('voice', ''),
            // voices: [],
            online: navigator.onLine,
            player: null,
            historyStack: [badiCalc.di],
            historyIndex: 0,
            originalStamp: badiCalc.di.stamp
        }
    },
    created() {
        var vue = this;
        window._messageBus.$on('setupDone', function() {
            vue.showVerse()
            vue.addPrevious()
        })
        document.addEventListener('pulsed', vue.onPulse, false)
        if (badiCalc.di && badiCalc.di.stamp) {
            vue.showVerse()
            vue.addPrevious()
        }
    },
    activated() {
        var vue = this;
        if (!badiCalc.di || !badiCalc.di.stamp) {
            vue.$router.push('/');
        }

        // window.speechSynthesis.onvoiceschanged = function () {
        //   vue.fillVoicesList();
        //   window.speechSynthesis.onvoiceschanged = null;
        // }
    },
    computed: {
        searchUrl: function() {
            return 'https://www.google.com/search?q=' +
                "Bahá'u'lláh+youtube+" + // hint to find at youtube
                this.verse.replace(/ /g, '+').replace(/:/g, '')
        },
        canShowNext: function() {
            return this.historyIndex > 0;
        }
    },
    watch: {
        volume: function(a) {
            shared.speech.volume = a;
            // if (this.speechMsg) {
            //   window.speechSynthesis.pause();
            //   this.speechMsg.volume = a / 100;
            //   window.speechSynthesis.resume();
            // }
        },
        toggleVerseSpeech: function() {
                if (this.speakingNow) {
                    this.stopSpeaking()
                } else {
                    this.speak();
                }
            }
            // voice: function (a) {
            //   if (this.speechMsg) {
            //     window.speechSynthesis.pause();
            //     this.speechMsg.voiceURI = a;
            //     window.speechSynthesis.resume();
            //   }
            //   storage.set('voice', a)
            // }
    },
    methods: {
        // fillVoicesList: function () {
        //   if (this.offerVoice) {
        //     var list = window.speechSynthesis.getVoices()
        //       .filter(function (v) { return v.lang.startsWith('en') })
        //       .map(function (v) { return { label: v.name, value: v.voiceURI } });
        //     this.voices = list;
        //     console.log(list);
        //     if (!this.voice) {
        //       this.voice = list[0].value;
        //     };
        //   }
        // },
        showPrevious() {
            var vue = this;
            if (this.historyIndex + 1 >= this.historyStack.length) {
                this.addPrevious();
            }

            vue.$ga.event('verse', 'previous');

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
        addPrevious: function() {
            var newDi = {};
            // console.log('add prev')
            var showing = this.historyStack[this.historyIndex];
            if (!showing.bNow) {
                return;
            }
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
        stopSpeaking() {
            window.speechSynthesis.cancel();
            this.speakingNow = false;
        },
        speak() {
            var vue = this;
            // as per https://bugs.chromium.org/p/chromium/issues/detail?id=679437
            // don't let each one be very long

            var text = '' + this.verse;

            text = text.replace(/["']/g, ' ');
            text = text.replace(/--/g, ',');

            //http://stackoverflow.com/a/36465144/32429
            var parts = text.match(/[^\,\.\;\!]+[\,\.\;\!]?|[\,\.\;\!]/g);

            // ensure none are too long
            const maxLength = 1000; // arbitrary number... need to be less than 15 seconds long
            const midPoint = maxLength / 2;

            for (var i = parts.length - 1; i >= 0; i--) {
                var part = parts[i]
                    // console.log(i, part)
                var offset = 0;
                while (part.length > maxLength) {
                    // get next space after midpoint
                    var breakPoint = part.indexOf(' ', midPoint);

                    var firstPart = part.substring(0, breakPoint);
                    part = part.substring(breakPoint + 1);

                    if (offset) {
                        parts.splice(i + offset++, 0, firstPart)
                    } else {
                        parts[i] = firstPart;
                        offset++;
                    }
                }
                if (offset) {
                    // did some splitting
                    parts.splice(i + offset++, 0, part)
                }
            }
            // console.log(parts);

            if (this.speechMsg) {
                window.speechSynthesis.cancel();
            }

            // var voice = this.voice;
            // console.log(voice);
            var volume = shared.speech.volume / 100;
            console.log('volume', volume)

            var msg = this.speechMsg = new SpeechSynthesisUtterance(parts.splice(0, 1));
            msg.lang = 'en-US';
            msg.volume = volume;
            // msg.voiceURI = voice;
            msg.rate = 0.9;
            msg.onend = function() {
                if (!vue.speakingNow) {
                    return;
                }

                vue.speakingNow = false;
                // read next?
                // console.log('ended')
                if (parts.length) {
                    msg.text = parts.splice(0, 1);
                    // console.log(msg.text);
                    window.speechSynthesis.speak(msg);
                    vue.speakingNow = true;
                }
            };
            window.speechSynthesis.speak(msg);
            vue.speakingNow = true;

            vue.$ga.event('verse', 'speak');

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
        title: function() {
            return {
                inner: this.title
            }
        }
    }
}
