import os, re, textwrap
from google import genai

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

ICONS = [
    {
        "name": "football",
        "prompt": """Create a 64x64 SVG icon of a soccer/football ball.
Style: modern flat design, dark gaming aesthetic.
Background: rounded square #1C1F3A with subtle violet glow border rgba(167,139,250,0.4).
Ball: classic black-and-white soccer ball with hexagonal panels, but recolored — main panels #A78BFA (violet), dark panels #2D1B69.
Add a soft violet glow filter: drop-shadow 0 0 8px rgba(167,139,250,0.7).
Ball centered, fills ~72% of icon. Clean, minimal, premium."""
    },
    {
        "name": "basketball",
        "prompt": """Create a 64x64 SVG icon of a basketball.
Style: modern flat design, dark gaming aesthetic.
Background: rounded square #1C1F3A with subtle orange glow border rgba(249,115,22,0.4).
Ball: classic basketball with curved seam lines, color #F97316 (orange), darker seams #9A3412.
Add soft orange glow: drop-shadow 0 0 8px rgba(249,115,22,0.7).
Ball centered, fills ~72% of icon. Clean, minimal, premium."""
    },
    {
        "name": "tennis",
        "prompt": """Create a 64x64 SVG icon of a tennis ball.
Style: modern flat design, dark gaming aesthetic.
Background: rounded square #1C1F3A with subtle lime glow border rgba(132,204,22,0.4).
Ball: tennis ball shape with curved white seam lines, main color #84CC16 (lime green), seam lines white/light.
Add soft lime glow: drop-shadow 0 0 8px rgba(132,204,22,0.7).
Ball centered, fills ~72% of icon. Clean, minimal, premium."""
    },
    {
        "name": "cs2",
        "prompt": """Create a 64x64 SVG icon for CS2/esports — a stylized crosshair/target sight.
Style: modern flat design, dark gaming aesthetic, cyberpunk feel.
Background: rounded square #1C1F3A with cyan glow border rgba(56,189,248,0.4).
Icon: precise crosshair with 4 lines and center dot, color #38BDF8 (cyan), with small gap in center.
Outer circle ring, thin lines. Add cyan glow: drop-shadow 0 0 8px rgba(56,189,248,0.8).
Centered, fills ~70% of icon. Sharp, technical, premium."""
    },
    {
        "name": "hockey",
        "prompt": """Create a 64x64 SVG icon for ice hockey — a hockey puck with crossed sticks.
Style: modern flat design, dark gaming aesthetic.
Background: rounded square #1C1F3A with white/ice glow border rgba(226,232,240,0.3).
Icon: flat black hockey puck (ellipse) in center, two crossed hockey sticks behind it, ice-white color #E2E8F0.
Add subtle white glow: drop-shadow 0 0 6px rgba(226,232,240,0.5).
Centered, fills ~72% of icon. Clean, minimal, premium."""
    },
]

os.makedirs("src/assets/icons", exist_ok=True)

for icon in ICONS:
    print(f"Generating {icon['name']}...")
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=f"""Generate a complete, valid SVG icon. Return ONLY the raw SVG code, nothing else — no markdown, no explanation, no ```svg fence.

{icon['prompt']}

Requirements:
- viewBox="0 0 64 64"
- width="64" height="64"
- The outer container is a rounded rect (rx=14) filling the full 64x64
- All shapes inside use only SVG primitives (rect, circle, path, line, ellipse, polygon)
- Include a <defs> section with a filter for the glow effect
- SVG must be self-contained and render correctly in a browser
- Return ONLY the SVG XML starting with <svg and ending with </svg>"""
    )

    svg_text = response.text.strip()
    # Clean up any accidental markdown fences
    svg_text = re.sub(r'^```[a-z]*\n?', '', svg_text, flags=re.MULTILINE)
    svg_text = re.sub(r'\n?```$', '', svg_text, flags=re.MULTILINE)
    svg_text = svg_text.strip()

    if not svg_text.startswith('<svg'):
        # Try to extract SVG from response
        match = re.search(r'<svg[\s\S]*</svg>', svg_text)
        if match:
            svg_text = match.group(0)
        else:
            print(f"  WARNING: could not extract SVG for {icon['name']}")
            continue

    path = f"src/assets/icons/{icon['name']}.svg"
    with open(path, 'w', encoding='utf-8') as f:
        f.write(svg_text)
    print(f"  Saved: {path}")

print("\nDone! All icons generated.")
