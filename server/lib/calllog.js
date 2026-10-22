'use strict';
// Long-term call log for /badiService, stored in Upstash Redis (free plan) over its REST API.
//
// v2 (aggregated): calls are counted in memory in each function instance and written in batches:
//   callers:  one short code per distinct caller signature (User-Agent + Referer + Origin), first/last seen, total
//   hr:<UTC hour>  hash, field "<code> <form>" -> calls in that hour  (+ "~<code>" samples taken, "~<code> <form>" form sampled)   ~35 days
//   hs:<UTC hour>  list of sample entries "<code> <unixSeconds> <form>", first 3 per caller per hour + first of each new form  ~35 days
//   days:<MT day>  hash, code -> calls that day (same as v1, kept ~3 years)
// One flush = one EVAL = one billable Upstash command, however many calls it carries.
// A flush is sent right away when a caller/form is new to this instance in the current hour (so new callers,
// new forms and every sample land immediately), otherwise at most every FLUSH_MS or when THRESHOLD calls are pending.
// No IP addresses are stored. Logging runs after the response is sent and can never change or delay it.
const crypto = require('crypto');

const PREFIX = process.env.BADISERVICE_LOG_PREFIX || 'bs:'; // key prefix (previews/tests can use e.g. "bstest:")
const RETENTION_SECONDS = 36 * 31 * 86400;  // daily counts kept ~3 years (old v1 monthly hit lists expire on their own)
const HOUR_RETENTION_SECONDS = 35 * 86400;  // hourly counts + samples
const SAMPLES_PER_HOUR = 3;
const FLUSH_MS = Math.max(5, Number(process.env.BADISERVICE_LOG_FLUSH_SEC) || 300) * 1000;
const THRESHOLD = 250;
const TIMEOUT_MS = 1500;
const LOG_ZONE = 'America/Edmonton';        // day buckets use Mountain time (like the old IIS host)

function config() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token || process.env.BADISERVICE_LOG === 'off') return null;
  return { url: url.replace(/\/+$/, ''), token };
}

// ARGV: 1 prefix, 2 hour retention, 3 day retention, 4 samples per hour, 5 JSON batch
// batch: [{s:sig, ua, re, or, f:first, l:last, n:total, d:{day:n}, h:{hour:{c:{form:n}, x:[[sec,form],...]}}}]
const SCRIPT = `
local p = ARGV[1]
local hret = tonumber(ARGV[2])
local dret = tonumber(ARGV[3])
local maxs = tonumber(ARGV[4])
local function ttl(k, s) if redis.call('TTL', k) < 0 then redis.call('EXPIRE', k, s) end end
local codes = {}
for _, c in ipairs(cjson.decode(ARGV[5])) do
  local code = redis.call('HGET', p .. 'callers:bysig', c.s)
  local ck
  if not code then
    local n = redis.call('INCR', p .. 'callers:seq')
    code = ''
    while n > 0 do
      local r = (n - 1) % 26
      code = string.char(65 + r) .. code
      n = math.floor((n - 1) / 26)
    end
    redis.call('HSET', p .. 'callers:bysig', c.s, code)
    redis.call('HSET', p .. 'caller:' .. code, 'code', code, 'ua', c.ua, 'referer', c.re, 'origin', c['or'], 'first', tostring(c.f))
  end
  ck = p .. 'caller:' .. code
  local last = tonumber(redis.call('HGET', ck, 'last') or '0')
  if c.l > last then redis.call('HSET', ck, 'last', tostring(c.l)) end
  redis.call('HINCRBY', ck, 'count', c.n)
  for day, n in pairs(c.d) do
    local k = p .. 'days:' .. day
    redis.call('HINCRBY', k, code, n)
    ttl(k, dret)
  end
  for hour, h in pairs(c.h) do
    local hk = p .. 'hr:' .. hour
    for form, n in pairs(h.c) do redis.call('HINCRBY', hk, code .. ' ' .. form, n) end
    ttl(hk, hret)
    local taken = tonumber(redis.call('HGET', hk, '~' .. code) or '0')
    local sk = p .. 'hs:' .. hour
    local pushed = 0
    for _, x in ipairs(h.x) do
      -- first maxs calls of the caller this hour, plus the first call of each further form (up to 4 * maxs)
      local newform = redis.call('HSETNX', hk, '~' .. code .. ' ' .. x[2], 1) == 1
      if taken < maxs or (newform and taken < 4 * maxs) then
        redis.call('RPUSH', sk, code .. ' ' .. tostring(x[1]) .. ' ' .. x[2])
        taken = taken + 1
        pushed = pushed + 1
      end
    end
    if pushed > 0 then
      redis.call('HSET', hk, '~' .. code, taken)
      ttl(sk, hret)
    end
  end
  codes[#codes + 1] = code
end
return codes
`;

