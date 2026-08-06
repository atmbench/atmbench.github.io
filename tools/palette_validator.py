#!/usr/bin/env python3
"""Re-run the full-scatter palette validation described in static/css/price_perf.css.

The existing six slots were validated over ALL pairs (not just neighbours,
because in a scatter any two points can land side by side) against the card
surface #fdfbf8, with a stated worst-case CIEDE2000 of 11.0 under
colour-vision deficiency and 15.6 under normal vision.

Adding a seventh harness therefore needs the same check re-run over seven
colours. This reproduces it:

  * sRGB -> linear -> CIEXYZ -> CIELAB (D65)
  * CIEDE2000 for every unordered pair
  * CVD simulation via Vienot et al. 1999 (protan/deutan) and a Brettel-style
    tritan approximation, then the same pairwise sweep under each

Usage:  python3 palette_validator.py [#RRGGBB ...]   (defaults to the current six)
"""
import itertools
import math
import sys

CURRENT = ["#0072B2", "#D55E00", "#009E73", "#E69F00", "#56B4E9", "#b0175f"]
SURFACE = "#fdfbf8"


def hex2rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))


def srgb2lin(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def lin2srgb(c):
    c = max(0.0, min(1.0, c))
    return 12.92 * c if c <= 0.0031308 else 1.055 * c ** (1 / 2.4) - 0.055


def rgb2xyz(rgb):
    r, g, b = (srgb2lin(c) for c in rgb)
    return (0.4124564 * r + 0.3575761 * g + 0.1804375 * b,
            0.2126729 * r + 0.7151522 * g + 0.0721750 * b,
            0.0193339 * r + 0.1191920 * g + 0.9503041 * b)


def xyz2lab(xyz):
    wx, wy, wz = 0.95047, 1.0, 1.08883
    x, y, z = xyz[0] / wx, xyz[1] / wy, xyz[2] / wz

    def f(t):
        return t ** (1 / 3) if t > 216 / 24389 else (841 / 108) * t + 4 / 29
    fx, fy, fz = f(x), f(y), f(z)
    return (116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz))


def lab(h):
    return xyz2lab(rgb2xyz(hex2rgb(h)))


def ciede2000(l1, l2):
    L1, a1, b1 = l1
    L2, a2, b2 = l2
    kL = kC = kH = 1.0
    C1, C2 = math.hypot(a1, b1), math.hypot(a2, b2)
    Cb = (C1 + C2) / 2
    G = 0.5 * (1 - math.sqrt(Cb ** 7 / (Cb ** 7 + 25 ** 7))) if Cb > 0 else 0.5
    a1p, a2p = (1 + G) * a1, (1 + G) * a2
    C1p, C2p = math.hypot(a1p, b1), math.hypot(a2p, b2)
    h1p = math.degrees(math.atan2(b1, a1p)) % 360 if (a1p or b1) else 0
    h2p = math.degrees(math.atan2(b2, a2p)) % 360 if (a2p or b2) else 0
    dLp = L2 - L1
    dCp = C2p - C1p
    if C1p * C2p == 0:
        dhp = 0
    elif abs(h2p - h1p) <= 180:
        dhp = h2p - h1p
    else:
        dhp = h2p - h1p - 360 if h2p > h1p else h2p - h1p + 360
    dHp = 2 * math.sqrt(C1p * C2p) * math.sin(math.radians(dhp) / 2)
    Lbp = (L1 + L2) / 2
    Cbp = (C1p + C2p) / 2
    if C1p * C2p == 0:
        hbp = h1p + h2p
    elif abs(h1p - h2p) <= 180:
        hbp = (h1p + h2p) / 2
    elif h1p + h2p < 360:
        hbp = (h1p + h2p + 360) / 2
    else:
        hbp = (h1p + h2p - 360) / 2
    T = (1 - 0.17 * math.cos(math.radians(hbp - 30))
         + 0.24 * math.cos(math.radians(2 * hbp))
         + 0.32 * math.cos(math.radians(3 * hbp + 6))
         - 0.20 * math.cos(math.radians(4 * hbp - 63)))
    dTh = 30 * math.exp(-(((hbp - 275) / 25) ** 2))
    Rc = 2 * math.sqrt(Cbp ** 7 / (Cbp ** 7 + 25 ** 7)) if Cbp > 0 else 0
    Sl = 1 + (0.015 * (Lbp - 50) ** 2) / math.sqrt(20 + (Lbp - 50) ** 2)
    Sc = 1 + 0.045 * Cbp
    Sh = 1 + 0.015 * Cbp * T
    Rt = -math.sin(math.radians(2 * dTh)) * Rc
    return math.sqrt((dLp / (kL * Sl)) ** 2 + (dCp / (kC * Sc)) ** 2
                     + (dHp / (kH * Sh)) ** 2
                     + Rt * (dCp / (kC * Sc)) * (dHp / (kH * Sh)))


# Vienot 1999 dichromat simulation in linear LMS.
RGB2LMS = ((17.8824, 43.5161, 4.11935),
           (3.45565, 27.1554, 3.86714),
           (0.0299566, 0.184309, 1.46709))
LMS2RGB = ((0.080944, -0.130504, 0.116721),
           (-0.0102485, 0.0540194, -0.113615),
           (-0.000365294, -0.00412163, 0.693513))
SIM = {
    "protan": ((0, 2.02344, -2.52581), (0, 1, 0), (0, 0, 1)),
    "deutan": ((1, 0, 0), (0.494207, 0, 1.24827), (0, 0, 1)),
    "tritan": ((1, 0, 0), (0, 1, 0), (-0.395913, 0.801109, 0)),
}


def mv(m, v):
    return tuple(sum(m[i][j] * v[j] for j in range(3)) for i in range(3))


def simulate(hexcolor, kind):
    lin = tuple(srgb2lin(c) for c in hex2rgb(hexcolor))
    lms = mv(RGB2LMS, lin)
    lms = mv(SIM[kind], lms)
    rgb = mv(LMS2RGB, lms)
    return "#%02x%02x%02x" % tuple(round(255 * lin2srgb(c)) for c in rgb)


def contrast(h1, h2):
    def lum(h):
        r, g, b = (srgb2lin(c) for c in hex2rgb(h))
        return 0.2126 * r + 0.7152 * g + 0.0722 * b
    a, b = sorted((lum(h1), lum(h2)), reverse=True)
    return (a + 0.05) / (b + 0.05)


def report(palette, label=""):
    print(f"=== {label or 'palette'}: {len(palette)} colours ===")
    worst = {}
    for kind in ("normal", "protan", "deutan", "tritan"):
        cols = palette if kind == "normal" else [simulate(c, kind) for c in palette]
        labs = [lab(c) for c in cols]
        pairs = [(ciede2000(labs[i], labs[j]), palette[i], palette[j])
                 for i, j in itertools.combinations(range(len(palette)), 2)]
        d, x, y = min(pairs)
        worst[kind] = d
        print(f"  {kind:<7} worst pair dE {d:6.2f}   ({x} vs {y})")
    cvd = min(worst[k] for k in ("protan", "deutan", "tritan"))
    print(f"  --> worst CVD dE {cvd:.2f} | worst normal dE {worst['normal']:.2f}")
    print("  contrast vs surface:", "  ".join(
        f"{c}:{contrast(c, SURFACE):.2f}" for c in palette))
    return worst["normal"], cvd


if __name__ == "__main__":
    pal = sys.argv[1:] or CURRENT
    report(pal, "candidate" if sys.argv[1:] else "current six (baseline)")
