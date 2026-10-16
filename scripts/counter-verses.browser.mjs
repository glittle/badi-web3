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

const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 1
})

const errors = []
page.on('pageerror', (err) => errors.push(err.message))
page.on('console', (msg) => {
  if (msg.type() !== 'error') return
  const text = msg.text()
  if (/google-analytics|googleapis|gstatic|firebase|fonts\.g|Failed to load resource|net::ERR/i.test(text)) return
  errors.push(text)
})

await page.addInitScript(() => {
  if (localStorage.getItem('__verseTestReady')) return
  localStorage.setItem('tapNum', '__q_numb|17')
  localStorage.setItem('tapGroup95', '__q_numb|2')
  localStorage.setItem('tapAuto', '__q_bool|0')
  localStorage.setItem('tapSounds', '__q_bool|0')
  localStorage.setItem('tapContinue', '__q_bool|1')
  localStorage.setItem('__verseTestReady', '__q_bool|1')
})

await page.goto(base + '/#/', { waitUntil: 'domcontentloaded' })
const more = page.locator('.tap95card button.more')
await more.waitFor({ state: 'visible' })
await more.scrollIntoViewIfNeeded()
await more.click()
await page.waitForSelector('article.CounterVerses')
assert.match(page.url(), /#\/counters/)

const expected = [
  {
    id: 'allah-u-abha-95',
    file: 'verse-allah-u-abha.png',
    text: 'Alláh-u-Abhá',
    source: 'Bahá’u’lláh, Kitáb-i-Aqdas',
    url: 'https://www.bahai.org/library/authoritative-texts/bahaullah/kitab-i-aqdas/5#589705584'
  },
  {
    id: 'guidance-decision-19',
    file: 'verse-guidance.png',
    text: 'Guide me, then, in all mine affairs',
    source: 'Bahá’u’lláh, Additional Prayers Revealed by Bahá’u’lláh',
    url: 'https://www.bahai.org/library/authoritative-texts/bahaullah/additional-prayers-revealed-bahaullah/418930760/1#884624320'
  },
  {
    id: 'women-courses-95',
    file: 'verse-women.png',
    text: 'Glorified be God, the Lord of Splendor and Beauty.',
    source: 'Bahá’u’lláh, Kitáb-i-Aqdas',
    url: 'https://www.bahai.org/library/authoritative-texts/bahaullah/kitab-i-aqdas/5#218902736'
  },
  {
    id: 'missed-prayers-18',
    file: 'verse-travel.png',
    text: 'Glorified be God, the Lord of the kingdoms of earth and heaven.',
    source: 'Bahá’u’lláh, Kitáb-i-Aqdas',
    url: 'https://www.bahai.org/library/authoritative-texts/bahaullah/kitab-i-aqdas/5#433941746'
  }
]

async function swipe(direction) {
  await page.locator('.cvCarousel').evaluate((el, direction) => {
    const rect = el.getBoundingClientRect()
    const y = rect.top + Math.min(rect.height / 2, 80)
    const startX = direction === 'left' ? rect.left + rect.width * 0.82 : rect.left + rect.width * 0.18
    const endX = direction === 'left' ? rect.left + rect.width * 0.18 : rect.left + rect.width * 0.82
    const touch = (x) => new Touch({ identifier: 1, target: el, clientX: x, clientY: y })
    el.dispatchEvent(new TouchEvent('touchstart', {
      bubbles: true,
      cancelable: true,
      touches: [touch(startX)],
      changedTouches: [touch(startX)]
    }))
    el.dispatchEvent(new TouchEvent('touchend', {
      bubbles: true,
      cancelable: true,
      touches: [],
      changedTouches: [touch(endX)]
    }))
  }, direction)
}

const tap = page.locator('article.CounterVerses button.primary.circular')
const versesTab = page.locator('.layout-footer .tbLink', { hasText: 'Count' })
await versesTab.waitFor({ state: 'visible' })
assert.match(await versesTab.locator('img').getAttribute('src'), /counter95\.svg/)
assert.equal(await versesTab.evaluate((el) => el.classList.contains('active')), true)

async function layoutOf() {
  return page.evaluate(() => {
    const q = (sel) => document.querySelector(sel)
    const box = (el) => {
      const b = el.getBoundingClientRect()
      return {
        y: Math.round(b.y),
        x: Math.round(b.x),
        w: Math.round(b.width),
        h: Math.round(b.height),
        b: Math.round(b.bottom)
      }
    }
    return {
      title: box(q('article.CounterVerses h2')),
      box: box(q('article.CounterVerses .cvTextBox')),
      button: box(q('article.CounterVerses button.primary.circular')),
      dots: box(q('article.CounterVerses .cvTapDots')),
      prefs: box(q('article.CounterVerses .cvPrefs')),
      actions: box(q('article.CounterVerses .cvActions')),
      delay: box(q('article.CounterVerses .tapDelayArea')),
      footer: box(q('.layout-footer')),
      vw: window.innerWidth,
      vh: window.innerHeight
    }
  })
}

function assertLayout(layout, label) {
  const buttonMid = layout.button.y + layout.button.h / 2
  assert.ok(buttonMid > layout.vh * 0.45, label + ' tap button is not in the lower half: ' + buttonMid)
  assert.ok(layout.button.x > layout.dots.x, label + ' tap button is not beside the dots')
  assert.ok(layout.button.y < layout.dots.b && layout.button.b > layout.dots.y, label + ' tap button does not line up with the dots')
  assert.ok(layout.prefs.y >= layout.actions.b + 8, label + ' Auto and Sound are not below the reset row')
  assert.ok(layout.delay.y >= layout.prefs.b + 6, label + ' slider is not below Auto and Sound')
  assert.ok(layout.box.y >= layout.title.b + 12, label + ' verse box has no top margin')
  assert.ok(layout.box.y >= layout.title.b - 12, label + ' verse box is not under the title')
  assert.ok(layout.button.b <= layout.footer.y, label + ' tap button overlaps the bottom bar')
  assert.ok(layout.delay.b <= layout.footer.y + 1, label + ' slider is behind the bottom bar')
  assert.ok(layout.actions.b <= layout.footer.y + 1, label + ' reset row is behind the bottom bar')
  assert.equal(layout.heading, undefined)
}

const tops = []

for (let i = 0; i < expected.length; i++) {
  const verse = expected[i]
  if (i > 0) await page.getByRole('button', { name: 'Next verse' }).click()
  await page.locator('article.CounterVerses .cvText').getByText(verse.text, { exact: false }).waitFor()
  const shown = await page.locator('article.CounterVerses').getAttribute('data-verse')
  assert.equal(shown, verse.id)
  assert.equal(await page.locator('article.CounterVerses button.back').count(), 0)
  assert.equal(await page.locator('article.CounterVerses .heading').count(), 0)
  const sourceLink = page.locator('.cvSource a')
  assert.equal((await sourceLink.innerText()).replace(/\s+/g, ' ').trim(), verse.source)
  assert.equal(await sourceLink.getAttribute('href'), verse.url)
  assert.doesNotMatch(await sourceLink.innerText(), /Notes|Synopsis|Q&A|¶|UHJ|background|authorized/)
  const boxStyle = await page.locator('.cvTextBox').evaluate((el) => {
    const style = getComputedStyle(el)
    return { border: parseFloat(style.borderTopWidth), pad: parseFloat(style.paddingTop) }
  })
  assert.ok(boxStyle.border >= 1, 'verse text has no border')
  assert.ok(boxStyle.pad >= 16, 'verse text padding is tight')
  const hug = await page.evaluate(() => {
    const b = document.querySelector('.cvTextBox').getBoundingClientRect()
    const t = document.querySelector('.cvText').getBoundingClientRect()
    return b.height - t.height
  })
  assert.ok(hug < 90, 'verse box does not hug its text: ' + hug)
  const layout = await layoutOf()
  assertLayout(layout, verse.id + ' @390')
  tops.push(layout)
  const continueLabel = page.locator('article.CounterVerses .continue')
  const continueToggle = page.locator('article.CounterVerses .q-toggle')
  if (verse.id === 'allah-u-abha-95') {
    await continueLabel.waitFor({ state: 'visible' })
    assert.match(await continueLabel.innerText(), /Continue past 95/)
    assert.equal(await continueToggle.count(), 1)
    await page.screenshot({ path: outDir + '/verse-with-continue.png' })
    await page.screenshot({ path: outDir + '/after-390x844.png' })
  } else {
    assert.equal(await continueLabel.count(), 0, verse.id + ' still shows continue past')
    assert.equal(await continueToggle.count(), 0, verse.id + ' still shows the continue toggle')
    if (verse.id === 'guidance-decision-19') {
      await page.screenshot({ path: outDir + '/verse-without-continue.png' })
    }
  }
  await page.screenshot({ path: outDir + '/' + verse.file })
}

for (const key of ['title', 'box', 'button']) {
  const ys = tops.map((item) => item[key].y)
  assert.equal(Math.max(...ys), Math.min(...ys), key + ' y changes between verses: ' + ys.join(','))
}

await swipe('right')
assert.equal(await page.locator('article.CounterVerses').getAttribute('data-verse'), 'women-courses-95')
await swipe('left')
assert.equal(await page.locator('article.CounterVerses').getAttribute('data-verse'), 'missed-prayers-18')

await tap.click()
await tap.click()
assert.equal((await page.locator('article.CounterVerses .tapNum').innerText()).trim(), '2')

await page.locator('.cvPager button[aria-label="Alláh-u-Abhá (daily)"]').click()
assert.equal((await page.locator('article.CounterVerses .tapNum').innerText()).trim(), '17')
await tap.click()
assert.equal((await page.locator('article.CounterVerses .tapNum').innerText()).trim(), '18')

await page.getByRole('button', { name: 'Next verse' }).click()
assert.equal((await page.locator('article.CounterVerses .tapNum').innerText()).trim(), '0')
await tap.click()
assert.equal((await page.locator('article.CounterVerses .tapNum').innerText()).trim(), '1')

await page.reload({ waitUntil: 'domcontentloaded' })
await page.locator('article.CounterVerses').waitFor()
assert.equal(await page.locator('article.CounterVerses').getAttribute('data-verse'), 'guidance-decision-19')
assert.equal((await page.locator('article.CounterVerses .tapNum').innerText()).trim(), '1')
await page.locator('.cvPager button[aria-label="Alláh-u-Abhá (daily)"]').click()
assert.equal((await page.locator('article.CounterVerses .tapNum').innerText()).trim(), '18')
await page.locator('.cvPager button[aria-label="Women in their courses"]').click()
assert.equal((await page.locator('article.CounterVerses .tapNum').innerText()).trim(), '0')
await page.locator('.cvPager button[aria-label="After the compensating prostrations"]').click()
assert.equal((await page.locator('article.CounterVerses .tapNum').innerText()).trim(), '2')
assert.equal(await page.locator('article.CounterVerses .continue').count(), 0)

await page.locator('.layout-footer .tbLink', { hasText: 'Today' }).click()
await page.locator('article.Home .tap95card .tapNum').waitFor()
assert.match(page.url(), /#\/?$/)
assert.equal((await page.locator('.tap95card .tapNum').innerText()).trim(), '18')
const homeContinue = page.locator('article.Home .tap95card .continue')
await homeContinue.waitFor({ state: 'visible' })
assert.match(await homeContinue.innerText(), /Continue past 95/)
assert.equal(await page.locator('article.Home .tap95card .q-toggle').count(), 1)

await page.locator('article.Home .tap95card button.more').click()
await page.locator('article.CounterVerses').waitFor()
assert.equal(await page.locator('article.CounterVerses').getAttribute('data-verse'), 'missed-prayers-18')
assert.equal(await page.locator('article.CounterVerses .continue').count(), 0)

async function tapTimes(n) {
  await tap.evaluate((el, times) => {
    for (let i = 0; i < times; i++) el.click()
  }, n)
}

await tapTimes(16)
assert.equal((await page.locator('article.CounterVerses .tapNum').innerText()).trim(), '18')
assert.equal(await tap.isDisabled(), false)
await tapTimes(1)
assert.equal((await page.locator('article.CounterVerses .tapNum').innerText()).trim(), '18')
assert.equal(await tap.isDisabled(), true)

const afterStop = await page.evaluate(() => {
  const raw = localStorage.getItem('counterVerses') || ''
  const saved = JSON.parse(raw.slice(raw.indexOf('|') + 1))
  return {
    tapContinue: localStorage.getItem('tapContinue'),
    tapNum: localStorage.getItem('tapNum'),
    stored: saved.counts['missed-prayers-18']
  }
})
assert.equal(afterStop.tapContinue, '__q_bool|1')
assert.equal(afterStop.tapNum, '__q_numb|18')
assert.deepEqual(afterStop.stored, { count: 0, group: 1 })

await page.locator('.cvPager button[aria-label="Alláh-u-Abhá (daily)"]').click()
await page.locator('article.CounterVerses .continue').waitFor({ state: 'visible' })
await tapTimes(77)
assert.equal((await page.locator('article.CounterVerses .tapNum').innerText()).trim(), '95')
assert.equal(await tap.isDisabled(), false)
await tapTimes(1)
assert.equal((await page.locator('article.CounterVerses .tapNum').innerText()).trim(), '1')
assert.equal(await page.evaluate(() => localStorage.getItem('tapContinue')), '__q_bool|1')
assert.equal(await page.evaluate(() => localStorage.getItem('tapNum')), '__q_numb|1')

await page.locator('.cvPager button').nth(1).click()
assert.equal(await page.locator('article.CounterVerses').getAttribute('data-verse'), 'guidance-decision-19')
assert.equal(await page.locator('article.CounterVerses .continue').count(), 0)

await page.locator('.layout-footer .tbLink', { hasText: 'Today' }).click()
await page.locator('article.Home .tap95card .tapNum').waitFor()
assert.equal((await page.locator('.tap95card .tapNum').innerText()).trim(), '1')
assert.match(await homeContinue.innerText(), /Continue past 95/)
assert.equal(await page.locator('.layout-footer .tbLink', { hasText: 'Today' }).evaluate((el) => el.classList.contains('active')), true)

await versesTab.click()
await page.locator('article.CounterVerses').waitFor()
assert.match(page.url(), /#\/counters/)
assert.equal(await versesTab.evaluate((el) => el.classList.contains('active')), true)

for (const vp of [
  { width: 360, height: 740, shot: 'after-360x740.png' },
  { width: 1280, height: 800, shot: 'after-desktop.png' }
]) {
  await page.setViewportSize({ width: vp.width, height: vp.height })
  await page.locator('.cvPager button').first().click()
  const seen = []
  for (let i = 0; i < expected.length; i++) {
    if (i > 0) await page.locator('.cvPager button').nth(i).click()
    const layout = await layoutOf()
    assertLayout(layout, expected[i].id + ' @' + vp.width)
    seen.push(layout)
  }
  for (const key of ['title', 'box', 'button']) {
    const ys = seen.map((item) => item[key].y)
    assert.equal(Math.max(...ys), Math.min(...ys), vp.width + ' ' + key + ' y changes: ' + ys.join(','))
  }
  await page.locator('.cvPager button').first().click()
  await page.screenshot({ path: outDir + '/' + vp.shot })
}

assert.deepEqual(errors, [], 'console errors: ' + errors.join('\n'))

await page.waitForFunction(() => navigator.serviceWorker && navigator.serviceWorker.controller, null, { timeout: 15000 })
await page.context().setOffline(true)
const sounds = await page.evaluate(async () => {
  const files = ['/statics/each.mp3', '/statics/each19.mp3', '/statics/each95.mp3']
  const results = []
  for (const url of files) {
    const full = await fetch(url)
    const fullBuf = await full.arrayBuffer()
    const ranged = await fetch(url, { headers: { Range: 'bytes=0-7' } })
    const rangeBuf = await ranged.arrayBuffer()
    const audio = document.createElement('audio')
    audio.preload = 'auto'
    audio.src = url
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('timeout ' + url)), 8000)
      audio.onloadeddata = () => {
        clearTimeout(timer)
        resolve()
      }
      audio.onerror = () => {
        clearTimeout(timer)
        reject(new Error('audio ' + url + ' ' + (audio.error && audio.error.code)))
      }
      audio.load()
    })
    const seekTo = audio.duration > 0.05 ? 0.05 : 0
    if (seekTo > 0) {
      await new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('seek ' + url)), 8000)
        audio.onseeked = () => {
          clearTimeout(timer)
          resolve()
        }
        audio.onerror = () => {
          clearTimeout(timer)
          reject(new Error('seek error ' + url))
        }
        audio.currentTime = seekTo
      })
    }
    results.push({
      url,
      fullStatus: full.status,
      fullLen: fullBuf.byteLength,
      type: full.headers.get('content-type'),
      rangeStatus: ranged.status,
      rangeLen: rangeBuf.byteLength,
      contentRange: ranged.headers.get('content-range')
    })
  }
  return results
})
await page.context().setOffline(false)
for (const item of sounds) {
  assert.equal(item.fullStatus, 200, item.url)
  assert.ok(item.fullLen > 100, item.url + ' is empty')
  assert.match(item.type || '', /audio\/mpeg/, item.url)
  assert.equal(item.rangeStatus, 206, item.url)
  assert.equal(item.rangeLen, 8, item.url)
  assert.match(item.contentRange || '', /^bytes 0-7\//, item.url)
}

await browser.close()
console.log('browser check passed')
