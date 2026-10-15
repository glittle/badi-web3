import { chromium } from 'playwright-core'
import fs from 'node:fs'
import path from 'node:path'
import { PNG } from 'pngjs'
import pixelmatch from 'pixelmatch'

const outDir = '/opt/cursor/artifacts/compare'
fs.mkdirSync(outDir, { recursive: true })

const routes = [
  { id: 'home', hash: '#/' },
  { id: 'listing', hash: '#/listing' },
  { id: 'verse', hash: '#/verse' },
  { id: 'notifications', hash: '#/notifications' },
  { id: 'locationsetup', hash: '#/locationsetup' },
  { id: 'othersetup', hash: '#/othersetup' },
  { id: 'about', hash: '#/about' },
  { id: 'missing', hash: '#/not-a-page' }
]

const viewports = [
  { id: 'phone', width: 390, height: 844 },
  { id: 'desktop', width: 1280, height: 800 }
]

const sites = [
  { id: 'live', origin: 'https://wondrous-badi.today' },
  { id: 'new', origin: 'http://127.0.0.1:4173' }
]

function crop(src, w, h) {
  const dst = new PNG({ width: w, height: h })
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const si = (src.width * y + x) << 2
      const di = (w * y + x) << 2
      dst.data[di] = src.data[si]
      dst.data[di + 1] = src.data[si + 1]
      dst.data[di + 2] = src.data[si + 2]
      dst.data[di + 3] = src.data[si + 3]
    }
  }
  return dst
}

function diffImages(aPath, bPath) {
  if (!fs.existsSync(aPath) || !fs.existsSync(bPath)) return null
  const a = PNG.sync.read(fs.readFileSync(aPath))
  const b = PNG.sync.read(fs.readFileSync(bPath))
  const width = Math.min(a.width, b.width)
  const height = Math.min(a.height, b.height)
  const mismatched = pixelmatch(crop(a, width, height).data, crop(b, width, height).data, null, width, height, { threshold: 0.2 })
  return {
    pct: Math.round((1000 * mismatched) / (width * height)) / 10,
    width,
    height,
    live: `${a.width}x${a.height}`,
    next: `${b.width}x${b.height}`
  }
}

async function shoot(page, file, full) {
  if (full) {
    await page.addStyleTag({
      content: `html,body,#q-app,.layout,.layout-content,.layout-view{height:auto!important;max-height:none!important;overflow:visible!important;position:static!important;}`
    })
    await page.screenshot({ path: file, fullPage: true })
    await page.reload({ waitUntil: 'domcontentloaded' })
    return
  }
  await page.screenshot({ path: file })
}

const browser = await chromium.launch({
  executablePath: '/usr/bin/google-chrome-stable',
  args: ['--no-sandbox', '--disable-dev-shm-usage']
})

const report = { shots: [], errors: {}, zoom: null }

for (const vp of viewports) {
  for (const site of sites) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
      timezoneId: 'America/Vancouver',
      locale: 'en-US'
    })
    await context.addInitScript(() => {
      const enc = (v) => {
        if (typeof v === 'number') return '__q_numb|' + v
        if (typeof v === 'boolean') return '__q_bool|' + (v ? '1' : '0')
        return '__q_strn|' + v
      }
      const offset = new Date().getTimezoneOffset()
      localStorage.setItem('coord.lat', enc(49.2827))
      localStorage.setItem('coord.lng', enc(-123.1207))
      localStorage.setItem('coord.name', enc('Vancouver'))
      localStorage.setItem('coord.source', enc('user'))
      localStorage.setItem('coord.tz', enc(offset))
      localStorage.setItem('use24hour', enc(false))
      localStorage.setItem('useArNames', enc(false))
    })
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', (err) => errors.push(String(err)))
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    report.errors[`${site.id}-${vp.id}`] = errors

    for (const route of routes) {
      const url = site.origin + '/' + route.hash
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 })
      await page.waitForSelector('h1, .error-code', { timeout: 20000 })
      await page.waitForTimeout(route.id === 'home' ? 1800 : 700)
      const file = path.join(outDir, `${route.id}-${vp.id}-${site.id}.png`)
      await page.screenshot({ path: file })
      const header = await page.locator('h1').first().textContent().catch(() => '')
      const h2 = await page.locator('.toolbar-title h2').textContent().catch(() => '')
      report.shots.push({ route: route.id, viewport: vp.id, site: site.id, file, header: (header || '').trim(), h2: (h2 || '').replace(/\s+/g, ' ').trim().slice(0, 140) })
      if (vp.id === 'phone' && ['home', 'listing', 'verse'].includes(route.id)) {
        const full = path.join(outDir, `${route.id}-${vp.id}-${site.id}-full.png`)
        await page.addStyleTag({
          content: `html,body,#q-app,.layout,.layout-content,.layout-view{height:auto!important;max-height:none!important;overflow:visible!important;position:static!important;}`
        })
        await page.screenshot({ path: full, fullPage: true })
      }
    }
    await context.close()
  }
}

