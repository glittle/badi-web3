#!/usr/bin/env node
// Reader for the /badiService call log (Upstash Redis REST).
// Credentials: KV_REST_API_URL + KV_REST_API_TOKEN (or UPSTASH_REDIS_REST_URL/TOKEN) in the environment.
// Get them locally with:  npx vercel env pull .env.calllog --environment=production   then:  node --env-file=.env.calllog scripts/calllog.mjs ...
// (.env* files are git/vercel-ignored; delete the file when done.)
//
// Usage:
//   node scripts/calllog.mjs callers                 caller table (code, first/last seen, count, details)
//   node scripts/calllog.mjs days [YYYY-MM]          calls per code per day (default: current month)
//   node scripts/calllog.mjs csv  [YYYY-MM] > hits.csv   export the hits (code,time_mt,time_utc,form)
//   node scripts/calllog.mjs months                  which old (v1) monthly hit lists exist, sizes, days left
//   node scripts/calllog.mjs hours [YYYY-MM-DD]      v2: calls per code per hour for a Mountain-time day (default today)
//   node scripts/calllog.mjs forms [YYYY-MM-DD]      v2: calls per code + form for that day
//   node scripts/calllog.mjs samples [YYYY-MM-DD]    v2: the sampled full entries (first 3 per caller per hour)
//   node scripts/calllog.mjs json [YYYY-MM-DD]       v2: hourly counts + samples for that day as JSON (for snapshots)
// Option: --prefix=bstest:  (or env BADISERVICE_LOG_PREFIX) to read a test key prefix instead of "bs:".
// "days" works for both v1 and v2 data. "csv" exports the old per-call lists, which remain until they expire.
const argv = process.argv.slice(2);
const pfxArg = argv.find((a) => a.startsWith('--prefix='));
const PREFIX = pfxArg ? pfxArg.slice(9) : process.env.BADISERVICE_LOG_PREFIX || 'bs:';
const ZONE = 'America/Edmonton';
const url = (process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '').replace(/\/+$/, '');
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
if (!url || !token) { console.error('Set KV_REST_API_URL and KV_REST_API_TOKEN (see header of this file).'); process.exit(1); }

