import assert from 'node:assert/strict'
import fs from 'node:fs'
import { describe, test } from 'node:test'
import { fileURLToPath } from 'node:url'

const sourcePath = fileURLToPath(new URL('../src/scripts/badiCalc.js', import.meta.url))
const source = fs.readFileSync(sourcePath, 'utf8')

function loadInStandardTime() {
  const start = source.indexOf('function inStandardTime')
  assert.ok(start >= 0, 'inStandardTime is defined in badiCalc.js')
  const open = source.indexOf('{', start)
  let depth = 0
  let end = open
  for (; end < source.length; end++) {
    const ch = source[end]
    if (ch === '{') depth++
    else if (ch === '}') {
      depth--
      if (depth === 0) {
        end++
        break
      }
    }
  }
  const body = source.slice(start, end)
  return new Function(`${body}\nreturn inStandardTime;`)()
}

const inStandardTime = loadInStandardTime()

function noon(year, month, day) {
  return new Date(year, month - 1, day, 12, 0, 0, 0)
}

function eachNoon(yearStart, yearEnd, visit) {
  for (let year = yearStart; year <= yearEnd; year++) {
    const cursor = noon(year, 1, 1)
    const stop = noon(year + 1, 1, 1)
    while (cursor < stop) {
      visit(new Date(cursor.getTime()), year)
      cursor.setDate(cursor.getDate() + 1)
    }
  }
}

// The previous check: equal to January 1 of the same year.
function januaryIsStandard(d) {
  const jan = new Date(d.getFullYear(), 0, 1)
  return jan.getTimezoneOffset() === d.getTimezoneOffset()
}

// Standard time is the larger offset in a year that still changes clocks.
function largerOffsetIsStandard(d) {
  const year = d.getFullYear()
  const jan = new Date(year, 0, 15, 12).getTimezoneOffset()
  const jul = new Date(year, 6, 15, 12).getTimezoneOffset()
  return d.getTimezoneOffset() >= Math.max(jan, jul)
}

// Same hour adjustment the holy-day listing applies to an 'S' time.
function clockHour(d, targetTime, offsetOf) {
  let adjust = 0
  if (targetTime.slice(-1) === 'S') {
    targetTime = targetTime.slice(0, 4)
    adjust = inStandardTime(d, offsetOf) ? 0 : 1
  }
  return +targetTime.slice(0, 2) + adjust
}

function monthDay(date) {
  return (date.getMonth() + 1) * 100 + date.getDate()
}

// Northern DST, roughly US/Canada: second Sunday in March through first Sunday in November.
function northernOffset(date) {
  const md = monthDay(date)
  return md >= 308 && md < 1101 ? 240 : 300
}

// Southern DST, roughly Australia east coast: early October through early April.
function southernOffset(date) {
  const md = monthDay(date)
  return md >= 1004 || md < 405 ? -660 : -600
}

// Alberta: last seasonal year is 2025; from 2026-03-08 the offset stays 360.
function albertaOffset(date) {
  const key = date.getFullYear() * 10000 + monthDay(date)
  if (key >= 20260308) return 360
  const md = monthDay(date)
  return md >= 308 && md < 1102 ? 360 : 420
}

function constantOffset(minutes) {
  return function () { return minutes }
}

