import os, sys, requests, base64
from openai import OpenAI
if sys.platform=="win32":
    import io; sys.stdout=io.TextIOWrapper(sys.stdout.buffer,encoding='utf-8')

client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
os.makedirs("public/bg", exist_ok=True)

IMAGES = [
    ("speed_210", "Ultra close-up of a luxury sports car dashboard speedometer showing exactly 210 km/h. The needle pointing to 210. Dial glowing with soft green and teal neon light. Dark carbon fiber dashboard background. Cinematic product photography, dramatic side lighting, deep black background. Hyperrealistic, ultra detailed. Premium automotive interior."),
    ("speed_280", "Ultra close-up of a luxury sports car dashboard speedometer showing exactly 280 km/h. The needle pointing to 280. Dial glowing with intense orange and amber neon light. Dark carbon fiber dashboard background. Cinematic product photography, dramatic lighting, deep black background. Hyperrealistic, ultra detailed. Premium automotive interior."),
    ("speed_340", "Ultra close-up of a luxury sports car dashboard speedometer showing exactly 340 km/h. The needle pointing to 340, deep in red zone. Dial glowing with intense red and crimson neon light, danger zone highlighted. Dark carbon fiber dashboard background. Cinematic product photography, dramatic lighting, deep black background. Hyperrealistic, ultra detailed. Premium automotive interior."),
]

for name, prompt in IMAGES:
    print(f"Generating {name}...")
    try:
        resp = client.images.generate(
            model="gpt-image-1",
            prompt=prompt,
            size="1536x1024",
            quality="medium",
            n=1,
        )
        item = resp.data[0]
        if hasattr(item, 'b64_json') and item.b64_json:
            img_data = base64.b64decode(item.b64_json)
        elif hasattr(item, 'url') and item.url:
            img_data = requests.get(item.url).content
        else:
            d = item.model_dump()
            if d.get('b64_json'):
                img_data = base64.b64decode(d['b64_json'])
            elif d.get('url'):
                img_data = requests.get(d['url']).content
            else:
                print(f"  ERROR: no image data"); continue

        path = f"public/bg/{name}.png"
        with open(path, 'wb') as f:
            f.write(img_data)
        print(f"  saved {path} ({len(img_data)//1024}kb)")
    except Exception as e:
        print(f"  ERROR: {e}")

print("Done!")
