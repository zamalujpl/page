import json
import os

print("/") # Home page

# Category pages
kolorowanki_dir = "src/content/kolorowanki"
for filename in sorted(os.listdir(kolorowanki_dir)):
    if filename.endswith(".json"):
        category_slug = filename.replace(".json", "")
        print(f"/{category_slug}")

# Image pages
for filename in sorted(os.listdir(kolorowanki_dir)):
    if filename.endswith(".json"):
        with open(os.path.join(kolorowanki_dir, filename)) as f:
            data = json.load(f)
            category_slug = data.get("category_slug")
            if not category_slug:
                continue
            for image in data.get("images", []):
                image_slug = image.get("slug")
                if not image_slug:
                    continue
                print(f"/{category_slug}/{image_slug}")
