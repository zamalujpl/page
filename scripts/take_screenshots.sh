#!/bin/bash

# Check if width and height are provided
if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Usage: $0 <width> <height>"
  exit 1
fi

WIDTH=$1
HEIGHT=$2
RESOLUTION_DIR="screenshots/${WIDTH}x${HEIGHT}"

# Create screenshots directory if it doesn't exist
mkdir -p "$RESOLUTION_DIR"

echo "Setting viewport to ${WIDTH}x${HEIGHT}"
agent-browser set viewport "$WIDTH" "$HEIGHT"

# Generate URLs and take screenshots
python scripts/generate_urls.py | while read -r url; do
  # It's important to use a base URL since agent-browser needs a full URL
  full_url="http://localhost:4321$url"
  
  echo "Processing $full_url"
  
  # Navigate to the page
  agent-browser open "$full_url"
  
  # Create a valid filename from the URL
  # Replace slashes with underscores and remove leading underscore
  filename=$(echo "$url" | sed 's/\//_/g' | sed 's/^_//').png
  
  # Take a screenshot
  agent-browser screenshot "${RESOLUTION_DIR}/${filename}" --full
done

echo "All screenshots for ${WIDTH}x${HEIGHT} saved in the '${RESOLUTION_DIR}' directory."