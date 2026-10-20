"""
Builds src/fonts/StarHillScript.woff2 from Great Vibes (SIL OFL 1.1).

Great Vibes has Cyrillic but lacks the Mongolian letters Ө ө Ү ү. This adds them:
  Ө ө  - the script's own О о with a slanted bar
  Ү ү  - the top of У у with its looping tail replaced by the straight, pen-drawn
         descender of the font's own р (as Ү ү are written by hand), so they read
         clearly apart from the looped У у
  Every contextual form of У у (у.init, у.alt0 …) gets a Ү ү twin, and the twins
  are mirrored into the font's GSUB/GPOS rules, so Ү ү join and space exactly
  like У у (e.g. ү takes ү.init after б, as у does).

Usage (needs: pip install fonttools brotli skia-pathops):
  python scripts/fonts/build-star-hill-script.py source-media/fonts/GreatVibes-Regular.ttf /tmp/StarHillScript.ttf src/fonts/StarHillScript.woff2
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

def transform_path(path, sx=1.0, dx=0.0, dy=0.0, anchor=(0.0, 0.0)):
    """Scale about `anchor`, then translate."""
    from fontTools.pens.transformPen import TransformPen
    ax, ay = anchor
    out = pathops.Path()
    path.draw(TransformPen(out.getPen(), (sx, 0, 0, sx, ax - sx * ax + dx, ay - sx * ay + dy)))
    return out

def stem_centre(path, y, h=6):
    """Centre and width of the right-most real stroke crossing height y."""
    xmin, ymin, xmax, ymax = bounds(path)
    band = pathops.op(path, rect_path(xmin - 400, y, xmax + 400, y + h), pathops.PathOp.INTERSECTION)
    segs = [bb for bb in contours_bounds(band) if bb[2] - bb[0] >= 25]
    x0, _, x1, _ = max(segs, key=lambda bb: bb[2])
    return (x0 + x1) / 2, x1 - x0

def with_r_descender(base, cut, scale=1.0):
    """Keep `base` above `cut` (its looping tail removed) and hang the straight,
    pen-drawn descender of the font's own р from the same stem."""
    p = glyph_path(base)
    xmin, ymin, xmax, ymax = bounds(p)
    kept = pathops.op(p, rect_path(xmin - 400, cut, xmax + 400, ymax + 50), pathops.PathOp.INTERSECTION)
    clean = pathops.Path()
    for c in kept.contours:
        bb = bounds(c)
        if bb and (bb[2] - bb[0]) * (bb[3] - bb[1]) > 4000:
            c.draw(clean.getPen())
    r = glyph_path(cmap[0x0440])
    rxmin, rymin, rxmax, rymax = bounds(r)
    join = cut + 12  # overlap so the union is seamless
    desc = pathops.op(r, rect_path(rxmin - 50, rymin - 50, rxmax + 50, join), pathops.PathOp.INTERSECTION)
    rc, rw = stem_centre(r, join - 8)
    bc, bw = stem_centre(p, join - 8)
    sx = scale * (bw / rw if rw else 1.0)
    sx = max(0.9 * scale, min(sx, 1.35 * scale))
    desc = transform_path(desc, sx=sx, anchor=(rc, join))
    desc = transform_path(desc, dx=bc - rc)
    return pathops.op(clean, desc, pathops.PathOp.UNION)

def copy_glyph(base):
    return glyph_path(base)

store("uni04E8", barred(cmap[0x041E], 0.12, 0.18, 0.5, 34), cmap[0x041E])
store("uni04E9", barred(cmap[0x043E], 0.12, 0.12, 0.48, 26), cmap[0x043E])
# ү: same spacing as у, plus a little room on the left so it never reads as
# joined to the letter before it.
YU_SHIFT = 40
store("uni04AF", transform_path(with_r_descender(cmap[0x0443], -40), dx=YU_SHIFT), cmap[0x0443])
hmtx["uni04AF"] = (hmtx[cmap[0x0443]][0] + YU_SHIFT, 0)
store("uni04AE", with_r_descender(cmap[0x0423], -40, 1.25), cmap[0x0423])

# ── Make Ү ү behave exactly like У у inside the font's own rules ───────────
# Great Vibes swaps у for contextual forms (e.g. у.init after б, so it tucks
# under б's flourish). Build the matching ү/Ү variant for every у/У variant,
# then mirror them into every substitution mapping, coverage and class.
mirror = {cmap[0x0443]: "uni04AF", cmap[0x0423]: "uni04AE"}
new_names = ["uni04E8", "uni04E9", "uni04AE", "uni04AF"]
for g in list(f.getGlyphOrder()):
    for src, dst in ((cmap[0x0443], "uni04AF"), (cmap[0x0423], "uni04AE")):
        if g.startswith(src + "."):
            twin = dst + g[len(src):]
            if dst == "uni04AF":
                # Same breathing room on the left as the base ү, same tighter right side.
                store(twin, transform_path(with_r_descender(g, -40), dx=YU_SHIFT), g)
                hmtx[twin] = (hmtx[g][0] + YU_SHIFT, 0)
            else:
                store(twin, with_r_descender(g, -40, 1.25), g)
            mirror[g] = twin
            new_names.append(twin)

from fontTools.ttLib.tables import otTables as ot

def mirror_tables(obj, seen=None):
    seen = seen if seen is not None else set()
    if id(obj) in seen:
        return
    seen.add(id(obj))
    if isinstance(obj, ot.Coverage):
        gid = f.getReverseGlyphMap()
        obj.glyphs = sorted(set(obj.glyphs) | {mirror[g] for g in obj.glyphs if g in mirror}, key=gid.__getitem__)
        return
    if isinstance(obj, ot.ClassDef):
        for g, k in list(obj.classDefs.items()):
            if g in mirror:
                obj.classDefs[mirror[g]] = k
        return
    if isinstance(obj, ot.SingleSubst):
        for g, out in list(obj.mapping.items()):
            if g in mirror:
                obj.mapping[mirror[g]] = mirror.get(out, out if out not in (cmap[0x0443], cmap[0x0423]) else mirror[out])
        return
    if isinstance(obj, ot.AlternateSubst):
        for g, alts in list(obj.alternates.items()):
            if g in mirror:
                obj.alternates[mirror[g]] = [mirror[a] for a in alts if a in mirror] or [mirror[g]]
        return
    if isinstance(obj, (list, tuple)):
        for x in obj:
            mirror_tables(x, seen)
        return
    if hasattr(obj, "__dict__") and type(obj).__module__.startswith("fontTools"):
        for v in vars(obj).values():
            mirror_tables(v, seen)

order = list(dict.fromkeys(f.getGlyphOrder() + new_names))
f.setGlyphOrder(order); glyf.glyphOrder = order
for tag in ("GSUB", "GPOS"):
    if tag in f:
        mirror_tables(f[tag].table)
if "GDEF" in f and f["GDEF"].table.GlyphClassDef:
    gc = f["GDEF"].table.GlyphClassDef.classDefs
    for g, twin in mirror.items():
        if g in gc:
            gc[twin] = gc[g]
print("mirrored", len(mirror), "У/у forms into Ү/ү:", sorted(mirror.values()))
order = list(dict.fromkeys(f.getGlyphOrder()))

# Left side bearing must equal each new outline's real left edge; renderers
# position a glyph by it, and the borrowed value (from У/у with their loops)
# would draw Ү/ү far too far left.
for g in new_names:
    glyph = glyf[g]
    glyph.recalcBounds(glyf)
    hmtx[g] = (hmtx[g][0], getattr(glyph, "xMin", 0))
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
