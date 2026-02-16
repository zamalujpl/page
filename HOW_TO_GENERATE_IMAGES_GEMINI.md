# How to Generate Images with Gemini

This guide explains the process of generating and downloading images using the Gemini interface for the Zamaluj.pl website.

## Step 1: Generate a List of Image Ideas

Use Gemini with the following prompt to generate a list of image ideas.

### Prompt Example:

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
  { "description": "Uroczy pluszowy miś trzymający duży balon w kształcie serca", "filename": "valentine_bear_balloon", "category": "valentines_day" },
  { "description": "Dwa pingwiny stojące razem na lodzie z sercem między nimi", "filename": "penguins_love", "category": "valentines_day" },
  { "description": "Klasyczny kupidyn ze skrzydłami, trzymający złoty łuk i strzałę", "filename": "cupid_gold_bow", "category": "valentines_day" },
  { "description": "Wielopoziomowy tort walentynkowy udekorowany sercami i zakrętasami z lukru", "filename": "valentine_cake", "category": "valentines_day" },
  { "description": "Dwa kocięta bawiące się kłębkiem czerwonej włóczki w kształcie serca", "filename": "kittens_yarn_heart", "category": "valentines_day" },
  { "description": "Ozdobna skrzynka pocztowa wypełniona walentynkami i różami", "filename": "love_letter_mailbox", "category": "valentines_day" },
  { "description": "Bukiet realistycznych róż przewiązany dużą jedwabną wstążką", "filename": "rose_bouquet", "category": "valentines_day" },
  { "description": "Para nierozłączek siedzących na gałęzi drzewa z kwiatami", "filename": "lovebirds_blossom", "category": "valentines_day" },
  { "description": "Ozdobny medalion w kształcie serca z delikatnym grawerem kwiatowym", "filename": "heart_locket", "category": "valentines_day" },
  { "description": "Szczeniak siedzący w pudełku prezentowym otoczony papierowymi sercami", "filename": "puppy_gift_box", "category": "valentines_day" },
  { "description": "Dwa słonie ze splecionymi trąbami w kształcie serca", "filename": "elephant_love", "category": "valentines_day" },
  { "description": "Pudełko czekoladek o różnych kształtach i wzorach", "filename": "chocolate_box", "category": "valentines_day" },
  { "description": "Balon na gorące powietrze w kształcie serca unoszący się nad chmurami", "filename": "heart_hot_air_balloon", "category": "valentines_day" },
  { "description": "Uroczy króliczek trzymający gigantyczną marchewkę wyrzeźbioną w kształcie serca", "filename": "bunny_carrot_heart", "category": "valentines_day" },
  { "description": "Szklany słoik wypełniony cukierkami w kształcie serca z napisem 'Bądź mój'", "filename": "candy_heart_jar", "category": "valentines_day" },
  { "description": "Dwa łabędzie na stawie tworzące serce swoimi długimi szyjami", "filename": "swan_lake_heart", "category": "valentines_day" },
  { "description": "Ozdobny wieniec wykonany z małych serc i wstążek", "filename": "valentine_wreath", "category": "valentines_day" },
  { "description": "Mała dziewczynka puszczająca bańki mydlane w kształcie serc", "filename": "heart_bubbles", "category": "valentines_day" },
  { "description": "Pluszowy miś siedzący przy stole z herbatą i ciasteczkami w kształcie serc", "filename": "bear_tea_party", "category": "valentines_day" },
  { "description": "Kłódka w kształcie serca z pasującym ozdobnym kluczem", "filename": "heart_lock_key", "category": "valentines_day" },
  { "description": "Dwie sowy huczące na gałęzi pod półksiężycem z gwiazdami", "filename": "valentine_owls", "category": "valentines_day" },
  { "description": "Kolekcja unoszących się balonów w różnych wzorach serc", "filename": "floating_heart_balloons", "category": "valentines_day" },
  { "description": "Ogrodowy gnom trzymający tabliczkę z napisem 'Kocham Cię'", "filename": "gnome_love_sign", "category": "valentines_day" },
  { "description": "Szczegółowy kwiat róży z kroplami rosy na płatkach", "filename": "single_rose_detail", "category": "valentines_day" },
  { "description": "Dwa lisy zwinięte razem w przytulnej leśnej norze", "filename": "fox_cuddle", "category": "valentines_day" },
  { "description": "Babeczka z dużą truskawką w kształcie serca na wierzchu", "filename": "strawberry_cupcake", "category": "valentines_day" },
  { "description": "Drzewo, którego liście są sercami o różnych rozmiarach", "filename": "heart_leaf_tree", "category": "valentines_day" },
  { "description": "Magiczna butelka z eliksirem z bąbelkami w kształcie serca", "filename": "love_potion_bottle", "category": "valentines_day" },
  { "description": "Dwie żyrafy krzyżujące szyje, tworząc kształt serca", "filename": "giraffe_heart", "category": "valentines_day" },
  { "description": "Uśmiechnięte słońce w okularach przeciwsłonecznych w kształcie serc", "filename": "sunny_valentine", "category": "valentines_day" },
  { "description": "Koszyk kociąt w małych czerwonych muszkach", "filename": "kittens_bowties", "category": "valentines_day" },
  { "description": "Misterny wzór mandali zbudowany w dużej ramie w kształcie serca", "filename": "heart_mandala", "category": "valentines_day" },
  { "description": "Wiewiórka trzymająca żołądź w kształcie serca", "filename": "squirrel_acorn", "category": "valentines_day" },
  { "description": "Romantyczna kolacja przy świecach dla dwojga z różami", "filename": "candle_dinner", "category": "valentines_day" },
  { "description": "Zabawny delfin wyskakujący przez rozprysk wody w kształcie serca", "filename": "dolphin_heart_splash", "category": "valentines_day" },
  { "description": "Dwie pandy dzielące kawałek bambusa w kształcie serca", "filename": "panda_bamboo_heart", "category": "valentines_day" },
  { "description": "Stara maszyna do pisania z kartką pokazującą 'I Love You'", "filename": "typewriter_love_note", "category": "valentines_day" },
  { "description": "Para pasujących rękawiczek trzymających się za ręce", "filename": "mitten_love", "category": "valentines_day" },
  { "description": "Motyl z wzorami serc na skrzydłach", "filename": "heart_butterfly", "category": "valentines_day" },
  { "description": "Koala przytulający pień drzewa z liściem w kształcie serca", "filename": "koala_hug", "category": "valentines_day" },
  { "description": "Wróżka ze skrzydłami w kształcie serca sypiąca pył miłości", "filename": "valentine_fairy", "category": "valentines_day" },
  { "description": "Rząd mrówek niosących małe okruszki w kształcie serca", "filename": "ant_parade_hearts", "category": "valentines_day" },
  { "description": "Dwa koniki morskie zwrócone do siebie w oceanie", "filename": "seahorse_romance", "category": "valentines_day" },
  { "description": "Pizza w kształcie serca z pepperoni w kształcie serc", "filename": "heart_pizza", "category": "valentines_day" },
  { "description": "Lew i lwica ocierające się o siebie na sawannie", "filename": "lion_love", "category": "valentines_day" },
  { "description": "Rower z frontowym koszykiem pełnym świeżych kwiatów", "filename": "valentine_bicycle", "category": "valentines_day" },
  { "description": "Przytulny kominek z sercowymi skarpetami wiszącymi na gzymsie", "filename": "fireplace_romance", "category": "valentines_day" },
  { "description": "Pluszowy miś malujący duże serce na płótnie", "filename": "artist_bear", "category": "valentines_day" },
  { "description": "Chmura deszcząca drobne serca nad małym parasolem", "filename": "heart_rain", "category": "valentines_day" },
  { "description": "Ręka rysująca serce na piasku na plaży", "filename": "beach_sand_heart", "category": "valentines_day" }
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
> Based on the attached black-and-white coloring page, generate a high-quality image showing it partially painted with watercolors. The colors should be vibrant with visible brush strokes and paint texture. Crucially, ensure the original outlines of the drawing remain clearly visible. Include a **drawn** yellow paintbrush lying on top of the image. The brush must be entirely within the image boundaries and must not extend outside the paper edges. Maintain the exact character and line work from the original image.

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
