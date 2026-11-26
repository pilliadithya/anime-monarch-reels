# Anime Monarch Reels Studio
Cloud-first HTML/CSS/JS animation pipeline. The GitHub Actions workflow vendors four skill repositories into ./skills/, commits them, installs Playwright/Chromium and FFmpeg, renders out/reel.mp4 and uploads the MP4 artifact.

Run **Actions → Reels Studio — Vendor Skills & Render MP4 → Run workflow**. Download artifact `anime-monarch-reels-mp4`.

Timeline exposes `window.__seekTo(seconds)`; the starter is 6 seconds / 144 frames. Renderer captures exact 24fps frames at 1080×1920 and encodes H.264/yuv420p. Optional voiceover: assets/audio/voiceover.wav. Optional SFX: assets/audio/sfx/* (WAV/MP3/OGG/M4A). Only explicit VO/SFX are mixed; no BGM.
