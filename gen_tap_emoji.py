import os, re, sys
from openai import OpenAI
if sys.platform=="win32":
    import io; sys.stdout=io.TextIOWrapper(sys.stdout.buffer,encoding='utf-8')

client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

prompt = """Design a beautiful 64x64 SVG emoji-style "tap" icon. It should look like a premium custom emoji, not a flat icon.

Create an upward-pointing index finger (like the 👆 emoji) but custom and beautiful.

EXACT STRUCTURE:

1. FINGER BODY — realistic emoji-style rounded finger pointing up:
<path d="M 22,54 C 20,54 19,52 19,50 L 19,26 C 19,18 24,12 32,12 C 40,12 45,18 45,26 L 45,50 C 45,52 44,54 42,54 Z"
  fill: use a warm skin-like gradient OR a beautiful violet/purple gradient for on-brand look
  Choose: radialGradient from #DDD6FE (light lavender) at top-left to #6D28D9 (deep violet) at bottom-right

2. FINGER VOLUME — make it 3D looking:
- Add a lighter curved highlight on the left side (white, opacity 0.3, blur 2px)
- Add subtle shadow on right side (dark violet, opacity 0.25)

3. KNUCKLE CREASES — 2 horizontal curved lines across finger:
- Line at y≈34: M 21,34 Q 32,32 43,34 — stroke #4C1D95, opacity 0.4, stroke-width 1
- Line at y≈44: M 21,44 Q 32,42 43,44 — stroke #4C1D95, opacity 0.3, stroke-width 1

4. FINGERNAIL — curved rounded rect at top of finger:
- Path: M 25,13 C 25,11 28,10 32,10 C 36,10 39,11 39,13 L 39,21 C 39,23 36,24 32,24 C 28,24 25,23 25,21 Z
- Fill: gradient from #F5F3FF to #A78BFA
- Add tiny white shine arc at top: M 27,11 C 29,10 35,10 37,11 — white opacity 0.6

5. TAP RIPPLE CIRCLES — centered around fingertip (32, 10):
- Circle 1: cx=32 cy=10, r=8, fill=none, stroke=#C4B5FD, stroke-width=2, stroke-dasharray="3 3", opacity=0.7
  Animate with: animation pulseTap 1.5s ease-out infinite
- Circle 2: cx=32 cy=10, r=14, fill=none, stroke=#A78BFA, stroke-width=1.5, stroke-dasharray="4 4", opacity=0.45
  animation pulseTap 1.5s ease-out 0.3s infinite
- Circle 3: cx=32 cy=10, r=20, fill=none, stroke=#7C3AED, stroke-width=1, stroke-dasharray="5 5", opacity=0.25
  animation pulseTap 1.5s ease-out 0.6s infinite

@keyframes pulseTap {
  0% { transform: scale(0.6); opacity: 0.8; }
  100% { transform: scale(1.3); opacity: 0; }
}

6. SPARKLE DOTS — 4 small diamond sparkles around the finger:
- Top-right: x=46,y=8 — small 4-point star, fill=#FCD34D (gold), size 5x5
- Top-left: x=18,y=14 — small circle r=2, fill=#C4B5FD
- Right: x=50,y=30 — 4-point star, fill=#A78BFA, size 4x4
- Left: x=14,y=36 — circle r=1.5, fill=#7C3AED

7. GLOW FILTER:
<filter id="glow"><feDropShadow stdDeviation="4" flood-color="#A78BFA" flood-opacity="0.75"/></filter>
Apply to finger group only (not ripples)

viewBox="0 0 64 64" width="64" height="64" xmlns="http://www.w3.org/2000/svg"
ALL gradients and filters in <defs>
Transform-origin for ripple animations: "32px 10px"

Return ONLY the SVG XML from <svg to </svg>"""

print("Generating beautiful tap emoji...")
resp = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role":"system","content":"You are an expert SVG emoji designer creating premium custom emoji icons. Return ONLY raw SVG XML."},
        {"role":"user","content":prompt}
    ],
    max_tokens=2500, temperature=0.1,
)
svg = resp.choices[0].message.content.strip()
svg = re.sub(r'^```[a-z]*\n?','',svg,flags=re.MULTILINE)
svg = re.sub(r'\n?```$','',svg,flags=re.MULTILINE).strip()
if not svg.startswith('<svg'):
    m=re.search(r'<svg[\s\S]*</svg>',svg)
    svg=m.group(0) if m else ''

if svg:
    for d in ["src/assets/icons","public/icons"]:
        with open(f"{d}/tap.svg",'w',encoding='utf-8') as f:
            f.write(svg)
    print("saved!")
else:
    print("ERROR - no SVG found")
