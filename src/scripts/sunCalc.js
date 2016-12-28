/* eslint one-var: 0 */
/* eslint padded-blocks: 0 */
/* eslint spaced-comment: 0 */
/* eslint no-trailing-spaces: 0 */

/*
 (c) 2011-2014, Vladimir Agafonkin
 SunCalc is a JavaScript library for calculating sun/mooon position and light phases.
 https://github.com/mourner/suncalc
 
 Glen - Moon and other unused calcs removed. 
*/

'use strict';

// shortcuts for easier to read formulas

var PI = Math.PI,
  sin = Math.sin,
  cos = Math.cos,
  asin = Math.asin,
  acos = Math.acos,
  rad = PI / 180;

// sun calculations are based on http://aa.quae.nl/en/reken/zonpositie.html formulas


// date/time constants and conversions

var dayMs = 1000 * 60 * 60 * 24,
  J1970 = 2440588,
  J2000 = 2451545;

function toJulian(date) {
  return date.valueOf() / dayMs - 0.5 + J1970;
}

function fromJulian(j) {
  return new Date((j + 0.5 - J1970) * dayMs);
}

function toDays(date) {
  return toJulian(date) - J2000;
}


// general calculations for position

var e = rad * 23.4397; // obliquity of the Earth

function declination(l, b) {
  return asin(sin(b) * cos(e) + cos(b) * sin(e) * sin(l));
}

// general sun calculations

function solarMeanAnomaly(d) {
  return rad * (357.5291 + 0.98560028 * d);
}

function eclipticLongitude(M) {

  var C = rad * (1.9148 * sin(M) + 0.02 * sin(2 * M) + 0.0003 * sin(3 * M)), // equation of center
    P = rad * 102.9372; // perihelion of the Earth

  return M + C + P + PI;
}

var SunCalc = {};

// sun times configuration (angle, morning name, evening name)

var times = SunCalc.times = [
  [-0.833, 'sunrise', 'sunset']
  //[  -0.3, 'sunriseEnd',    'sunsetStart' ],
  //[    -6, 'dawn',          'dusk'        ],
  //[   -12, 'nauticalDawn',  'nauticalDusk'],
  //[   -18, 'nightEnd',      'night'       ],
  //[     6, 'goldenHourEnd', 'goldenHour'  ]
];


// calculations for sun times

var J0 = 0.0009;

function julianCycle(d, lw) {
  return Math.round(d - J0 - lw / (2 * PI));
}

function approxTransit(Ht, lw, n) {
  return J0 + (Ht + lw) / (2 * PI) + n;
}

function solarTransitJ(ds, M, L) {
  return J2000 + ds + 0.0053 * sin(M) - 0.0069 * sin(2 * L);
}

function hourAngle(h, phi, d) {
  return acos((sin(h) - sin(phi) * sin(d)) / (cos(phi) * cos(d)));
}

// returns set time for the given sun altitude
function getSetJ(h, lw, phi, dec, n, M, L) {

  var w = hourAngle(h, phi, dec),
    a = approxTransit(w, lw, n);
  return solarTransitJ(a, M, L);
}


// calculates sun times for a given date and latitude/longitude
module.exports = {
  getTimes: function (date, lat, lng) {

    var lw = rad * -lng,
      phi = rad * lat,

      d = toDays(date),
      n = julianCycle(d, lw),
      ds = approxTransit(0, lw, n),

      M = solarMeanAnomaly(ds),
      L = eclipticLongitude(M),
      dec = declination(L, 0),

      Jnoon = solarTransitJ(ds, M, L),

      i, len, time, Jset, Jrise;


    var result = {
      solarNoon: fromJulian(Jnoon),
      nadir: fromJulian(Jnoon - 0.5)
    };

    for (i = 0, len = times.length; i < len; i += 1) {
      time = times[i];

      Jset = getSetJ(time[0] * rad, lw, phi, dec, n, M, L);
      Jrise = Jnoon - (Jset - Jnoon);

      result[time[1]] = fromJulian(Jrise);
      result[time[2]] = fromJulian(Jset);
    }

    return result;
  }
};

// export as AMD module / Node module / browser variable
// if (typeof define === 'function' && define.amd) define(SunCalc);
// else if (typeof module !== 'undefined') module.exports = SunCalc;
// else
// window.SunCalc = SunCalc;