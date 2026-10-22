# Badíʿ Calendar Tools

A web app with tools for the Badíʿ calendar. Hosted at <https://wondrous-badi.today/>.

Developed by Glen Little. Many features are modelled after the [Badíʿ Calendar](https://chrome.google.com/webstore/detail/bad%C3%AD-calendar/egekinjjpolponbbfjimifpgfdmphomp) browser extension.

## Stack

Version 2.0.0 is the same app on a current toolchain:

- Vue 3
- Vite 6
- Vue Router 4, hash mode (`#/`, `#/listing`, `#/verse`, …)
- Vuex 4
- Node.js 22 or newer (current LTS line)

The interface still uses the Quasar 0.13 material stylesheet and a small set of local widgets (`q-layout`, `q-toggle`, `q-range`, `q-popover`, `q-drawer-link`) so the pages look like the 2017 app. Quasar 2 and Element Plus were not used: both would replace the DOM and the CSS the site is built on.

Calendar math in `src/scripts/badiCalc.js` and `src/scripts/sunCalc.js` is the original code, ported to ES modules.

## Scripts

```bash
npm install
npm run dev       # http://127.0.0.1:5173
npm run build     # static files in dist/
npm run preview   # serve dist/ at http://127.0.0.1:4173
npm run test:storage
```

`npm run build` writes a static `dist/` folder for Vercel. It copies `root/` (`robots.txt`, `sitemap.xml`, `.well-known/assetlinks.json`, `version.json`, the web manifest) and `src/statics/`. `sw-badi-web4.js` is copied and then stamped with the app version, the hashed files from Vite's asset manifest, `/index.html`, the small shell images (tab icons, the four manifest icons, and the static icons the pages use), and the counter sounds (`each.mp3`, `each19.mp3`, `each95.mp3`). A byte-range request for those sounds is answered from that cache. It does not precache `/images` or `/files`. A same-origin request is answered from that precache when the file is there. Paths served outside this app stay outside it: `/manifest.json` (always from the network, so an install never gets an old copy), `/_vercel/` (Vercel Web Analytics, never cached), `/badiService`, `/feasts`, `/images`, `/files`, `/scripts`.

The host should send `Content-Type: application/manifest+json` for `/manifest.json`, and `Cache-Control: no-cache` for `/sw-badi-web4.js`, `/version.json`, and `/index.html`. Hashed files under `/assets/` can be cached as immutable. Do not cache `/badiService`.

`version.json` is regenerated at the start of `dev` and `build` with `buildDate` and the version from `package.json`.

## Server code and deploying (Vercel project `wondrous-badi`)

`server/` holds the Vercel side of wondrous-badi.today, exactly as deployed: `api/badiService.js` (the `/badiService`
date service), `api/hash.js` (old `#/` URL redirects), `lib/` (calendar/sun/place code and the call log, `lib/calllog.js`),
`scripts/calllog.mjs` (call-log reader), `vercel.json` (routes, headers; `outputDirectory: "public"`, no build step),
its own `package.json` (CommonJS, Node 24, `@vercel/functions`), `test/`, and `LOGGING.md` / `BADISERVICE-API.md`.
It is kept apart from the app because the app's `package.json` is `"type": "module"` and the functions are CommonJS.

Vercel needs `api/` at the root of what is uploaded, so a deploy folder is assembled, then deployed from there:

```bash
npm run build                                       # app -> dist/
node scripts/assemble-deploy.mjs ../wb-deploy --legacy=<old deploy folder>/public
cd ../wb-deploy
npx vercel link --yes --project wondrous-badi --scope glittles-projects-f45a13ca   # once per folder (.vercel/ is not in git)
npx vercel deploy                                   # preview; check it, then promote or `npx vercel deploy --prod`
```

The assembled folder is `server/*` + `public/` = `dist/`. `--legacy` copies the top-level items the app build does not
make (`/feasts`, `/files` (PDFs), `/scripts`, `abc.txt`); they are not in git, so keep a copy of the current deploy folder's
`public/`. `/images` is a separate Vercel project (rewrite in `vercel.json`). Never commit `.env*` or `.vercel/`.

## Routes

Hash routes match the previous app. Today, Dates, Verse, and Count are the bottom tabs:

| Menu | Hash |
| --- | --- |
| Today | `#/` |
| Dates | `#/listing` |
| Verse | `#/verse` |
| Notifications | `#/notifications` |
| Location | `#/locationsetup` |
| Other Settings | `#/othersetup` |
| About | `#/about` |
| Count | `#/counters` |

## Settings

`localStorage` keeps the Quasar 0.13 prefixes (`__q_numb|`, `__q_bool|`, `__q_strn|`, …) so an existing browser keeps location, 24-hour time, Arabic month names, the 95-count, and the Dates filters. The verse page stores `counterVerses` with that same prefix. The first time it is read, the saved `tapNum` / `tapGroup95` count is copied onto Alláh-u-Abhá, and later taps on that verse keep `tapNum` in step.

## Zoom

The viewport meta tag no longer sets `maximum-scale`. Touch handlers are passive and ignore a second finger, so pinch-zoom and browser zoom both work. The blue shell still fills the screen; the page column scrolls inside it.

## Absolute URLs that stay

These point at the public site or at services that are not part of `dist/`:

- `https://wondrous-badi.today/` and `https://wondrous-badi.today/statics/featured-wbt.png` (canonical, Open Graph, Twitter)
- `https://wondrous-badi.today/files/FeastBook-*.pdf` (date links; `/files` is hosted separately)
- `/images/…` calendar art (hosted separately)
- Google Fonts, and the Maps Geocoding request in Location setup
- `https://wondrous-badi.today/feasts`, `/images`, `/badiService` in `sitemap.xml`
