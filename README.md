# Anime Monarch Reels Studio

Private Codespaces workspace for 2D/3D HTML animation.

## Start
Open **Code → Codespaces → Create codespace on main** and wait for the setup script. It clones four skills into `./skills/` and installs Node.js, Python, Playwright/Chromium, and FFmpeg.

Run `npm run dev` and open forwarded port 4173 for preview.

## Verify
```bash
node --version
python3 --version
ffmpeg -version
npx playwright --version
```

Production rules are in GEMINI.md and AGENTS.md: 1080×1920, 9:16, 24 fps, H.264 MP4, no watermark, safe zones top 250/bottom 420 px, no BGM.
