import json
import os

assets_file = "src/assets.json"
content_dir = "src/content/kolorowanki"

if not os.path.exists("src/content"):
    os.makedirs("src/content")

if not os.path.exists(content_dir):
    os.makedirs(content_dir)

with open(assets_file) as f:
    data = json.load(f)

for category_key, category_data in data.items():
    category_slug = category_key
    category_title = category_key.replace("_", " ").title()
    category_description = f"Coloring pages for the {category_title} category."

    images = []
    for item in category_data.get("items", []):
        image_slug = item.get("key")
        image_title = image_slug.replace("_", " ").title()
        images.append({
            "slug": image_slug,
            "key": image_slug,
            "title": image_title,
            "description": f"Coloring page of {image_title}."
        })

    category_content = {
        "category_slug": category_slug,
        "category_title": category_title,
        "category_description": category_description,
        "images": images
    }

    with open(os.path.join(content_dir, f"{category_key}.json"), "w") as f:
        json.dump(category_content, f, indent=2)

print(f"Content generated in {content_dir}")
