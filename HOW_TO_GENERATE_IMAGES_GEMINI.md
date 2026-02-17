# How to Generate Images with Gemini

This guide explains the process of generating and downloading images using the Gemini interface for the Zamaluj.pl website.

## Step 1: Generate a List of Image Ideas

Use Gemini with the following prompt to generate a list of image ideas.

### Minecraft Style Prompt:
When generating content for Minecraft, use this style template for individual image prompts:
> [SUBJECT] from Minecraft, 1024x1024 pixels, softly rounded blocky voxel geometry, slightly beveled edges, Gravity Falls art style, thick bold black outlines, Disney-style facial features, coloring book page, black and white line art, pure white background, no shading, no background elements, minimal solid black areas.

### Prompt Example for List Generation:

```
Example output { "description": "a wise wizard casting a glowing spell from his staff", "filename": "wizard_spell", "category": "fantasy_fairy_tales" } Category: Minecraft Task: Create a list of coloring books description with minecraft characters. One coloring book can containe one, two, up to three chracters, then can interact with eachother and/or can have itemes from the game: bow, axe, sword etc... Before you give final answer consider double check if assumptions are right
```

The output should be a JSON array of objects, where each object has a `description`, `filename`, and `category`.

## Step 2: Copy the Ideas to Local Storage and Initialize State

Once you have the list of image ideas, you need to copy it to your browser's local storage and correctly initialize the script's state.

Open your browser's developer console and **run these three commands sequentially**:

```javascript
localStorage.removeItem("imageState"); // IMPORTANT: Clear any old state from previous runs
localStorage.setItem("images", JSON.stringify([
    {
      "description": "Creeper in a pre-explosion hissing pose",
      "filename": "creeper_improved",
      "category": "minecraft"
    },
    {
      "description": "Large Spider in a climbing pose",
      "filename": "spider_climbing",
      "category": "minecraft"
    },
    {
      "description": "Hovering Blaze surrounded by spinning rods",
      "filename": "blaze_nether",
      "category": "minecraft"
    },
    {
      "description": "Flying Ghast with open mouth shooting a fireball",
      "filename": "ghast_fireball",
      "category": "minecraft"
    },
    {
      "description": "Drowned holding a trident",
      "filename": "drowned_trident",
      "category": "minecraft"
    },
    {
      "description": "Flying Vex holding a sword",
      "filename": "vex_flying",
      "category": "minecraft"
    },
    {
      "description": "Magma Cube stretched out mid-jump showing internal lava layers",
      "filename": "magma_cube_stretch",
      "category": "minecraft"
    },
    {
      "description": "Librarian Villager wearing glasses and holding an open book",
      "filename": "villager_librarian",
      "category": "minecraft"
    },
    {
      "description": "Blacksmith Villager standing next to an anvil",
      "filename": "villager_blacksmith",
      "category": "minecraft"
    },
    {
      "description": "Pillager holding a crossbow and an Illager Banner",
      "filename": "pillager_banner",
      "category": "minecraft"
    },
    {
      "description": "Evoker with raised hands casting a spell",
      "filename": "evoker_spell",
      "category": "minecraft"
    },
    {
      "description": "Steve in full diamond armor holding a pickaxe",
      "filename": "steve_diamond_armor",
      "category": "minecraft"
    },
    {
      "description": "Alex aiming with a bow",
      "filename": "alex_archer",
      "category": "minecraft"
    },
    {
      "description": "The Warden with glowing chest elements",
      "filename": "warden_beast",
      "category": "minecraft"
    },
    {
      "description": "Breeze jumping and spinning in a whirlwind",
      "filename": "breeze_action",
      "category": "minecraft"
    },
    {
      "description": "Armadillo curling up into its shell",
      "filename": "armadillo_shell",
      "category": "minecraft"
    },
    {
      "description": "Bogged skeleton holding a bow with dripping poison",
      "filename": "bogged_archer",
      "category": "minecraft"
    },
    {
      "description": "Creaking monster in a lurking pose",
      "filename": "creaking_monster",
      "category": "minecraft"
    },
    {
      "description": "Set of diamond tools including a sword, pickaxe, and axe",
      "filename": "diamond_tools_set",
      "category": "minecraft"
    },
    {
      "description": "Open Chest overflowing with diamonds and emeralds",
      "filename": "loot_chest",
      "category": "minecraft"
    },
    {
      "description": "Enchanting Table with floating book and magical runes",
      "filename": "magic_enchanting",
      "category": "minecraft"
    },
    {
      "description": "Totem of Undying item close-up",
      "filename": "totem_item",
      "category": "minecraft"
    },
    {
      "description": "Furnace emitting smoke while cooking a fish",
      "filename": "furnace_cooking",
      "category": "minecraft"
    },
    {
      "description": "Shining Golden Apple item",
      "filename": "apple_golden",
      "category": "minecraft"
    }
]));
localStorage.setItem("imageState", "awaiting_prompt_insertion");
localStorage.setItem("extractedImageUrls", JSON.stringify([]));
```

## Step 3: Run the Automation Script

Copy the entire content of the file `scripts/gemini_automation.js` into your browser's developer console and run it.

This script will:
1.  Add a "D" button to the Gemini interface.
2.  Manage the phased workflow for image generation and URL collection.

**Workflow for each image:**
*   **Click 'D' (1st time):** The script will populate Gemini's input box with the image prompt.
*   **You (manually) hit Enter in Gemini:** Gemini generates the image.
*   **Click 'D' (2nd time):** The script will find the last generated image, extract its URL and collect it along with the filename and category into an internal list (`localStorage.extractedImageUrls`). It will then automatically advance the image queue and immediately start processing the next image.

**Continue this two-click process (click 'D', hit Enter, click 'D') until the script announces "Image queue is empty. All images processed." and prints the final JSON array of collected image data.**

## Step 4: Final Bulk Download

Once the image queue is empty and the script prints the `extractedImageUrls` JSON array to your console, copy that entire JSON output and provide it to the agent. The agent will then write and execute a Python script to download all the collected images to their correct locations.

## Step 5: Next Steps (Processing Images)

Once all images are downloaded, you will need to move them to the correct `public/assets/<category_name>/` directories and process them (e.g., convert to SVG, WebP, PDF) using the project's scripts.

## Step 6: Generating Category Header Assets

Each category needs a `header.png` generated from three source images: `outline.png` (the original B&W), `pencil.png`, and `paint.png`. Use the following prompts with Gemini by uploading the `outline.png` file first.

### Prompt for `pencil.png`:
> Based on the attached black-and-white coloring page, generate a high-quality image showing it partially colored with colored pencils. The colors should have a clear pencil texture with visible shading and hatching. Include a **drawn** yellow pencil with a pink eraser lying on top of the image. The pencil must be entirely within the image boundaries and must not extend outside the paper edges. Maintain the exact character and line work from the original image.

### Prompt for `paint.png`:
> Based on the attached black-and-white coloring page, generate a high-quality image showing it partially painted with watercolors. The colors should have a vibrant with visible brush strokes and paint texture. Crucially, ensure the original outlines of the drawing remain clearly visible. Include a **drawn** yellow paintbrush lying on top of the image. The brush must be entirely within the image boundaries and must not extend outside the paper edges. Maintain the exact character and line work from the original image.

### Finalizing the Header:
1. Save the generated images as `pencil.png` and `paint.png` in `public/assets/<category_slug>/`.
2. Ensure the original B&W image is saved as `outline.png` in the same folder.
3. Run the header assembly script:
   ```bash
   python3 scripts/chars_to_header.py
   ```
4. Optimize the result:
   ```bash
   bash convert_all_headers.sh
   ```
