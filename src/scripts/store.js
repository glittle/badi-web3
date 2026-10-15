import { createStore } from 'vuex'
import badiCalc from './badiCalc'

const store = createStore({
  state: {
    pulseNum: 1,
    di: {}
  },
  mutations: {
    pulsed(state) {
      state.pulseNum++
      state.di = badiCalc.di
      console.log('pulsed')
      document.dispatchEvent(new Event('pulsed'))
    }
  }
})

const pulseSeconds = 60
var pulseTimer = null
var lastPulseStamp = null
var lastPulseTime = 0

function scheduleNextPulse() {
  var nextMinute = new Date()
  nextMinute.setHours(nextMinute.getHours(), nextMinute.getMinutes(), nextMinute.getSeconds() + pulseSeconds, 1)
  nextMinute.setSeconds(0)
  var delay = nextMinute.getTime() - new Date().getTime()

  pulseTimer = setTimeout(function () {
    doPulse()
  }, delay)
}

export function doPulse(newTestTime) {
  var pulseTime = new Date().getTime()
  if (lastPulseTime && pulseTime - lastPulseTime < 250) {
    console.log('ignore attempted rapid pulse')
    return
  }

  lastPulseTime = pulseTime
  clearTimeout(pulseTimer)

  if (newTestTime) {
    badiCalc.reset()
  }
  window.testTime = newTestTime

  badiCalc.refreshDateInfo()
  store.commit('pulsed')

  if (window._nowDi) {
    var newStamp = window._nowDi.stamp
    if (newStamp !== lastPulseStamp) {
      lastPulseStamp = newStamp
      window._messageBus.$emit('changedDay')
    }
  }

  scheduleNextPulse()
}

export default store

window.doPulse = doPulse
console.log('For testing other dates:\n  doPulse(new Date(y,m-1,d,h,m,s))')
