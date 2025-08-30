import os
import random
from openai import OpenAI

import time
from dotenv import load_dotenv

# Load API key from .env
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY not found in .env file.")

client = OpenAI(api_key=OPENAI_API_KEY)

# Your data
days_with_header_images = [
    {
        'key': 'freckles_day',
        'day': 'Dzień Piegów',
        'images': [
            # 'dziecko z piegami',
            'lupa',
            # 'lustro z uśmiechniętą twarzą dziecka'
        ]
    },
]

# Prompt templates
PROMPTS = [
    (
      "A clean black-and-white line drawing of a magnifying glass {character}, "
      "in a Disney-meets-Gravity Falls coloring book style. "
      "No background, no text, no shading, no color — only clean black outlines. "
      "Centered, full view on a solid white 512x512px canvas."
    ),
    (
        "Create a single illustration on a canvas with a solid white background. "
        "Draw {character} shaded entirely in grayscale, as if colored with a pencil. "
        "Include a yellow pencil visibly coloring part of the character. "
        "Use a coloring book aesthetic in the style of Disney mixed with Gravity Falls. "
        "No background, no text. The character/object should be fully visible and centered.\n\n"
        "Format:\n- File format: PNG\n- Background: Solid white\n- Canvas size: 512x512 px"
    ),
    (
        "Create a single illustration on a canvas with a solid white background. "
        "Draw {character} partially or fully filled with bright, vibrant paint colors. "
        "Include a paintbrush visibly painting an element of the character. "
        "Use a coloring book aesthetic in the style of Disney mixed with Gravity Falls. "
        "No background, no text. The character/object should be fully visible and centered.\n\n"
        "Format:\n- File format: PNG\n- Background: Solid white\n- Canvas size: 512x512 px"
    ),
]

def generate_image(prompt, retries=3, delay=5):
    """
    Generate an image using OpenAI's API with retry logic.
    """
    for attempt in range(1, retries + 1):
        try:
            response = client.images.generate(
            model="dall-e-3",
            prompt=prompt,
            n=1,
            size="1024x1024",
            response_format="url")
            return response.data[0].url
        except Exception as e:
            print(f"[Attempt {attempt}] Failed to generate image: {e}")
            if attempt < retries:
                print(f"Retrying in {delay} seconds...")
                time.sleep(delay)
            else:
                print("All attempts to generate image failed.")
                raise

def save_image(url, path, retries=3, delay=5):
    """
    Download and save an image from a URL with retry logic.
    """
    import requests
    for attempt in range(1, retries + 1):
        try:
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            with open(path, "wb") as f:
                f.write(response.content)
            return
        except Exception as e:
            print(f"[Attempt {attempt}] Failed to save image: {e}")
            if attempt < retries:
                print(f"Retrying in {delay} seconds...")
                time.sleep(delay)
            else:
                print("All attempts to save image failed.")
                raise

def main():
    for day in days_with_header_images:
        key = day['key']
        out_dir = os.path.join("public", "assets", key)
        os.makedirs(out_dir, exist_ok=True)
        for idx, character in enumerate(day['images']):
            if idx == 0:
                prompt_template = PROMPTS[0]
                img_type = "outline"
            elif idx == 1:
                prompt_template = PROMPTS[1]
                img_type = "pencil"
            elif idx == 2:
                prompt_template = PROMPTS[2]
                img_type = "paint"
            else:
                print(f"Skipping character '{character}' at index {idx} (no matching prompt).")
                continue
            prompt = prompt_template.format(character=character)
            print(f"Generating image for '{character}' with prompt type '{img_type}':\n{prompt}\n")
            try:
                image_url = generate_image(prompt)
                out_path = os.path.join(out_dir, f"{img_type}.png")
                save_image(image_url, out_path)
                print(f"Saved to {out_path}")
            except Exception as e:
                print(f"Failed to generate or save image for '{character}' [{img_type}]: {e}")
            time.sleep(5)

if __name__ == "__main__":
    main()
