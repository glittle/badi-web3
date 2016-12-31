import Vue from 'vue'
import Vuex from 'vuex'

import dateInfo from './dateInfo'
// const moment = require('moment-timezone');

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    pulseNum: 1
  },
  mutations: {
    pulse(state) {
      state.pulseNum++
    }
  }
})

startPulse()

// ----------------------------

const pulseTime = 1000 * 5; // normally 1 minute
const delayPulseStart = false; // normally true

function startPulse() {
  // start the timer just after the minute
  var nextMinute = new Date();
  nextMinute.setHours(nextMinute.getHours(), nextMinute.getMinutes() + 1, 0, 1)
  var delay = delayPulseStart ? nextMinute.getTime() - new Date().getTime() : 0;
  //   console.log('will start pulse in ' + delay)
  setTimeout(function () {
    // just after the top of the minute
    // console.log('timeout done')
    setInterval(function () {
      //   console.log('interval')
      doPulse()
    }, pulseTime)

    doPulse()
  }, delay);
}

function doPulse() {
  dateInfo.refreshDateInfo();

  store.commit('pulse')

  //   console.log('pulsed ' + store.state.pulseNum + ' at ' + moment().format())

  //   console.log(dateInfo.di.currentTime)
}


export default store
