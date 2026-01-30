#!/bin/bash

BASE_URL="http://localhost:4321"
FAILED_URLS=()

for url in $(python scripts/generate_all_urls.py); do
  full_url="${BASE_URL}${url}"
  echo "Checking: ${full_url}"
  
  # Use agent-browser to open the URL and get the title
  title=$(agent-browser open "${full_url}" && agent-browser get title)
  
  if [[ $? -ne 0 ]] || [[ "${title}" == *"404"* ]]; then
    echo "  [FAILED] URL: ${full_url}"
    FAILED_URLS+=("${full_url}")
  else
    echo "  [OK]"
  fi
done

if [ ${#FAILED_URLS[@]} -ne 0 ]; then
  echo -e "\n--- FAILED URLS ---"
  for failed_url in "${FAILED_URLS[@]}"; do
    echo "- ${failed_url}"
  done
  exit 1
else
  echo -e "\nAll links are OK!"
fi
