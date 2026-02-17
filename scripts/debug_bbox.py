import os
from PIL import Image, ImageOps, ImageDraw

def draw_debug_bbox(file_path, output_path, threshold=200):
    try:
        with Image.open(file_path) as img:
            # 1. Convert to grayscale
            img_l = img.convert("L")
            
            # 2. Apply threshold: 
            # pixels darker than 'threshold' become 0 (black), 
            # pixels lighter become 255 (white)
            # This ignores light gray noise.
            bw_img = img_l.point(lambda x: 0 if x < threshold else 255, '1')
            
            # 3. Invert to find content
            inverted_img = ImageOps.invert(img_l.point(lambda x: 0 if x < threshold else 255, 'L'))
            bbox = inverted_img.getbbox()
            
            if not bbox:
                print(f"Skipping {file_path}: No content detected.")
                return False

            # 4. Draw the bbox on the original image
            original_rgb = img.convert("RGB")
            draw = ImageDraw.Draw(original_rgb)
            draw.rectangle([bbox[0], bbox[1], bbox[2], bbox[3]], outline="blue", width=5)
            
            # 5. Save the debug image
            original_rgb.save(output_path, "PNG")
            print(f"Debug image (with threshold) saved to: {output_path}")
            print(f"Detected BBox: {bbox}")
            return True

    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

if __name__ == "__main__":
    # Using threshold=200 to be strict about what is "black"
    draw_debug_bbox("minecraft__blaze_nether_original.png", "minecraft__blaze_nether_debug_v3.png", threshold=200)
