#!/bin/bash

# png_to_svg.sh
# Script to convert PNG images to SVG format using potrace

# Check if required commands are available
command -v potrace >/dev/null 2>&1 || { echo "Error: potrace is not installed. Please install it using 'brew install potrace'."; exit 1; }
command -v convert >/dev/null 2>&1 || { echo "Error: ImageMagick is not installed. Please install it using 'brew install imagemagick'."; exit 1; }

# Display usage information
usage() {
    echo "Usage: $0 [options] <input_file.png> [output_file.svg]"
    echo
    echo "Options:"
    echo "  -h, --help           Show this help message"
    echo "  -d, --directory      Process all PNG files in the specified directory"
    echo "  -a, --alphamax       Set the corner threshold parameter (default: 1)"
    echo "  -t, --turdsize       Set the speckle removal threshold (default: 2)"
    echo "  -o, --opttolerance   Set the optimization tolerance (default: 0.2)"
    echo
    echo "If output_file.svg is not specified, it will use the same name as the input file with .svg extension."
    echo "Example: $0 image.png               # Creates image.svg"
    echo "Example: $0 -d images/              # Converts all PNG files in images/ directory"
    echo "Example: $0 -a 0.8 -t 5 image.png   # Custom parameters for better quality"
    exit 1
}

# Initialize variables with defaults
alphamax=1
turdsize=2
opttolerance=0.2
process_directory=false
directory=""

# Parse options
while [[ $# -gt 0 ]]; do
    case "$1" in
        -h|--help)
            usage
            ;;
        -d|--directory)
            process_directory=true
            directory="$2"
            shift 2
            ;;
        -a|--alphamax)
            alphamax="$2"
            shift 2
            ;;
        -t|--turdsize)
            turdsize="$2"
            shift 2
            ;;
        -o|--opttolerance)
            opttolerance="$2"
            shift 2
            ;;
        *)
            break
            ;;
    esac
done

# Function to convert a single PNG file to SVG
convert_png_to_svg() {
    local input_file="$1"
    local output_file="$2"

    # If output file is not specified, use the input filename with .svg extension
    if [[ -z "$output_file" ]]; then
        output_file="${input_file%.*}.svg"
    fi

    echo "Converting $input_file to $output_file"

    # Create a temporary BMP file (potrace works with bitmap formats)
    temp_bmp=$(mktemp).bmp

    # Check if output file already exists
    if [[ -f "$output_file" ]]; then
        echo "Notice: Overwriting existing SVG file: $output_file"
    fi

    # Use ImageMagick to convert PNG to BMP
    # We want black in PNG to be black in SVG, so we don't negate and don't use -i with potrace
    convert "$input_file" -flatten "$temp_bmp"

    # Use potrace to convert BMP to SVG
    # Note: No -i flag, this ensures black in PNG stays black in SVG
    potrace -s -a "$alphamax" -t "$turdsize" -O "$opttolerance" -o "$output_file" "$temp_bmp"

    # Clean up temporary file
    rm -f "$temp_bmp"

    echo "Conversion complete: $output_file"
}

# Process a directory of PNG files
process_png_directory() {
    local dir="$1"

    # Check if directory exists
    if [[ ! -d "$dir" ]]; then
        echo "Error: Directory '$dir' does not exist."
        exit 1
    fi

    # Find all PNG files in the directory
    local png_files=$(find "$dir" -type f -name "*.png")

    if [[ -z "$png_files" ]]; then
        echo "No PNG files found in directory '$dir'."
        exit 1
    fi

    # Process each PNG file
    echo "Found $(echo "$png_files" | wc -l | tr -d ' ') PNG files to process."
    for file in $png_files; do
        convert_png_to_svg "$file"
    done

    echo "All files processed successfully."
}

# Main execution
if [[ $process_directory == true ]]; then
    process_png_directory "$directory"
else
    # Check if an input file was provided
    if [[ $# -lt 1 ]]; then
        echo "Error: No input file specified."
        usage
    fi

    # Get input and output file names
    input_file="$1"
    output_file="$2"

    # Check if input file exists
    if [[ ! -f "$input_file" ]]; then
        echo "Error: Input file '$input_file' does not exist."
        exit 1
    fi

    # Check if input file is a PNG
    if [[ "${input_file,,}" != *".png" ]]; then
        echo "Warning: Input file does not have a .png extension. The script may not work as expected."
    fi

    # Convert the file
    convert_png_to_svg "$input_file" "$output_file"
fi
