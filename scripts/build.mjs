#!/usr/bin/env node
import * as esbuild from 'esbuild';
import { execSync } from 'child_process';
import { mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const outDir = join(root, 'public', 'build');

mkdirSync(outDir, { recursive: true });

// 1. Build JS with esbuild (low memory)
esbuild.buildSync({
  entryPoints: [join(root, 'resources/js/app.jsx')],
  bundle: true,
  outfile: join(outDir, 'app.js'),
  format: 'esm',
  jsx: 'automatic',
  minify: true,
  sourcemap: false,
  target: ['es2020'],
  loader: { '.jsx': 'jsx', '.js': 'js', '.json': 'json' },
});

// 2. Build CSS with Tailwind CLI
execSync(`npx @tailwindcss/cli -i "${join(root, 'resources/css/app.css')}" -o "${join(outDir, 'app.css')}" --minify`, {
  cwd: root,
  stdio: 'inherit',
});

// 3. Laravel manifest (format for @vite directive)
writeFileSync(join(outDir, 'manifest.json'), JSON.stringify({
  'resources/css/app.css': { file: 'app.css' },
  'resources/js/app.jsx': { file: 'app.js' },
}));

console.log('Build done: public/build/');
