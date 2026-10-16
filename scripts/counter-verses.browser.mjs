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
    source: 'Kitáb-i-Aqdas ¶18'
  },
  {
    id: 'guidance-decision-19',
    file: 'verse-guidance.png',
    text: 'Guide me, then, in all mine affairs',
    source: 'Additional Prayers'
  },
  {
    id: 'women-courses-95',
    file: 'verse-women.png',
    text: 'Glorified be God, the Lord of Splendor and Beauty.',
    source: 'Kitáb-i-Aqdas ¶13'
  },
  {
    id: 'missed-prayers-18',
    file: 'verse-travel.png',
    text: 'Glorified be God, the Lord of the kingdoms of earth and heaven.',
    source: 'Kitáb-i-Aqdas ¶14'
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

for (let i = 0; i < expected.length; i++) {
  const verse = expected[i]
  if (i > 0) await page.getByRole('button', { name: 'Next verse' }).click()
  await page.locator('article.CounterVerses .cvText').getByText(verse.text, { exact: false }).waitFor()
  const shown = await page.locator('article.CounterVerses').getAttribute('data-verse')
  assert.equal(shown, verse.id)
  const source = await page.locator('.cvSource').innerText()
  assert.match(source, new RegExp(verse.source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  const box = await tap.boundingBox()
  assert.ok(box, 'tap button is missing')
  assert.ok(box.y > 420, 'counter is not in the thumb zone: y=' + box.y)
  assert.ok(box.y + box.height < 844, 'tap button is below the viewport')
  await page.screenshot({ path: outDir + '/' + verse.file })
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

await page.getByRole('button', { name: 'Back' }).click()
await page.locator('.tap95card .tapNum').waitFor()
assert.match(page.url(), /#\/?$/)
assert.equal((await page.locator('.tap95card .tapNum').innerText()).trim(), '18')

assert.deepEqual(errors, [], 'console errors: ' + errors.join('\n'))
await browser.close()
console.log('browser check passed')
