// Dotted version numbers, compared numerically so 2.4.9 is before 2.4.14.
// Missing parts count as 0, so 2.4 and 2.4.0 are the same release.

export function compareVersions(a, b) {
  const pa = parts(a)
  const pb = parts(b)
  const n = Math.max(pa.length, pb.length)
  for (let i = 0; i < n; i++) {
    const diff = (pa[i] || 0) - (pb[i] || 0)
    if (diff) return diff < 0 ? -1 : 1
  }
  return 0
}

// Newest entry is listed[0]. The badge names the running release when that
// release is in the list. A running release older than the newest entry
// means this copy has not picked up the latest files.
export function versionPlace(running, listed) {
  const newest = listed[0] || ''
  const yours = listed.find(function (version) {
    return compareVersions(version, running) === 0
  }) || ''
  return {
    yours: yours,
    newest: newest,
    newerAvailable: newest !== '' && compareVersions(running, newest) < 0
  }
}

function parts(version) {
  return String(version).split('.').map(function (part) {
    const n = parseInt(part, 10)
    return Number.isFinite(n) ? n : 0
  })
}
