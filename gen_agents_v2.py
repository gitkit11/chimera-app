import os, re, sys
from openai import OpenAI
if sys.platform=="win32":
    import io; sys.stdout=io.TextIOWrapper(sys.stdout.buffer,encoding='utf-8')

client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
SYSTEM = "You are a world-class SVG icon designer specializing in game character badges. Return ONLY raw SVG XML."

AGENTS = [
("lion", """
Design a 56x56 SVG LION EMBLEM icon. Style: premium heraldic game badge, like League of Legends / Dota champion icon.

EXACT STRUCTURE:
1. Background: circle cx=28 cy=28 r=26, fill with radialGradient from #292010 (center) to #0D0B00 (edge), stroke #F59E0B stroke-width=1.5 opacity=0.7

2. MANE — 8 pointed flame-rays around the lion head (like a sun):
   Use polygon or path for 8 triangular rays, fill=#B45309, opacity=0.6, centered at (28,28), radius 22-26

3. LION FACE centered at (28,26):
   - Head: circle r=11, fill radialGradient #F59E0B center to #D97706 edge
   - Ears: two small triangles above head: left (20,16)(24,14)(22,19), right (32,14)(36,16)(34,19), fill=#F59E0B
   - Eyes: two ellipses, left cx=24 cy=24 r=(2.5,2), right cx=32 cy=24 r=(2.5,2), fill=#FCD34D, with small black pupils
   - Nose: small triangle at (28,28), fill=#B45309
   - Mouth: curved path M25,30 Q28,33 31,30, stroke=#B45309, stroke-width=1, no fill
   - Muzzle: light ellipse cx=28 cy=29 rx=5 ry=3, fill=#FDE68A opacity=0.5

4. Glow filter: feDropShadow flood-color=#F59E0B stdDeviation=3 opacity=0.7

viewBox="0 0 56 56" width="56" height="56"
"""),

("goat", """
Design a 56x56 SVG GOAT HEAD EMBLEM. Style: dark arcane scout badge, mystical blue-gray.

EXACT STRUCTURE:
1. Background: circle cx=28 cy=28 r=26, fill radialGradient from #0F1520 (center) to #060810 (edge), stroke #94A3B8 stroke-width=1.5 opacity=0.6

2. Two large curved HORNS (goat's most iconic feature):
   Left horn: path M20,14 C10,6 6,18 14,26, stroke=#78909C stroke-width=3 stroke-linecap=round fill=none
   Right horn: path M36,14 C46,6 50,18 42,26, stroke=#78909C stroke-width=3 stroke-linecap=round fill=none

3. GOAT FACE centered at (28,30):
   - Head: rounded rect or path for narrow goat face, fill radialGradient #B0BEC5 to #607D8B
   - Long snout: ellipse cx=28 cy=34 rx=5 ry=4, fill=#90A4AE
   - Eyes: horizontal RECTANGULAR pupils (goat eyes!): left rect x=20 y=25 w=5 h=3 rx=1, right rect x=31 y=25 w=5 h=3 rx=1, fill=#263238
   - Eye whites: ellipse behind each rect, fill=#CFD8DC
   - Small beard: triangle below chin, fill=#78909C opacity=0.7

4. Glow filter: feDropShadow flood-color=#94A3B8 stdDeviation=2.5 opacity=0.6

viewBox="0 0 56 56" width="56" height="56"
"""),

("snake", """
Design a 56x56 SVG SERPENT/SNAKE HEAD EMBLEM. Style: dark emerald poison, dangerous arbiter.

EXACT STRUCTURE:
1. Background: circle cx=28 cy=28 r=26, fill radialGradient from #0A1F12 (center) to #020A04 (edge), stroke #10B981 stroke-width=1.5 opacity=0.7

2. Snake scales pattern (subtle): 6-8 small diamond shapes scattered on face area, fill=#065F46 opacity=0.4

3. SNAKE HEAD — wide triangular venomous head:
   Head shape: polygon points="28,8 44,26 40,44 28,48 16,44 12,26" fill radialGradient #1A5C38 center to #0A2C1A edge, stroke=#10B981 stroke-width=1

4. SNAKE FEATURES:
   - Slit eyes: two tall thin ellipses, left cx=21 cy=26 rx=2 ry=4, right cx=35 cy=26 rx=2 ry=4
     Fill: outer ellipse #84CC16, inner thin rect (pupil) fill=#000
   - Nostrils: two small circles cx=25 cy=34 r=1.5 and cx=31 cy=34 r=1.5, fill=#065F46
   - Forked tongue: path M28,42 L24,50 M28,42 L32,50, stroke=#EF4444 stroke-width=2 stroke-linecap=round
   - Fang hints: two white small triangles near mouth bottom, fill=white opacity=0.7

5. Glow filter: feDropShadow flood-color=#10B981 stdDeviation=3 opacity=0.75

viewBox="0 0 56 56" width="56" height="56"
"""),

("shadow", """
Design a 56x56 SVG SHADOW EYE EMBLEM for an AI oracle agent. Style: mysterious all-seeing, cosmic intelligence.

EXACT STRUCTURE:
1. Background: circle cx=28 cy=28 r=26, fill radialGradient from #0A0F1F (center bright) to #020408 (edge dark), stroke with gradient from #3B82F6 to #1D4ED8 stroke-width=1.5 opacity=0.6

2. Cosmic wisps/rays: 6 thin curved paths radiating from center (28,28), stroke=#1E3A5F opacity=0.4 stroke-width=1

3. THE EYE centered at (28,28):
   - Outer eyelid shape: large pointed oval/vesica piscis: path M8,28 Q28,10 48,28 Q28,46 8,28 Z, fill=#0D1B2A, stroke=#3B82F6 stroke-width=1 opacity=0.8
   - Iris: circle cx=28 cy=28 r=10, fill radialGradient: center #60A5FA, mid #2563EB, edge #1E3A5F
   - Pupil: ellipse cx=28 cy=28 rx=3 ry=5 (vertical slit!), fill=#000010
   - Iris reflection: tiny ellipse cx=25 cy=24 rx=2 ry=1.5, fill=white opacity=0.6
   - Concentric ring: circle cx=28 cy=28 r=7, fill=none stroke=#93C5FD stroke-width=0.8 opacity=0.5

4. Eyelashes/lids: 3 small lines above and below the eye, stroke=#4B6A8A stroke-width=1.2

5. Floating particles: 4 tiny circles around eye, r=1.2, fill=#60A5FA opacity=0.6

6. Glow filter: feGaussianBlur stdDeviation=2 + feMerge for full glow. Also feDropShadow flood-color=#3B82F6 stdDeviation=4 opacity=0.7

viewBox="0 0 56 56" width="56" height="56"
"""),
]

os.makedirs("src/assets/agents", exist_ok=True)

for name, spec in AGENTS:
    print(f"Generating {name}...")
    resp = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role":"system","content":SYSTEM},
            {"role":"user","content":f"""Create this premium SVG badge icon precisely:

{spec}

ALL gradients and filters MUST be in <defs> with unique IDs prefixed by '{name}'.
Return ONLY SVG from <svg to </svg>"""}
        ],
        max_tokens=2500, temperature=0.1,
    )
    svg = resp.choices[0].message.content.strip()
    svg = re.sub(r'^```[a-z]*\n?','',svg,flags=re.MULTILINE)
    svg = re.sub(r'\n?```$','',svg,flags=re.MULTILINE).strip()
    if not svg.startswith('<svg'):
        m = re.search(r'<svg[\s\S]*</svg>', svg)
        svg = m.group(0) if m else ''
    if svg:
        with open(f"src/assets/agents/{name}.svg",'w',encoding='utf-8') as f:
            f.write(svg)
        print(f"  saved {name}.svg")
    else:
        print(f"  ERROR {name}")

print("Done!")
