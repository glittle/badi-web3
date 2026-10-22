'use strict';
// Small IANA time-zone helpers (Intl based), adapted from badi-mcp src/calendar/zoned-date.ts.
const fmts = new Map();
// Date.UTC maps years 0-99 to 1900-1999; this does not.
function utc(y, mo, d, h = 0, mi = 0, s = 0) { const t = new Date(Date.UTC(2000, mo - 1, d, h, mi, s)); t.setUTCFullYear(y + (t.getUTCFullYear() - 2000)); return t.getTime(); }
function isValidTimeZone(zone) {
  if (!zone || zone.length > 80) return false;
  try { new Intl.DateTimeFormat('en-US', { timeZone: zone }); return true; } catch { return false; }
}
function fmt(zone) {
  let f = fmts.get(zone);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', { timeZone: zone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
    fmts.set(zone, f);
  }
  return f;
}
/** Local civil parts (month 1-12) of a UTC instant in zone. */
function civil(zone, utcMs) {
  const m = {};
  for (const p of fmt(zone).formatToParts(new Date(utcMs))) if (p.type !== 'literal') m[p.type] = Number(p.value);
  let { year, month, day, hour, minute, second } = m;
  if (hour === 24) { hour = 0; const n = new Date(utc(year, month, day + 1)); year = n.getUTCFullYear(); month = n.getUTCMonth() + 1; day = n.getUTCDate(); }
  return { year, month, day, hour, minute, second };
}
function offsetMs(zone, utcMs) {
  const p = civil(zone, utcMs);
  return utc(p.year, p.month, p.day, p.hour, p.minute, p.second) - Math.floor(utcMs / 1000) * 1000;
}
/** UTC instant of a local wall time in zone (month 1-12). */
function localToUtc(zone, y, mo, d, h = 0, mi = 0, s = 0) {
  const guess = utc(y, mo, d, h, mi, s);
  const o1 = offsetMs(zone, guess);
  let out = guess - o1;
  const o2 = offsetMs(zone, out);
  if (o2 !== o1) out = guess - o2;
  return out;
}
const pad = (n, w = 2) => String(Math.abs(n)).padStart(w, '0');
/** ISO 8601 local time with offset, e.g. 2026-10-15T18:09:41-04:00 (to the second). */
function isoLocal(zone, utcMs) {
  if (!Number.isFinite(utcMs)) return null;
  const ms = Math.round(utcMs / 1000) * 1000;
  const p = civil(zone, ms);
  const off = Math.round(offsetMs(zone, ms) / 60000);
  const sign = off < 0 ? '-' : '+';
  return `${pad(p.year, 4)}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}:${pad(p.second)}${sign}${pad(Math.floor(Math.abs(off) / 60))}:${pad(Math.abs(off) % 60)}`;
}
module.exports = { isValidTimeZone, civil, localToUtc, isoLocal };
