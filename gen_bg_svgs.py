import os, re, sys
from openai import OpenAI
if sys.platform=="win32":
    import io; sys.stdout=io.TextIOWrapper(sys.stdout.buffer,encoding='utf-8')

client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
SYSTEM = "You are a premium SVG illustrator. Return ONLY raw SVG XML, no markdown."

ITEMS = [
("sniper", """
Create a 320x160 SVG illustration of a sniper rifle — dark, cinematic, premium style for a dark betting app background.

DESIGN:
- Background: transparent (no bg rect)
- The sniper rifle drawn from the side profile, detailed but stylized
- Rifle barrel: long horizontal element, dark gunmetal color (#2D3748), with metallic highlights (#718096)
- Scope: rectangular box on top of barrel, with lens circle (#1A202C), objective lens with blue-tinted glass (#60A5FA opacity=0.6)
- Stock: angular shape on right side, dark wood texture (#2D3A1E) with grain lines
- Trigger guard: small curved element
- Suppressor/muzzle: cylindrical shape at barrel end, darker (#1A202C) with ring details
- Crosshair overlay: subtle crosshair lines extending from scope lens, stroke=#A78BFA opacity=0.3 strokeWidth=0.5
- Overall: positioned center-right of viewbox, taking about 70% of width
- Metallic sheen: subtle linear gradient highlights on barrel/scope
- Glow: very subtle feDropShadow flood-color=#A78BFA stdDeviation=8 opacity=0.15 on entire weapon

STYLE: Tom Clancy game / military precision equipment aesthetic. Dark, moody, premium.
viewBox="0 0 320 160" width="320" height="160"
"""),

("golden_cup", """
Create a 240x200 SVG illustration of a magnificent golden trophy cup — luxury, premium, gleaming style for a dark betting app.

DESIGN:
- Background: transparent
- The trophy/chalice centered, tall goblet shape with two handles
- Main cup body: wide bowl at top, narrowing stem, wide base
  Cup bowl: path using curves, fill with radial gradient — center #FDE68A bright gold, edge #92400E dark bronze
  Side highlight: thin bright vertical stripe on left side of cup, fill=#FFF7ED opacity=0.8
  Inner shadow: right side of cup slightly darker #B45309
- Two ornate handles: curved S-shapes on each side of cup, stroke=#D97706 strokeWidth=3 fill=none
- Stem: cylindrical, fill linear gradient #D97706 to #92400E
- Base: wide rectangular base with beveled edges, fill #B45309 with gold rim
- Stars/sparkles: 3-4 four-pointed star shapes around the cup, fill=#FDE68A opacity=0.6-0.9 various sizes
- Glow: feDropShadow flood-color=#EAB308 stdDeviation=12 opacity=0.4 on entire cup
- Subtle vertical shine lines on cup bowl

STYLE: Championship trophy, World Cup feel, gloriously golden.
viewBox="0 0 240 200" width="240" height="200"
"""),
]

os.makedirs("src/assets/bg", exist_ok=True)

for name, spec in ITEMS:
    print(f"Generating {name}...")
    resp = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role":"system","content":SYSTEM},
                  {"role":"user","content":f"""Create this premium SVG illustration:

{spec}

ALL gradients/filters in <defs> with unique IDs prefixed '{name}_'.
Return ONLY SVG from <svg to </svg>"""}],
        max_tokens=3000, temperature=0.1,
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
