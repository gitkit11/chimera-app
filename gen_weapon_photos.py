import os, sys, requests
from openai import OpenAI
if sys.platform=="win32":
    import io; sys.stdout=io.TextIOWrapper(sys.stdout.buffer,encoding='utf-8')

client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
os.makedirs("src/assets/bg", exist_ok=True)

IMAGES = [
    ("sniper_photo", "A professional studio photography of a modern sniper rifle AWP, lying on a dark black surface. Dramatic side-profile view. Dark moody atmosphere, cinematic lighting with subtle purple rim light. Ultra detailed, hyperrealistic, photographic quality. No background, just darkness. Premium product photography style."),
    ("ak47_gold", "A professional studio photography of a golden AK-47 assault rifle, gold-plated finish, lying diagonally on black surface. Dramatic lighting highlighting gold metallic sheen. Dark moody atmosphere with warm golden light reflections. Ultra detailed hyperrealistic photographic quality. Premium luxury product photography."),
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
        import base64
        import base64, json
        item = resp.data[0]
        print(f"  Response keys: {[k for k in dir(item) if not k.startswith('_')]}")
        # Try all possible data locations
        if hasattr(item, 'url') and item.url:
            img_data = requests.get(item.url).content
        elif hasattr(item, 'b64_json') and item.b64_json:
            img_data = base64.b64decode(item.b64_json)
        elif hasattr(resp, 'data') and isinstance(resp.data, list):
            raw = resp.data[0]
            if hasattr(raw, 'model_dump'):
                d = raw.model_dump()
                print(f"  Data dump: {list(d.keys())}")
                if d.get('b64_json'):
                    img_data = base64.b64decode(d['b64_json'])
                elif d.get('url'):
                    img_data = requests.get(d['url']).content
                else:
                    print(f"  ERROR: no image in {list(d.keys())}"); continue
            else:
                print(f"  ERROR: unknown format"); continue
        else:
            print(f"  ERROR: no image data"); continue
        path = f"public/bg/{name}.png"
        os.makedirs("public/bg", exist_ok=True)
        with open(path, 'wb') as f:
            f.write(img_data)
        print(f"  saved {path} ({len(img_data)//1024}kb)")
    except Exception as e:
        print(f"  ERROR: {e}")

print("Done!")
