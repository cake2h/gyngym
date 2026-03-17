#!/bin/bash
# Build for restricted shared hosting (low memory, ulimit on processes)
set -e
cd "$(dirname "$0")/.."
mkdir -p public/build

# 1. esbuild — GOMAXPROCS=1 limits threads (avoids "failed to create new OS thread")
GOMAXPROCS=1 ./node_modules/.bin/esbuild resources/js/app.jsx --bundle --outfile=public/build/app.js --format=esm --jsx=automatic --minify --target=es2020

# 2. Tailwind: если app.css уже есть (в git) — пропустить (на сервере нет памяти)
if [ ! -f public/build/app.css ]; then
  TAILWIND_BIN="scripts/tailwindcss-linux-x64"
  if [ ! -f "$TAILWIND_BIN" ]; then
    echo "Downloading Tailwind standalone..."
    curl -sL "https://github.com/tailwindlabs/tailwindcss/releases/download/v4.2.1/tailwindcss-linux-x64" -o "$TAILWIND_BIN"
    chmod +x "$TAILWIND_BIN"
  fi
  RAYON_NUM_THREADS=1 "$TAILWIND_BIN" -i resources/css/app.css -o public/build/app.css --minify
else
  echo "Using existing app.css (skipped Tailwind build)"
fi

# 3. Manifest (Vite.php expects 'src' for preloads)
echo '{"resources/css/app.css":{"src":"resources/css/app.css","file":"app.css"},"resources/js/app.jsx":{"src":"resources/js/app.jsx","file":"app.js"}}' > public/build/manifest.json

echo "Build done: public/build/"
