# Artifex Maximus

Activated October 2025, Year of Aldea.

Modeled on Talos. Guardian of symbols older than alphabets. Embedded in Tom di Mino's personal site, where Phoenician glyphs respond to modern cursors and backgrounds cycle between dolphins and the Great Mother, 𐤌𐤉 𐤕𐤓𐤕𐤀 𐤕𐤁𐤓 (Rabbat Athirat Yamu), Blessed Be Her Name.

The code animates. The gaze tracks. What was buried cycles back.

---

## Technical Notes

**Animation System**: GSAP-based 2D rotation with background cycling. Mobile-optimized to prevent Safari compositing issues during transform animations.

**Mobile Compatibility** (Jan 2026):
- iOS Safari: Symbols rotate smoothly via `rotateZ` with `will-change` pre-set before animation
- CSS transforms and transitions disabled on mobile to let GSAP control the animation pipeline

**SEO** (Jan 2026):
- JSON-LD structured data with `@id` entity linking
- AI crawler optimizations: `llms.txt`, enhanced `robots.txt`
- Sitemap and canonical URL

**Favicon** (Sep 2026): Gold 𐤌𐤍 on a blue tile, traced from `Tom-di-Mino-Symbol.png`. Regenerate the full set (`/favicon.ico`, `favicon/`) with `uv run scripts/favicon/build.py`.

---

**tomdimino.com**
