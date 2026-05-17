#!/usr/bin/env python3
"""
gen_speedometers_svg.py
Programmatic speedometer PNGs for express cards.
Same gauge every time — only needle position + accent color change.
Output: public/bg/speed_210.png, speed_280.png, speed_340.png
"""
import os, sys, math
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops

if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

os.makedirs("public/bg", exist_ok=True)

W, H = 1536, 1024
SS   = 3   # 3× supersampling → LANCZOS downsample for smooth arcs


# ─── Helpers ──────────────────────────────────────────────────────────────────
def load_font(size: int, bold: bool = True) -> ImageFont.FreeTypeFont:
    candidates = (
        ["C:/Windows/Fonts/segoeuib.ttf", "C:/Windows/Fonts/arialbd.ttf",
         "C:/Windows/Fonts/arial.ttf"]
        if bold else
        ["C:/Windows/Fonts/segoeui.ttf", "C:/Windows/Fonts/arial.ttf"]
    )
    for p in candidates:
        try:
            return ImageFont.truetype(p, size)
        except OSError:
            pass
    return ImageFont.load_default()


def polar(cx: float, cy: float, r: float, deg: float):
    rad = math.radians(deg)
    return cx + r * math.cos(rad), cy + r * math.sin(rad)


def donut_pts(cx, cy, r_out, r_in, a0, a1, n: int = 600):
    """Polygon points for an annular arc segment a0→a1 (degrees)."""
    pts = []
    for i in range(n + 1):
        pts.append(polar(cx, cy, r_out, a0 + (a1 - a0) * i / n))
    for i in range(n + 1):
        pts.append(polar(cx, cy, r_in,  a1 - (a1 - a0) * i / n))
    return pts


