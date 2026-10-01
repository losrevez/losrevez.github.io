"""Make TrueType copies of the brand fonts for the PDF export only.

Chrome writes CFF-based .otf and variable fonts into PDFs as "Type 3" fonts,
which editors such as Affinity cannot map back to installed fonts (text opens
as curves). Static TrueType (glyf) fonts are embedded as real TrueType fonts
with their names intact, so the text stays editable.

Output goes to fonts-local/ (gitignored). The web page keeps using assets/fonts/.
Licence: approved by the band on 2026-09-30 for this local conversion; the
converted files are never committed or published.

Usage:  python3 -m venv .venv-fonts && .venv-fonts/bin/pip install fonttools
        .venv-fonts/bin/python scripts/pdf-fonts.py
"""
from pathlib import Path

from fontTools.pens.cu2quPen import Cu2QuPen
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.ttLib import TTFont, newTable
from fontTools.varLib.instancer import instantiateVariableFont

SRC = Path("assets/fonts")
OUT = Path("fonts-local")


def otf_to_ttf(font: TTFont) -> None:
    """Convert CFF outlines to quadratic glyf outlines (fontTools' otf2ttf recipe)."""
    order = font.getGlyphOrder()
    glyphset = font.getGlyphSet()
    glyf = newTable("glyf")
    glyf.glyphOrder = order
    glyf.glyphs = {}
    for name in order:
        pen = TTGlyphPen(glyphset)
        glyphset[name].draw(Cu2QuPen(pen, max_err=1.0, reverse_direction=True))
        glyf.glyphs[name] = pen.glyph()
    font["loca"] = newTable("loca")
    font["glyf"] = glyf
    del font["CFF "]
    if "VORG" in font:
        del font["VORG"]
    glyf.compile(font)
    hmtx = font["hmtx"]
    for name, g in glyf.glyphs.items():
        if hasattr(g, "xMin"):
            hmtx[name] = (hmtx[name][0], g.xMin)
    maxp = newTable("maxp")
    maxp.tableVersion = 0x00010000
    for attr in ("maxZones", "maxTwilightPoints", "maxStorage", "maxFunctionDefs",
                 "maxInstructionDefs", "maxStackElements", "maxSizeOfInstructions",
                 "maxComponentElements"):
        setattr(maxp, attr, 1 if attr == "maxZones" else 0)
    font["maxp"] = maxp
    post = font["post"]
    post.formatType = 2.0
    post.extraNames = []
    post.mapping = {}
    post.glyphOrder = order
    font.sfntVersion = "\x00\x01\x00\x00"


def set_names(font: TTFont, family: str, style: str) -> None:
    name = font["name"]
    legacy_family = family if style == "Regular" else f"{family} {style}"
    for nid, value in ((1, legacy_family), (2, "Regular"), (4, f"{family} {style}"),
                       (6, f"{family.replace(' ', '')}-{style}"), (16, family), (17, style)):
        name.setName(value, nid, 3, 1, 0x409)
        name.setName(value, nid, 1, 0, 0)
    font["OS/2"].usWeightClass = {"Regular": 400, "SemiBold": 600}[style]


def main() -> None:
    OUT.mkdir(exist_ok=True)
    for src, out in (("PilatWide.otf", "PilatWide.ttf"), ("WhitneyCond.otf", "WhitneyCond.ttf")):
        f = TTFont(SRC / src)
        otf_to_ttf(f)
        f.save(OUT / out)
        print("wrote", OUT / out, f["name"].getDebugName(4))
    # Khand is variable: fix the two weights the page uses, named after the
    # font's own named instances so they match the installed variable font.
    for wght, style in ((400, "Regular"), (600, "SemiBold")):
        f = instantiateVariableFont(TTFont(SRC / "Khand.ttf"), {"wght": wght})
        set_names(f, "Khand Variable", style)
        f.save(OUT / f"Khand-{wght}.ttf")
        print("wrote", OUT / f"Khand-{wght}.ttf", f["name"].getDebugName(4))


if __name__ == "__main__":
    main()
