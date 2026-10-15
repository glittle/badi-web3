/*
 * Quasar Framework 0.13 LocalStorage encoding.
 * Existing visitors keep their settings only if these prefixes stay intact:
 *   __q_date| __q_expr| __q_numb| __q_bool| __q_strn| __q_objt|
 * An encoded empty string is "__q_strn|" (length 9). Quasar's decoder returns
 * that raw marker when length < 10, and the old wrapper treated it as missing.
 */

export function encode(value) {
  if (Object.prototype.toString.call(value) === '[object Date]') {
    return '__q_date|' + value.toUTCString()
  }
  if (Object.prototype.toString.call(value) === '[object RegExp]') {
    return '__q_expr|' + value.source
  }
  if (typeof value === 'number') {
    return '__q_numb|' + value
  }
  if (typeof value === 'boolean') {
    return '__q_bool|' + (value ? '1' : '0')
  }
  if (typeof value === 'string') {
    return '__q_strn|' + value
  }
  if (typeof value === 'function') {
    return '__q_strn|' + value.toString()
  }
  if (value === Object(value)) {
    return '__q_objt|' + JSON.stringify(value)
  }
  return value
}

export function decode(value) {
  if (value == null) return value
  const length = value.length
  if (length < 10) {
    return value
  }
  const type = value.substr(0, 8)
  const source = value.substring(9)
  switch (type) {
    case '__q_date':
      return new Date(source)
    case '__q_expr':
      return new RegExp(source)
    case '__q_numb':
      return Number(source)
    case '__q_bool':
      return Boolean(source === '1')
    case '__q_strn':
      return '' + source
    case '__q_objt':
      return JSON.parse(source)
    default:
      return value
  }
}

function rawGet(key) {
  const stored = window.localStorage.getItem(key)
  if (stored === null) return null
  return decode(stored)
}

export default {
  set: function (key, value) {
    window.localStorage.setItem(key, encode(value))
  },
  get: function (key, defaultValue) {
    if (window.localStorage.getItem(key) !== null) {
      var v = rawGet(key)
      if (v !== '__q_strn|') {
        return v
      }
    }
    return defaultValue
  }
}
