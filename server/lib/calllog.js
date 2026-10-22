'use strict';
// Long-term call log for /badiService, stored in Upstash Redis (free plan) over its REST API.
// Two logs:
//   callers: one short code per distinct caller signature (User-Agent + Referer + Origin), with first/last seen + details
//   hits:    one compact entry per call: "<code> <unixSeconds> <form>", in monthly lists
// No IP addresses are stored. Logging runs after the response is sent and can never change or delay it.
const crypto = require('crypto');

const PREFIX = 'bs:';                       // key prefix in the Redis database
const RETENTION_SECONDS = 36 * 31 * 86400;  // monthly hit lists and daily counts kept ~3 years
const TIMEOUT_MS = 1500;
const LOG_ZONE = 'America/Edmonton';        // month/day buckets use Mountain time (like the old IIS host)

function config() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token || process.env.BADISERVICE_LOG === 'off') return null;
  return { url: url.replace(/\/+$/, ''), token };
}

// One EVAL per call (= 1 billable Upstash command).
// KEYS: 1 bysig hash, 2 sequence, 3 month hit list, 4 day count hash
// ARGV: 1 sig, 2 now, 3 ua, 4 referer, 5 origin, 6 form, 7 retention, 8 prefix
const SCRIPT = `
local code = redis.call('HGET', KEYS[1], ARGV[1])
if not code then
  local n = redis.call('INCR', KEYS[2])
  code = ''
  while n > 0 do
    local r = (n - 1) % 26
    code = string.char(65 + r) .. code
    n = math.floor((n - 1) / 26)
  end
  redis.call('HSET', KEYS[1], ARGV[1], code)
  redis.call('HSET', ARGV[8] .. 'caller:' .. code, 'code', code, 'ua', ARGV[3], 'referer', ARGV[4], 'origin', ARGV[5], 'first', ARGV[2])
end
local ck = ARGV[8] .. 'caller:' .. code
redis.call('HSET', ck, 'last', ARGV[2])
redis.call('HINCRBY', ck, 'count', 1)
if redis.call('RPUSH', KEYS[3], code .. ' ' .. ARGV[2] .. ' ' .. ARGV[6]) == 1 then redis.call('EXPIRE', KEYS[3], ARGV[7]) end
if redis.call('HINCRBY', KEYS[4], code, 1) == 1 then redis.call('EXPIRE', KEYS[4], ARGV[7]) end
return code
`;

function localYmd(ms) {
  const p = {};
  for (const x of new Intl.DateTimeFormat('en-CA', { timeZone: LOG_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(ms))) p[x.type] = x.value;
  return { month: `${p.year}-${p.month}`, day: `${p.year}-${p.month}-${p.day}` };
}

const header = (req, name) => {
  const v = req.headers && req.headers[name];
  return (Array.isArray(v) ? v.join(', ') : v || '').slice(0, 500);
};

/** Returns a promise that always resolves (never rejects). */
function logCall(req, form, nowMs = Date.now()) {
  try {
    const cfg = config();
    if (!cfg) return Promise.resolve(null);
    const ua = header(req, 'user-agent'), referer = header(req, 'referer'), origin = header(req, 'origin');
    const sig = crypto.createHash('sha1').update(`${ua}\n${referer}\n${origin}`).digest('hex').slice(0, 20);
    const { month, day } = localYmd(nowMs);
    const body = JSON.stringify(['EVAL', SCRIPT, '4',
      `${PREFIX}callers:bysig`, `${PREFIX}callers:seq`, `${PREFIX}hits:${month}`, `${PREFIX}days:${day}`,
      sig, String(Math.floor(nowMs / 1000)), ua, referer, origin, form, String(RETENTION_SECONDS), PREFIX]);
    return fetch(cfg.url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${cfg.token}`, 'Content-Type': 'application/json' },
      body,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    }).then((r) => r.json()).then((j) => (j && j.result) || null).catch(() => null);
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

module.exports = { logCall, formOf, PREFIX, RETENTION_SECONDS, LOG_ZONE, SCRIPT };
