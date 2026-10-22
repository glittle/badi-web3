'use strict';
// Sunrise/sunset. Copied from badi-mcp src/calendar/sun.ts, itself a port of src/scripts/sunCalc.js in
// glittle/badi-web3, which is SunCalc (c) 2011-2015 Vladimir Agafonkin, https://github.com/mourner/suncalc (BSD-2-Clause).
const PI = Math.PI, sin = Math.sin, cos = Math.cos, tan = Math.tan, asin = Math.asin, atan = Math.atan2, acos = Math.acos;
const rad = PI / 180;
const dayMs = 864e5, J1970 = 2440588, J2000 = 2451545, e = rad * 23.4397, J0 = 0.0009;
const toJulian = (ms) => ms / dayMs - 0.5 + J1970;
const fromJulian = (j) => new Date((j + 0.5 - J1970) * dayMs).getTime();
const toDays = (ms) => toJulian(ms) - J2000;
const declination = (l, b) => asin(sin(b) * cos(e) + cos(b) * sin(e) * sin(l));
const solarMeanAnomaly = (d) => rad * (357.5291 + 0.98560028 * d);
function eclipticLongitude(M) {
  const C = rad * (1.9148 * sin(M) + 0.02 * sin(2 * M) + 0.0003 * sin(3 * M));
  return M + C + rad * 102.9372 + PI;
}
const julianCycle = (d, lw) => Math.round(d - J0 - lw / (2 * PI));
const approxTransit = (Ht, lw, n) => J0 + (Ht + lw) / (2 * PI) + n;
const solarTransitJ = (ds, M, L) => J2000 + ds + 0.0053 * sin(M) - 0.0069 * sin(2 * L);
const hourAngle = (h, phi, d) => acos((sin(h) - sin(phi) * sin(d)) / (cos(phi) * cos(d)));
const SUNSET_ANGLE = -0.833 * rad;

/** Sun times for the solar day nearest utcMs (pass local noon). sunsetMs is NaN when the sun does not set/rise. */
function sunTimesMs(utcMs, latitude, longitude) {
  const lw = rad * -longitude, phi = rad * latitude;
  const d = toDays(utcMs);
  const n = julianCycle(d, lw);
  const ds = approxTransit(0, lw, n);
  const M = solarMeanAnomaly(ds);
  const L = eclipticLongitude(M);
  const dec = declination(L, 0);
  const Jnoon = solarTransitJ(ds, M, L);
  const w = hourAngle(SUNSET_ANGLE, phi, dec);
  const Jset = solarTransitJ(approxTransit(w, lw, n), M, L);
  const Jrise = Jnoon - (Jset - Jnoon);
  const sunriseMs = fromJulian(Jrise), sunsetMs = fromJulian(Jset);
  // When the sun never sets (or never rises) acos() is NaN. cos of the noon-altitude tells which.
  const polar = !Number.isFinite(sunsetMs)
    ? ((sin(SUNSET_ANGLE) - sin(phi) * sin(dec)) / (cos(phi) * cos(dec)) < -1 ? 'midnightSun' : 'polarNight')
    : null;
  return { sunriseMs, sunsetMs, solarNoonMs: fromJulian(Jnoon), ok: !polar, polar };
}
module.exports = { sunTimesMs };
