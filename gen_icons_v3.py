import os, re, sys
from openai import OpenAI

if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

SYSTEM = """You are a world-class SVG icon designer. You write pixel-perfect SVG code.
Return ONLY raw SVG XML — no markdown, no explanation, no code fences."""

ICONS = [

("football", """
Draw a 64x64 SVG icon of a classic soccer ball that is IMMEDIATELY recognizable.

BACKGROUND: <rect width="64" height="64" rx="14" fill="#0D0B1E"/>
Border: <rect width="64" height="64" rx="14" fill="none" stroke="url(#fbBorder)" stroke-width="1.5"/>
linearGradient id="fbBorder": #7C3AED -> #A78BFA diagonal

BALL (center 32,32 radius 20):
Draw a REALISTIC soccer ball using these EXACT shapes:

1. Base ball circle: <circle cx="32" cy="32" r="20" fill="url(#fbBase)"/>
   radialGradient id="fbBase": center(40%,35%) stop0=#C4B5FD stop1=#4C1D95

2. Draw the classic soccer pattern with these EXACT pentagons and hexagons:
   Central pentagon (dark, top-center of ball):
   <polygon points="32,15 38,20 36,27 28,27 26,20" fill="#1a0840" stroke="#0D0B1E" stroke-width="0.6"/>

   5 outer dark pentagons (evenly spaced around the ball):
   <polygon points="46,20 52,24 50,32 44,33 41,26" fill="#1a0840" stroke="#0D0B1E" stroke-width="0.6"/>
   <polygon points="40,45 46,42 50,48 45,53 38,51" fill="#1a0840" stroke="#0D0B1E" stroke-width="0.6"/>
   <polygon points="24,51 22,45 27,41 33,44 32,51" fill="#1a0840" stroke="#0D0B1E" stroke-width="0.6"/>
   <polygon points="14,32 16,25 23,24 26,31 20,36" fill="#1a0840" stroke="#0D0B1E" stroke-width="0.6"/>
   <polygon points="18,20 24,16 30,19 28,27 21,27" fill="#1a0840" stroke="#0D0B1E" stroke-width="0.6"/>

   Clip everything to ball circle: <clipPath id="ballClip"><circle cx="32" cy="32" r="20"/></clipPath>
   Wrap all ball shapes in: <g clip-path="url(#ballClip)">

3. Specular highlight (top-left): <ellipse cx="26" cy="22" rx="5" ry="3" fill="white" opacity="0.3" transform="rotate(-30,26,22)"/>

4. Apply glow filter to entire ball group:
   feDropShadow stdDeviation="3" flood-color="#A78BFA" flood-opacity="0.7"

Wrap the whole ball in <g filter="url(#fbGlow)">
"""),

("cs2", """
Draw a 64x64 SVG icon for CS2 esports. Make it STRIKING and BEAUTIFUL — a premium gaming icon.

BACKGROUND: <rect width="64" height="64" rx="14" fill="#0D0B1E"/>
Border: <rect width="64" height="64" rx="14" fill="none" stroke="url(#csBorder)" stroke-width="1.5"/>
linearGradient id="csBorder": #0EA5E9 -> #7DD3FC diagonal

DESIGN — A glowing CS2-style shield/emblem with crosshair:

1. Outer glow ring: <circle cx="32" cy="32" r="22" fill="none" stroke="#38BDF8" stroke-width="1" opacity="0.5"/>

2. Shield shape (main element, centered):
<path d="M32,10 L48,18 L48,34 Q48,46 32,54 Q16,46 16,34 L16,18 Z"
  fill="url(#csShield)" stroke="#38BDF8" stroke-width="1" stroke-opacity="0.6"/>
linearGradient id="csShield" vertical: stop0=#0C2D3F stop1=#061520

3. Crosshair ON TOP of shield:
   Top line:    <line x1="32" y1="17" x2="32" y2="25" stroke="#38BDF8" stroke-width="2" stroke-linecap="round"/>
   Bottom line: <line x1="32" y1="39" x2="32" y2="47" stroke="#38BDF8" stroke-width="2" stroke-linecap="round"/>
   Left line:   <line x1="17" y1="32" x2="25" y2="32" stroke="#38BDF8" stroke-width="2" stroke-linecap="round"/>
   Right line:  <line x1="39" y1="32" x2="47" y2="32" stroke="#38BDF8" stroke-width="2" stroke-linecap="round"/>
   Center dot:  <circle cx="32" cy="32" r="2.5" fill="#38BDF8"/>
   Inner ring:  <circle cx="32" cy="32" r="8" fill="none" stroke="#38BDF8" stroke-width="1" stroke-opacity="0.7"/>

4. Glow: feDropShadow on the whole group stdDeviation="3.5" flood-color="#38BDF8" flood-opacity="0.9"
   Also add radial glow overlay: <circle cx="32" cy="32" r="18" fill="url(#csGlowFill)"/>
   radialGradient id="csGlowFill": center rgba(56,189,248,0.15) -> transparent

5. Two small star/diamond accents at top corners of shield:
   <polygon points="22,14 23.5,17 22,20 20.5,17" fill="#38BDF8" opacity="0.6"/>
   <polygon points="42,14 43.5,17 42,20 40.5,17" fill="#38BDF8" opacity="0.6"/>
"""),

("tennis", """
Draw a 64x64 SVG icon of a tennis ball that is INSTANTLY recognizable and beautiful.

BACKGROUND: <rect width="64" height="64" rx="14" fill="#0D0B1E"/>
Border: <rect width="64" height="64" rx="14" fill="none" stroke="url(#tnBorder)" stroke-width="1.5"/>
linearGradient id="tnBorder": #65A30D -> #BEF264 diagonal

BALL (center 32,32 radius 20):

1. Base circle with gradient (bright lime green):
<circle cx="32" cy="32" r="20" fill="url(#tnBase)" filter="url(#tnGlow)"/>
radialGradient id="tnBase" center(35%,30%): stop0=#D9F99D stop1=#4D7C0F

2. Classic tennis ball seam (TWO white curved stripes forming the characteristic S/swoosh pattern):
   Clip to ball: <clipPath id="tnClip"><circle cx="32" cy="32" r="20"/></clipPath>

   First white stripe (sweeps left-to-right, curves UP then DOWN):
   <path d="M 12,28 Q 20,14 32,20 Q 44,26 52,14"
     fill="none" stroke="white" stroke-width="4" stroke-linecap="round"
     clip-path="url(#tnClip)" opacity="0.92"/>

   Second white stripe (sweeps left-to-right, curves DOWN then UP — opposite side):
   <path d="M 12,36 Q 20,50 32,44 Q 44,38 52,50"
     fill="none" stroke="white" stroke-width="4" stroke-linecap="round"
     clip-path="url(#tnClip)" opacity="0.92"/>

3. Specular highlight: <ellipse cx="26" cy="23" rx="5" ry="3" fill="white" opacity="0.35" transform="rotate(-20,26,23)"/>

4. Glow filter: feDropShadow stdDeviation="3.5" flood-color="#84CC16" flood-opacity="0.75"
"""),

]

