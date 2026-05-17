import os, re
from openai import OpenAI

client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

ICONS = [
    ("football", "#A78BFA", "violet",
     "soccer football ball — classic black-and-white ball with hexagonal/pentagonal panels. Panels recolored: main #A78BFA violet, dark panels #2D1B69 deep purple. Subtle violet glow."),
    ("basketball", "#F97316", "orange",
     "basketball — round ball with classic curved seam lines. Main color #F97316 orange, seam lines #431407 dark. Subtle orange glow."),
    ("tennis", "#84CC16", "lime",
     "tennis ball — round with classic curved seam lines. Main color #84CC16 lime green, seam/stripes white. Subtle lime glow."),
    ("cs2", "#38BDF8", "cyan",
     "CS2 esports crosshair — precise tactical crosshair with 4 lines, center gap, outer circle ring. Color #38BDF8 cyan. Sharp cyberpunk look. Subtle cyan glow."),
    ("hockey", "#E2E8F0", "ice white",
     "ice hockey — hockey puck (black flat ellipse) in center foreground, two crossed hockey sticks behind it in #E2E8F0 ice white. Subtle white glow."),
]

os.makedirs("src/assets/icons", exist_ok=True)

SYSTEM = """You are an expert SVG icon designer. You write clean, valid, beautiful SVG code.
Return ONLY the raw SVG XML — no markdown, no explanation, no code fences."""

for name, color, color_name, desc in ICONS:
    print(f"Generating {name}...")

    prompt = f"""Create a beautiful 64x64 SVG sport icon.

Sport: {desc}

Exact requirements:
- viewBox="0 0 64 64" width="64" height="64"
- Outer container: <rect width="64" height="64" rx="14" fill="#1C1F3A"/> (rounded dark square)
- Subtle colored border: <rect width="64" height="64" rx="14" fill="none" stroke="{color}" stroke-width="1.5" stroke-opacity="0.45"/>
- Icon content: centered, fills about 70-74% of the icon area (roughly 44x44px centered at 32,32)
- Glow effect: use <defs><filter id="glow"><feGaussianBlur stdDeviation="2.5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs> and apply filter="url(#glow)" to the main icon shape
- Color scheme: main color {color} ({color_name}), dark background #1C1F3A
- Style: modern flat, premium dark gaming aesthetic, clean shapes
- All SVG elements must be valid: rect, circle, ellipse, path, line, polyline, polygon only
- Make it look BEAUTIFUL and distinctive — this is a premium app icon

Return ONLY the SVG starting with <svg and ending with </svg>"""

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": SYSTEM},
            {"role": "user", "content": prompt}
        ],
        max_tokens=1500,
        temperature=0.3,
    )

    svg_text = response.choices[0].message.content.strip()
    svg_text = re.sub(r'^```[a-z]*\n?', '', svg_text, flags=re.MULTILINE)
    svg_text = re.sub(r'\n?```$', '', svg_text, flags=re.MULTILINE)
    svg_text = svg_text.strip()

    if not svg_text.startswith('<svg'):
        match = re.search(r'<svg[\s\S]*</svg>', svg_text)
        if match:
            svg_text = match.group(0)
        else:
            print(f"  ERROR: no SVG found for {name}")
            continue

    path = f"src/assets/icons/{name}.svg"
    with open(path, 'w', encoding='utf-8') as f:
        f.write(svg_text)
    print(f"  ✓ {path}")

print("\nAll icons done!")
