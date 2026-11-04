'use strict';
// /placename?lat=..&lng=..: the name of the place at a lat/lng (reverse geocoding).
// Replaces the browser's Google Maps geocode call (that API key's project was deleted).
// Uses OpenStreetMap Nominatim (https://operations.osmfoundation.org/policies/nominatim/):
// max 1 request/second, an identifying User-Agent, and results must be cached. Coordinates are
// rounded to 3 decimals (~100 m) and the response is cached by Vercel's CDN for 30 days per
// rounded query, so our small volume stays far below the limit.
// Privacy: coordinates and IP addresses are never logged or stored.
const USER_AGENT = 'WondrousBadi/2.5 (https://wondrous-badi.today)';
const TIMEOUT_MS = 4000;

function first(v) {
  return Array.isArray(v) ? v[0] : v;
}

function parseCoord(v, max) {
  v = first(v);
  if (typeof v !== 'string' || !/^\s*-?\d+(\.\d+)?\s*$/.test(v)) return null;
  const n = Number(v);
  if (!isFinite(n) || n < -max || n > max) return null;
  return Math.round(n * 1000) / 1000;
}

function getQuery(req) {
  if (req.query) return req.query;
  const u = new URL(req.url || '/', 'http://x');
  return Object.fromEntries(u.searchParams);
}

function send(res, status, body, cache) {
  res.statusCode = status;
  res.setHeader('Cache-Control', cache);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

function pickName(a) {
  a = a || {};
  return a.city || a.town || a.village || a.municipality || a.hamlet || a.county || a.state || null;
}

module.exports = async (req, res) => {
  const q = getQuery(req);
  const lat = parseCoord(q.lat, 90);
  const lng = parseCoord(q.lng, 180);
  if (lat === null || lng === null) {
    send(res, 400, { error: 'lat and lng must be numbers (lat -90..90, lng -180..180)' }, 'no-store');
    return;
  }
  const url = 'https://nominatim.openstreetmap.org/reverse?format=jsonv2'
    + '&lat=' + lat.toFixed(3) + '&lon=' + lng.toFixed(3)
    + '&zoom=10&addressdetails=1&accept-language=en';
  try {
    const r = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, 'Accept': 'application/json' },
      signal: AbortSignal.timeout(TIMEOUT_MS)
    });
    if (!r.ok) throw new Error('status ' + r.status);
    const data = await r.json();
    const a = data && data.address;
    const name = pickName(a);
    // a place with no name (e.g. open ocean) is a real answer and may be cached too, but for less time
    send(res, 200, {
      name: name,
      region: (a && a.state) || null,
      country: (a && a.country) || null
    }, name ? 'public, max-age=86400, s-maxage=2592000' : 'public, s-maxage=86400');
  } catch (e) {
    // fail fast; don't let the CDN cache a failure
    send(res, 200, { name: null }, 'no-store');
  }
};

module.exports.pickName = pickName;
module.exports.parseCoord = parseCoord;
