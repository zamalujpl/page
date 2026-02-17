import os
from PIL import Image, ImageOps

def analyze_subject_size(file_path, threshold=0.85, canvas_size=1024):
    try:
        with Image.open(file_path) as img:
            # Convert to grayscale and invert to find the subject (non-white)
            img_l = img.convert("L")
            inverted_img = ImageOps.invert(img_l)
            bbox = inverted_img.getbbox()
            
            if not bbox:
                return None, 0, 0
            
            # Calculate content dimensions
            content_w = bbox[2] - bbox[0]
            content_h = bbox[3] - bbox[1]
            
            # Check if the largest dimension is smaller than 85% of the canvas
            max_dim = max(content_w, content_h)
            occupancy = max_dim / canvas_size
            
            return occupancy, content_w, content_h
    except Exception as e:
        print(f"Error analyzing {file_path}: {e}")
        return None, 0, 0

def main():
    target_dir = "private/assets/to_process"
    threshold = 0.85
    canvas_size = 1024
    
    files = [f for f in os.listdir(target_dir) if f.startswith("minecraft__") and f.lower().endswith(".png")]
    small_files = []

    print(f"Analyzing {len(files)} Minecraft images for subject size (Threshold: {threshold*100}%)...\n")

    for filename in sorted(files):
        file_path = os.path.join(target_dir, filename)
        occupancy, w, h = analyze_subject_size(file_path, threshold, canvas_size)
        
        if occupancy is not None and occupancy < threshold:
            small_files.append((filename, occupancy, w, h))
            print(f"[SMALL] {filename}: {occupancy:.1%} coverage ({w}x{h})")

    print(f"\nFinished analysis.")
    print(f"Total Minecraft files: {len(files)}")
    print(f"Files with small subjects: {len(small_files)}")

if __name__ == "__main__":
    main()
