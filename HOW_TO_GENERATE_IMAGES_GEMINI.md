# How to Generate Images with Gemini

This guide explains the process of generating and downloading images using the Gemini interface for the Zamaluj.pl website.

## Step 1: Generate a List of Image Ideas

Use Gemini with the following prompt to generate a list of image ideas.

### Prompt Example:

```
Example output { "description": "a wise wizard casting a glowing spell from his staff", "filename": "wizard_spell", "category": "fantasy_fairy_tales" } Category: Minecraft Task: Create a list of coloring books description with minecraft characters. One coloring book can containe one, two, up to three chracters, then can interact with eachother and/or can have itemes from the game: bow, axe, sword etc... Before you give final answer consider double check if assumptions are right
```

The output should be a JSON array of objects, where each object has a `description`, `filename`, and `category`.

## Step 2: Copy the Ideas to Local Storage

Once you have the list of image ideas, you need to copy it to your browser's local storage.

Open your browser's developer console and run the following command, replacing the example data with your generated JSON:

```javascript
localStorage.setItem("images", JSON.stringify([
  {
    description: "a robot walking a dog in space",
    category: "sci-fi",
    filename: "robot_dog"
  },
  {
    description: "a friendly dragon sharing a cup of tea with a knight",
    category: "fantasy_fairy_tales",
    filename: "dragon_knight_tea"
  }
]));
```

## Step 3: Add the Download Button to the Gemini Interface

To add the download button to the Gemini interface, run the following script in your browser's developer console. This script will add a "D" button that triggers the download process.

```javascript
function addProcessImageButton() {
  console.log('Attempting to insert "Process Images" button...');

  const sendButtonContainer = document.querySelector('.send-button-container');
  if (!sendButtonContainer) {
    console.warn('Send button container not found. Aborting.');
    return;
  }

  if (document.getElementById('process-image-button')) {
    console.log('"Process Images" button already exists. Skipping.');
    return;
  }

  const newButton = document.createElement('button');
  newButton.textContent = 'D';
  newButton.id = 'process-image-button';
  newButton.className = 'mdc-icon-button mat-mdc-icon-button mat-mdc-button-base mat-unthemed'; // Use Gemini's button classes
  newButton.style.width = '40px';
  newButton.style.height = '40px';
  newButton.style.border = '1px solid var(--gds-sys-color-outline)';
  newButton.style.borderRadius = '50%';
  newButton.style.backgroundColor = 'var(--gds-sys-color-surface-container)';
  newButton.style.color = 'var(--gds-sys-color-on-surface)';
  newButton.style.cursor = 'pointer';
  newButton.style.marginRight = '8px';


  newButton.addEventListener('click', () => {
    console.log('Process Images button clicked');
    if (typeof processImageQueue === 'function') {
      processImageQueue();
    } else {
      console.warn('processImageQueue is not defined or not a function');
    }
  });

  sendButtonContainer.parentElement.insertBefore(newButton, sendButtonContainer);

  console.log('"Process Images" button inserted.');
}

addProcessImageButton();
```

## Step 4: Download Images in the Browser (for Gemini Interface)

The download button added in the previous step uses the `processImageQueue` function to automate the process of generating and downloading images.

**Important:** Before you can use the download button, you must define the `processImageQueue` function in your browser's developer console.

Here is the code for the `processImageQueue` function.

```javascript
/**
 * Expected localStorage:
 * 
 * localStorage.setItem("images", JSON.stringify([
 *   {
 *     description: "a robot walking a dog in space",
 *     category: "sci-fi",
 *     filename: "robot_dog"
 *   }
 * ]));
 * 
 * State flag:
 * - "awaiting_image" → prompt inserted, waiting for image to appear
 * - "image_ready" → image is expected and ready to download
 */

async function processImageQueue() {
  const STORAGE_KEY = "images";
  const STATE_KEY = "imageState";

  let queue = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  if (!Array.isArray(queue) || queue.length === 0) {
    console.warn("Image queue is empty.");
    return;
  }

  const current = queue[0];
  const { description, category, filename } = current;
  if (!description || !category || !filename) {
    console.error("Invalid object format in queue.");
    return;
  }

  const container = document.getElementById("chat-history");
  const images = container?.querySelectorAll("img") || [];

  const imageState = localStorage.getItem(STATE_KEY);

  // === Scenario 1: Image not ready, populate prompt ===
  if (imageState !== "image_ready") {
    const prompt = `I need a colouring book. Only black and white with a little bit of very light gray where there is a strong shadow.

• Black (outlines and details): #000000
• White (main fill color): #FFFFFF
• Very light gray (shadows): #D3D3D3 to #E0E0E0 (approximate)

The drawing can be 256x256 pixels

Use a combination of Disney and the Gravity Falls styles as a reference.
Draw me a ${description}`;

    const editableDiv = document.querySelector('div.ql-editor[contenteditable="true"]');
    if (!editableDiv) {
      console.warn("Prompt input (ql-editor) not found.");
      return;
    }

    editableDiv.innerHTML = `<p>${prompt.replace(/\n/g, "<br>")}</p>`;
    editableDiv.dispatchEvent(new Event("input", { bubbles: true }));
    editableDiv.focus();

    localStorage.setItem(STATE_KEY, "image_ready");
    console.log("Prompt inserted. Now waiting for image to be generated.");
    return; // Don't proceed to downloading yet
  }

  // === Scenario 2: Image ready, download ===
  if (images.length === 0) {
    console.warn("No images found to download.");
    return;
  }

  const lastImg = images[images.length - 1];
  const src = lastImg.src;

  try {
    const response = await fetch(src);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const ext = blob.type.split("/")[1] || "png";
    const downloadName = `${category}__${filename}.${ext}`;

    const link = document.createElement("a");
    link.href = url;
    link.download = downloadName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Clear state, shift queue
    queue.shift();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    localStorage.setItem(STATE_KEY, "awaiting_image");

    console.log(`Downloaded: ${downloadName}`);
  } catch (err) {
    console.error("Download failed:", err);
  }
}

```

## Step 5: Modify descriptions.json

After downloading the images, you will need to modify `private/assets/to_process/descriptions.json` with the new image information.

```