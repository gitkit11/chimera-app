import os, re, sys
from openai import OpenAI
if sys.platform=="win32":
    import io; sys.stdout=io.TextIOWrapper(sys.stdout.buffer,encoding='utf-8')

client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
SYSTEM = "You are a premium SVG icon designer for a dark sports betting AI app. Return ONLY raw SVG XML."

ICONS = [
("signals", "#A78BFA", """
64x64 SVG icon: a premium crosshair/reticle targeting system for a sports betting AI.
Background: transparent (no background rect)
Design:
- Outer circle: r=28, stroke=#A78BFA, stroke-width=1.5, fill=none, with 4 gaps at 0/90/180/270 degrees (like a crosshair)
- Four crosshair lines from center: top, bottom, left, right — each 12px long, stroke=#A78BFA, stroke-width=2, round caps
- Inner circle: r=8, stroke=#C084FC, stroke-width=1.2, fill=none
- Center dot: r=3, fill=#EDE9FE
- Small tick marks at 45-degree positions on outer circle: 4 short lines, stroke=#A78BFA opacity=0.5
- Glow filter: feDropShadow flood-color=#A78BFA stdDeviation=3 opacity=0.7
Style: military-grade precision targeting, purple glow, premium dark aesthetic
"""),

("express", "#F97316", """
64x64 SVG icon: lightning bolt chain for a sports betting express/parlay.
Background: transparent
Design:
- Two interlocked diamond/chain links: each 20x14px oval rotated 45deg, stroke=#F97316 stroke-width=2.5
  Link 1: centered at (22,32), rotated -30deg
  Link 2: centered at (42,32), rotated +30deg
  They overlap in the center area
- A bold lightning bolt overlay: zigzag path from (30,16) to (28,30) to (34,30) to (32,48), fill=#F97316, no stroke
- Small energy sparks: 3 small 4-point stars around the bolt, fill=#FCD34D size=4
- Glow: feDropShadow flood-color=#F97316 stdDeviation=3 opacity=0.75
Style: energy, multiple wins chained, orange/amber power aesthetic
"""),

("totals", "#34D399", """
64x64 SVG icon: upward momentum chart for totals betting.
Background: transparent
Design:
- Bar chart: 4 bars of increasing height, left-to-right
  Bar 1: x=8, height=20, bottom at y=52, width=8, fill=#065F46 opacity=0.7
  Bar 2: x=20, height=30, width=8, fill=#059669 opacity=0.8
  Bar 3: x=32, height=40, width=8, fill=#10B981
  Bar 4: x=44, height=50, width=8, fill=#34D399
  Rounded top on each bar (rx=2)
- Bold upward arrow above bar 4: from (48,22) going to (56,10) and (40,10), fill=#6EE7B7
- Horizontal baseline at y=52: line x1=6 x2=58, stroke=#34D399 opacity=0.3 stroke-width=1
- Small trend line connecting bar tops: path through tops, stroke=#6EE7B7 stroke-width=1.5 fill=none
- Glow: feDropShadow flood-color=#34D399 stdDeviation=3 opacity=0.7
Style: financial chart, growth, emerald green precision
"""),

("week", "#EAB308", """
64x64 SVG icon: premium crown/trophy for the best signal of the week.
Background: transparent
Design:
- Bold crown shape centered:
  Base: rect x=12 y=46 width=40 height=8 rx=3, fill=#EAB308
  5 crown points rising from base:
  - Left outer: triangle from (12,46) to (16,26) to (20,38)
  - Left inner: triangle from (20,38) to (24,32) to (28,42)
  - Center top: triangle from (25,42) to (32,18) to (39,42)
  - Right inner: triangle from (36,42) to (40,32) to (44,38)
  - Right outer: triangle from (44,38) to (48,26) to (52,46)
  Fill all: linear gradient from #FCD34D top to #D97706 bottom
- 3 gems on crown points: circles r=3 at (16,26), (32,18), (48,26), fill=#FFF7ED with inner glow
- Glow: feDropShadow flood-color=#EAB308 stdDeviation=4 opacity=0.8
Style: royal, premium, golden trophy energy
"""),

("favorites", "#F472B6", """
64x64 SVG icon: premium bookmark/star for saved favorites.
Background: transparent
Design:
- Large 5-pointed star: centered at (32,30), outer-radius=24, inner-radius=10
  Points at: top(32,6), upper-right(52,18), lower-right(44,46), lower-left(20,46), upper-left(12,18)
  Fill: radial gradient from #FDF2F8 center to #EC4899 edge
  Stroke: #F472B6 stroke-width=1.5
- Star sparkle: 4 small diamond shapes around the main star at 45-degree positions, fill=#F9A8D4 size=5
- Inner glow ring: circle r=10 at center, fill=none stroke=#FDF2F8 opacity=0.4 stroke-width=1
- Specular highlight: small ellipse top-left of star, fill=white opacity=0.5
- Glow: feDropShadow flood-color=#EC4899 stdDeviation=3 opacity=0.7
Style: collection, saved treasures, rose/pink luxury feel
"""),
]

os.makedirs("src/assets/menu", exist_ok=True)

for name, color, spec in ICONS:
    print(f"Generating {name}...")
    resp = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role":"system","content":SYSTEM},{"role":"user","content":f"""Create this premium SVG icon for a dark sports betting app:

{spec}

Requirements:
- viewBox="0 0 64 64" width="64" height="64" xmlns="http://www.w3.org/2000/svg"
- Transparent background (NO background rect)
- ALL gradients and filters in <defs> with unique IDs
- Return ONLY SVG from <svg to </svg>"""}],
        max_tokens=1800, temperature=0.1,
    )
    svg = resp.choices[0].message.content.strip()
    svg = re.sub(r'^```[a-z]*\n?','',svg,flags=re.MULTILINE)
    svg = re.sub(r'\n?```$','',svg,flags=re.MULTILINE).strip()
    if not svg.startswith('<svg'):
        m=re.search(r'<svg[\s\S]*</svg>',svg)
        svg=m.group(0) if m else ''
    if svg:
        with open(f"src/assets/menu/{name}.svg",'w',encoding='utf-8') as f:
            f.write(svg)
        print(f"  saved {name}.svg")
    else:
        print(f"  ERROR {name}")

print("Done!")
