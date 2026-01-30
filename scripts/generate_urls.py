import json
import os
import random

# Output the homepage URL
print("/")

kolorowanki_dir = "src/content/kolorowanki"
all_category_data = []
all_image_urls = []

# Collect all category data and image URLs
for filename in sorted(os.listdir(kolorowanki_dir)):
    if filename.endswith(".json"):
        with open(os.path.join(kolorowanki_dir, filename)) as f:
            data = json.load(f)
            category_slug = data.get("category_slug")
            if not category_slug:
                continue
            all_category_data.append(data)
            
            for image in data.get("images", []):
                image_slug = image.get("slug")
                if image_slug:
                    all_image_urls.append(f"/{category_slug}/{image_slug}")

# Select one random category index page
if all_category_data:
    random_category = random.choice(all_category_data)
    print(f"/{random_category['category_slug']}/")

# Select one random image page
if all_image_urls:
    random_image_url = random.choice(all_image_urls)
    print(random_image_url)
    # Removed: print(f"{random_image_url}/print") as it leads to a 404 and cannot be screenshotted directly.
    # The print functionality will be verified by the user manually on the image page.
