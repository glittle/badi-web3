import storage from './storage'
import store from './store'

var coords = {
  get lat() {
    return storage.get('coord.lat', 0)
  },
  set lat(v) {
    storage.set('coord.lat', v)
    updatedCoords()
  },
  get lng() {
    return storage.get('coord.lng', new Date().getTimezoneOffset() / 60 * -15)
  },
  set lng(v) {
    storage.set('coord.lng', v)
    updatedCoords()
  },
  get name() {
    return storage.get('coord.name', '(unknown)')
  },
  set name(v) {
    storage.set('coord.name', v || '')
  },
  get source() {
    return storage.get('coord.source', 'not set')
  },
  set source(v) {
    storage.set('coord.source', v)
  }
}

var timer = null;

function updatedCoords() {
  clearTimeout(timer);
  timer = setTimeout(function () {
    store.commit('pulsed')
  }, 500);
}

var formats = {
  topTitleDay: '{bDay} {bMonthNamePri}-{bMonthNameSec} {bYear} <span>⇒ {endingSunsetDesc}</span>',
  topTitleEve: '<span>{startingSunsetDesc} ⇒</span> {bDay} {bMonthNamePri}-{bMonthNameSec} {bYear}',
  statusIconText: '{bMonthNamePri}',
  noticationMain: 'Today is {bDay} {bMonthNamePri}-{bMonthNameSec} {bYear}',
  noticationSub: '{nearestSunset}',
  noticationSubFast: 'From {sunriseDesc} to {endingSunsetDesc}',
  shortDay: 'the {bDayOrdinal} day of {bMonthNamePri}',
}

export {
  coords,
  formats
}