const dtf = new Intl.DateTimeFormat('en-CA', { timeZone: LOG_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' });
function localDay(ms) {
  const p = {};
  for (const x of dtf.formatToParts(new Date(ms))) p[x.type] = x.value;
  return `${p.year}-${p.month}-${p.day}`;
}
const utcHour = (ms) => new Date(ms).toISOString().slice(0, 13).replace(/[-T]/g, ''); // YYYYMMDDHH (UTC)

const header = (req, name) => {
  const v = req.headers && req.headers[name];
  return (Array.isArray(v) ? v.join(', ') : v || '').slice(0, 500);
};

// ---- per-instance state ----
let pending = new Map(); // sig -> caller batch entry
let pendingCount = 0;
let lastFlush = 0;
const seen = new Map();  // `${hour}|${sig}` -> { forms:Set, samples:n }  (what this instance has already flushed/queued this hour)

function send(cfg, batch) {
  return fetch(cfg.url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${cfg.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(['EVAL', SCRIPT, '0', PREFIX, String(HOUR_RETENTION_SECONDS), String(RETENTION_SECONDS),
      String(SAMPLES_PER_HOUR), JSON.stringify(batch)]),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  }).then((r) => r.json()).then((j) => (j && j.result) || null).catch(() => null);
}

/** Send everything pending now. Always resolves (never rejects). Failed batches are dropped, not retried. */
function flush(nowMs = Date.now()) {
  try {
    const cfg = config();
    if (!cfg || !pending.size) return Promise.resolve(null);
    const batch = [...pending.values()];
    pending = new Map(); pendingCount = 0; lastFlush = nowMs;
    return send(cfg, batch);
  } catch {
    return Promise.resolve(null);
  }
}

/** Record one call. Returns a promise that always resolves (never rejects): the flush, if one was due. */
function logCall(req, form, nowMs = Date.now()) {
  try {
    const cfg = config();
    if (!cfg) return Promise.resolve(null);
    const ua = header(req, 'user-agent'), referer = header(req, 'referer'), origin = header(req, 'origin');
    const sig = crypto.createHash('sha1').update(`${ua}\n${referer}\n${origin}`).digest('hex').slice(0, 20);
    const sec = Math.floor(nowMs / 1000), hour = utcHour(nowMs), day = localDay(nowMs);

    if (seen.size > 2000) for (const k of seen.keys()) if (!k.startsWith(hour)) seen.delete(k);
    const sk = `${hour}|${sig}`;
    let s = seen.get(sk);
    if (!s) seen.set(sk, (s = { forms: new Set(), samples: 0 }));
    const urgent = !s.forms.has(form);
    s.forms.add(form);

    let c = pending.get(sig);
    if (!c) pending.set(sig, (c = { s: sig, ua, re: referer, or: origin, f: sec, l: sec, n: 0, d: {}, h: {} }));
    c.l = Math.max(c.l, sec); c.f = Math.min(c.f, sec); c.n++;
    c.d[day] = (c.d[day] || 0) + 1;
    const h = c.h[hour] || (c.h[hour] = { c: {}, x: [] });
    h.c[form] = (h.c[form] || 0) + 1;
    if (s.samples < SAMPLES_PER_HOUR || (urgent && s.samples < 4 * SAMPLES_PER_HOUR)) { h.x.push([sec, form]); s.samples++; }
    pendingCount++;

    if (urgent || pendingCount >= THRESHOLD || nowMs - lastFlush >= FLUSH_MS) return flush(nowMs);
    return Promise.resolve(null);
  } catch {
    return Promise.resolve(null);
  }
}

/** Request form: d = dated, u = undated; '2' = after-sunset fragment; c/t/l = city / tz / lat-lng; '!NNN' = non-200 status. */
function formOf(segs, query, status) {
  let f = '';
  if (segs) {
    const ints = segs.slice(0, 3).map((s) => parseInt(s, 10));
    f = ints.length === 3 && ints.every((n) => n && Number.isFinite(n)) ? 'd' : 'u';
    if (segs[3] !== undefined && String(segs[3]).trim() === '2') f += '2';
  } else f = '?';
  const q = query || {};
  if (q.city !== undefined) f += 'c';
  if (q.tz !== undefined) f += 't';
  if (q.lat !== undefined || q.lng !== undefined || q.lon !== undefined || q.long !== undefined) f += 'l';
  if (status !== 200) f += '!' + status;
  return f;
}

/** Test helper: forget per-instance state. */
function _reset() { pending = new Map(); pendingCount = 0; lastFlush = 0; seen.clear(); }

module.exports = { logCall, flush, formOf, PREFIX, RETENTION_SECONDS, HOUR_RETENTION_SECONDS, SAMPLES_PER_HOUR, FLUSH_MS, LOG_ZONE, SCRIPT, _reset };
