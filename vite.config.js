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

function extrasPlugin() {
  return {
    name: 'badi-extras',
    buildStart() {
      writeVersionFile()
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const urlPath = (req.url || '/').split('?')[0]
        const file = urlPath.startsWith('/statics/')
          ? serveFile(path.join(root, 'src'), urlPath)
          : serveFile(path.join(root, 'root'), urlPath)
        if (!file) return next()
        res.setHeader('Content-Type', types[path.extname(file).toLowerCase()] || 'application/octet-stream')
        fs.createReadStream(file).pipe(res)
      })
    },
    closeBundle() {
      const dist = path.join(root, 'dist')
      fs.mkdirSync(dist, { recursive: true })
      fs.cpSync(path.join(root, 'root'), dist, { recursive: true })
      fs.cpSync(path.join(root, 'src/statics'), path.join(dist, 'statics'), { recursive: true })
    }
  }
}

export default defineConfig({
  plugins: [vue(), extrasPlugin()],
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
    chunkSizeWarningLimit: 2200
  },
  server: {
    port: 5173,
    host: '127.0.0.1'
  }
})
