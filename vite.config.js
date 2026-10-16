import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))

function versionJsonText(pkg) {
  const buildDate = new Date().toString()
  return `{
  "name":      "${pkg.name}",
  "buildDate": "${buildDate}",
	"version":   "${pkg.version}"
}
`
}

function writeVersionFile() {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))
  const text = versionJsonText(pkg)
  fs.writeFileSync(path.join(root, 'root/version.json'), text)
  return text
}

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.mp3': 'audio/mpeg',
  '.webmanifest': 'application/manifest+json'
}

function serveFile(dir, urlPath) {
  const rel = decodeURIComponent(urlPath.split('?')[0])
  if (rel.includes('\0')) return null
  const file = path.normalize(path.join(dir, rel))
  const base = path.resolve(dir)
  if (!file.startsWith(base + path.sep) && file !== base) return null
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return null
  return file
}

function copyTree(src, dest) {
  const existing = fs.lstatSync(dest, { throwIfNoEntry: false })
  if (existing && existing.isSymbolicLink()) fs.unlinkSync(dest)
  fs.mkdirSync(dest, { recursive: true })
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name)
    const to = path.join(dest, entry.name)
    if (entry.isDirectory()) {
      copyTree(from, to)
    } else if (entry.isFile()) {
      const link = fs.lstatSync(to, { throwIfNoEntry: false })
      if (link && link.isSymbolicLink()) fs.unlinkSync(to)
      fs.copyFileSync(from, to)
    }
  }
}

// Small UI images the shell and every page request. Not /images or /files.
const SHELL_PRECACHE_URLS = [
  '/statics/sunWhite.png',
  '/statics/calendarWhite.png',
  '/statics/verseWhite.png',
  '/statics/counter95.svg',
  '/statics/calendar.png',
  '/statics/sunset.png',
  '/statics/sunrise.png',
  '/statics/star.png',
  '/statics/sun.png',
  '/statics/qr.png',
  '/statics/pdf.png',
  '/statics/web.png',
  '/statics/video.svg',
  '/statics/DOC.gif',
  '/statics/divider.png',
  '/statics/icons/icon-any-192.png?v=v2',
  '/statics/icons/icon-any-512.png?v=v2',
  '/statics/icons/icon-maskable-192.png?v=v2',
  '/statics/icons/icon-maskable-512.png?v=v2',
  '/statics/icons/apple-touch-icon.png?v=v2',
  '/statics/icons/favicon.ico?v=v1',
  '/statics/icons/safari-pinned-tab.svg?v=v1'
]

// Counter taps play these on Today and on the Count page. They have to be in
// the precache or the sounds disappear after an offline reload.
const COUNTER_SOUND_URLS = [
  '/statics/each.mp3',
  '/statics/each19.mp3',
  '/statics/each95.mp3'
]

function collectPrecacheUrls(viteManifest) {
  const urls = new Set(['/index.html', '/manifest.json'])
  for (const item of Object.values(viteManifest)) {
    if (item.file) urls.add('/' + item.file)
    for (const css of item.css || []) urls.add('/' + css)
    for (const asset of item.assets || []) urls.add('/' + asset)
  }
  const staticsRoot = path.join(root, 'src/statics')
  for (const url of SHELL_PRECACHE_URLS.concat(COUNTER_SOUND_URLS)) {
    const file = path.join(staticsRoot, url.split('?')[0].replace(/^\/statics\//, ''))
    if (fs.existsSync(file)) urls.add(url)
  }
  return [...urls].sort()
}

function stampServiceWorker() {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))
  const manifestPath = path.join(root, 'dist/.vite/manifest.json')
  if (!fs.existsSync(manifestPath)) {
    throw new Error('Vite asset manifest is missing; cannot precache the build')
  }
  const urls = collectPrecacheUrls(JSON.parse(fs.readFileSync(manifestPath, 'utf8')))
  const swPath = path.join(root, 'dist/sw-badi-web4.js')
  let sw = fs.readFileSync(swPath, 'utf8')
  const versionLine = "const CACHE_VERSION = '0.0.0-dev'"
  const listLine = 'const PRECACHE_URLS = []'
  if (!sw.includes(versionLine) || !sw.includes(listLine)) {
    throw new Error('service worker stamp markers are missing')
  }
  sw = sw.replace(versionLine, "const CACHE_VERSION = " + JSON.stringify(pkg.version))
  sw = sw.replace(listLine, 'const PRECACHE_URLS = ' + JSON.stringify(urls))
  fs.writeFileSync(swPath, sw)
}

