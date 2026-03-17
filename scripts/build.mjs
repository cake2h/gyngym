#!/usr/bin/env node
/**
 * Build uses esbuild CLI (Go binary) + Tailwind CLI — minimal Node memory.
 * Run: node scripts/build.mjs
 */
import { execSync } from 'child_process';
import { mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const outDir = join(root, 'public', 'build');
const entry = join(root, 'resources/js/app.jsx');
const outJs = join(outDir, 'app.js');
const cssIn = join(root, 'resources/css/app.css');
const cssOut = join(outDir, 'app.css');

mkdirSync(outDir, { recursive: true });

// 1. esbuild CLI (Go binary — low memory, no Node heap)
execSync(
  `npx esbuild "${entry}" --bundle --outfile="${outJs}" --format=esm --jsx=automatic --minify --target=es2020`,
  { cwd: root, stdio: 'inherit' }
);

// 2. Tailwind CLI
execSync(
  `npx @tailwindcss/cli -i "${cssIn}" -o "${cssOut}" --minify`,
  { cwd: root, stdio: 'inherit' }
);

// 3. Laravel manifest
writeFileSync(join(outDir, 'manifest.json'), JSON.stringify({
  'resources/css/app.css': { file: 'app.css' },
  'resources/js/app.jsx': { file: 'app.js' },
}));

console.log('Build done: public/build/');
