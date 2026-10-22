# Badíʿ Service API

A free web service that gives the Badíʿ (Wondrous) date for any Gregorian date, or for "today".
Responses are JSON. No key or sign-up is needed.

Base address: `https://wondrous-badi.today/badiService`

## Basic use (unchanged)

| Request | Meaning |
| --- | --- |
| `/badiService` | Today (server calendar date, Mountain time) |
| `/badiService/2026/10/15` | The Badíʿ day whose daylight falls on 15 Oct 2026 |
| `/badiService/2026/10/15/2` | The evening of 15 Oct 2026, after sunset (already the next Badíʿ day) |
| `/badiService/Today/...` | Same as the forms above (older links) |

Example: `https://wondrous-badi.today/badiService/2026/10/15`

```json
{"year":183,"month":11,"day":19,"badiMonthInfo":{"localName":"Will","arabicName":"Mashíyyat"},"badiDayInfo":{"localName":"Loftiness","arabicName":"`Alá’"},"relationToMidnight":2}
```

- `year`, `month`, `day`: the Badíʿ date. Month 0 means Ayyám-i-Há.
- `relationToMidnight`: `2` = the daylight part of the Badíʿ day; `1` = the evening before midnight, after the sunset that started the day.

## New: your location or time zone (optional)

Add any of these to any of the addresses above:

| Parameter | Example | Meaning |
| --- | --- | --- |
| `city` | `city=Quebec`, `city=Quebec, Canada`, `city=Calgary` | A city from a built-in list of about 7,300 larger cities. Accents and capitals do not matter. Add the country or region if the name is shared (`city=Springfield, Illinois`). The city supplies its own time zone. |
| `lat` and `lng` | `lat=46.81&lng=-71.21` | Your location (rough is fine). `lon` or `long` also work instead of `lng`. |
| `tz` | `tz=America/Toronto` | An IANA time zone name. With `lat`/`lng` it sets the time zone. Without it the zone is taken from the nearest listed city (within 400 km). |

What changes when you add them:

- **No date + city or lat/lng**: the service uses the current time at that place and today's real sunset there. Before sunset you get today's Badíʿ day (`relationToMidnight` 2); after sunset you get the new Badíʿ day that began at sunset (`relationToMidnight` 1).
- **No date + only `tz`**: today's calendar date in that time zone (no sunset is calculated).
- **With a date**: the date is worked out exactly as before; sunset times for that place are added.
- Extra fields are added after the usual ones:
  - `location`: `source` (`city`, `coordinates` or `timezone`), `name`, `lat`, `lng`, `timeZone`
  - `gregorianDate`: the Gregorian date used (for "today", the local date at that place)
  - `localTime`: the current local time there (only when no date was given)
  - `dayStartSunset` / `dayEndSunset`: local sunset times that begin and end the Badíʿ day shown (with UTC offset)
  - `note`: only when something needs explaining, e.g. near the poles when the sun does not set
- These responses allow use from any web page (`Access-Control-Allow-Origin: *`).

Examples:

- `https://wondrous-badi.today/badiService?city=Quebec`
- `https://wondrous-badi.today/badiService?lat=46.81&lng=-71.21&tz=America/Toronto`
- `https://wondrous-badi.today/badiService/2026/10/15?city=Calgary`

`https://wondrous-badi.today/badiService/2026/10/15?city=Calgary` returns:

```json
{"year":183,"month":11,"day":19,"badiMonthInfo":{"localName":"Will","arabicName":"Mashíyyat"},"badiDayInfo":{"localName":"Loftiness","arabicName":"`Alá’"},"relationToMidnight":2,"location":{"source":"city","name":"Calgary, Alberta, Canada","lat":51.083,"lng":-114.08,"timeZone":"America/Edmonton"},"gregorianDate":"2026-10-15","dayStartSunset":"2026-10-14T18:47:45-06:00","dayEndSunset":"2026-10-15T18:45:38-06:00"}
```

If a city cannot be found or is ambiguous, or a parameter is invalid, the reply is HTTP 400 with a short explanation:

```json
{"error":"\"Springfield\" matches more than one city. Add the region or country, e.g. \"city=Springfield, Massachusetts\". Choices: ...","code":"ambiguous_city","choices":["Springfield, Massachusetts, United States of America","..."]}
```

Sunset times use the same calculation as the Wondrous-Badíʿ Today app and are usually within a minute or two of other sources (a few minutes at high latitudes). Requests without these parameters work exactly as they always have.

## Privacy

The service keeps a simple usage log: the calling app's or website's identification (User-Agent, and Referer/Origin if sent), the time of each call, and whether a date or the location options were used. IP addresses and locations are not recorded.
