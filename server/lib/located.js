'use strict';
// Extra behaviour for /badiService when tz, lat/lng (lon/long) or city query params are used.
const { getBadiDate, dayNum, ymdOf } = require('./badiCalc');
const { civil, localToUtc, isoLocal } = require('./zone');
const { sunTimesMs } = require('./sun');

/** Sunset (UTC ms, or NaN) for Gregorian day number n at place, using local noon as the reference. */
function sunsetOf(place, n) {
  const { year, month, day } = ymdOf(n);
  const noon = localToUtc(place.timeZone, year, month, day, 12, 0, 0);
  const s = sunTimesMs(noon, place.lat, place.lng);
  return { ms: s.ok ? s.sunsetMs : NaN, polar: s.polar };
}

const ymdStr = (n) => { const d = ymdOf(n); return `${String(d.year).padStart(4, '0')}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`; };

/**
 * Build the response object.
 *  place: resolved place;  dated: { n, fragment } or null (undated);  routeFragment for undated legacy semantics.
 *  nowMs: current instant (injectable for tests).
 */
function compute(place, dated, routeFragment, nowMs) {
  const solar = place.lat !== null;
  let badi, gregN, dayGregN; // dayGregN = Gregorian day whose daylight belongs to the Badí day
  let localTime = null, note = null;

  if (dated) {
    gregN = dated.n;
    badi = getBadiDate(gregN, dated.fragment);
    dayGregN = dated.fragment === 2 ? gregN + 1 : gregN;
  } else {
    const c = civil(place.timeZone, nowMs);
    const today = dayNum(c.year, c.month, c.day);
    gregN = today;
    localTime = isoLocal(place.timeZone, nowMs);
    if (!solar) {
      badi = getBadiDate(today, routeFragment);
      dayGregN = routeFragment === 2 ? today + 1 : today;
    } else {
      // Find the most recent sunset at or before now (sunset of Gregorian day k); the Badí day then
      // corresponds to Gregorian day k+1. relationToMidnight is 1 while the local date is still k.
      const s0 = sunsetOf(place, today), s1 = sunsetOf(place, today - 1), s2 = sunsetOf(place, today - 2);
      let k = null;
      if (Number.isFinite(s0.ms) && nowMs >= s0.ms) k = today;
      else if (Number.isFinite(s1.ms) && nowMs >= s1.ms) k = today - 1;
      else if (Number.isFinite(s1.ms) && Number.isFinite(s2.ms) && nowMs >= s2.ms) k = today - 2;
      if (k === null) {
        // No usable sunset (polar day or night): fall back to the local calendar date.
        badi = getBadiDate(today, 1);
        dayGregN = today;
        note = 'No sunset at this location around this date (polar day or night); the Badí date follows the local calendar date.';
      } else {
        badi = getBadiDate(k + 1, 1); // daytime form of Gregorian day k+1
        badi.relationToMidnight = today <= k ? 1 : 2;
        dayGregN = k + 1;
      }
    }
  }

  const out = badi; // existing fields, existing order
  out.location = { source: place.source, name: place.name, lat: place.lat, lng: place.lng, timeZone: place.timeZone };
  if (place.timeZoneFrom) out.location.timeZoneFrom = place.timeZoneFrom;
  out.gregorianDate = ymdStr(gregN);
  if (localTime) out.localTime = localTime;
  if (solar) {
    const start = sunsetOf(place, dayGregN - 1), end = sunsetOf(place, dayGregN);
    out.dayStartSunset = isoLocal(place.timeZone, start.ms);
    out.dayEndSunset = isoLocal(place.timeZone, end.ms);
    if (!note && (start.polar || end.polar)) note = 'The sun does not set at this location on one of these dates (polar day or night); that sunset is null.';
  }
  if (note) out.note = note;
  return out;
}

module.exports = { compute };
