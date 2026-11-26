# Anime Monarch Reels Studio
Create polished 2D/3D HTML animation for Anime Monarch (@anime.monarch7), using this cloud-first repo.

## Vendored skills
Read the actual instructions before each task:
- ./skills/animate/plugins/animate/skills/animate/SKILL.md
- ./skills/claude-animation-skills/skills/ (read relevant SKILL.md files)
- ./skills/motion-skills/ (read relevant SKILL.md files)
- ./skills/bang-motion/SKILL.md
If a path differs, locate the real SKILL.md and state its path; never invent skill contents.

## Reels standards
1080×1920, 9:16, 24 fps, H.264 MP4, yuv420p, no watermark. Titles, Tenglish pop-up captions, and CTAs stay within y=250..1499 (top 250 and bottom 420 px are excluded). Meaningful visual/scene/UI change every 1.5–2.5 seconds. Dynamic headers, chips, meters, multiplane 3D camera moves and full-body character rigs where appropriate. Captions are punchy 2–4 word Tenglish. ElevenLabs VO if provided; layered non-musical SFX only; no BGM.

## Deterministic rendering
Use a pure time-based timeline and expose window.__seekTo(t). Do not use timers, random, wall-clock animation or unseekable CSS keyframes in rendered scenes. Playwright captures exact timestamps at 24 fps and pipes frames to FFmpeg. Output out/reel.mp4. Optional VO: assets/audio/voiceover.wav. Optional SFX: files in assets/audio/sfx/. Only mix these explicit voice/SFX files; never add music. Verify output with FFprobe before claiming render success.