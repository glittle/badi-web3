#!/usr/bin/env node
// Assemble the Vercel deploy folder for wondrous-badi.today from this repo.
//   npm run build
//   node scripts/assemble-deploy.mjs <outDir> --legacy=<folder with feasts/ files/ scripts/ abc.txt ...>
// Layout of <outDir> (what Vercel sees; vercel.json has outputDirectory "public", no build step):
//   api/ lib/ scripts/calllog.mjs package.json package-lock.json vercel.json .vercelignore *.md test/  <- server/
//   public/                                                                                              <- dist/ (minus .vite/)
//   public/feasts, public/files, public/scripts, ...                                                     <- --legacy (not in git)
// <outDir> must not exist or must be empty, apart from a .vercel/ link folder which is kept.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const args = process.argv.slice(2);
const out = args.find((a) => !a.startsWith('--'));
const legacyArg = args.find((a) => a.startsWith('--legacy='));
if (!out) { console.error('usage: node scripts/assemble-deploy.mjs <outDir> [--legacy=<old public folder>]'); process.exit(1); }
const dist = path.join(repo, 'dist');
if (!fs.existsSync(path.join(dist, 'index.html'))) { console.error('dist/ is missing: run npm run build first'); process.exit(1); }
fs.mkdirSync(out, { recursive: true });
const leftovers = fs.readdirSync(out).filter((n) => n !== '.vercel');
if (leftovers.length) { console.error(`${out} is not empty (${leftovers.slice(0, 5).join(', ')}...)`); process.exit(1); }

const skip = new Set(['.vite', 'node_modules', '.env', '.vercel']);
const copy = (from, to) => fs.cpSync(from, to, { recursive: true, filter: (src) => !skip.has(path.basename(src)) && !path.basename(src).startsWith('.env') });

for (const name of fs.readdirSync(path.join(repo, 'server'))) copy(path.join(repo, 'server', name), path.join(out, name));
copy(dist, path.join(out, 'public'));
if (legacyArg) {
  const legacy = legacyArg.slice(9);
  // only top-level entries that the app build does not produce (feasts/, files/, scripts/, abc.txt, ...)
  for (const name of fs.readdirSync(legacy)) {
    if (!fs.existsSync(path.join(out, 'public', name))) copy(path.join(legacy, name), path.join(out, 'public', name));
  }
} else console.warn('No --legacy folder: /feasts, /files, /scripts and other legacy files will be missing from the deploy.');
console.log(`Deploy folder ready: ${out}`);
