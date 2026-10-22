// Call-log tests. Needs a local redis on :6390 and test/upstash-shim.py on :18790 (normal) and :18791 (5 s delay).
// Run: node --test test/calllog.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { logCall, formOf, flush, _reset } = require('../lib/calllog.js');
const handler = require('../api/badiService.js');

const setEnv = (url) => { if (url) { process.env.KV_REST_API_URL = url; process.env.KV_REST_API_TOKEN = 'testtoken'; } else { delete process.env.KV_REST_API_URL; delete process.env.KV_REST_API_TOKEN; } };
const rc = async (...cmd) => (await (await fetch('http://127.0.0.1:18790/', { method: 'POST', headers: { Authorization: 'Bearer testtoken' }, body: JSON.stringify(cmd) })).json()).result;
function call(path, query = {}, headers = {}) {
  const res = { statusCode: 0, headers: {}, body: '', setHeader(k, v) { this.headers[k.toLowerCase()] = v; }, end(b) { this.body = b || ''; } };
  handler({ method: 'GET', query: { full: path, ...query }, headers }, res);
  return res;
}
const sleep = (ms) => new Promise((s) => setTimeout(s, ms));

test('formOf', () => {
  assert.equal(formOf(['2026', '10', '15'], {}, 200), 'd');
  assert.equal(formOf(['2026', '10', '15', '2'], {}, 200), 'd2');
  assert.equal(formOf([], {}, 200), 'u');
  assert.equal(formOf([], { city: 'Quebec' }, 200), 'uc');
  assert.equal(formOf(['2026', '10', '15'], { lat: '1', lng: '2', tz: 'UTC' }, 200), 'dtl');
  assert.equal(formOf(['2024', '13', '40'], {}, 500), 'd!500');
});

test('callers get codes A, B, ...; hits and day counts recorded; no IPs', async () => {
  setEnv('http://127.0.0.1:18790/');
  const android = { 'user-agent': 'Dalvik/2.1.0 (Linux; U; Android 16; SM-S906W Build/BP2A.250605.031.A3)', 'x-forwarded-for': '203.0.113.9' };
  const wp = { 'user-agent': 'WordPress/7.1.3; https://bahaiquebec.org', referer: 'https://bahaiquebec.org/' };
  const ios = { 'user-agent': 'Adjure/1 CFNetwork/3860.700.2 Darwin/25.6.0' };
  for (let i = 0; i < 3; i++) call('/badiService/2026/10/15', {}, android);
  call('/badiService', {}, wp);
  call('/badiService/Today/2026/10/15/2', {}, ios);
  call('/badiService', { city: 'Quebec' }, wp);
  call('/badiService/2024/13/40', {}, android);
  await sleep(500); await flush(); await sleep(500);
  assert.equal(await rc('GET', 'bs:callers:seq'), '3');
  const a = await rc('HGETALL', 'bs:caller:A');
  assert.ok(a.includes('Dalvik/2.1.0 (Linux; U; Android 16; SM-S906W Build/BP2A.250605.031.A3)'));
  assert.equal(a[a.indexOf('count') + 1], '4');
  const keys = await rc('KEYS', '*');
  const dump = JSON.stringify(await Promise.all(keys.map(async (k) => [k, await rc('TYPE', k) === 'list' ? await rc('LRANGE', k, '0', '-1') : await rc('TYPE', k) === 'hash' ? await rc('HGETALL', k) : await rc('GET', k)])));
  assert.ok(!dump.includes('203.0.113.9'));
  const hk = keys.find((k) => k.startsWith('bs:hr:'));
  const h = await rc('HGETALL', hk); const m = {}; for (let i = 0; i < h.length; i += 2) m[h[i]] = h[i + 1];
  assert.equal(m['A d'], '3'); assert.equal(m['A d!500'], '1'); assert.equal(m['B u'], '1'); assert.equal(m['B uc'], '1'); assert.equal(m['C d2'], '1');
  const samples = await rc('LRANGE', hk.replace(':hr:', ':hs:'), '0', '-1');
  assert.equal(samples.length, 7); // 3 calls of A + A's new form d!500, B's two forms, C
  assert.ok(await rc('TTL', hk) > 30 * 86400 && await rc('TTL', hk) <= 35 * 86400);
  assert.ok(!keys.some((k) => k.startsWith('bs:hits:'))); // v1 per-call lists are no longer written
});

test('repeat calls are held in memory until the flush interval', async () => {
  _reset(); setEnv('http://127.0.0.1:18790/');
  const t = Date.now(); const req = { headers: { 'user-agent': 'batch' } };
  await logCall(req, 'd', t); for (let i = 1; i < 10; i++) await logCall(req, 'd', t + i * 1000);
  const before = await rc('HGET', 'bs:caller:' + (await rc('HGET', 'bs:callers:bysig', Object.keys({}).length ? '' : (await rc('HKEYS', 'bs:callers:bysig')).slice(-1)[0])), 'count');
  assert.equal(before, '1');
  await logCall(req, 'd', t + 61000);
  const after = await rc('HGET', 'bs:caller:' + (await rc('HGET', 'bs:callers:bysig', (await rc('HKEYS', 'bs:callers:bysig')).slice(-1)[0])), 'count');
  assert.equal(after, '11');
});

test('store unreachable / slow / unset: response identical and immediate; logCall settles fast', async () => {
  const ref = call('/badiService/2026/10/15', {}, {});
  for (const url of ['http://127.0.0.1:9/', 'http://127.0.0.1:18791/', null, 'not a url']) {
    setEnv(url);
    const t0 = performance.now();
    const r = call('/badiService/2026/10/15', {}, { 'user-agent': 'x' });
    assert.ok(performance.now() - t0 < 50, `sync response for ${url}`);
    assert.equal(r.body, ref.body); assert.equal(r.statusCode, 200); assert.deepEqual(r.headers, ref.headers);
    const t1 = performance.now();
    const v = await logCall({ headers: { 'user-agent': 'x' } }, 'd');
    assert.equal(v, null);
    assert.ok(performance.now() - t1 < 2500, `logCall timeout for ${url}`);
  }
  setEnv(null);
});
