# /badiService call log

Vercel (Hobby) keeps request logs for about an hour, so `/badiService` writes its own long-term log, much like
the old IIS logs but smaller and without IP addresses.

## What is stored (v2, aggregated — since 2026-10)

1. **Callers.** Each distinct caller signature (User-Agent, plus Referer and Origin when sent) gets a short code:
   `A`, `B`, … `Z`, `AA`, `AB`, …. For each code: the full User-Agent / Referer / Origin, first-seen time,
   last-seen time and total calls.
2. **Hourly counts** `bs:hr:<YYYYMMDDHH UTC>`: a hash with one field per `"<code> <form>"` holding the number of calls
   that hour. `form` is: `d` dated, `u` undated, `2` the after-sunset form (`/y/m/d/2`), then `c` city, `t` tz,
   `l` lat/lng if those options were used, and `!NNN` if the status was not 200. Kept ~35 days.
3. **Samples** `bs:hs:<YYYYMMDDHH UTC>`: full entries `<code> <unix time> <form>` for the first 3 calls of each caller
   in each hour, plus the first call of every further form that caller used that hour. Kept ~35 days.
4. **Daily counts** `bs:days:<YYYY-MM-DD MT>` per code (kept ~3 years).

The old v1 per-call lists `bs:hits:<YYYY-MM>` are no longer written; existing ones stay readable (`csv`, `months`) until they expire.

### Batching
Each function instance counts calls in memory and writes them with **one** `EVAL` (= 1 Upstash command) per flush.
A flush is sent immediately when a caller/form is new to that instance in the current hour (so new callers, new forms and
all samples land at once); repeat calls are flushed by the next call after 60 s (`BADISERVICE_LOG_FLUSH_SEC`) or once 250
are pending. Repeat calls still in memory when Vercel recycles an instance are lost (at most ~60 s of one busy caller).
A failed flush is dropped, not retried (no double counting).

**Privacy:** no IP addresses, query values or response contents are stored. Only the caller's User-Agent / Referer / Origin
(which identify the app or website, not a person) and the time and shape of each call.

## Where

Upstash Redis on its **free plan**, added through the Vercel Marketplace and connected to the `wondrous-badi` project.
Keys all start with `bs:` (`bs:callers:bysig`, `bs:callers:seq`, `bs:caller:<code>`, `bs:hits:<YYYY-MM>`, `bs:days:<YYYY-MM-DD>`).

One flush costs one Redis command. At ~5,000 calls/day: roughly 1,500–3,000 commands/day (~45k–90k/month) instead of ~150k.

| | Free plan limit | Expected use (~4,500 calls/day) |
| --- | --- | --- |
| Commands | 500,000 / month | ~140,000 / month (+ a few hundred when reading) |
| Storage | 256 MB | ~2.3 MB / month of hits → ~83 MB at the 3-year retention cap |
| Bandwidth | 10 GB / month | ~0.2 GB / month |

The Free plan has no usage-based charges (do not pick Pay-as-you-go or a Fixed plan). If a limit is ever hit, Upstash
rejects further commands until the monthly reset; the service itself keeps answering normally (the log just has a gap).

**Retention:** each monthly hit list and daily count expires about 36 months after it was started.
Caller records are kept indefinitely (there are only a few dozen). Export a month to CSV before it expires if you want to keep it.

## Safety

Logging starts only after the response has been sent (`waitUntil`), has a 1.5-second timeout, and swallows every error.
If the store is missing, slow or unreachable, `/badiService` behaves exactly as before. To switch logging off without
removing the store, set the environment variable `BADISERVICE_LOG=off` and redeploy.

## Reading the log

From `/workspace/wondrous-badi-vercel`:

```
npx vercel env pull .env.calllog --environment=production   # fetch the store credentials (keep private)
node --env-file=.env.calllog scripts/calllog.mjs callers     # caller table
node --env-file=.env.calllog scripts/calllog.mjs days 2026-10  # calls per code per day
node --env-file=.env.calllog scripts/calllog.mjs csv 2026-10 > hits-2026-10.csv
node --env-file=.env.calllog scripts/calllog.mjs months      # old v1 monthly lists, sizes, days left
node --env-file=.env.calllog scripts/calllog.mjs hours 2026-10-22    # calls per code per MT hour
node --env-file=.env.calllog scripts/calllog.mjs forms 2026-10-22    # calls per code + form
node --env-file=.env.calllog scripts/calllog.mjs samples 2026-10-22  # sampled entries
node --env-file=.env.calllog scripts/calllog.mjs json 2026-10-22     # counts + samples as JSON
# add --prefix=bstest: to read preview/test data
rm .env.calllog
```

Times are shown in Mountain time; the CSV also has UTC.
