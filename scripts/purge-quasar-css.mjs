/*
 * Drop Quasar 0.13 rules whose class or id names never appear in the app.
 * The vendored stylesheet is the whole framework. Element-only rules (the
 * reset, buttons, the icon font) stay. A selector stays when every class and
 * id in it appears in src or index.html, or on the safelist.
 */
import fs from 'node:fs'
import path from 'node:path'
import postcss from 'postcss'

const SAFELIST = new Set([
  // Vue Router adds these; they are not written in a template.
  'router-link-active',
  'router-link-exact-active'
])

const SKIP_FILES = new Set([
  'quasar.mat.css'
])

function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist') continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(full, out)
    } else if (entry.isFile() && !SKIP_FILES.has(entry.name)) {
      out.push(full)
    }
  }
  return out
}

export function collectClassWords(root) {
  const words = new Set(SAFELIST)
  const files = walk(path.join(root, 'src'), [])
  files.push(path.join(root, 'index.html'))
  const token = /[A-Za-z_][A-Za-z0-9_-]*/g
  for (const file of files) {
    if (!/\.(vue|js|css|html)$/.test(file)) continue
    const text = fs.readFileSync(file, 'utf8')
    let match
    while ((match = token.exec(text))) words.add(match[0])
  }
  return words
}

function selectorUsed(selector, words) {
  const names = selector.match(/[.#](-?[_a-zA-Z]+[_a-zA-Z0-9-]*)/g)
  if (!names) return true
  for (const name of names) {
    if (!words.has(name.slice(1))) return false
  }
  return true
}

function prune(node, words) {
  if (!node.nodes) return
  for (const child of [...node.nodes]) {
    if (child.type === 'rule') {
      const kept = child.selectors.filter((selector) => selectorUsed(selector, words))
      if (!kept.length) child.remove()
      else child.selectors = kept
    } else if (child.type === 'atrule') {
      const name = child.name.toLowerCase()
      if (name === 'keyframes' || name.endsWith('keyframes')) continue
      prune(child, words)
      const useful = child.nodes && child.nodes.some((n) => n.type === 'rule' || n.type === 'atrule')
      if (!useful) child.remove()
    }
  }
}

export function purgeQuasarCss(css, words) {
  const root = postcss.parse(css)
  const keyframes = []
  root.walkAtRules((rule) => {
    const name = rule.name.toLowerCase()
    if (name === 'keyframes' || name.endsWith('keyframes')) {
      keyframes.push(rule)
      rule.remove()
    }
  })
  prune(root, words)
  let out = root.toString().trim() + '\n'
  for (const rule of keyframes) {
    const name = rule.params.trim()
    const used = new RegExp('(?:^|[^\\w-])' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?:$|[^\\w-])')
    if (used.test(out)) out += rule.toString() + '\n'
  }
  return out
}
