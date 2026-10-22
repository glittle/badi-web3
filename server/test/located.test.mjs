// Unit tests for the optional location params. Run: node --test test/
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { compute } = require('../lib/located.js');
const { resolve, PlaceError } = require('../lib/place.js');
const { dayNum } = require('../lib/badiCalc.js');
const { localToUtc } = require('../lib/zone.js');
const handler = require('../api/badiService.js');

const at = (zone, y, mo, d, h, mi) => localToUtc(zone, y, mo, d, h, mi, 0);
const undated = (q, nowMs) => compute(resolve(q), null, 1, nowMs);
const hm = (iso) => iso.slice(11, 16);

function call(path, query = {}) {
  const res = { statusCode: 0, headers: {}, body: '', setHeader(k, v) { this.headers[k.toLowerCase()] = v; }, end(b) { this.body = b || ''; } };
  handler({ method: 'GET', query: { full: path, ...query } }, res);
  return res;
}

test('Québec before/after sunset across seasons and DST changes', () => {
  const Z = 'America/Montreal';
  const cases = [
    // [y,m,d, sunset approx local "HH:MM" window check, offset]
    [2026, 1, 15, '-05:00'], [2026, 3, 7, '-05:00'], [2026, 3, 8, '-04:00'], [2026, 3, 20, '-04:00'],
    [2026, 6, 21, '-04:00'], [2026, 10, 31, '-04:00'], [2026, 11, 1, '-05:00'], [2026, 12, 21, '-05:00'],
  ];
  for (const [y, m, d, off] of cases) {
    const before = undated({ city: 'Quebec' }, at(Z, y, m, d, 12, 0));
    const after = undated({ city: 'Quebec' }, at(Z, y, m, d, 23, 0));
    assert.equal(before.relationToMidnight, 2);
    assert.equal(after.relationToMidnight, 1);
    assert.equal(before.gregorianDate, `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
    assert.ok(before.dayEndSunset.endsWith(off), before.dayEndSunset);
    assert.equal(after.dayStartSunset, before.dayEndSunset); // the evening sunset starts the next Badí day
    // the 'after' Badí day equals the legacy /y/m/d/2 date; 'before' equals legacy /y/m/d
    const legacyDay = JSON.parse(call(`/badiService/${y}/${m}/${d}`).body);
    const legacyEve = JSON.parse(call(`/badiService/${y}/${m}/${d}/2`).body);
    for (const k of ['year', 'month', 'day', 'relationToMidnight']) {
      assert.equal(before[k], legacyDay[k]);
      assert.equal(after[k], legacyEve[k]);
    }
  }
});

test('Québec: one minute before vs after the computed sunset', () => {
  const Z = 'America/Montreal';
  const r = undated({ city: 'Québec' }, at(Z, 2026, 10, 15, 12, 0));
  const sunset = Date.parse(r.dayEndSunset);
  assert.equal(undated({ city: 'quebec, canada' }, sunset - 60000).relationToMidnight, 2);
  assert.equal(undated({ city: 'QUEBEC' }, sunset + 60000).relationToMidnight, 1);
  assert.equal(undated({ city: "QUEBEC" }, sunset + 60000).day, (r.day % 19) + 1);
});

test('Calgary, Sydney, Auckland', () => {
  const c = undated({ city: 'Calgary' }, at('America/Edmonton', 2026, 10, 15, 20, 0));
  assert.equal(c.location.timeZone, 'America/Edmonton');
  assert.equal(c.relationToMidnight, 1); // Calgary sunset ~18:40 MDT in mid-October
  const s = undated({ city: 'Sydney' }, at('Australia/Sydney', 2026, 12, 25, 19, 0));
  assert.equal(s.relationToMidnight, 2); // summer sunset ~20:05 AEDT
  assert.ok(s.dayEndSunset.endsWith('+11:00'));
  const a = undated({ city: 'Auckland' }, at('Pacific/Auckland', 2026, 3, 21, 1, 30));
  assert.equal(a.gregorianDate, '2026-03-21');
  assert.equal(a.relationToMidnight, 2); // after midnight: daytime part of Mar 21
  assert.equal(a.month, 1); assert.equal(a.day, 1); // Naw-Rúz 183
});

test('Reykjavík in June (sunset after local midnight) and polar cases', () => {
  const Z = 'Atlantic/Reykjavik';
  const noon = undated({ city: 'Reykjavik' }, at(Z, 2026, 6, 21, 12, 0));
  assert.ok(noon.dayEndSunset.startsWith('2026-06-22T00:'), noon.dayEndSunset); // sets just after midnight
  // 00:01 on Jun 22, before that day's... the Jun 21 sunset (~00:03) has not happened yet: still Badí day of Jun 21
  const early = undated({ city: 'Reykjavik' }, Date.parse(noon.dayEndSunset) - 120000);
  assert.equal(early.gregorianDate, '2026-06-22');
  assert.equal(early.day, noon.day); assert.equal(early.relationToMidnight, 2);
  const late = undated({ city: 'Reykjavik' }, Date.parse(noon.dayEndSunset) + 120000);
  assert.equal(late.day, noon.day === 19 ? 1 : noon.day + 1);
  // Tromsø-like latitude in midnight sun and polar night: graceful fallback, no crash
  const sum = undated({ lat: '69.65', lng: '18.96', tz: 'Europe/Oslo' }, at('Europe/Oslo', 2026, 6, 21, 23, 0));
  assert.equal(sum.dayEndSunset, null); assert.match(sum.note, /polar/); assert.equal(sum.relationToMidnight, 2);
  const win = undated({ lat: '69.65', lng: '18.96', tz: 'Europe/Oslo' }, at('Europe/Oslo', 2026, 12, 21, 23, 0));
  assert.equal(win.dayStartSunset, null); assert.match(win.note, /polar/);
  const dated = compute(resolve({ lat: '69.65', lng: '18.96' }), { n: dayNum(2026, 6, 21), fragment: 1 }, 1, 0);
  assert.equal(dated.location.timeZone, 'Europe/Oslo'); assert.equal(dated.dayEndSunset, null);
});

test('tz only: local calendar date, legacy fragment semantics, no sunsets', () => {
  const now = Date.UTC(2026, 9, 15, 3, 30); // 23:30 Oct 14 in Toronto, 21:30 Oct 14 in Edmonton, Oct 15 in Tehran
  const t = undated({ tz: 'America/Toronto' }, now);
  assert.equal(t.gregorianDate, '2026-10-14'); assert.equal(t.relationToMidnight, 2);
  assert.equal(t.dayEndSunset, undefined);
  assert.equal(undated({ tz: 'Asia/Tehran' }, now).gregorianDate, '2026-10-15');
  const frag2 = compute(resolve({ tz: 'America/Toronto' }), null, 2, now);
  assert.equal(frag2.relationToMidnight, 1); assert.equal(frag2.day, t.day + 1);
});

test('lat/lng without tz infers zone; lon/long aliases via handler', () => {
  assert.equal(resolve({ lat: '46.81', lng: '-71.21' }).timeZone, 'America/Montreal');
  for (const k of ['lng', 'lon', 'long']) {
    const r = call('/badiService/2026/10/15', { lat: '46.81', [k]: '-71.21' });
    assert.equal(r.statusCode, 200); assert.equal(JSON.parse(r.body).location.lng, -71.21);
  }
  assert.throws(() => resolve({ lat: '0', lng: '-140' }), (e) => e.code === 'timezone_required');
});

test('dated + location keeps legacy fields first and identical', () => {
  for (const p of ['/badiService/2026/10/15', '/badiService/2026/10/15/2', '/badiService/Today/2026/3/20/2', '/badiService/2025/2/28']) {
    const legacy = call(p).body;
    const ext = call(p, { city: 'Calgary' });
    assert.equal(ext.statusCode, 200);
    assert.ok(ext.body.startsWith(legacy.slice(0, -1) + ',"location":'), ext.body);
    assert.equal(ext.headers['access-control-allow-origin'], '*');
    assert.equal(call(p).headers['access-control-allow-origin'], undefined);
  }
  const r = JSON.parse(call('/badiService/2026/10/15', { city: 'Calgary' }).body);
  assert.ok(r.dayStartSunset.startsWith('2026-10-14T18:4')); assert.ok(r.dayEndSunset.startsWith('2026-10-15T18:4'));
});

test('invalid inputs', () => {
  const bad = [
    [{ city: 'Atlantisxyz' }, 'city_not_found'], [{ city: 'Springfield' }, 'ambiguous_city'], [{ city: '' }, 'bad_city'],
    [{ city: 'Quebec, France' }, 'city_not_found'], [{ tz: 'Mars/Olympus' }, 'bad_timezone'], [{ tz: '' }, 'bad_timezone'],
    [{ lat: '46.8' }, 'bad_coordinates'], [{ lat: 'abc', lng: '1' }, 'bad_coordinates'], [{ lat: '91', lng: '0', tz: 'UTC' }, 'bad_coordinates'],
    [{ lat: '1', lng: '181', tz: 'UTC' }, 'bad_coordinates'], [{ city: 'Calgary', lat: '1', lng: '1' }, 'bad_location'],
  ];
  for (const [q, code] of bad) {
    const r = call('/badiService', q);
    assert.equal(r.statusCode, 400, JSON.stringify(q));
    assert.equal(JSON.parse(r.body).code, code, JSON.stringify(q));
    assert.equal(r.headers['content-type'], 'application/json; charset=utf-8');
    assert.equal(r.headers['access-control-allow-origin'], '*');
  }
  // legacy errors unchanged in shape even with new params (empty body), plus CORS
  assert.equal(call('/badiService/2024/13/40', { city: 'Calgary' }).statusCode, 500);
  assert.equal(call('/badiService/2024/13/40', { city: 'Calgary' }).body, '');
  assert.equal(call('/badiService/abc', { city: 'Calgary' }).statusCode, 400);
  assert.equal(call('/badiService/1/1/1', { city: 'Calgary' }).statusCode, 500);
  assert.equal(call('/badiService/9999/12/31/2', { tz: 'UTC' }).statusCode, 500);
  assert.equal(call('/badiService/0001/03/21', { city: 'Calgary' }).statusCode, 200);
});
