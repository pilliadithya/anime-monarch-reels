# Anime Monarch Reels Studio

Create polished 2D/3D HTML animation and motion graphics for Anime Monarch (@anime.monarch7).

## Skill references — read before each task
- `./skills/animate/plugins/animate/skills/animate/SKILL.md`
- `./skills/claude-animation-skills/skills/` (choose relevant skill docs)
- `./skills/motion-skills/` (choose relevant skill docs)
- `./skills/bang-motion/SKILL.md`

If a referenced path is missing, locate the actual skill files in the cloned repo and report the path; never pretend to have read unavailable instructions.

## Reel defaults
- 1080×1920, portrait 9:16, 24 fps
- Export H.264 MP4; zero watermarks
- Keep captions, titles, and CTAs out of top 250 px and bottom 420 px
- Meaningful visual/scene/UI change every 1.5–2.5 seconds
- Use dynamic headers, pop-in chips, animated meters, 3D multiplane camera moves, and full-body character rigs where suitable
- Captions: punchy 2–4 word Tenglish pop-ups
- ElevenLabs voiceover when provided/requested
- Layer non-musical SFX; no BGM

## Production workflow
Clarify message, duration, assets, and CTA if needed. Inspect skills/assets, build reusable HTML/CSS/JS scenes, preview at 1080×1920, check safe zones and timing, use Playwright/Chromium for browser checks/capture and FFmpeg for encoding. Never claim an MP4 exists unless the output was created and checked.