def draw_centered(draw, x, y, text, font, color):
    try:
        bb = font.getbbox(text)
        tw, th = bb[2] - bb[0], bb[3] - bb[1]
        ox, oy = bb[0], bb[1]
    except AttributeError:
        tw, th = font.getsize(text)
        ox, oy = 0, 0
    draw.text((x - tw // 2 - ox, y - th // 2 - oy), text, fill=color, font=font)


# ─── Dial constants ───────────────────────────────────────────────────────────
A_START = 225.0   # 7 o'clock (degrees from East, clockwise)
A_SWEEP = 270.0   # full dial sweep
V_MAX   = 360.0   # scale max (breathing room above 340)

def v2a(v): return A_START + (v / V_MAX) * A_SWEEP


# ─── Generator ────────────────────────────────────────────────────────────────
def generate(target_speed: int, out_name: str):
    sw, sh = W * SS, H * SS
    cx = sw // 2
    cy = int(sh * 0.545)

    # — Radii (SS-space) —
    RO   = 320 * SS   # outer track edge
    RI   = 248 * SS   # inner track edge
    RTO  = 240 * SS   # tick outer edge
    RMAJ = 205 * SS   # major tick inner
    RMIN = 222 * SS   # minor tick inner
    RLBL = 183 * SS   # label radius
    RN   = 234 * SS   # needle tip radius
    RHB  = 21  * SS   # hub radius

    a0   = v2a(0);   a210 = v2a(210)
    a280 = v2a(280); a360 = v2a(360)
    aTgt = v2a(target_speed)

    # — Accent colors per zone —
    if target_speed <= 210:
        accent = (82, 218, 114);  glow_c = (36, 110, 56)
    elif target_speed <= 280:
        accent = (248, 140, 32);  glow_c = (134, 68, 10)
    else:
        accent = (232, 58, 58);   glow_c = (124, 22, 22)

    # ── Background ────────────────────────────────────────────────────────
    canvas = Image.new("RGB", (sw, sh), (3, 2, 10))
    d = ImageDraw.Draw(canvas)

    # Soft radial glow from center
    for r in range(int(430 * SS), 0, -SS):
        t = 1.0 - r / (430 * SS)
        d.ellipse([cx-r, cy-r, cx+r, cy+r],
                  fill=(int(t*7), int(t*4), int(t*22)))

    # ── Track base (full arc, dark) ───────────────────────────────────────
    d.polygon(donut_pts(cx, cy, RO, RI, a0, a360), fill=(11, 11, 20))

    # ── Zone fills (dark-tinted interior) ────────────────────────────────
    d.polygon(donut_pts(cx, cy, RO-8*SS, RI+2*SS, a0,   a210), fill=(16, 60, 28))
    d.polygon(donut_pts(cx, cy, RO-8*SS, RI+2*SS, a210, a280), fill=(58, 34,  8))
    d.polygon(donut_pts(cx, cy, RO-8*SS, RI+2*SS, a280, a360), fill=(60, 12, 12))

    # ── Outer bright color stripes ────────────────────────────────────────
    EW = 8 * SS
    d.polygon(donut_pts(cx, cy, RO, RO-EW, a0,   a210), fill=(70, 200, 95))
    d.polygon(donut_pts(cx, cy, RO, RO-EW, a210, a280), fill=(245, 136, 32))
    d.polygon(donut_pts(cx, cy, RO, RO-EW, a280, a360), fill=(225, 50, 50))

    # ── Inner bright color stripes ────────────────────────────────────────
    IW = 5 * SS
    d.polygon(donut_pts(cx, cy, RI+IW, RI, a0,   a210), fill=(44, 138, 65))
    d.polygon(donut_pts(cx, cy, RI+IW, RI, a210, a280), fill=(180, 92, 18))
    d.polygon(donut_pts(cx, cy, RI+IW, RI, a280, a360), fill=(155, 26, 26))

    # ── Glow bloom around outer stripes ──────────────────────────────────
    bloom = Image.new("RGB", (sw, sh), (0, 0, 0))
    bd = ImageDraw.Draw(bloom)
    BW = 20 * SS
    bd.polygon(donut_pts(cx, cy, RO+BW, RO-BW, a0,   a210), fill=(54, 174, 76))
    bd.polygon(donut_pts(cx, cy, RO+BW, RO-BW, a210, a280), fill=(224, 110, 18))
    bd.polygon(donut_pts(cx, cy, RO+BW, RO-BW, a280, a360), fill=(195, 36, 36))
    bloom = bloom.filter(ImageFilter.GaussianBlur(radius=int(22 * SS)))
    canvas = ImageChops.lighter(canvas, bloom)
    d = ImageDraw.Draw(canvas)

    # ── Zone separator lines (clean division at 210 and 280) ─────────────
    for v_sep in [210, 280]:
        a_sep = v2a(v_sep)
        x1, y1 = polar(cx, cy, RO + 3*SS, a_sep)
        x2, y2 = polar(cx, cy, RI - 3*SS, a_sep)
        d.line([(int(x1), int(y1)), (int(x2), int(y2))],
               fill=(4, 4, 14), width=int(3 * SS))

    # ── Outer bezel ring ──────────────────────────────────────────────────
    br = 3 * SS
    d.ellipse([cx-RO-br, cy-RO-br, cx+RO+br, cy+RO+br],
              outline=(55, 60, 82), width=br)

    # ── Inner ring ────────────────────────────────────────────────────────
    d.ellipse([cx-RI, cy-RI, cx+RI, cy+RI],
              outline=(8, 8, 16), width=int(2 * SS))

    # ── Tick marks ────────────────────────────────────────────────────────
    for v in range(0, 361, 5):
        a     = v2a(v)
        major = (v % 50 == 0)
        semi  = (v % 10 == 0)
        r_i   = RMAJ if major else (RMIN if semi else RTO - 5*SS)
        lw    = int(3.5*SS) if major else int(1.8*SS) if semi else SS
        col   = (215, 220, 235) if major else (112, 118, 140) if semi else (56, 60, 76)
        x1, y1 = polar(cx, cy, RTO, a)
        x2, y2 = polar(cx, cy, r_i, a)
        d.line([(int(x1), int(y1)), (int(x2), int(y2))],
               fill=col, width=max(1, lw))

    # ── Speed labels ──────────────────────────────────────────────────────
    font_lbl = load_font(int(17 * SS), bold=True)
    for v in [0, 50, 100, 150, 200, 250, 300]:
        a  = v2a(v)
        x, y = polar(cx, cy, RLBL, a)
        c  = (76, 206, 100) if v <= 210 else (244, 138, 36) if v <= 280 else (224, 54, 54)
        draw_centered(d, int(x), int(y), str(v), font_lbl, c)

    # ── Needle glow layers ────────────────────────────────────────────────
    tip = polar(cx, cy, RN, aTgt)
    for gw in (int(22*SS), int(14*SS), int(8*SS)):
        d.line([(cx, cy), (int(tip[0]), int(tip[1]))], fill=glow_c, width=gw)

    # ── Needle ────────────────────────────────────────────────────────────
    d.line([(cx, cy), (int(tip[0]), int(tip[1]))], fill=accent, width=int(4*SS))
    d.line([(cx, cy), (int(tip[0]), int(tip[1]))], fill=(255, 255, 255), width=SS)

    # Short counterweight tail (opposite direction)
    cw = polar(cx, cy, int(RHB * 1.7), aTgt + 180)
    d.line([(cx, cy), (int(cw[0]), int(cw[1]))], fill=accent, width=int(6*SS))

    # ── Hub ───────────────────────────────────────────────────────────────
    d.ellipse([cx-RHB, cy-RHB, cx+RHB, cy+RHB],
              fill=(33, 33, 52), outline=(86, 90, 116), width=int(2*SS))
    ih = RHB // 2
    d.ellipse([cx-ih, cy-ih, cx+ih, cy+ih], fill=(168, 174, 194))

    # ── Speed readout (inside dial, lower center) ─────────────────────────
    font_big  = load_font(int(58 * SS), bold=True)
    font_unit = load_font(int(18 * SS), bold=False)
    spd_y = cy + int(112 * SS)
    draw_centered(d, cx, spd_y, str(target_speed), font_big, accent)
    draw_centered(d, cx, spd_y + int(38 * SS), "km/h", font_unit, (122, 128, 150))

    # ── Downscale & save ──────────────────────────────────────────────────
    final = canvas.resize((W, H), Image.LANCZOS)
    out   = f"public/bg/{out_name}.png"
    final.save(out, "PNG")
    kb = os.path.getsize(out) // 1024
    print(f"  → {out}  ({kb} KB)")


# ─── Run ──────────────────────────────────────────────────────────────────────
GAUGES = [(210, "speed_210"), (280, "speed_280"), (340, "speed_340")]

for speed, name in GAUGES:
    print(f"Generating {name}  (needle → {speed} km/h)…")
    generate(speed, name)

print("\nDone!")
