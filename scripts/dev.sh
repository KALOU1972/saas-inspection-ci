#!/usr/bin/env bash
# Démarre l'application DGT en réinstallant les dépendances si nécessaire
# (le sandbox purge node_modules lors des pauses).
set -e
cd "$(dirname "$0")/.."

if [ ! -d node_modules ]; then
  echo "node_modules absent -> réinstallation (npm ci)…"
  npm ci --no-audit --no-fund
fi

exec npm run dev -- --hostname 0.0.0.0 --port 3000