function previewHeaders(req, res, next) {
  const urlPath = (req.url || '/').split('?')[0]
  if (urlPath !== '/manifest.json' && urlPath !== '/sw-badi-web4.js' && urlPath !== '/version.json') {
    return next()
  }
  const file = path.join(root, 'dist', urlPath.slice(1))
  if (!fs.existsSync(file)) return next()
  if (urlPath === '/manifest.json') {
    res.setHeader('Content-Type', 'application/manifest+json')
  } else if (urlPath.endsWith('.js')) {
    res.setHeader('Content-Type', 'text/javascript; charset=utf-8')
    res.setHeader('Cache-Control', 'no-cache')
  } else {
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.setHeader('Cache-Control', 'no-cache')
  }
  fs.createReadStream(file).pipe(res)
}

function extrasPlugin() {
  return {
    name: 'badi-extras',
    buildStart() {
      writeVersionFile()
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const raw = req.url || '/'
        // Vite rewrites template asset urls to ?import and must answer those
        // itself. Serving the raw file here makes the module fail to load.
        if (/[?&](import|url)(&|$)/.test(raw)) return next()
        const urlPath = raw.split('?')[0]
        const file = urlPath.startsWith('/statics/')
          ? serveFile(path.join(root, 'src'), urlPath)
          : serveFile(path.join(root, 'root'), urlPath)
        if (!file) return next()
        const type = urlPath === '/manifest.json'
          ? 'application/manifest+json'
          : (types[path.extname(file).toLowerCase()] || 'application/octet-stream')
        res.setHeader('Content-Type', type)
        if (urlPath === '/sw-badi-web4.js' || urlPath === '/version.json') {
          res.setHeader('Cache-Control', 'no-cache')
        }
        fs.createReadStream(file).pipe(res)
      })
    },
    configurePreviewServer(server) {
      server.middlewares.use(previewHeaders)
    },
    closeBundle() {
      const dist = path.join(root, 'dist')
      fs.mkdirSync(dist, { recursive: true })
      // Copy file bytes. A symlink left in dist/ by the public-dir pass
      // (public/.well-known → ../root/.well-known) must be replaced, not
      // written through, or a deploy can ship a link instead of the file.
      copyTree(path.join(root, 'root'), dist)
      copyTree(path.join(root, 'src/statics'), path.join(dist, 'statics'))
      const assetName = '.well-known/assetlinks.json'
      const from = fs.readFileSync(path.join(root, 'root', assetName))
      const shipped = fs.readFileSync(path.join(dist, assetName))
      if (!from.equals(shipped)) {
        throw new Error('dist/' + assetName + ' is not byte-identical to root/' + assetName)
      }
      stampServiceWorker()
    }
  }
}

export default defineConfig({
  plugins: [vue({
    template: {
      compilerOptions: {
        // Vue 2 kept the spaces between inline buttons, icons, and switches.
        // The Vite default ('condense') deletes those text nodes.
        whitespace: 'preserve'
      }
    }
  }), extrasPlugin()],
  resolve: {
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
    alias: {
      src: path.join(root, 'src')
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsDir: 'assets',
    manifest: true,
    chunkSizeWarningLimit: 2200
  },
  server: {
    port: 5173,
    host: '127.0.0.1'
  }
})