describe('inStandardTime', { concurrency: false }, () => {

test('S times are adjusted in one place', () => {
  const calls = source.match(/inStandardTime\s*\(/g) || []
  assert.deepEqual(calls, [
    'inStandardTime(',
    'inStandardTime ('
  ])
  assert.match(source, /adjustDTtoST = inStandardTime\(targetDi\.frag1\) \? 0 : 1/)
  assert.match(source, /tempDate\.setHours\(timeHour \+ adjustDTtoST\)/)
})

test('stubbed offsets: normal DST, permanent zones, and the Alberta change', () => {
  const north = [
    [2026, 1, 15, true],
    [2026, 3, 7, true],
    [2026, 3, 8, false],
    [2026, 4, 21, false],
    [2026, 5, 29, false],
    [2026, 7, 10, false],
    [2026, 10, 15, false],
    [2026, 10, 31, false],
    [2026, 11, 1, true],
    [2026, 11, 28, true]
  ]
  for (const [year, month, day, expected] of north) {
    assert.equal(
      inStandardTime(noon(year, month, day), northernOffset),
      expected,
      `northern ${year}-${month}-${day}`
    )
  }

  const south = [
    [2026, 1, 15, false],
    [2026, 3, 15, false],
    [2026, 4, 21, true],
    [2026, 5, 29, true],
    [2026, 7, 10, true],
    [2026, 10, 15, false],
    [2026, 11, 28, false]
  ]
  for (const [year, month, day, expected] of south) {
    assert.equal(
      inStandardTime(noon(year, month, day), southernOffset),
      expected,
      `southern ${year}-${month}-${day}`
    )
  }

  for (const [year, month, day] of [[2026, 1, 15], [2026, 4, 21], [2026, 7, 10], [2026, 11, 28], [2027, 11, 28]]) {
    assert.equal(inStandardTime(noon(year, month, day), constantOffset(360)), true, `regina ${year}-${month}-${day}`)
    assert.equal(inStandardTime(noon(year, month, day), constantOffset(0)), true, `utc ${year}-${month}-${day}`)
  }

  const alberta = [
    [2025, 1, 15, true],
    [2025, 7, 10, false],
    [2025, 11, 28, true],
    [2026, 1, 15, true],
    [2026, 3, 15, false],
    [2026, 4, 21, false],
    [2026, 5, 29, false],
    [2026, 7, 10, false],
    [2026, 11, 28, true],
    [2027, 1, 15, true],
    [2027, 7, 10, true],
    [2027, 11, 28, true]
  ]
  for (const [year, month, day, expected] of alberta) {
    assert.equal(
      inStandardTime(noon(year, month, day), albertaOffset),
      expected,
      `alberta ${year}-${month}-${day}`
    )
  }

  assert.equal(clockHour(noon(2026, 11, 28), '0100S', albertaOffset), 1)
  assert.equal(clockHour(noon(2026, 7, 10), '1200S', albertaOffset), 13)
  assert.equal(clockHour(noon(2026, 4, 21), '1500S', northernOffset), 16)
  assert.equal(clockHour(noon(2026, 11, 28), '0100S', northernOffset), 1)
  assert.equal(clockHour(noon(2026, 11, 28), '0100S', southernOffset), 2)
  assert.equal(clockHour(noon(2026, 7, 10), '1200S', southernOffset), 12)
  assert.equal(clockHour(noon(2026, 11, 28), '0100S', constantOffset(360)), 1)
  assert.equal(clockHour(noon(2026, 11, 28), '0100S', constantOffset(0)), 1)
})

test('real time zones across a year', { concurrency: false }, (t) => {
  const mismatches = (zone, yearStart, yearEnd, expected) => {
    const found = []
    const previous = process.env.TZ
    process.env.TZ = zone
    try {
      eachNoon(yearStart, yearEnd, (d) => {
        if (inStandardTime(d) !== expected(d) && found.length < 6) {
          const iso = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
          found.push(`${iso} off=${d.getTimezoneOffset()} got=${inStandardTime(d)}`)
        }
      })
    } finally {
      if (previous === undefined) delete process.env.TZ
      else process.env.TZ = previous
    }
    return found
  }

  for (const zone of ['America/Toronto', 'Europe/London']) {
    const found = mismatches(zone, 2024, 2028, januaryIsStandard)
    assert.deepEqual(found, [], `${zone} should match the previous January comparison`)
  }

  for (const zone of ['Australia/Sydney', 'Pacific/Auckland']) {
    const found = mismatches(zone, 2024, 2028, largerOffsetIsStandard)
    assert.deepEqual(found, [], `${zone} should follow the larger offset in both seasons`)
    process.env.TZ = zone
    const summer = noon(2026, 1, 15)
    const winter = noon(2026, 7, 10)
    assert.equal(inStandardTime(summer), false, `${zone} January is daylight time`)
    assert.equal(januaryIsStandard(summer), true, `${zone} January used to compare equal to itself`)
    assert.equal(inStandardTime(winter), true, `${zone} July is standard time`)
    assert.equal(januaryIsStandard(winter), false, `${zone} July used to differ from January`)
    assert.equal(clockHour(noon(2026, 11, 28), '0100S'), 2, `${zone} Nov 28 is daylight time`)
    assert.equal(clockHour(noon(2026, 7, 10), '1200S'), 12, `${zone} July keeps noon`)
  }

  for (const zone of ['America/Regina', 'UTC', 'America/Phoenix']) {
    const found = mismatches(zone, 2024, 2028, () => true)
    assert.deepEqual(found, [], `${zone} is standard all year`)
    process.env.TZ = zone
    assert.equal(clockHour(noon(2026, 11, 28), '0100S'), 1, `${zone} keeps 1:00`)
  }

  process.env.TZ = 'America/Toronto'
  assert.equal(clockHour(noon(2026, 4, 21), '1500S'), 16, 'Toronto Ridvan stays on daylight time')
  assert.equal(clockHour(noon(2026, 7, 10), '1200S'), 13, 'Toronto July noon becomes 1 pm')
  assert.equal(clockHour(noon(2026, 11, 28), '0100S'), 1, 'Toronto November is standard')
  assert.equal(clockHour(noon(2026, 5, 29), '0300S'), 4, 'Toronto May is daylight time')

  process.env.TZ = 'Europe/London'
  assert.equal(clockHour(noon(2026, 4, 21), '1500S'), 16)
  assert.equal(clockHour(noon(2026, 11, 28), '0100S'), 1)

  process.env.TZ = 'America/Edmonton'
  const jan2026 = noon(2026, 1, 1)
  const nov2026 = noon(2026, 11, 28)
  const janOff = jan2026.getTimezoneOffset()
  const novOff = nov2026.getTimezoneOffset()
  const hasAlbertaChange = janOff === 420 && novOff === 360
  if (!hasAlbertaChange) {
    t.diagnostic(
      `America/Edmonton tzdata has no 2026 change (Jan 1 offset ${janOff}, Nov 28 offset ${novOff}). ` +
      'The Alberta cases were checked with a stubbed offset function.'
    )
  } else {
    assert.equal(inStandardTime(nov2026), true, 'Edmonton Nov 28 2026 is standard')
    assert.equal(januaryIsStandard(nov2026), false, 'January comparison still sees the old winter offset')
    assert.equal(clockHour(nov2026, '0100S'), 1, 'Recite tablet at 1:00, not 2:00')
    assert.equal(inStandardTime(noon(2026, 1, 15)), true)
    assert.equal(inStandardTime(noon(2026, 4, 21)), false, 'April still sees January standard time')
    assert.equal(inStandardTime(noon(2026, 7, 10)), false, 'July still sees January standard time')
    assert.equal(clockHour(noon(2027, 11, 28), '0100S'), 1)
    for (const year of [2024, 2025, 2027, 2028]) {
      const found = mismatches('America/Edmonton', year, year, januaryIsStandard)
      assert.deepEqual(found, [], `Edmonton ${year} still matches a normal year`)
    }
  }
})

})
