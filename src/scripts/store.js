import Es6polyfill from 'es6-promise';
import Vue from 'vue'
import Vuex from 'vuex'
import badiCalc from './badiCalc'

Es6polyfill.polyfill();

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    pulseNum: 1,
    di: {}
  },
  mutations: {
    pulsed(state) {
      state.pulseNum++;
      state.di = badiCalc.di; //TODO integrate into system
      // console.log('dispatch starting');
      document.dispatchEvent(new Event('pulsed'));
      // console.log('dispatch done');
    }
    // ,
    // newDate(state, di) {
    //   state.di = di //TODO integrate into system
    // }
  }
})



// ----------------------------

const pulseSeconds = 60; // normally 60 seconds
var pulseTimer = null;
var lastPulseStamp = null;

function scheduleNextPulse() {
  // start the timer just after the minute
  var nextMinute = new Date();
  //   console.log('start called at ' + nextMinute)

  nextMinute.setHours(nextMinute.getHours(), nextMinute.getMinutes(), nextMinute.getSeconds() + pulseSeconds, 1);
  nextMinute.setSeconds(0);
  var delay = nextMinute.getTime() - new Date().getTime();

  // console.log('next pulse at ' + nextMinute.toString());
  // console.log('next pulse in ' + delay);

  pulseTimer = setTimeout(function () {
    // just after the top of the minute
    doPulse();
  }, delay);
}

export function doPulse(newTestTime) {
  clearTimeout(pulseTimer);

  if (newTestTime) {
    // debugger;
    // reset some...
    badiCalc.reset();
  }
  window.testTime = newTestTime; // okay if undefined

  badiCalc.refreshDateInfo();

  store.commit('pulsed')

  var newStamp = window._nowDi.stamp;
  if (newStamp !== lastPulseStamp) {
    lastPulseStamp = newStamp;
    window._messageBus.$emit('changedDay');
  }

  // store._vm.$ga.event('doPulse', 'doPulse');

  scheduleNextPulse();
}

// scheduleNextPulse();

export default store

// for development
window.doPulse = doPulse

// debugger;
console.log('For testing other dates:\n  doPulse(new Date(y,m-1,d,h,m,s))');

// setTimeout(function () {
//   doPulse(new Date(2017, 0, 17, 23, 4, 59))
// }, 0)
