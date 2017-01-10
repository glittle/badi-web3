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
    },
    newDate(state, di) {
      state.di = di //TODO integrate into system
    }
  }
})



// ----------------------------

// const pulseTime = 1000 * 60; // normally 1 minute

function scheduleNextPulse() {
  // start the timer just after the minute
  var nextMinute = new Date();
  //   console.log('start called at ' + nextMinute)

  nextMinute.setHours(nextMinute.getHours(), nextMinute.getMinutes() + 1, 0, 1)
  var delay = nextMinute.getTime() - new Date().getTime();

  //   console.log('start pulse in ' + delay);

  setTimeout(function () {
    // just after the top of the minute
    doPulse();
  }, delay);
}

export function doPulse() {
  badiCalc.refreshDateInfo();
  store.commit('pulsed')
    // console.log('pulsed');
  scheduleNextPulse();
}

scheduleNextPulse();

export default store

// for development
window.doPulse = doPulse
