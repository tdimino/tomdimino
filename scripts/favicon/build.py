#!/usr/bin/env python3
"""Build the MN favicon set from Tom-di-Mino-Symbol.png.

Traces the 𐤌𐤍 glyph out of the symbol, composes gold-on-blue SVG masters,
and rasterizes the full set into favicon/ plus /favicon.ico.

Requires: magick, potrace, rsvg-convert.
Run: uv run scripts/favicon/build.py
"""

import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
WORK = HERE / "work"
OUT = ROOT / "favicon"

SOURCE = ROOT / "Tom-di-Mino-Symbol.png"
GLYPH_CROP = "1029x620+458+663"  # tight bbox of the MN inside the black disc

GOLD = "#f4be51"
BLUE = "#006699"
CANVAS = 512

# (filename, corner radius and glyph width as fractions of canvas, extra stroke weight in canvas units)
MASTERS = {
    "icon.svg": (0.22, 0.70, 0),         # tab icon, manifest "any"
    "icon-small.svg": (0.18, 0.84, 6),   # 16/32/48 rasters: bigger, slightly bolder glyph; >10 closes the mem
    "icon-full.svg": (0.0, 0.62, 0),     # apple-touch + maskable: full bleed, glyph in safe zone
}


def run(*cmd):
    subprocess.run(cmd, check=True)


def trace_glyph():
    """Return (width, height, [path d strings]) for the traced glyph."""
    WORK.mkdir(exist_ok=True)
    pbm, svg = WORK / "glyph.pbm", WORK / "glyph.svg"
    # White areas of the symbol are transparent; flatten on white so the glyph survives,
    # then negate so potrace (which traces black) sees the glyph.
    run("magick", str(SOURCE), "-background", "white", "-alpha", "remove",
        "-crop", GLYPH_CROP, "+repage", "-threshold", "50%", "-negate", str(pbm))
    run("potrace", "-s", "--alphamax", "0.6", "--opttolerance", "0.2",
        "--turdsize", "20", "-u", "1", str(pbm), "-o", str(svg))
    text = svg.read_text()
    w, h = (float(v) for v in re.search(r'viewBox="0 0 ([\d.]+) ([\d.]+)"', text).groups())
    paths = [re.sub(r"\s+", " ", d) for d in re.findall(r'<path d="([^"]+)"', text)]
    return w, h, paths


def compose(w, h, paths, radius, glyph_width, weight):
    scale = CANVAS * glyph_width / w
    x = (CANVAS - w * scale) / 2
    y = (CANVAS - h * scale) / 2
    rx = CANVAS * radius
    # potrace emits y-up coordinates; flip into the canvas.
    transform = f"translate({x:.2f} {y + h * scale:.2f}) scale({scale:.5f} {-scale:.5f})"
    # Stroke width lives in path space, so undo the scale to get canvas units.
    stroke = f' stroke="{GOLD}" stroke-width="{weight / scale:.1f}"' if weight else ""
    d = " ".join(paths)
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {CANVAS} {CANVAS}">'
        f'<rect width="{CANVAS}" height="{CANVAS}" rx="{rx:g}" fill="{BLUE}"/>'
        f'<path transform="{transform}" fill="{GOLD}"{stroke} d="{d}"/>'
        "</svg>\n"
    )


def rasterize(svg, png, size):
    run("rsvg-convert", "-w", str(size), "-h", str(size), str(svg), "-o", str(png))


def main():
    w, h, paths = trace_glyph()
    masters = {}
    for name, (radius, glyph_width, weight) in MASTERS.items():
        dest = OUT / name if name == "icon.svg" else HERE / name
        dest.write_text(compose(w, h, paths, radius, glyph_width, weight))
        masters[name] = dest

    rasterize(masters["icon.svg"], OUT / "icon-192.png", 192)
    rasterize(masters["icon.svg"], OUT / "icon-512.png", 512)
    rasterize(masters["icon-full.svg"], OUT / "icon-maskable-512.png", 512)
    rasterize(masters["icon-full.svg"], OUT / "apple-touch-icon.png", 180)

    ico_sizes = []
    for size in (16, 32, 48):
        png = WORK / f"ico-{size}.png"
        rasterize(masters["icon-small.svg"], png, size)
        ico_sizes.append(str(png))
    run("magick", *ico_sizes, str(ROOT / "favicon.ico"))

    # apple-touch-icon must be opaque; flatten any edge alpha onto blue.
    apple = OUT / "apple-touch-icon.png"
    run("magick", str(apple), "-background", BLUE, "-alpha", "remove", "-alpha", "off", str(apple))


if __name__ == "__main__":
    main()
