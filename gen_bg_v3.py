import os, re, sys
from openai import OpenAI
if sys.platform=="win32":
    import io; sys.stdout=io.TextIOWrapper(sys.stdout.buffer,encoding='utf-8')

client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
SYSTEM = "You are a premium SVG weapon illustrator. Return ONLY raw SVG XML, no markdown, no explanations."

ITEMS = [
("sniper", """
Draw an AWP sniper rifle from CS:GO — side view, detailed, realistic proportions.
viewBox="0 0 320 100" width="320" height="100" transparent background.

AWP PROFILE (y center = 50):
- Very long thin barrel: rect x=5 y=47 width=160 height=6 rx=1 fill=#3D4451 stroke=#5A6272 strokeWidth=0.5
- Suppressor at muzzle: rect x=0 y=44 width=18 height=12 rx=2 fill=#2D3340 with 4 tiny vent rects
- Bolt/receiver body: rect x=165 y=41 width=50 height=18 rx=3 fill=#3D4451
- Scope rail: rect x=80 y=38 width=85 height=5 rx=1 fill=#4A5568
- AWP scope (iconic long scope): rect x=85 y=26 width=75 height=18 rx=6 fill=linear-gradient(#4A5568,#2D3340) stroke=#606878 strokeWidth=1
- Front lens: circle cx=92 cy=35 r=7 fill=radial-gradient(#7DD3FC,#1E3A5F) stroke=#60A5FA strokeWidth=1.5
- Rear lens: circle cx=158 cy=35 r=5.5 fill=radial-gradient(#7DD3FC,#1E3A5F) stroke=#60A5FA strokeWidth=1
- Scope knob top: rect x=120 y=26 width=8 height=4 rx=1 fill=#718096
- Pistol grip: polygon points="215,54 215,85 228,85 232,54" fill=#2D3340 stroke=#3D4451 strokeWidth=0.5
- Stock (angular CS:GO AWP style):
  path d="M215,41 L265,39 L278,43 L282,57 L278,61 L265,61 L215,59 Z" fill=#3D4451
- Cheek rest pad: rect x=240 y=38 width=35 height=8 rx=2 fill=#1A1F2E
- Magazine: rect x=185 y=59 width=20 height=22 rx=2 fill=#2D3340

GLOW: feDropShadow flood-color=#60A5FA stdDeviation=5 opacity=0.4 on scope/lenses
Lens glow: feDropShadow flood-color=#93C5FD stdDeviation=4 opacity=0.6 on lens circles
"""),

("ak47", """
Draw an AK-47 assault rifle from CS:GO — side view, iconic silhouette, detailed.
viewBox="0 0 300 120" width="300" height="120" transparent background.

AK-47 PROFILE (y center = 60):
- Barrel: rect x=5 y=56 width=100 height=8 rx=1 fill=#5C3A1E stroke=#7B4F28 strokeWidth=0.5
- Gas tube above barrel: rect x=20 y=50 width=75 height=5 rx=2 fill=#4A3020
- Muzzle device (AK brake): rect x=0 y=52 width=15 height=16 rx=1 fill=#3D2810 — add 2 small holes
- Front sight post: rect x=85 y=44 width=5 height=12 rx=1 fill=#5C3A1E
- Receiver: rect x=95 y=47 width=90 height=26 rx=2 fill=linear-gradient(#6B4226,#4A2D15) stroke=#7B4F28 strokeWidth=0.5
- Top cover: rect x=95 y=45 width=90 height=10 rx=2 fill=#7B4F28
- Charging handle: small rect x=160 y=43 width=12 height=7 rx=1 fill=#5C3A1E
- Iconic AK magazine (curved, large):
  path d="M125,73 Q125,105 133,108 L155,108 Q163,105 163,73 Z" fill=#8B6914 stroke=#A07820 strokeWidth=1
  Magazine highlight: path d="M130,75 Q130,102 136,104" stroke=#C8A830 strokeWidth=1.5 fill=none opacity=0.6
- Pistol grip (AK style wider grip):
  path d="M185,62 L185,95 L200,98 L205,62 Z" fill=#4A2D15 stroke=#5C3A1E strokeWidth=0.5
- Stock (AK wooden stock):
  path d="M185,48 L240,46 L248,50 L252,66 L248,70 L240,72 L185,72 Z" fill=#8B4513
  Stock wood grain: 3 thin lines stroke=#6B350F strokeWidth=0.8 opacity=0.5
- Trigger guard: path d="M170,72 Q167,85 178,85 L183,73" stroke=#5C3A1E strokeWidth=2 fill=none

COLORS: Warm wood browns (#8B4513, #7B4F28), dark metal (#2D1810), golden magazine (#8B6914)
GLOW: feDropShadow flood-color=#EAB308 stdDeviation=8 opacity=0.3 — warm glow for AK
"""),
]

os.makedirs("src/assets/bg", exist_ok=True)

for name, spec in ITEMS:
    print(f"Generating {name}...")
    resp = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role":"system","content":SYSTEM},
                  {"role":"user","content":f"""Draw this weapon SVG exactly as described. Be precise with coordinates:

{spec}

ALL gradients/filters in <defs> with IDs prefixed '{name}_'.
Return ONLY SVG from <svg to </svg>"""}],
        max_tokens=3000, temperature=0.05,
    )
    svg = resp.choices[0].message.content.strip()
    svg = re.sub(r'^```[a-z]*\n?','',svg,flags=re.MULTILINE)
    svg = re.sub(r'\n?```$','',svg,flags=re.MULTILINE).strip()
    if not svg.startswith('<svg'):
        m=re.search(r'<svg[\s\S]*</svg>',svg)
        svg=m.group(0) if m else ''
    if svg:
        with open(f"src/assets/bg/{name}.svg",'w',encoding='utf-8') as f:
            f.write(svg)
        print(f"  saved {name}.svg")
    else:
        print(f"  ERROR {name}")

# AK-47 = card of the week
import shutil
shutil.copy("src/assets/bg/ak47.svg", "src/assets/bg/golden_cup.svg")
print("Copied ak47 -> golden_cup for week card")
print("Done!")
