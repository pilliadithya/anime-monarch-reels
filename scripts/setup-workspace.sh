#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
sudo apt-get update
sudo apt-get install -y --no-install-recommends ffmpeg git python3-venv python3-pip
mkdir -p skills
clone_or_update() {
  local repo="$1" dir="$2"
  if [ -d "$dir/.git" ]; then git -C "$dir" pull --ff-only || true
  else git clone --depth 1 "$repo" "$dir"; fi
}
clone_or_update https://github.com/cth9191/animate skills/animate
clone_or_update https://github.com/artemnovitckii/claude-animation-skills skills/claude-animation-skills
clone_or_update https://github.com/iart-ai/motion-skills skills/motion-skills
clone_or_update https://github.com/bangtutorial/bang-motion skills/bang-motion
npm install
npx playwright install --with-deps chromium
python3 -m venv .venv
. .venv/bin/activate
python -m pip install --upgrade pip playwright
echo "== Versions =="
node --version
npm --version
python3 --version
ffmpeg -version | head -n 1
npx playwright --version
echo "Workspace setup complete."
