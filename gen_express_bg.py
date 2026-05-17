import os, sys, requests, base64
from openai import OpenAI
if sys.platform=="win32":
    import io; sys.stdout=io.TextIOWrapper(sys.stdout.buffer,encoding='utf-8')

client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
os.makedirs("public/bg", exist_ok=True)

IMAGES = [
    ("express_car", "Professional studio photography of a sleek black Formula 1 racing car, low angle dramatic shot. Dark glossy surface with intense orange and amber rim lighting. Carbon fiber details catching light. Motion blur on wheels suggesting extreme speed. Dark black background, cinematic atmosphere. Ultra detailed hyperrealistic photographic quality. Premium automotive photography."),
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
