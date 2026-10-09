#!/usr/bin/env python3
"""The bulb's lit cube (app.js MDK.bulb, CSS [bulb]): the game's cube as a glowing ORANGE JELLY cube.

Review 2026-10-09, with a picture of the pillow slide whose cubes glow as glossy orange jelly cubes - "use these cubes
throughout for the effect". Measured on that picture: the cube keeps the blue cube's own design - its deep rim, the
light bevel line along its top, its white gloss - recoloured: the face orange at the top (253,150,33) turning golden
yellow at the bottom (255,213,30), the rim a deep red-orange (~245,65,5), the bevel line cream-orange (253,202,115);
round it a thin bright cream-yellow outline (255,241,165) and a warm glow fading into the floor (those two are CSS:
MDK.bulb's drop-shadows and .md-bulb-halo / .md-bulb-pool).

So this recolours the game's cube (cubes_blue_row.webp, its first cube - the box MDK.cube shows, so the layers sit
exactly on it), part by part, by the blue art's own shading (its green channel: the face ~135, the bevel line lighter,
the rim darker; a small dead zone so the art's faint face texture does not show) and keeps its gloss white:
  cube_orange.webp ....... the lit cube, steady
  cube_orange_light.webp . a soft golden light in the lower middle of its face, screened onto it - the part that
                           twinkles (MDK.bulb), so the cube's light flickers like a diya's
(Earlier lit cubes - resin, honey, gold - were each turned down; each re-render gets a NEW file name, because a browser
kept showing a cached old one under the same name.)

    python tools/gen_cube_lit.py        (then: node tools/gen_asset_sizes.js)
"""
import os
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STRIP = os.path.join(ROOT, "assets", "cubes_blue_row.webp")
BOX = (3, 2, 208, 211)          # app.js STRIP: cuts[0]..cuts[1] x top..bot - the box MDK.cube shows

FACE_TOP, FACE_BOTTOM = (253, 146, 32), (255, 214, 30)   # the face: orange at the top -> golden yellow at the bottom
BEVEL, RIM, GLOSS = (253, 204, 118), (236, 58, 4), (255, 255, 250)
LIGHT = (255, 228, 120)                                   # the light inside (screened): soft golden


def main():
    im = Image.open(STRIP).convert("RGBA").crop(BOX)
    px = np.asarray(im).astype(float)
    rgb, al = px[..., :3], px[..., 3] / 255
    h, w = al.shape
    R, G = rgb[..., 0], rgb[..., 1]
    yy, xx = np.mgrid[0:h, 0:w]
    X, Y = (xx + .5) / w, (yy + .5) / h
    C = lambda v: np.array(v, float)
    lerp = lambda c0, c1, t: c0 * (1 - t[..., None]) + c1 * t[..., None]

    # ---- the lit cube ----
    col = lerp(C(FACE_TOP), C(FACE_BOTTOM), np.clip((Y - .12) / .76, 0, 1) ** 1.1)
    d = (ndimage.gaussian_filter(G, 1.6) - 135) / 120                   # the art's shading: + the bevel line, - the rim
    d = np.sign(d) * np.clip(np.abs(d) - .07, 0, None) / .93            # (a dead zone: its faint face texture is not shading)
    col = lerp(col, C(BEVEL), np.clip(np.clip(d, 0, 1) * 1.6, 0, 1))
    col = lerp(col, C(RIM), np.clip(np.clip(-d, 0, 1) * 2.8, 0, 1))      # (a full deep rim: flush in a row, each cube still reads)
    col = lerp(col, C(GLOSS), np.clip((R - 120) / 110, 0, 1))          # its gloss (near white in the art) stays white
    save(col, al, "cube_orange")

    # ---- the light inside: soft, low in the middle of the face, clear of the rim ----
    sq = (np.abs(2 * X - 1) ** 6 + np.abs(2 * Y - 1) ** 6) ** (1 / 6)
    inside = np.clip((.86 - sq) / .12, 0, 1)
    glow = np.exp(-(((X - .5) / .36) ** 2 + ((Y - .64) / .3) ** 2) * 1.3)
    save(np.broadcast_to(C(LIGHT), rgb.shape), np.clip(glow * inside, 0, 1) * (al > .5), "cube_orange_light")


def save(rgb, a, name):
    p = os.path.join(ROOT, "assets", name + ".webp")
    out = np.dstack([np.clip(rgb, 0, 255), np.clip(a, 0, 1) * 255]).astype(np.uint8)
    Image.fromarray(out, "RGBA").save(p, "WEBP", quality=92, method=6, exact=True)
    print(p, os.path.getsize(p))


if __name__ == "__main__":
    main()
