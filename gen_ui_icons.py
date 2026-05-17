import os, re, sys
from openai import OpenAI
if sys.platform=="win32":
    import io; sys.stdout=io.TextIOWrapper(sys.stdout.buffer,encoding='utf-8')

client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
SYSTEM = "You are a premium SVG icon designer. Return ONLY raw SVG XML, no markdown."

ICONS = [
("tap", """
64x64 SVG — a beautiful glowing finger tap icon.

BACKGROUND: none (transparent — no background rect)

DESIGN: A stylized index finger pointing up/tapping, centered in 64x64.
- Finger shape: smooth rounded path, slightly bent index finger pointing up
- Main fill: linear gradient from #C4B5FD (top) to #7C3AED (bottom)
- Finger outline/stroke: #A78BFA, stroke-width=1
- Small circular "tap ripple" rings at the fingertip: 2 concentric circles, stroke only, #A78BFA, opacity decreasing (0.6, 0.3)
- Fingernail detail: small rounded rect at top of finger, slightly lighter color
- Subtle inner highlight on finger: thin light stroke on left side, white opacity 0.3
- Glow: feDropShadow stdDeviation=3, flood-color=#A78BFA, flood-opacity=0.6
- Size: finger fills about 60% of icon, centered slightly lower
- Style: modern, clean, premium purple
"""),

("lock", """
64x64 SVG — a beautiful premium padlock icon.

BACKGROUND: none (transparent)

DESIGN: A stylish padlock, centered in 64x64.
- Lock body: rounded rectangle (rx=5), centered at ~(32,38), width=28, height=22
  Fill: radial gradient from #3B1F7A (center) to #1a0840 (edge)
  Stroke: linear gradient from #A78BFA to #7C3AED, stroke-width=1.5
- Lock shackle (U-shaped bar on top):
  Path: starts at (20,38), goes up to (20,26) with arc radius 12, ends at (44,26) going down to (44,38)
  Stroke: linear gradient #C4B5FD to #7C3AED, stroke-width=3, stroke-linecap=round, fill=none
- Keyhole: small circle (r=4) in center of body + small rectangle below it (2x5), fill=#A78BFA opacity=0.8
- Highlight: small white ellipse top-left of body, opacity=0.2
- Small sparkle dots: 3 tiny circles around the lock, #C4B5FD, opacity=0.5
- Glow: feDropShadow stdDeviation=3.5, flood-color=#7C3AED, flood-opacity=0.65
- Style: mysterious, premium, violet glow
"""),
]

os.makedirs("src/assets/icons", exist_ok=True)
os.makedirs("public/icons", exist_ok=True)

for name, spec in ICONS:
    print(f"Generating {name}...")
    resp = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role":"system","content":SYSTEM},{"role":"user","content":f"""Create this SVG icon:

{spec}

Requirements:
- viewBox="0 0 64 64" width="64" height="64" xmlns="http://www.w3.org/2000/svg"
- Transparent background (no background rect)
- Put ALL gradients/filters in <defs>
- Return ONLY SVG from <svg to </svg>"""}],
        max_tokens=1500, temperature=0.15,
    )
    svg = resp.choices[0].message.content.strip()
    svg = re.sub(r'^```[a-z]*\n?','',svg,flags=re.MULTILINE)
    svg = re.sub(r'\n?```$','',svg,flags=re.MULTILINE).strip()
    if not svg.startswith('<svg'):
        m=re.search(r'<svg[\s\S]*</svg>',svg)
        svg=m.group(0) if m else ''
    if svg:
        for d in ["src/assets/icons","public/icons"]:
            with open(f"{d}/{name}.svg",'w',encoding='utf-8') as f:
                f.write(svg)
        print(f"  saved {name}.svg")
    else:
        print(f"  ERROR {name}")
print("Done!")
