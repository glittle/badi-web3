'use strict';
// Vercel serverless port of BadiService2 (ASP.NET minimal API, hosted under path base /badiService).
// Routes: /badiService/Today/{gYear?}/{gMonth?}/{gDay?}/{fragment?}  and  /badiService/{gYear?}/{gMonth?}/{gDay?}/{fragment?}
const { getBadiDate, dayNum, DateError } = require('../lib/badiCalc');
const { resolve, PlaceError } = require('../lib/place');
const { compute } = require('../lib/located');

// Optional query params (2026 additions). Any of these switches on the extended response; without them
// every response is byte-identical to the original ASP.NET service.
const NEW_PARAMS = ['tz', 'lat', 'lng', 'lon', 'long', 'city'];

// The original uses DateTime.Today = the server's local calendar date.
// Confirmed: the production VM runs on Mountain time with DST (America/Edmonton).
const SERVER_TIME_ZONE = 'America/Edmonton';

function today() {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: SERVER_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' })
    .formatToParts(new Date());
  const get = (t) => parseInt(parts.find((p) => p.type === t).value, 10);
  return dayNum(get('year'), get('month'), get('day'));
}

// Mimic ASP.NET int binding (int.TryParse, invariant culture). Returns null on failure.
function parseIntParam(s) {
  if (s === undefined || s === '') return 0; // missing optional param -> default
  if (!/^[\s]*-?\d+[\s]*$/.test(s)) return null;
  const n = parseInt(s.trim(), 10);
  if (n > 2147483647 || n < -2147483648) return null;
  return n;
}

function send(res, status, body, cors) {
  res.statusCode = status;
  if (cors) res.setHeader('Access-Control-Allow-Origin', '*');
  if (body !== undefined) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(body);
  } else {
    res.end();
  }
}

module.exports = (req, res) => {
  // `full` is the original path starting at /badiService (set by vercel.json routes).
  let full = typeof req.query.full === 'string' ? req.query.full : '/badiService';
  let rest;
  if (full.startsWith('/badiService')) rest = full.slice('/badiService'.length);
  else rest = full; // e.g. /BadiService/... : the live Node proxy forwards the path unchanged (case-sensitive strip)

  const q = req.query || {};
  const first = (k) => (Array.isArray(q[k]) ? q[k][0] : q[k]);
  const ext = NEW_PARAMS.some((k) => q[k] !== undefined);
  const S = (status, body) => send(res, status, body, ext);

  if (req.method !== 'GET') return S(405);
  if (rest.includes('+')) return S(404); // IIS request filtering rejects '+' in path

  let segs = rest.replace(/^\//, '').replace(/\/$/, '');
  segs = segs === '' ? [] : segs.split('/');
  try { segs = segs.map((s) => decodeURIComponent(s)); } catch (e) { return S(400); }

  if (segs.length && segs[0].toLowerCase() === 'today') segs = segs.slice(1);
  if (segs.length > 4) return S(404);

  const vals = [0, 1, 2, 3].map((i) => parseIntParam(segs[i]));
  if (vals.some((v) => v === null)) return S(400);
  let [gYear, gMonth, gDay, fragment] = vals;
  if (segs[3] === undefined || segs[3] === '') fragment = 1;

  if (ext) return extended(res, S, first, gYear, gMonth, gDay, fragment);

  try {
    const gDate = gYear === 0 || gMonth === 0 || gDay === 0 ? today() : dayNum(gYear, gMonth, gDay);
    const result = getBadiDate(gDate, fragment);
    return S(200, JSON.stringify(result));
  } catch (e) {
    if (e instanceof DateError) return S(500);
    throw e;
  }
};

function jsonError(S, err) {
  const body = { error: err.message, code: err.code };
  if (err.extra) Object.assign(body, err.extra);
  return S(400, JSON.stringify(body));
}

function extended(res, S, first, gYear, gMonth, gDay, fragment) {
  let place;
  try {
    place = resolve({
      tz: first('tz'),
      lat: first('lat'),
      lng: first('lng') ?? first('lon') ?? first('long'),
      city: first('city'),
    });
  } catch (e) {
    if (e instanceof PlaceError) return jsonError(S, e);
    throw e;
  }
  try {
    const undated = gYear === 0 || gMonth === 0 || gDay === 0;
    const dated = undated ? null : { n: dayNum(gYear, gMonth, gDay), fragment };
    const result = compute(place, dated, fragment, Date.now());
    return S(200, JSON.stringify(result));
  } catch (e) {
    if (e instanceof DateError) return S(500); // same as legacy for impossible dates
    throw e;
  }
}

// ---- Long-term call log (lib/calllog.js). Runs after the response has been sent; never affects it. ----
const handleRequest = module.exports;
const { logCall, formOf } = require('../lib/calllog');
let waitUntil = null;
try { ({ waitUntil } = require('@vercel/functions')); } catch { waitUntil = null; }

function scheduleLog(req, res) {
  try {
    const full = req.query && typeof req.query.full === 'string' ? req.query.full : '/badiService';
    let segs = full.replace(/^\/badiService/, '').replace(/^\//, '').replace(/\/$/, '');
    segs = segs === '' ? [] : segs.split('/');
    if (segs.length && segs[0].toLowerCase() === 'today') segs = segs.slice(1);
    const p = logCall(req, formOf(segs, req.query, res.statusCode));
    if (waitUntil) waitUntil(p);
  } catch { /* logging must never break the service */ }
}

module.exports = (req, res) => {
  try {
    return handleRequest(req, res);
  } finally {
    scheduleLog(req, res);
  }
};
