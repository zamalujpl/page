#!/bin/bash

# Directory to check
TARGET_DIR="private/assets/to_process"
EXPECTED_WIDTH=1024
EXPECTED_HEIGHT=1024

echo "=== Checking image dimensions in $TARGET_DIR ==="
echo "Expected resolution: ${EXPECTED_WIDTH}x${EXPECTED_HEIGHT}"
echo "------------------------------------------------"

count=0
invalid_count=0

# Loop through PNG files in the directory
for img in "$TARGET_DIR"/*.png; do
    # Skip if no png files found
    [ -e "$img" ] || continue
    
    count=$((count + 1))
    
    # Get dimensions using ImageMagick identify
    dims=$(identify -format "%wx%h" "$img")
    width=$(echo $dims | cut -d'x' -f1)
    height=$(echo $dims | cut -d'x' -f2)
    
    if [ "$width" -ne "$EXPECTED_WIDTH" ] || [ "$height" -ne "$EXPECTED_HEIGHT" ]; then
        echo "[INVALID] $(basename "$img"): $dims"
        invalid_count=$((invalid_count + 1))
    fi
done

echo "------------------------------------------------"
echo "Total images checked: $count"
echo "Images with wrong resolution: $invalid_count"

if [ "$invalid_count" -eq 0 ]; then
    echo "✅ All images are 1024x1024."
else
    echo "❌ Found $invalid_count images with incorrect dimensions."
fi
