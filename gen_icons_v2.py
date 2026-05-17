import os, re, sys
from openai import OpenAI

# Fix Windows console encoding
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

SYSTEM = """You are a world-class SVG icon designer specializing in premium dark-theme gaming/sports app icons.
You create stunning, detailed SVG icons with gradients, glow effects, and visual depth.
Return ONLY raw SVG XML — no markdown, no explanation."""

ICONS = [
  ("football", """
Design a premium 64x64 SVG soccer ball icon for a dark sports betting app.

CONTAINER: rounded rect rx=14, fill=#0D0B1E, with purple gradient border (use linearGradient stroke from #7C3AED to #A78BFA, opacity 0.6, stroke-width=1.5)

BALL DESIGN (centered at 32,32, radius ~22):
- Base circle with radial gradient: center #C4B5FD, edge #5B21B6
- Classic soccer ball pattern: 1 central pentagon + 5 surrounding hexagons
- Central pentagon: fill=#1E0E4A (very dark purple)
- Hexagons: alternating #A78BFA and #7C3AED
- Black outline stroke width=0.8 between panels: #0D0B1E
- Top-right specular highlight: small white ellipse, opacity=0.35, blur

GLOW: feDropShadow stdDeviation=3.5, flood-color=#A78BFA, opacity=0.65

Make it look like a real 3D ball with depth and premium quality."""),

  ("basketball", """
Design a premium 64x64 SVG basketball icon for a dark sports betting app.

CONTAINER: rounded rect rx=14, fill=#0D0B1E, with orange gradient border (linearGradient from #EA580C to #F97316, opacity 0.6, stroke-width=1.5)

BALL DESIGN (centered at 32,32, radius ~22):
- Base circle with radial gradient: center #FB923C, mid #F97316, edge #C2410C
- 3 classic curved seam lines (black, stroke-width=2, round caps):
  * Vertical seam: arc from top to bottom
  * Left curved seam: arc sweeping left
  * Right curved seam: arc sweeping right
- Seam color: #431407 (very dark brown)
- Top-left specular highlight: white ellipse, opacity=0.25, slightly blurred

GLOW: feDropShadow stdDeviation=3.5, flood-color=#F97316, opacity=0.7

Make it look like a real glossy basketball with 3D depth."""),

  ("tennis", """
Design a premium 64x64 SVG tennis ball icon for a dark sports betting app.

CONTAINER: rounded rect rx=14, fill=#0D0B1E, with lime gradient border (linearGradient from #65A30D to #84CC16, opacity 0.6, stroke-width=1.5)

BALL DESIGN (centered at 32,32, radius ~22):
- Base circle with radial gradient: center #BEF264, mid #84CC16, edge #3F6212
- Classic tennis ball seam: two curved white S-shaped lines (stroke-width=3, stroke=#FAFAF8, opacity=0.9, round caps, no fill) that sweep across the ball in opposite directions creating the characteristic figure-8 pattern
- Felt texture suggestion: very subtle noise pattern or tiny dots, opacity=0.15
- Top specular highlight: white ellipse, opacity=0.3

GLOW: feDropShadow stdDeviation=3, flood-color=#84CC16, opacity=0.65

Make it look fresh and sporty with clean lime-green color."""),

  ("cs2", """
Design a premium 64x64 SVG CS2/esports icon — a tactical crosshair sight — for a dark gaming app.

CONTAINER: rounded rect rx=14, fill=#0D0B1E, with cyan gradient border (linearGradient from #0EA5E9 to #38BDF8, opacity 0.6, stroke-width=1.5)

CROSSHAIR DESIGN (centered at 32,32):
- Outer ring: circle r=20, stroke=#38BDF8, stroke-width=1.5, fill=none, opacity=0.8
- Inner ring: circle r=12, stroke=#38BDF8, stroke-width=0.8, fill=none, opacity=0.4
- 4 crosshair lines with gaps (8px gap in center):
  * Top: line from y=9 to y=24 (gap before center)
  * Bottom: line from y=40 to y=55
  * Left: line from x=9 to x=24
  * Right: line from x=40 to x=55
  * All lines: stroke=#38BDF8, stroke-width=2, stroke-linecap=round
- Center dot: circle r=2, fill=#38BDF8
- 4 small tick marks on outer ring at 0/90/180/270 degrees, stroke-width=2
- Subtle cyan glow radiating from center: radial gradient overlay, opacity=0.12

GLOW: feDropShadow stdDeviation=3, flood-color=#38BDF8, opacity=0.8

Sharp, tactical, cyberpunk feel."""),

  ("hockey", """
Design a premium 64x64 SVG ice hockey icon for a dark sports betting app.

CONTAINER: rounded rect rx=14, fill=#0D0B1E, with icy-blue gradient border (linearGradient from #94A3B8 to #E2E8F0, opacity 0.5, stroke-width=1.5)

ICON DESIGN (centered at 32,32):
- Two crossed hockey sticks (X pattern, rotated 45deg each):
  * Each stick: shaft is a rounded rect ~5px wide, ~28px long
  * Blade at bottom: wider curved shape ~12px wide, 7px tall, curved outward
  * Color: gradient from #CBD5E1 (top) to #94A3B8 (bottom)
  * Stroke: #0D0B1E, stroke-width=0.5 for definition
- Hockey puck (in front of sticks, bottom-center):
  * Ellipse rx=9, ry=5, fill with gradient: top edge #4B5563, main #1F2937, bottom #111827
  * Subtle edge highlight: top arc stroke #6B7280, stroke-width=1, opacity=0.6

GLOW: feDropShadow stdDeviation=3, flood-color=#94A3B8, opacity=0.5

Clean, icy aesthetic with metallic hockey equipment feel."""),
]

os.makedirs("src/assets/icons", exist_ok=True)

for name, prompt in ICONS:
    print(f"Generating {name}...")

    full_prompt = f"""Create a complete, valid, beautiful SVG icon based on this spec:

{prompt}

TECHNICAL REQUIREMENTS:
- viewBox="0 0 64 64" width="64" height="64" xmlns="http://www.w3.org/2000/svg"
- Use <defs> for gradients and filters at the top
- All gradient IDs must be unique (prefix with icon name e.g. id="footBg")
- Use linearGradient and radialGradient for premium look
- Include the glow filter as specified
- Every shape must be mathematically precise and centered
- The icon must look BEAUTIFUL at 52x52px display size
- Return ONLY the SVG XML from <svg to </svg>, nothing else"""

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": SYSTEM},
            {"role": "user",   "content": full_prompt}
        ],
        max_tokens=2000,
        temperature=0.2,
    )

    svg_text = response.choices[0].message.content.strip()
    svg_text = re.sub(r'^```[a-z]*\n?', '', svg_text, flags=re.MULTILINE)
    svg_text = re.sub(r'\n?```$', '', svg_text, flags=re.MULTILINE)
    svg_text = svg_text.strip()

    if not svg_text.startswith('<svg'):
        match = re.search(r'<svg[\s\S]*</svg>', svg_text)
        svg_text = match.group(0) if match else ''

    if svg_text:
        path = f"src/assets/icons/{name}.svg"
        with open(path, 'w', encoding='utf-8') as f:
            f.write(svg_text)
        print(f"  saved: {path}")
    else:
        print(f"  ERROR: no SVG for {name}")

print("\nAll done!")
