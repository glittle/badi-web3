// Checks the reload notice: a service worker update shows "New version found —
// reloading…" before the page reloads, the About link shows "Reloading…", and a
// Count tally survives both reloads. Run against `npm run preview`.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { chromium } from 'playwright-core'

const base = process.env.PREVIEW_URL || 'http://127.0.0.1:4173'
const outDir = process.env.ARTIFACT_DIR || '/opt/cursor/artifacts'
fs.mkdirSync(outDir, { recursive: true })

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome',
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage']
})
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
const errors = []
page.on('pageerror', (err) => errors.push(err.message))
page.on('console', (msg) => {
  if (msg.type() !== 'error') return
  const text = msg.text()
  if (/_vercel\/insights|googleapis|gstatic|firebase|fonts\.g|Failed to load resource|net::ERR/i.test(text)) return
  errors.push(text)
})
await page.addInitScript(() => {
  if (localStorage.getItem('__reloadTestReady')) return
  localStorage.setItem('tapAuto', '__q_bool|0')
  localStorage.setItem('tapSounds', '__q_bool|0')
  localStorage.setItem('__reloadTestReady', '__q_bool|1')
})

await page.goto(base + '/#/counters', { waitUntil: 'load' })
await page.waitForFunction(() => navigator.serviceWorker && navigator.serviceWorker.controller, null, { timeout: 20000 })
// Load again so the page starts under a controller, as after any earlier visit.
await page.reload({ waitUntil: 'load' })
await page.locator('article.CounterVerses').waitFor()
const tap = page.locator('article.CounterVerses button.primary.circular')
const num = async () => (await page.locator('article.CounterVerses .tapNum').innerText()).trim()
await page.locator('article.CounterVerses button.reset').click()
for (let i = 0; i < 3; i++) await tap.click()
assert.equal(await num(), '3')

async function expectNoticeThenReload(trigger, text, shot) {
  await page.evaluate(() => { window.__beforeReload = true })
  await trigger()
  const notice = page.locator('#reloadNotice')
  await notice.waitFor({ state: 'visible', timeout: 2000 })
  // The text goes in just after the alert region is added, so screen readers announce it.
  assert.equal(await notice.getAttribute('role'), 'alert')
  await page.waitForFunction((t) => (document.querySelector('#reloadNotice') || {}).innerText?.trim() === t, text, { timeout: 1000 })
  assert.equal((await notice.innerText()).trim(), text)
  await page.waitForTimeout(400)
  await page.screenshot({ path: outDir + '/' + shot })
  assert.equal(await page.evaluate(() => window.__beforeReload === true), true, 'reloaded before the notice could be read')
  await page.waitForFunction(() => window.__beforeReload !== true, null, { timeout: 5000 })
  await page.waitForLoadState('load')
  assert.equal(await page.locator('#reloadNotice').count(), 0)
}

// 1. A new worker takes control: the update path.
await expectNoticeThenReload(
  () => page.evaluate(() => navigator.serviceWorker.dispatchEvent(new Event('controllerchange'))),
  'New version found — reloading…',
  'reload-notice-update.png'
)
await page.locator('article.CounterVerses').waitFor()
assert.equal(await num(), '3', 'count lost across the update reload')

// 2. About: "force a reload now".
await page.goto(base + '/#/about', { waitUntil: 'load' })
const about = page.locator('.About')
await about.waitFor()
assert.match(await about.innerText(), /Version \d+\.\d+\.\d+ \(built .+ ago - force a reload now\)/)
await expectNoticeThenReload(() => page.locator('.About .reload').click(), 'Reloading…', 'reload-notice-about.png')
await page.goto(base + '/#/counters', { waitUntil: 'load' })
await page.locator('article.CounterVerses').waitFor()
assert.equal(await num(), '3', 'count lost across the About reload')

assert.deepEqual(errors, [], 'console errors: ' + errors.join('\n'))
await browser.close()
console.log('reload notice check passed')
