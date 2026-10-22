# /badiService call log

Vercel (Hobby) keeps request logs for about an hour, so `/badiService` writes its own long-term log, much like
the old IIS logs but smaller and without IP addresses.

## What is stored

1. **Callers.** Each distinct caller signature (User-Agent, plus Referer and Origin when sent) gets a short code:
   `A`, `B`, … `Z`, `AA`, `AB`, …. For each code: the full User-Agent / Referer / Origin, first-seen time,
   last-seen time and total calls.
2. **Hits.** One short entry per call: `<code> <unix time> <form>`, kept in one list per month (Mountain time).
   `form` is: `d` dated, `u` undated, `2` the after-sunset form (`/y/m/d/2`), then `c` city, `t` tz, `l` lat/lng if
   those options were used, and `!NNN` if the status was not 200. Examples: `d`, `d2`, `uc`, `d!500`.
3. **Daily counts** per code (used by the reader for quick per-day tables).

**Privacy:** no IP addresses, query values or response contents are stored. Only the caller's User-Agent / Referer / Origin
(which identify the app or website, not a person) and the time and shape of each call.

## Where

Upstash Redis on its **free plan**, added through the Vercel Marketplace and connected to the `wondrous-badi` project.
Keys all start with `bs:` (`bs:callers:bysig`, `bs:callers:seq`, `bs:caller:<code>`, `bs:hits:<YYYY-MM>`, `bs:days:<YYYY-MM-DD>`).

Each call costs exactly one Redis command (a single `EVAL` script that assigns the caller code if new, updates
last-seen, appends the hit and bumps the daily count).

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
node --env-file=.env.calllog scripts/calllog.mjs months      # monthly lists, sizes, days left
rm .env.calllog
```

Times are shown in Mountain time; the CSV also has UTC.
