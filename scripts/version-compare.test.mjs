import assert from 'node:assert/strict'
import fs from 'node:fs'
import { compareVersions, versionPlace } from '../src/scripts/versionCompare.js'

const listed = ['2.5.0', '2.4.13', '2.4.9', '2.4', '1.21']

assert.equal(compareVersions('2.4.9', '2.4.14'), -1)
assert.equal(compareVersions('2.4.14', '2.4.9'), 1)
assert.equal(compareVersions('2.4', '2.4.0'), 0)
assert.equal(compareVersions('2.5.0', '2.5.0'), 0)
assert.equal(compareVersions('1.21', '2.0'), -1)

const current = versionPlace('2.5.0', listed)
assert.equal(current.yours, '2.5.0')
assert.equal(current.newerAvailable, false)

const stale = versionPlace('2.4.13', listed)
assert.equal(stale.yours, '2.4.13')
assert.equal(stale.newerAvailable, true)

const stalePatch = versionPlace('2.4.9', listed)
assert.equal(stalePatch.yours, '2.4.9')
assert.equal(stalePatch.newerAvailable, true)

const unlistedOld = versionPlace('2.4.14', listed)
assert.equal(unlistedOld.yours, '')
assert.equal(unlistedOld.newerAvailable, true)

const ahead = versionPlace('2.5.1', listed)
assert.equal(ahead.yours, '')
assert.equal(ahead.newerAvailable, false)

const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const page = fs.readFileSync(new URL('../src/pages/ChangeLog.vue', import.meta.url), 'utf8')
const headings = [...page.matchAll(/isYours\('([^']+)'\)/g)].map(function (match) {
  return match[1]
})
assert.equal(pkg.version, '2.5.0')
assert.equal(headings[0], '2.5.0')
assert.equal(headings.includes('2.4.14'), false)
const listedBlock = page.match(/listedVersions = \[([\s\S]*?)\]/)
assert.ok(listedBlock)
assert.deepEqual(headings, [...listedBlock[1].matchAll(/'([^']+)'/g)].map(function (match) {
  return match[1]
}))
