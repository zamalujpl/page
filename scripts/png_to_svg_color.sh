zamaluj_pl/scripts/png_to_svg_color.sh
#!/bin/bash

# png_to_svg_color.sh
# Script to convert a PNG image to a colored SVG using autotrace

# Check for required tools
command -v autotrace >/dev/null 2>&1 || { echo "Error: autotrace is not installed. Please install it using 'brew install autotrace'."; exit 1; }
command -v convert >/dev/null 2>&1 || { echo "Error: ImageMagick is not installed. Please install it using 'brew install imagemagick'."; exit 1; }

usage() {
    echo "Usage: $0 <input_file.png> [output_file.svg]"
    echo
    echo "Converts a PNG image to a colored SVG using autotrace."
    echo "If output_file.svg is not specified, it will use the same name as the input file with .svg extension."
    echo "Example: $0 image.png"
    echo "Example: $0 image.png output.svg"
    exit 1
}

# Check arguments
if [[ $# -lt 1 ]]; then
    usage
fi

input_file="$1"
output_file="$2"

if [[ -z "$output_file" ]]; then
    output_file="${input_file%.*}.svg"
fi

if [[ ! -f "$input_file" ]]; then
    echo "Error: Input file '$input_file' does not exist."
    exit 1
fi

# Convert PNG to PNM (autotrace works best with PNM)
temp_pnm=$(mktemp).pnm
convert "$input_file" -background none -alpha on "$temp_pnm"

# Use autotrace to convert PNM to SVG, preserving colors
# --color-count can be adjusted for more/less color detail
autotrace --input-format=pnm --output-format=svg --color-count=16 --output-file="$output_file" "$temp_pnm"

rm -f "$temp_pnm"

echo "Conversion complete: $output_file"
