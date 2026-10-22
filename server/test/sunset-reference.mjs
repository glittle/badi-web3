// Cross-check our sunsets against api.sunrise-sunset.org (NOAA-based) and badi-mcp's sun.js. Network; run manually.
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { compute } = require('../lib/located.js');
const { resolve } = require('../lib/place.js');
const { dayNum } = require('../lib/badiCalc.js');
const { localToUtc } = require('../lib/zone.js');
const mcp = await import('/workspace/badi-mcp-deploy/dist/calendar/sun.js').catch(() => null);
const cases = [['Quebec', '2026-10-15'], ['Quebec', '2026-06-21'], ['Quebec', '2026-12-21'], ['Quebec', '2026-03-08'], ['Quebec', '2026-11-01'],
  ['Calgary', '2026-10-15'], ['Calgary', '2026-06-21'], ['Sydney', '2026-12-25'], ['Sydney', '2026-06-21'], ['Auckland', '2026-03-21'],
  ['Reykjavik', '2026-06-21'], ['Reykjavik', '2026-12-21'], ['Tehran', '2026-03-20']];
let worst = 0;
for (const [city, ymd] of cases) {
  const place = resolve({ city });
  const [y, m, d] = ymd.split('-').map(Number);
  const ours = Date.parse(compute(place, { n: dayNum(y, m, d), fragment: 1 }, 1, 0).dayEndSunset);
  const r = await (await fetch(`https://api.sunrise-sunset.org/json?lat=${place.lat}&lng=${place.lng}&date=${ymd}&formatted=0&tzid=${place.timeZone}`)).json();
  const ref = Date.parse(r.results.sunset);
  const mcpMs = mcp ? mcp.sunTimesMs(localToUtc(place.timeZone, y, m, d, 12), place.lat, place.lng).sunsetMs : NaN;
  const diff = (ours - ref) / 60000; worst = Math.max(worst, Math.abs(diff));
  console.log(`${city.padEnd(10)} ${ymd} ours ${new Date(ours).toISOString()} ref ${r.results.sunset} diff ${diff.toFixed(2)} min; badi-mcp diff ${((ours - mcpMs) / 1000).toFixed(0)} s`);
  await new Promise((s) => setTimeout(s, 300));
}
console.log(`max |diff| vs sunrise-sunset.org: ${worst.toFixed(2)} min`);
