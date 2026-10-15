import assert from 'node:assert/strict'
import test from 'node:test'
import { encode, decode } from '../src/scripts/storage.js'

test('quasar 0.13 prefixes round-trip', () => {
  assert.equal(encode(true), '__q_bool|1')
  assert.equal(encode(false), '__q_bool|0')
  assert.equal(decode('__q_bool|1'), true)
  assert.equal(decode('__q_bool|0'), false)
  assert.equal(encode(1930), '__q_numb|1930')
  assert.equal(decode('__q_numb|49.28'), 49.28)
  assert.equal(decode('__q_numb|0'), 0)
  assert.equal(encode('user'), '__q_strn|user')
  assert.equal(decode('__q_strn|America/Vancouver'), 'America/Vancouver')
  assert.equal(encode(''), '__q_strn|')
  assert.equal(decode('__q_strn|'), '__q_strn|')
  assert.deepEqual(decode(encode({ a: 1 })), { a: 1 })
})
