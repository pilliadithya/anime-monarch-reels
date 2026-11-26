# Anime Monarch Reels — Agent Rules
Read actual vendored skill files before implementing:
- skills/animate/plugins/animate/skills/animate/SKILL.md
- relevant SKILL.md files under skills/claude-animation-skills/skills/
- relevant SKILL.md files under skills/motion-skills/
- skills/bang-motion/SKILL.md
Follow GEMINI.md. Deliver 1080×1920 9:16, 24 fps H.264/yuv420p MP4, no watermark. Keep all titles/captions/CTAs between y=250 and y=1499. Scene/visual changes every 1.5–2.5s; Tenglish captions 2–4 words. Optional VO and layered non-musical SFX only; no BGM.
Rendering must be deterministic and expose window.__seekTo(t). Use Playwright exact frame capture and FFmpeg. Validate output via FFprobe. Never report success without a real verified MP4.