import Vue from 'vue'
import Vuex from 'vuex'
import badiCalc from './badiCalc'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    pulseNum: 1,
    di: {}
  },
  mutations: {
    pulsed(state) {
      state.pulseNum++
        document.dispatchEvent(new Event('pulsed'));
    },
    newDate(state, di) {
      state.di = di //TODO integrate into system
    }
  }
})



// ----------------------------

const pulseSeconds = 60; // normally 60 seconds

function scheduleNextPulse() {
  // start the timer just after the minute
  var nextMinute = new Date();
  //   console.log('start called at ' + nextMinute)

  nextMinute.setHours(nextMinute.getHours(), nextMinute.getMinutes(), nextMinute.getSeconds() + pulseSeconds, 1)
  var delay = nextMinute.getTime() - new Date().getTime();

  //   console.log('start pulse in ' + delay);

  setTimeout(function () {
    // just after the top of the minute
    doPulse();
  }, delay);
}

export function doPulse(newTestTime) {
  if (newTestTime) {
    // debugger;
  }
  window.testTime = newTestTime; // okay if undefined

  badiCalc.refreshDateInfo();
  store.commit('pulsed')

  scheduleNextPulse();
}

scheduleNextPulse();

export default store

// for development
window.doPulse = doPulse

console.log('For testing other dates:\n  doPulse(new Date(y,m-1,d,h,m,s))');
