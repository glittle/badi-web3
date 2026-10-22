// Proves requests WITHOUT the new query params are byte-identical between the original port and the new code.
// Local: old handler (copy at ORIG_DIR) vs new handler, ~870 paths x several query variants.
// Remote (optional): pass a base URL running the old code (e.g. current prod) to compare with new local output.
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const ORIG = process.env.ORIG_DIR || '/tmp/orig';
const oldH = require(`${ORIG}/api/badiService.js`);
const newH = require('../api/badiService.js');
const REMOTE = process.argv[2];

const dates = new Set();
const add = (y, m, d) => { const dt = new Date(Date.UTC(y, m - 1, d)); dates.add(`${dt.getUTCFullYear()}/${dt.getUTCMonth() + 1}/${dt.getUTCDate()}`); };
for (let y = 2015; y <= 2035; y++) { add(y, 1, 1); add(y, 12, 31); for (let d = 18; d <= 23; d++) add(y, 3, d); for (const d of [-5, -4, -3, -2, -1, 0, 1]) add(y, 3, d); }
for (let y = 2015; y <= 2035; y += 2) for (let k = 1; k <= 17; k += 4) { add(y, 3, 21 + 19 * k - 1); add(y, 3, 21 + 19 * k); }
let seed = 42; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
while (dates.size < 410) add(2015 + Math.floor(rnd() * 21), 1 + Math.floor(rnd() * 12), 1 + Math.floor(rnd() * 28));
const paths = [];
for (const d of dates) { paths.push(`/badiService/${d}`, `/badiService/${d}/2`, `/badiService/Today/${d}`); }
paths.push('/badiService', '/badiService/', '/badiService/Today', '/badiService/today/2025/4/30/2', '/badiService/2024/13/40', '/badiService/abc',
  '/badiService/2024/1/1/2/5', '/badiService/2024/1/1/7', '/badiService/2024/1/1/-1', '/badiService/2024/1', '/badiService/0/1/1', '/badiService/-5/1/1',
  '/BadiService/2024/1/1', '/badiService/2024/01/05/', '/badiService/2024/2/30', '/badiService/1/1/1', '/badiService/9999/12/31/2', '/badiService/9999/12/31',
  '/badiService/99999999999/1/1', '/badiService/2024/1/1/2x', '/badiService/Today/2024/1/1/2/9', '/badiService/0001/03/21', '/badiService/1844/3/20/2',
  '/badiService/2024/1/1/+2', '/badiService/%32024/1/1');
const queries = [{}, { x: '1' }, { PATH: 'https://wondrous-badi.today/badiService' }, { timezone: 'America/Toronto' }, { latitude: '46.8' }];

function run(h, path, query, method = 'GET') {
  const res = { statusCode: 0, headers: {}, body: '', setHeader(k, v) { this.headers[k.toLowerCase()] = v; }, end(b) { this.body = b || ''; } };
  h({ method, query: { full: path, ...query } }, res);
  return res;
}
let n = 0, bad = 0;
for (const p of paths) for (const q of queries) for (const m of q === queries[0] ? ['GET', 'POST', 'HEAD'] : ['GET']) {
  const a = run(oldH, p, q, m), b = run(newH, p, q, m); n++;
  if (a.statusCode !== b.statusCode || a.body !== b.body || JSON.stringify(a.headers) !== JSON.stringify(b.headers)) { bad++; if (bad < 5) console.log('DIFF', p, q, m, a, b); }
}
console.log(JSON.stringify({ local: { comparisons: n, mismatches: bad } }));

if (REMOTE) {
  let rn = 0, rbad = 0, i = 0;
  const list = paths.flatMap((p) => [[p, {}], [p, { x: '1' }]]);
  async function worker() {
    while (i < list.length) {
      const [p, q] = list[i++];
      const qs = new URLSearchParams(q).toString();
      const r = await fetch(REMOTE + p + (qs ? '?' + qs : ''), { redirect: 'manual' });
      const body = await r.text();
      const b = run(newH, p, q); rn++;
      if (r.status === 308) continue; // Vercel's own '//' normalisation, not reached by the function
      if (r.status !== b.statusCode || (r.status < 400 && body !== b.body) || (r.headers.get('access-control-allow-origin') ?? undefined) !== b.headers['access-control-allow-origin']) {
        rbad++; if (rbad < 5) console.log('RDIFF', p, q, r.status, body.slice(0, 80), b.statusCode, b.body.slice(0, 80));
      }
    }
  }
  await Promise.all([worker(), worker(), worker(), worker()]);
  console.log(JSON.stringify({ remote: REMOTE, comparisons: rn, mismatches: rbad }));
}
