import os
import sys
from PIL import Image, ImageOps

def process_image(file_path, output_path, target_size=(1024, 1024), margin=25, threshold=200):
    try:
        with Image.open(file_path) as img:
            # 1. Convert to grayscale for edge detection
            img_l = img.convert("L")
            
            # 2. Apply threshold to ignore noise/light gray artifacts
            inverted_img = img_l.point(lambda x: 255 if x < threshold else 0, 'L')
            
            # 3. Find bounding box
            bbox = inverted_img.getbbox()
            
            if not bbox:
                print(f"Skipping {file_path}: No content detected.")
                return False

            # 4. Crop to content
            original_rgb = img.convert("RGB")
            cropped_img = original_rgb.crop(bbox)
            
            # 5. Calculate scaling for 95% coverage
            width, height = cropped_img.size
            max_content_size = (target_size[0] - 2 * margin, target_size[1] - 2 * margin)
            
            ratio = min(max_content_size[0] / width, max_content_size[1] / height)
            new_size = (int(width * ratio), int(height * ratio))
            
            # 6. Resize
            resized_img = cropped_img.resize(new_size, Image.Resampling.LANCZOS)
            
            # 7. Create background and paste centered
            new_img = Image.new("RGB", target_size, (255, 255, 255))
            upper_left = (
                (target_size[0] - new_size[0]) // 2,
                (target_size[1] - new_size[1]) // 2
            )
            new_img.paste(resized_img, upper_left)
            
            # 8. Save
            new_img.save(output_path, "PNG")
            return True

    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    target_dir = "private/assets/to_process"
    if not os.path.exists(target_dir):
        return

    # Process ONLY minecraft files
    files = [f for f in os.listdir(target_dir) if f.startswith("minecraft__") and f.lower().endswith(".png")]
    
    print(f"Processing {len(files)} Minecraft image(s) with 95% coverage (Margin 25px)...")

    for filename in sorted(files):
        file_path = os.path.join(target_dir, filename)
        process_image(file_path, file_path)

    print(f"\nFinished updating to 95%.")

if __name__ == "__main__":
    main()
