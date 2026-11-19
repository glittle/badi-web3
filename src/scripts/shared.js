import storage from './storage'
import { doPulse } from './store'

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
// A crawler default lives only in this object. Getters and setters must not
// touch localStorage while it is set, or the visit would look like a person
// who had already finished setup.
let ephemeralCoords = null

function applyEphemeralCoords(place) {
    ephemeralCoords = {
        lat: place.lat,
        lng: place.lng,
        tz: place.tz,
        name: place.name,
        source: place.source
    }
}

function ephemeralCoordsActive() {
    return ephemeralCoords != null
}

function readCoord(key, fallback) {
    if (ephemeralCoords) return ephemeralCoords[key]
    return storage.get('coord.' + key, fallback)
}

function writeCoord(key, value) {
    if (ephemeralCoords) {
        ephemeralCoords[key] = value
        return
    }
    storage.set('coord.' + key, value)
}

var coords = {
    get lat() {
        return readCoord('lat', 0)
    },
    set lat(v) {
        writeCoord('lat', v)
        updatedCoords()
    },
    get lng() {
        return readCoord('lng', new Date().getTimezoneOffset() / 60 * -15)
    },
    set lng(v) {
        writeCoord('lng', v)
        updatedCoords()
    },
    get tz() {
        return readCoord('tz', null)
    },
    set tz(v) {
        writeCoord('tz', v)
    },
    get name() {
        return readCoord('name', '(unknown)')
    },
    set name(v) {
        writeCoord('name', v || '')
    },
    get source() {
        return readCoord('source', 'not set')
    },
    set source(v) {
        writeCoord('source', v)
    },
    get sourceIsSet() {
        return this.source === 'user';
    }
}

var timer = null;

function updatedCoords() {
    clearTimeout(timer);
    timer = setTimeout(function() {
        doPulse();
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
    remoteSendTag,
    applyEphemeralCoords,
    ephemeralCoordsActive
}