async function redis(...cmd) {
  const r = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(cmd) });
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}
const fmt = (sec) => {
  if (!sec) return '';
  const p = {};
  for (const x of new Intl.DateTimeFormat('en-CA', { timeZone: ZONE, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).formatToParts(new Date(sec * 1000))) p[x.type] = x.value;
  return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}:${p.second}`;
};
const thisMonth = () => fmt(Date.now() / 1000).slice(0, 7);
const csvq = (s) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
const codeNum = (c) => [...c].reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0);

async function allCallers() {
  const seq = Number(await redis('GET', `${PREFIX}callers:seq`)) || 0;
  const out = [];
  for (let n = 1; n <= seq; n++) {
    let code = '', k = n;
    while (k > 0) { code = String.fromCharCode(65 + ((k - 1) % 26)) + code; k = Math.floor((k - 1) / 26); }
    const arr = await redis('HGETALL', `${PREFIX}caller:${code}`);
    const h = {}; for (let i = 0; i < (arr || []).length; i += 2) h[arr[i]] = arr[i + 1];
    out.push({ code, ...h });
  }
  return out;
}

const [cmd = 'callers', arg] = argv.filter((a) => !a.startsWith('--'));

// v2 hourly keys are UTC hours (YYYYMMDDHH). Collect the UTC hours that fall in a Mountain-time day.
const today = () => fmt(Date.now() / 1000).slice(0, 10);
function hoursOfDay(day) {
  const out = []; const t0 = Date.UTC(+day.slice(0, 4), +day.slice(5, 7) - 1, +day.slice(8, 10)) - 86400000;
  for (let t = t0; t < t0 + 3 * 86400000; t += 3600000) {
    if (fmt(t / 1000).slice(0, 10) === day) out.push({ key: new Date(t).toISOString().slice(0, 13).replace(/[-T]/g, ''), mt: fmt(t / 1000).slice(11, 13) });
  }
  return out;
}
async function dayData(day) {
  const hours = [];
  for (const h of hoursOfDay(day)) {
    const arr = (await redis('HGETALL', `${PREFIX}hr:${h.key}`)) || [];
    if (!arr.length) continue;
    const counts = {};
    for (let i = 0; i < arr.length; i += 2) if (!arr[i].startsWith('~')) counts[arr[i]] = +arr[i + 1];
    const samples = ((await redis('LRANGE', `${PREFIX}hs:${h.key}`, '0', '-1')) || []).map((e) => { const [code, sec, form = ''] = e.split(' '); return { code, time_mt: fmt(+sec), time_utc: new Date(sec * 1000).toISOString(), form }; });
    hours.push({ hour_mt: `${day} ${h.mt}:00`, utc_hour: h.key, counts, samples });
  }
  return hours;
}
if (cmd === 'callers') {
  const rows = await allCallers();
  console.log(`Times are Mountain time (${ZONE}).`);
  for (const c of rows) {
    console.log(`${c.code.padEnd(4)} first ${fmt(+c.first)}  last ${fmt(+c.last)}  calls ${String(c.count || 0).padStart(7)}`);
    console.log(`     UA: ${c.ua || '(none)'}${c.referer ? `\n     Referer: ${c.referer}` : ''}${c.origin ? `\n     Origin: ${c.origin}` : ''}`);
  }
} else if (cmd === 'days') {
  const month = arg || thisMonth();
  const days = new Date(Date.UTC(+month.slice(0, 4), +month.slice(5, 7), 0)).getUTCDate();
  const table = {}; const codes = new Set();
  for (let d = 1; d <= days; d++) {
    const day = `${month}-${String(d).padStart(2, '0')}`;
    const arr = await redis('HGETALL', `${PREFIX}days:${day}`);
    if (!arr || !arr.length) continue;
    table[day] = {};
    for (let i = 0; i < arr.length; i += 2) { table[day][arr[i]] = +arr[i + 1]; codes.add(arr[i]); }
  }
  const cols = [...codes].sort((a, b) => codeNum(a) - codeNum(b));
  console.log(['day', ...cols, 'total'].join('\t'));
  for (const [day, row] of Object.entries(table)) {
    const vals = cols.map((c) => row[c] || 0);
    console.log([day, ...vals, vals.reduce((a, b) => a + b, 0)].join('\t'));
  }
} else if (cmd === 'csv') {
  const month = arg || thisMonth();
  const key = `${PREFIX}hits:${month}`;
  const len = Number(await redis('LLEN', key)) || 0;
  process.stdout.write('code,time_mt,time_utc,form\n');
  for (let i = 0; i < len; i += 20000) {
    const chunk = await redis('LRANGE', key, String(i), String(Math.min(i + 19999, len - 1)));
    process.stdout.write(chunk.map((e) => { const [code, sec, form = ''] = e.split(' '); return [code, fmt(+sec), new Date(sec * 1000).toISOString(), csvq(form)].join(','); }).join('\n') + (chunk.length ? '\n' : ''));
  }
} else if (cmd === 'months') {
  let cursor = '0'; const keys = [];
  do { const [c, k] = await redis('SCAN', cursor, 'MATCH', `${PREFIX}hits:*`, 'COUNT', '1000'); cursor = String(c); keys.push(...k); } while (cursor !== '0');
  for (const k of keys.sort()) console.log(`${k.slice(PREFIX.length + 5)}\t${await redis('LLEN', k)} hits\tTTL ${Math.round((await redis('TTL', k)) / 86400)} days`);
} else if (cmd === 'hours' || cmd === 'forms' || cmd === 'samples' || cmd === 'json') {
  const day = arg || today();
  const hours = await dayData(day);
  if (cmd === 'json') { console.log(JSON.stringify({ prefix: PREFIX, day, zone: ZONE, hours }, null, 1)); process.exit(0); }
  console.log(`${day} (Mountain time, ${ZONE}); prefix ${PREFIX}`);
  if (cmd === 'samples') {
    for (const h of hours) for (const x of h.samples) console.log(`${x.time_mt}\t${x.code}\t${x.form}`);
  } else if (cmd === 'forms') {
    const tot = {};
    for (const h of hours) for (const [k, n] of Object.entries(h.counts)) tot[k] = (tot[k] || 0) + n;
    for (const k of Object.keys(tot).sort()) { const [code, form] = k.split(' '); console.log(`${code}\t${form}\t${tot[k]}`); }
  } else {
    const codes = new Set(); const rows = hours.map((h) => { const r = {}; for (const [k, n] of Object.entries(h.counts)) { const c = k.split(' ')[0]; r[c] = (r[c] || 0) + n; codes.add(c); } return [h.hour_mt.slice(11), r]; });
    const cols = [...codes].sort((a, b) => codeNum(a) - codeNum(b));
    console.log(['hour', ...cols, 'total'].join('\t'));
    for (const [hr, r] of rows) { const v = cols.map((c) => r[c] || 0); console.log([hr, ...v, v.reduce((a, b) => a + b, 0)].join('\t')); }
  }
} else {
  console.error('Unknown command. Use: callers | days [YYYY-MM] | hours|forms|samples|json [YYYY-MM-DD] | csv [YYYY-MM] | months  [--prefix=bs:]'); process.exit(1);
}