os.makedirs("src/assets/icons", exist_ok=True)

for name, spec in ICONS:
    print(f"Generating {name}...")

    prompt = f"""Create a complete valid SVG icon from this EXACT specification.
Follow the spec precisely — use the exact coordinates, colors, and shapes described.

SPECIFICATION:
{spec}

RULES:
- viewBox="0 0 64 64" width="64" height="64" xmlns="http://www.w3.org/2000/svg"
- Put ALL gradients and filters in <defs> at the top
- Use clipPath where specified to clip shapes to the ball/circle
- Make it render beautifully — this is a premium app icon
- Return ONLY SVG from <svg to </svg>"""

    resp = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role":"system","content":SYSTEM},{"role":"user","content":prompt}],
        max_tokens=2000, temperature=0.1,
    )

    svg = resp.choices[0].message.content.strip()
    svg = re.sub(r'^```[a-z]*\n?','',svg,flags=re.MULTILINE)
    svg = re.sub(r'\n?```$','',svg,flags=re.MULTILINE).strip()
    if not svg.startswith('<svg'):
        m = re.search(r'<svg[\s\S]*</svg>',svg)
        svg = m.group(0) if m else ''

    if svg:
        with open(f"src/assets/icons/{name}.svg",'w',encoding='utf-8') as f:
            f.write(svg)
        # Copy to public too
        with open(f"public/icons/{name}.svg",'w',encoding='utf-8') as f:
            f.write(svg)
        print(f"  saved {name}.svg")
    else:
        print(f"  ERROR {name}")

print("Done!")
