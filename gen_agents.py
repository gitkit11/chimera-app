import os, re, sys
from openai import OpenAI
if sys.platform=="win32":
    import io; sys.stdout=io.TextIOWrapper(sys.stdout.buffer,encoding='utf-8')

client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
SYSTEM = "You are a premium SVG icon designer. Return ONLY raw SVG XML, no markdown."

AGENTS = [
("lion", "#F59E0B", """
Create a 56x56 SVG icon: a stylized LION HEAD facing forward, premium dark gaming aesthetic.
Background: none (transparent)
Design:
- Majestic lion face, front-facing, stylized/geometric but recognizable
- Main color: #F59E0B (golden amber) with darker #B45309 for shadows/depth
- Large flowing mane: rays/petals around the head in #F59E0B, opacity variations
- Eyes: bright amber #FCD34D, slightly glowing, fierce expression
- Nose/muzzle: darker amber, simple shapes
- Use clean geometric paths — triangle ears, arc mane rays, oval eyes
- Glow filter: feDropShadow flood-color=#F59E0B stdDeviation=3 opacity=0.6
- Fill the full 56x56 area, centered
Style: like a game character icon / tarot card art / premium trading card
"""),

("goat", "#94A3B8", """
Create a 56x56 SVG icon: a stylized GOAT HEAD facing forward, premium dark gaming aesthetic.
Background: none (transparent)
Design:
- Goat face, front-facing, stylized/geometric but recognizable
- Main color: #94A3B8 (steel blue-gray) with #475569 for shadows
- Two curved horns (iconic goat horns): smooth arcs on both sides
- Eyes: horizontal rectangular pupils (goat pupils), color #CBD5E1
- Beard: small triangular tuft below chin
- Ears: pointed, horizontal
- Glow filter: feDropShadow flood-color=#94A3B8 stdDeviation=2.5 opacity=0.5
- Fill full 56x56, centered
Style: mysterious scout character, arcane feel
"""),

("snake", "#10B981", """
Create a 56x56 SVG icon: a stylized SNAKE HEAD facing forward, premium dark gaming aesthetic.
Background: none (transparent)
Design:
- Snake/serpent head from front/slightly above, triangular head shape
- Main color: #10B981 (emerald green) with #065F46 for scales/shadows
- Forked tongue: red #EF4444, split Y-shape extending from mouth
- Eyes: narrow slits, bright yellow-green #84CC16, with glow
- Scales: subtle diamond/scale pattern texture on head
- Fangs: small white points visible at bottom of mouth
- Glow filter: feDropShadow flood-color=#10B981 stdDeviation=3 opacity=0.65
- Fill full 56x56, centered
Style: deadly arbiter, poisonous intelligence
"""),

("shadow", "#6B7280", """
Create a 56x56 SVG icon: a stylized SHADOW / PHANTOM EYE icon for an AI shadow agent.
Background: none (transparent)
Design:
- A mysterious all-seeing eye, slightly open, with dramatic eyelids
- Main color: #6B7280 (shadow gray) with subtle blue tints #3B82F6
- Iris: concentric rings, outer #4B5563, inner #60A5FA glow
- Pupil: deep black vertical slit, like a dragon/cat eye
- Eyelids: thick curved shapes, dark gray
- Flowing ethereal wisps/shadows around the eye (like dark smoke)
- Glow filter: feDropShadow flood-color=#3B82F6 stdDeviation=4 opacity=0.5
- Fill full 56x56, centered
Style: omniscient shadow intelligence, Llama AI feel
"""),
]

os.makedirs("src/assets/agents", exist_ok=True)

for name, color, spec in AGENTS:
    print(f"Generating {name}...")
    resp = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role":"system","content":SYSTEM},
            {"role":"user","content":f"""Create a premium SVG character icon:
{spec}
Requirements: viewBox="0 0 56 56" width="56" height="56" xmlns="http://www.w3.org/2000/svg"
ALL gradients and filters in <defs>. Return ONLY SVG from <svg to </svg>"""}
        ],
        max_tokens=2000, temperature=0.15,
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
