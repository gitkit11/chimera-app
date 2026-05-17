import os, re, sys
from openai import OpenAI
if sys.platform=="win32":
    import io; sys.stdout=io.TextIOWrapper(sys.stdout.buffer,encoding='utf-8')

client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

prompt = """Create a premium 56x56 SVG logo for a sports betting company called "StawkiBet".

DESIGN CONCEPT: A bold, premium sports betting brand mark.

REQUIREMENTS:
- viewBox="0 0 56 56" width="56" height="56"
- Background: rounded rect rx=12, fill=#0F1923 (very dark navy)
- Subtle border: stroke with premium feel

LOGO MARK: A stylized lightning bolt or "S" integrated with a betting/sports element
- Option: Bold letter "S" made of two diagonal lines forming a lightning bolt shape
- The S/lightning: fill with gradient from #00D4FF (cyan) to #0088CC (deep blue)
- Add a small circular ball/dot at the top of the S (representing a sports ball)
- The shape should feel like speed, precision, winning

DETAILS:
- Main color: #00C4E8 (premium cyan/teal - NOT gold, fresh and modern)
- Secondary: #0080B4
- The letter/mark should be bold, filling ~65% of the icon
- Add subtle glow: feDropShadow flood-color=#00C4E8 stdDeviation=3 opacity=0.6
- Top-right corner: tiny 3-dot pattern or star accent in white opacity=0.5

STYLE: Premium fintech/sportsbook aesthetic. Clean. Trustworthy. Not a cartoon.

Return ONLY SVG from <svg to </svg>"""

print("Generating StawkiBet logo...")
resp = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role":"system","content":"You are a premium SVG logo designer for fintech/sportsbook brands. Return ONLY raw SVG."},
        {"role":"user","content":prompt}
    ],
    max_tokens=1500, temperature=0.1,
)
svg = resp.choices[0].message.content.strip()
svg = re.sub(r'^```[a-z]*\n?','',svg,flags=re.MULTILINE)
svg = re.sub(r'\n?```$','',svg,flags=re.MULTILINE).strip()
if not svg.startswith('<svg'):
    m=re.search(r'<svg[\s\S]*</svg>',svg)
    svg=m.group(0) if m else ''

if svg:
    os.makedirs("src/assets", exist_ok=True)
    with open("src/assets/stawkibet.svg",'w',encoding='utf-8') as f:
        f.write(svg)
    print("saved src/assets/stawkibet.svg")
else:
    print("ERROR")
