import os, re, sys
from openai import OpenAI
if sys.platform=="win32":
    import io; sys.stdout=io.TextIOWrapper(sys.stdout.buffer,encoding='utf-8')

client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
SYSTEM = "You are a premium SVG icon designer. Return ONLY raw SVG XML, no markdown, no explanation."

prompt = """Create a 64x64 SVG icon: a beautiful glowing finger tap / touch icon.

BACKGROUND: none (transparent — NO background rect at all)

FINGER DESIGN:
- A clean, modern index finger pointing upward, slightly angled (about 10 degrees right)
- Finger shape: use smooth bezier paths to create a realistic but stylized finger silhouette
- The finger should be roughly centered in the icon, taking up about 55% height
- Fill: smooth linear gradient from top #EDE9FE (light lavender) to bottom #7C3AED (deep violet)
- Subtle inner highlight: a thin lighter path on the left side of the finger, white opacity 0.25
- Fingernail at top: small rounded rect shape, fill #C4B5FD, slightly lighter
- Knuckle lines: 2 subtle horizontal curved lines on the finger, stroke #A78BFA opacity 0.3, stroke-width 0.7

TAP EFFECT:
- 3 concentric arc/ring segments centered at the fingertip (top of finger):
  * Ring 1: radius 8, short arc 120deg centered, stroke #A78BFA, stroke-width 1.5, opacity 0.7
  * Ring 2: radius 13, same arc, stroke #7C3AED, stroke-width 1, opacity 0.5
  * Ring 3: radius 18, same arc, stroke #6D28D9, stroke-width 0.8, opacity 0.3
- These arcs suggest a tap ripple effect spreading from the fingertip

GLOW:
- feDropShadow stdDeviation=3 flood-color=#A78BFA flood-opacity=0.65
- Apply to whole icon group

STYLE: Premium, clean, modern. The finger should look elegant not cartoonish.
Coordinates: finger roughly at x=28-38, y=14-56. Fingertip at approximately (32, 14).

Return ONLY SVG from <svg to </svg>"""

print("Generating tap icon v2...")
resp = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role":"system","content":SYSTEM},{"role":"user","content":prompt}],
    max_tokens=2000, temperature=0.1,
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
    print("saved tap.svg")
else:
    print("ERROR")
