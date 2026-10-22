'use strict';
// Location resolution for the optional badiService query params.
// City lookup is adapted from badi-mcp src/calendar/location.ts. The offline city table (lib/cities.json) is
// derived from the city-timezones npm package v1.3.4 (MIT, Kevin Roberts):
// [city, cityAscii, lat, lng, population, country, iso2, province, stateAnsi, timeZone]
const { isValidTimeZone } = require('./zone');

class PlaceError extends Error {
  constructor(message, code, extra) { super(message); this.code = code; this.extra = extra; }
}

let cities = null;
function load() {
  if (cities) return cities;
  cities = require('./cities.json').map((r) => ({
    city: r[0], cityAscii: r[1], lat: r[2], lng: r[3], pop: r[4], country: r[5], iso2: r[6], province: r[7], stateAnsi: r[8], timeZone: r[9],
    norm: normalize(r[1] || r[0]), norm2: normalize(r[0]),
  }));
  return cities;
}

const ALIASES = {
  nyc: 'new york', 'new york city': 'new york', sf: 'san francisco', la: 'los angeles', dc: 'washington', 'washington dc': 'washington',
  'washington d c': 'washington', tihran: 'tehran', teheran: 'tehran', bombay: 'mumbai', calcutta: 'kolkata', peking: 'beijing',
  'quebec city': 'quebec', 'ville de quebec': 'quebec',
};

function normalize(v) {
  return String(v).normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/['’‘`.]/g, '')
    .replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
}
const label = (c) => [c.city, c.province || c.stateAnsi, c.country].filter(Boolean).join(', ');
const brief = (c) => `${c.city}, ${c.province || c.stateAnsi || c.country}, ${c.country}`;

function findCity(query, timeZone) {
  let text = String(query).trim();
  let qualifier = '';
  const parts = text.split(',');
  if (parts.length > 1) { text = parts[0].trim(); qualifier = normalize(parts.slice(1).join(' ')); }
  let norm = normalize(text);
  if (ALIASES[norm]) norm = ALIASES[norm];
  if (!norm) throw new PlaceError('The city name is empty. Example: city=Calgary or city=Quebec, Canada.', 'bad_city');

  let matches = load().filter((c) => c.norm === norm || c.norm2 === norm);
  if (qualifier && matches.length) {
    const q = matches.filter((c) => [c.country, c.province, c.iso2, c.stateAnsi].map(normalize)
      .some((f) => f && (f === qualifier || f.includes(qualifier) || qualifier.includes(f))));
    if (!q.length) {
      throw new PlaceError(`No city "${text}" in "${parts.slice(1).join(',').trim()}" is in the offline list. Places with that name: ${matches.slice(0, 6).map(brief).join('; ')}.`, 'city_not_found');
    }
    matches = q;
  }
  if (timeZone) {
    const z = matches.filter((c) => c.timeZone === timeZone);
    if (z.length) matches = z;
  }
  if (!matches.length) {
    throw new PlaceError(`City "${query}" is not in the offline list (about 7,300 larger cities). Try a nearby larger city, add the country ("city=Quebec, Canada"), or pass lat, lng and tz instead.`, 'city_not_found');
  }
  matches.sort((a, b) => b.pop - a.pop);
  const [best, second] = matches;
  if (second && best.pop < second.pop * 4) {
    throw new PlaceError(`"${query}" matches more than one city. Add the region or country, e.g. "city=${best.city}, ${best.province || best.country}". Choices: ${matches.slice(0, 6).map(brief).join('; ')}.`, 'ambiguous_city',
      { choices: matches.slice(0, 6).map((c) => `${c.city}, ${c.province || c.stateAnsi || c.country}, ${c.country}`) });
  }
  if (!isValidTimeZone(best.timeZone)) throw new PlaceError(`The offline record for ${best.city} has no usable time zone.`, 'bad_city');
  return best;
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const r = Math.PI / 180;
  const a = Math.sin(((lat2 - lat1) * r) / 2) ** 2 + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(((lon2 - lon1) * r) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(a)));
}
function nearest(lat, lng) {
  let best = null, km = Infinity;
  for (const c of load()) { const d = haversineKm(lat, lng, c.lat, c.lng); if (d < km) { km = d; best = c; } }
  return { city: best, km };
}

const NUM = /^\s*[+-]?(\d+(\.\d*)?|\.\d+)\s*$/;
function coord(name, raw, max) {
  if (!NUM.test(raw)) throw new PlaceError(`${name} must be a decimal number (got "${raw}").`, 'bad_coordinates');
  const v = Number(raw);
  if (v < -max || v > max) throw new PlaceError(`${name} must be between -${max} and ${max}.`, 'bad_coordinates');
  return v;
}

/**
 * q: { tz, lat, lng, city } raw strings (undefined when absent).
 * Returns { source, name, lat, lng, timeZone, note? }  (lat/lng null for timezone-only).
 */
function resolve(q) {
  const tz = q.tz !== undefined ? String(q.tz).trim() : undefined;
  if (tz !== undefined && !isValidTimeZone(tz)) {
    throw new PlaceError(`Unknown time zone "${tz}". Use an IANA zone name such as America/Toronto or Asia/Tehran.`, 'bad_timezone');
  }
  const hasLat = q.lat !== undefined, hasLng = q.lng !== undefined;
  if (q.city !== undefined && (hasLat || hasLng)) {
    throw new PlaceError('Use either city or lat/lng, not both.', 'bad_location');
  }
  if (hasLat !== hasLng) throw new PlaceError('Pass both lat and lng (or lon/long).', 'bad_coordinates');
  if (hasLat) {
    const lat = coord('lat', q.lat, 90), lng = coord('lng', q.lng, 180);
    if (tz) return { source: 'coordinates', name: null, lat, lng, timeZone: tz };
    const n = nearest(lat, lng);
    if (!n.city || n.km > 400 || !isValidTimeZone(n.city.timeZone)) {
      throw new PlaceError('No time zone could be inferred for these coordinates (no listed city within 400 km). Add tz, e.g. &tz=America/Toronto.', 'timezone_required');
    }
    return { source: 'coordinates', name: null, lat, lng, timeZone: n.city.timeZone, timeZoneFrom: `nearest listed city: ${label(n.city)} (${Math.round(n.km)} km)` };
  }
  if (q.city !== undefined) {
    const c = findCity(q.city, tz);
    return { source: 'city', name: label(c), lat: c.lat, lng: c.lng, timeZone: c.timeZone };
  }
  if (tz) return { source: 'timezone', name: null, lat: null, lng: null, timeZone: tz };
  throw new PlaceError('Empty location parameters.', 'bad_location');
}

module.exports = { resolve, PlaceError, normalize };
