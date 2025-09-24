import os
import random
from PIL import Image

INPUT_ASSETS_ROOT = "public/assets"
OUTPUT_ASSETS_ROOT = "public/assets"
TEMPLATE_PATH = os.path.join("scripts/header_template_alpha.png")
IMAGE_NAMES = ["outline.png", "pencil.png", "paint.png"]
SIZE = (400, 400)

def log(msg):
    print(msg)

def process_folder(folder):
    paths = [os.path.join(folder, name) for name in IMAGE_NAMES]
    missing = [name for name, p in zip(IMAGE_NAMES, paths) if not os.path.exists(p)]
    if missing:
        log(f"  [SKIP] Missing files in {folder}: {missing}")
        return

    log(f"  [OK] All images found in {folder}")
    # Load images
    images = [Image.open(p).convert("RGBA") for p in paths]
    # Randomize order
    zipped = list(zip(IMAGE_NAMES, images))
    random.shuffle(zipped)
    order, images_shuffled = zip(*zipped)
    log(f"    [ORDER] {order}")

    # Resize images
    images_resized = [img.resize(SIZE, Image.LANCZOS) for img in images_shuffled]

    # Combine side by side
    combined = Image.new("RGBA", (SIZE[0]*3, SIZE[1]), (255,255,255,0))
    for i, img in enumerate(images_resized):
        combined.paste(img, (i*SIZE[0], 0))

    # Overlay template (never alter original and close file handle immediately)
    with Image.open(TEMPLATE_PATH) as template_file:
        template = template_file.convert("RGBA").copy()  # Load and copy to memory

    if template.size != combined.size:
        template_overlay = template.resize(combined.size, Image.LANCZOS)
    else:
        template_overlay = template.copy()
    final = combined.copy()
    final.paste(template_overlay, (0, 0), template_overlay)

    # Save result
    rel = os.path.relpath(folder, INPUT_ASSETS_ROOT)
    dest_folder = os.path.join(OUTPUT_ASSETS_ROOT, rel)
    os.makedirs(dest_folder, exist_ok=True)
    out_path = os.path.join(dest_folder, "header.png")
    final.save(out_path)
    log(f"    [DONE] Saved header: {out_path}")

def main():
    log(f"[START] Scanning {INPUT_ASSETS_ROOT}")
    for entry in os.scandir(INPUT_ASSETS_ROOT):
        if entry.is_dir():
            log(f"[DIR] {entry.path}")
            process_folder(entry.path)
    log("[END] Done.")

if __name__ == "__main__":
    main()
