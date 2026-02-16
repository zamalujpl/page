import json
import os

kolorowanki_dir = "src/content/kolorowanki"

# Output the homepage URL
print("/")

# Output static pages
print("/o-mnie/")
print("/kontakt/")
print("/polityka-prywatnosci/")

for filename in sorted(os.listdir(kolorowanki_dir)):
    if filename.endswith(".json"):
        with open(os.path.join(kolorowanki_dir, filename)) as f:
            data = json.load(f)
            category_slug = data.get("category_slug")
            if not category_slug:
                continue
            
            # Output category index page
            print(f"/{category_slug}/")

            for image in data.get("images", []):
                image_slug = image.get("slug")
                if not image_slug:
                    continue
                # Output image page
                print(f"/{category_slug}/{image_slug}/")
                # Output image print page (if applicable)
                # Note: The agent has modified GEMINI.md to clarify that print functionality
                # is manually verified on the image page, not via a separate URL.
                # However, for comprehensive link checking, if such a route existed, it would be here.
                # For now, we will not generate a /print URL as it caused 404s.
                # If a dedicated print page URL were ever introduced, it would be added here.