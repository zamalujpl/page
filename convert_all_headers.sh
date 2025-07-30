#!/bin/bash

IMG_DIR="public/assets"

find "$IMG_DIR" -type f \( -iname "*header*.jpg" -o -iname "*header*.jpeg" -o -iname "*header*.png" \) | while read IMG; do
  DIM=$(identify -format "%w %h" "$IMG")
  WIDTH=$(echo $DIM | cut -d' ' -f1)
  HEIGHT=$(echo $DIM | cut -d' ' -f2)
  OUT="${IMG%.*}.webp"
  if [ "$WIDTH" -eq 1200 ] && [ "$HEIGHT" -eq 400 ] && [ -f "$OUT" ]; then
    continue
  fi
  magick convert "$IMG" -resize 1200x400^ -gravity center -extent 1200x400 "$OUT" 2>/dev/null
  rm -f "$IMG"
done
