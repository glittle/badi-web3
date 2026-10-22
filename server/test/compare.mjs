// Compare live https://wondrous-badi.today/badiService with the Vercel deployment, byte-for-byte.
// Usage: node test/compare.mjs [https://wondrous-badi.vercel.app]
// Test-only: the original VM. After the DNS switch, set LIVE_BASE to the VM's direct address.
const LIVE = process.env.LIVE_BASE || 'https://wondrous-badi.today';
const NEW = process.argv[2] || 'https://wondrous-badi.vercel.app';
const CONCURRENCY = 3;

{ const r = await fetch(LIVE + '/badiService'); if (/vercel/i.test(r.headers.get('server') || '')) { console.error('LIVE_BASE now resolves to Vercel, not the VM; aborting'); process.exit(2); } }
const dates = new Set();
const add = (y, m, d) => { const dt = new Date(Date.UTC(y, m - 1, d)); dates.add(`${dt.getUTCFullYear()}/${dt.getUTCMonth() + 1}/${dt.getUTCDate()}`); };
for (let y = 2015; y <= 2035; y++) {
  add(y, 1, 1); add(y, 12, 31);
  for (let d = 18; d <= 23; d++) add(y, 3, d);            // around Naw-Ruz
  for (const d of [-5, -4, -3, -2, -1, 0, 1]) add(y, 3, d); // Ayyám-i-Há / Loftiness start (Feb 24 .. Mar 1)
}
// Badí' month boundaries: 19-day steps from Mar 21 (+/-1 day), sampled
let seed = 42; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
for (let y = 2015; y <= 2035; y += 2) for (let k = 1; k <= 17; k += 4) { add(y, 3, 21 + 19 * k - 1); add(y, 3, 21 + 19 * k); }
while (dates.size < 410) add(2015 + Math.floor(rnd() * 21), 1 + Math.floor(rnd() * 12), 1 + Math.floor(rnd() * 28));

const paths = [];
for (const d of dates) { paths.push(`/badiService/${d}`); paths.push(`/badiService/${d}/2`); }
const extras = ['/badiService', '/badiService/', '/badiService/Today', '/badiService/today/2025/4/30/2', '/badiService/2024/13/40', '/badiService/abc',
  '/badiService/2024/1/1/2/5', '/badiService/2024/1/1/7', '/badiService/2024/1/1/-1', '/badiService/2024/1', '/badiService/0/1/1', '/badiService/-5/1/1',
  '/BadiService/2024/1/1', '/badiService/2024/01/05/', '/badiService/2024/2/30', '/badiService/1/1/1', '/badiService/9999/12/31/2', '/badiService/9999/12/31',
  '/badiService/99999999999/1/1', '/badiService/2024/1/1/2x', '/badiService/2024//1', '/badiService/Today/2024/1/1/2/9', '/badiService/0001/03/21', '/badiService/1844/3/20/2'];
paths.push(...extras);

async function get(base, p) {
  for (let a = 0; a < 3; a++) {
    try {
      const r = await fetch(base + p, { redirect: 'manual' });
      const body = Buffer.from(await r.arrayBuffer());
      return { status: r.status, ct: r.headers.get('content-type'), body };
    } catch (e) { await new Promise((s) => setTimeout(s, 1000)); }
  }
  return { status: -1, ct: null, body: Buffer.alloc(0) };
}
let i = 0, ok = 0; const bad = [];
async function worker() {
  while (i < paths.length) {
    const p = paths[i++];
    const [a, b] = await Promise.all([get(LIVE, p), get(NEW, p)]);
    const isErr = a.status >= 400;
    const same = a.status === b.status && (isErr || (a.body.equals(b.body) && a.ct === b.ct));
    if (same) ok++; else bad.push({ p, live: [a.status, a.ct, a.body.toString().slice(0, 200)], new: [b.status, b.ct, b.body.toString().slice(0, 200)] });
    await new Promise((s) => setTimeout(s, 100));
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));
console.log(JSON.stringify({ dates: dates.size, requestsPerSide: paths.length, match: ok, mismatches: bad.length }, null, 0));
for (const b of bad) console.log(JSON.stringify(b));