// Zoom on the new build, phone width.
{
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    timezoneId: 'America/Vancouver',
    hasTouch: true,
    isMobile: true
  })
  await context.addInitScript(() => {
    const enc = (v) => typeof v === 'number' ? '__q_numb|' + v : (typeof v === 'boolean' ? '__q_bool|' + (v ? '1' : '0') : '__q_strn|' + v)
    localStorage.setItem('coord.lat', enc(49.2827))
    localStorage.setItem('coord.lng', enc(-123.1207))
    localStorage.setItem('coord.name', enc('Vancouver'))
    localStorage.setItem('coord.source', enc('user'))
    localStorage.setItem('coord.tz', enc(new Date().getTimezoneOffset()))
  })
  const page = await context.newPage()
  await page.goto('http://127.0.0.1:4173/#/', { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('h1')
  await page.waitForTimeout(800)
  const meta = await page.locator('meta[name="viewport"]').getAttribute('content')
  const touchAction = await page.evaluate(() => getComputedStyle(document.documentElement).touchAction)
  await page.screenshot({ path: path.join(outDir, 'zoom-before.png') })
  const client = await context.newCDPSession(page)
  let pinchError = null
  let scale = 1
  try {
    await client.send('Input.synthesizePinchGesture', {
      x: 195,
      y: 420,
      scaleFactor: 2,
      relativeSpeed: 80,
      gestureSourceType: 'touch'
    })
    await page.waitForTimeout(400)
    scale = await page.evaluate(() => window.visualViewport ? window.visualViewport.scale : 1)
  } catch (err) {
    pinchError = String(err)
  }
  await page.screenshot({ path: path.join(outDir, 'zoom-after-pinch.png') })
  let browserZoom = null
  try {
    await client.send('Emulation.setPageScaleFactor', { pageScaleFactor: 1.75 })
    browserZoom = await page.evaluate(() => window.visualViewport ? window.visualViewport.scale : null)
    await page.screenshot({ path: path.join(outDir, 'zoom-after-browser.png') })
  } catch (err) {
    browserZoom = 'error: ' + err.message
  }
  report.zoom = { meta, touchAction, pinchScale: scale, pinchError, browserZoom }
  await context.close()
}

await browser.close()

const rows = []
for (const route of routes) {
  for (const vp of viewports) {
    const live = path.join(outDir, `${route.id}-${vp.id}-live.png`)
    const next = path.join(outDir, `${route.id}-${vp.id}-new.png`)
    const d = diffImages(live, next)
    const liveShot = report.shots.find((s) => s.route === route.id && s.viewport === vp.id && s.site === 'live')
    const newShot = report.shots.find((s) => s.route === route.id && s.viewport === vp.id && s.site === 'new')
    rows.push({
      route: route.id,
      viewport: vp.id,
      diffPct: d ? d.pct : null,
      liveHeader: liveShot && liveShot.h2,
      newHeader: newShot && newShot.h2,
      headerMatch: liveShot && newShot ? liveShot.h2 === newShot.h2 : false
    })
  }
}
report.rows = rows
fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2))
console.log(JSON.stringify({ rows, zoom: report.zoom, errorCounts: Object.fromEntries(Object.entries(report.errors).map(([k, v]) => [k, v.length])) }, null, 2))
