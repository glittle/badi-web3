'use strict';
// /whereami: the visitor's approximate location from Vercel's edge geolocation headers.
// Replaces the browser's ipinfo.io lookup. The IP address itself is never read, logged or stored.
function header(req, name) {
  const v = req.headers[name];
  return Array.isArray(v) ? v[0] : v;
}

function decode(v) {
  if (!v) return '';
  try { return decodeURIComponent(v); } catch (e) { return v; }
}

module.exports = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const lat = header(req, 'x-vercel-ip-latitude');
  const lng = header(req, 'x-vercel-ip-longitude');
  if (!lat || !lng) {
    res.statusCode = 204; // no geolocation available (e.g. running locally)
    res.end();
    return;
  }
  const body = {
    city: decode(header(req, 'x-vercel-ip-city')),
    region: decode(header(req, 'x-vercel-ip-country-region')),
    country: decode(header(req, 'x-vercel-ip-country')),
    lat: lat,
    lng: lng
  };
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
};
