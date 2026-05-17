import os, re, sys
from openai import OpenAI
if sys.platform=="win32":
    import io; sys.stdout=io.TextIOWrapper(sys.stdout.buffer,encoding='utf-8')

client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
SYSTEM = "You are a premium SVG illustrator. Return ONLY raw SVG XML, no markdown."

ITEMS = [
("sniper", """
Create a 300x140 SVG of a detailed sniper rifle from the side — large, bright enough to see against dark background.

EXACT SPECS:
viewBox="0 0 300 140" transparent background

RIFLE PARTS (all centered vertically around y=70):
1. Long barrel: rect x=10 y=66 width=180 height=8 rx=2, fill=linear gradient #4A5568→#2D3748
2. Muzzle brake: rect x=190 y=62 width=20 height=16 rx=3, fill=#1A202C, with 3 small vent holes
3. Scope base rail: rect x=60 y=58 width=90 height=6 rx=1, fill=#718096
4. Scope body: rect x=70 y=44 width=80 height=22 rx=8, fill=linear gradient #4A5568→#2D3748, stroke=#718096 strokeWidth=1
5. Scope lens front: circle cx=80 cy=55 r=9, fill=radial gradient #60A5FA center→#1E3A5F edge, stroke=#94A3B8 strokeWidth=1.5
6. Scope lens rear: circle cx=145 cy=55 r=7, fill=radial gradient #60A5FA center→#1E3A5F edge
7. Scope knobs: 2 small circles on top of scope: cx=100 cy=44 r=4, cx=115 cy=44 r=4, fill=#94A3B8
8. Stock: polygon points="190,62 240,60 255,68 255,82 240,84 190,74" fill=#374151
9. Pistol grip: rect x=170 y=70 width=24 height=35 rx=4, fill=#374151
10. Trigger guard: semicircle/path below grip, stroke=#718096 strokeWidth=2 fill=none
11. Magazine: rect x=130 y=74 width=25 height=28 rx=3, fill=#4B5563
12. Suppressor hint: small dots/lines near muzzle

COLORS: Gunmetal grays, steel blues for lens
GLOW: feDropShadow on whole rifle: flood-color=#A78BFA stdDeviation=6 opacity=0.35
Make it LARGE and DETAILED so it's clearly visible as a background element
"""),

("golden_cup", """
Create a 220x180 SVG of a CS:GO style tournament trophy cup — the famous round bowl trophy.

EXACT SPECS:
viewBox="0 0 220 180" transparent background

CS:GO TROPHY SHAPE:
1. Main bowl/sphere: large oval/ellipse shape at top
   ellipse cx=110 cy=70 rx=65 ry=55
   fill: radial gradient id='gold1' cx=40% cy=35% r=60%:
     stop0: #FEF3C7 (bright center)
     stop1: #F59E0B (mid)
     stop2: #92400E (edge/shadow)
   stroke: #FCD34D strokeWidth=2

2. Bowl rim: ellipse cx=110 cy=30 rx=62 ry=10
   fill: linear gradient #FDE68A→#D97706
   stroke: #FCD34D strokeWidth=1.5

3. Short stem: rect x=98 y=120 width=24 height=25 rx=3
   fill: linear gradient #D97706→#92400E

4. Base: ellipse cx=110 cy=148 rx=40 ry=10 fill=#B45309
   rect x=75 y=144 width=70 height=12 rx=4 fill=#92400E
   Top edge highlight: ellipse cx=110 cy=144 rx=40 ry=5 fill=#FCD34D opacity=0.6

5. Two handles: curved paths on each side
   Left: M55,55 C30,50 25,90 50,100 stroke=#D97706 strokeWidth=6 fill=none strokeLinecap=round
   Right: M165,55 C190,50 195,90 170,100 stroke=#D97706 strokeWidth=6 fill=none strokeLinecap=round

6. Trophy surface details:
   Vertical shine line: line x1=85 y1=35 x2=82 y2=115 stroke=white strokeWidth=3 opacity=0.35 strokeLinecap=round
   Small shine oval: ellipse cx=82 cy=50 rx=4 ry=10 fill=white opacity=0.25

7. Stars around cup: 3 four-pointed stars:
   (140,20): size=8, fill=#FDE68A
   (165,50): size=6, fill=#FDE68A opacity=0.7
   (160,90): size=5, fill=#F59E0B opacity=0.5

8. GLOW: feDropShadow flood-color=#EAB308 stdDeviation=15 opacity=0.6

Make it BRIGHT GOLD and CLEARLY VISIBLE against dark backgrounds
"""),
]

os.makedirs("src/assets/bg", exist_ok=True)

for name, spec in ITEMS:
    print(f"Generating {name}...")
    resp = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role":"system","content":SYSTEM},
                  {"role":"user","content":f"""Create this SVG illustration EXACTLY as described:

{spec}

Put ALL gradients/filters in <defs> with IDs prefixed '{name}_'.
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
print("Done!")
