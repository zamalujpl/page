/**
 * Expected localStorage:
 *
 * localStorage.setItem("images", JSON.stringify([...])); // Your image ideas list
 * localStorage.setItem("imageState", "awaiting_prompt_insertion"); // IMPORTANT: Initialize state
 */

async function processImageQueue() {
  const STORAGE_KEY_IMAGES = "images";
  const STORAGE_KEY_STATE = "imageState";

  console.log("--- processImageQueue called ---");
  let currentImageState = localStorage.getItem(STORAGE_KEY_STATE) || "awaiting_prompt_insertion";
  console.log("Current imageState (on call):", currentImageState);

  let queue = JSON.parse(localStorage.getItem(STORAGE_KEY_IMAGES) || "[]");

  console.log("Current image queue length:", queue.length);

  if (!Array.isArray(queue) || queue.length === 0) {
    console.warn("Image queue is empty. All images processed.");
    localStorage.removeItem(STORAGE_KEY_STATE); // Clear state if queue is empty
    console.log("Please manually move your downloaded images to their correct project directories.");
    return;
  }

  const current = queue[0];
  const { description, category, filename } = current;
  if (!description || !category || !filename) {
    console.error("Invalid object format in queue. Missing description, category, or filename.", current);
    return;
  }
  console.log("Processing image entry:", filename);


  // === PHASE 1: Populate prompt and copy filename to clipboard ===
  if (currentImageState === "awaiting_prompt_insertion") {
    console.log("Entering Phase 1: Inserting prompt.");
    const prompt = `I need a colouring book. Only black and white with a little bit of very light gray where there is a strong shadow.

• Black (outlines and details): #000000
• White (main fill color): #FFFFFF
• Very light gray (shadows): D3D3D3 to E0E0E0 (approximate)

The drawing can be 256x256 pixels

Use a combination of Disney and the Gravity Falls styles as a reference.
Draw me a ${description}`;

    const editableDiv = document.querySelector('div.ql-editor[contenteditable="true"]');
    if (!editableDiv) {
      console.error("Prompt input (ql-editor) not found. Cannot insert prompt.");
      return;
    }

    editableDiv.textContent = '';
    prompt.split('\n').forEach((line, index) => {
      if (index > 0) {
        editableDiv.appendChild(document.createElement('br'));
      }
      editableDiv.appendChild(document.createTextNode(line));
    });

    editableDiv.dispatchEvent(new Event("input", { bubbles: true }));
    editableDiv.focus();

    localStorage.setItem(STORAGE_KEY_STATE, "awaiting_image_generation");
    
    const suggestedFilename = `${category}__${filename}.png`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(suggestedFilename)
        .then(() => console.log(`Suggested filename copied to clipboard: ${suggestedFilename}`))
        .catch(err => console.error('Failed to copy suggested filename to clipboard:', err));
    } else {
      console.warn('Clipboard API not available. Cannot automatically copy filename.');
    }

    console.log("Prompt inserted. State set to 'awaiting_image_generation'. Now hit Enter in Gemini to generate the image.");
    console.log(`Once the image is generated, manually right-click it and select 'Save Image As...'.`);
    console.log(`The suggested filename '${suggestedFilename}' has been copied to your clipboard. Paste it into the save dialog.`);
    console.log("After manual download, click the 'D' button again to advance to the next prompt.");
    return;
  }

  // === PHASE 2: Advance queue after manual download ===
  if (currentImageState === "awaiting_image_generation") {
    console.log("Entering Phase 2: Advancing queue after manual download.");

    const suggestedFilename = `${category}__${filename}.png`;
    console.log(`Confirming manual download for: ${suggestedFilename}`);

    // Shift queue and reset state
    queue.shift(); // Remove the current image from the queue
    localStorage.setItem(STORAGE_KEY_IMAGES, JSON.stringify(queue)); // Save updated queue
    localStorage.setItem(STORAGE_KEY_STATE, "awaiting_prompt_insertion"); // Reset state for the next image

    console.log(`Queue advanced. Finished with ${filename}. New image queue length: ${queue.length}.`);


    // If there are more images, recursively call to process the next one immediately
    if (queue.length > 0) {
      console.log("Processing next image in queue...");
      processImageQueue();
    } else {
      console.log("Image queue is empty. All images processed.");
      localStorage.removeItem(STORAGE_KEY_STATE); // Clear state if queue is empty
      console.log("All prompts processed. Please manually move your downloaded images to their correct project directories.");
    }
    return;
  }
}

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