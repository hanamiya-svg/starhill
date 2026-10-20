"""
Builds src/fonts/StarHillScript.woff2 from Great Vibes (SIL OFL 1.1).

Great Vibes has Cyrillic but lacks the Mongolian letters Ө ө Ү ү. This adds them:
  Ө ө  - the script's own О о with a slanted bar
  Ү    - Great Vibes' alternate Y (Y.ss01), distinct from the curly У
  ү    - у with the closing curl of its tail removed (straight tail, as in handwriting)

Usage (needs: pip install fonttools brotli skia-pathops):
  python scripts/fonts/build-star-hill-script.py source-media/fonts/GreatVibes-Regular.ttf /tmp/StarHillScript.ttf src/fonts/StarHillScript.woff2 -175
"""
import sys
import pathops
from fontTools.ttLib import TTFont
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.pens.cu2quPen import Cu2QuPen
from fontTools.pens.boundsPen import BoundsPen

src, out_ttf, out_woff2 = sys.argv[1:4]
f = TTFont(src)
gs = f.getGlyphSet()
glyf, hmtx, cmap = f["glyf"], f["hmtx"], f.getBestCmap()
SLANT = 0.24

def glyph_path(name):
    p = pathops.Path(); gs[name].draw(p.getPen(glyphSet=gs)); return p

def rect_path(x0, y0, x1, y1):
    p = pathops.Path(); pen = p.getPen()
    pen.moveTo((x0, y0)); pen.lineTo((x1, y0)); pen.lineTo((x1, y1)); pen.lineTo((x0, y1)); pen.closePath(); return p

def poly_path(pts):
    p = pathops.Path(); pen = p.getPen(); pen.moveTo(pts[0]); [pen.lineTo(q) for q in pts[1:]]; pen.closePath(); return p

def bounds(path):
    bp = BoundsPen(None); path.draw(bp); return bp.bounds

def contours_bounds(path):
    return [b for b in (bounds(c) for c in path.contours) if b]

def store(new, path, adv_from):
    pen = TTGlyphPen(None)
    path.draw(Cu2QuPen(pen, 1.0, reverse_direction=False))
    glyf[new] = pen.glyph()
    hmtx[new] = hmtx[adv_from]

def barred(base, inset_l, inset_r, y_frac, th):
    p = glyph_path(base)
    xmin, ymin, xmax, ymax = bounds(p)
    w = xmax - xmin; yc = ymin + (ymax - ymin) * y_frac
    x0, x1 = xmin + w * inset_l, xmax - w * inset_r
    bar = poly_path([(x0 - SLANT * th / 2, yc - th / 2), (x1 - SLANT * th / 2, yc - th / 2), (x1 + SLANT * th / 2, yc + th / 2), (x0 + SLANT * th / 2, yc + th / 2)])
    return pathops.op(p, bar, pathops.PathOp.UNION)

def no_loop(base, cut):
    """The letter with its descender's closing curl removed: everything above `cut`."""
    p = glyph_path(base)
    xmin, ymin, xmax, ymax = bounds(p)
    # Angled like a pen lifting off: higher on the left, lower on the right.
    clip = poly_path([(xmin - 400, cut + 80), (xmax + 400, cut - 70), (xmax + 400, ymax + 50), (xmin - 400, ymax + 50)])
    kept = pathops.op(p, clip, pathops.PathOp.INTERSECTION)
    # Drop small fragments left behind by the curl (keep the big contour(s)).
    out = pathops.Path()
    for c in kept.contours:
        b = bounds(c)
        if b and (b[2] - b[0]) * (b[3] - b[1]) > 4000:
            c.draw(out.getPen())
    return out

def copy_glyph(base):
    return glyph_path(base)

store("uni04E8", barred(cmap[0x041E], 0.12, 0.18, 0.5, 34), cmap[0x041E])
store("uni04E9", barred(cmap[0x043E], 0.12, 0.12, 0.48, 26), cmap[0x043E])
store("uni04AF", no_loop(cmap[0x0443], float(sys.argv[4]) if len(sys.argv) > 4 else -235), cmap[0x0443])
store("uni04AE", copy_glyph("Y.ss01"), "Y.ss01")

order = list(dict.fromkeys(f.getGlyphOrder() + ["uni04E8", "uni04E9", "uni04AE", "uni04AF"]))
f.setGlyphOrder(order); glyf.glyphOrder = order
for t in f["cmap"].tables:
    if t.isUnicode():
        t.cmap.update({0x04E8: "uni04E8", 0x04E9: "uni04E9", 0x04AE: "uni04AE", 0x04AF: "uni04AF"})
for n in f["name"].names:
    if n.nameID in (1, 4, 16): n.string = "Star Hill Script"
    elif n.nameID == 6: n.string = "StarHillScript-Regular"
    elif n.nameID == 3: n.string = "StarHillScript-Regular;based on Great Vibes"
f.save(out_ttf)
f.flavor = "woff2"; f.save(out_woff2)
print("saved", len(order))
