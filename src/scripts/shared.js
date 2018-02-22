import storage from './storage'
import store from './store'

var speech = {
    get volume() {
        return storage.get('volume', 80);
    },
    set volume(v) {
        storage.set('volume', v);
    }
}
var notifications = {
    get wanted() {
        if (typeof Notification === 'undefined') {
            return 'denied';
        }
        return Notification ? Notification.permission : 'denied';
    }
}
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
    get tz() {
        return storage.get('coord.tz', null)
    },
    set tz(v) {
        storage.set('coord.tz', v)
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
    },
    get sourceIsSet() {
        return this.source === 'user';
    }
}

var timer = null;

function updatedCoords() {
    clearTimeout(timer);
    timer = setTimeout(function() {
        store.commit('pulsed')
    }, 500);
}

var formats = {
    topTitleDay: '{bDay} {bMonthNamePri} ({bMonthNameSec}) {bYear} <span>⇒ {endingSunsetDesc}</span>',
    topTitleEve: '<span>{startingSunsetDesc} ⇒</span> {bDay} {bMonthNamePri} ({bMonthNameSec}) {bYear}',
    statusIconText: '{bMonthNamePri}',
    noticationMain: 'Today is {bDay} {bMonthNamePri} ({bMonthNameSec}) {bYear}',
    noticationSub: '{nearestSunset}',
    noticationSubFast: 'Fast from {sunriseDesc} to {endingSunsetDesc}',
    shortDay: 'the {bDayOrdinal} day of {bMonthNamePri}',
}

function makeId(day) {
    if (day.id) {
        return day.id;
    }

    var di = day.di;
    var id = [day.DayCode || day.Type, di.bYear, day.Type === 'M' ? di.bMonth00 : ''].filter(function(s) {
        return !!s
    }).join('-');
    day.id = id;
    return id;
}

function remoteSendTag(name, value) {
    // was OneSignal.sendTag
    console.log('want to send', name, value);
}

export {
    coords,
    formats,
    speech,
    notifications,
    makeId,
    remoteSendTag
}
