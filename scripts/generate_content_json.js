import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper to create a URL-friendly slug
function createSlug(text) {
  return text
    .toString()
    .replace(/ł/g, 'l')
    .replace(/Ł/g, 'l')
    .normalize('NFD') // Normalize diacritics
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-'); // Replace multiple - with single -
}

// Get __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');

const descriptionsJsonPath = path.join(projectRoot, 'private/assets/to_process/descriptions.json');
const contentDir = path.join(projectRoot, 'src/content/kolorowanki');

async function generateContentJson(categoryKey, categoryTitle, categoryDescription) {
  if (!fs.existsSync(descriptionsJsonPath)) {
    console.error(`Error: descriptions.json not found at ${descriptionsJsonPath}`);
    process.exit(1);
  }

  const descriptions = JSON.parse(fs.readFileSync(descriptionsJsonPath, 'utf8'));
  const assets = JSON.parse(fs.readFileSync(path.join(projectRoot, 'src/assets.json'), 'utf8'));
  const categoryAssets = assets[categoryKey]?.items || [];
  const assetKeys = new Set(categoryAssets.map(item => item.key));

  const filteredImages = descriptions.filter(desc => 
    desc.category === categoryKey && assetKeys.has(desc.filename)
  );

  if (filteredImages.length === 0) {
    console.warn(`No images found for category: ${categoryKey} in descriptions.json.`);
    return;
  }

  const contentJson = {
    category_slug: createSlug(categoryTitle), // e.g., "walentynki"
    category_title: categoryTitle, // e.g., "Walentynki"
    category_description: categoryDescription,
    asset_key: categoryKey, // e.g., "valentines_day"
    images: []
  };

  for (const imgDesc of filteredImages) {
    // Generate a title from the full Polish description
    const fullTitle = imgDesc.description.charAt(0).toUpperCase() + imgDesc.description.slice(1);
    
    contentJson.images.push({
      key: imgDesc.filename,
      slug: createSlug(fullTitle),
      title: fullTitle, // Use full Polish description as title
      description: imgDesc.description // Use the existing Polish description
    });
  }

  const outputFilePath = path.join(contentDir, `${createSlug(categoryTitle)}.json`);
  fs.writeFileSync(outputFilePath, JSON.stringify(contentJson, null, 2), 'utf8');

  console.log(`Successfully generated content JSON for '${categoryKey}' at ${path.relative(projectRoot, outputFilePath)}`);
}

// --- Execution ---
// This part can be moved to a separate wrapper script if needed, or executed directly.
// For now, let's call it with hardcoded values as per user's request.
const targetCategoryKey = "valentines_day";
const targetCategoryTitle = "Walentynki";
const targetCategoryDescription = "Zanurz się w świecie miłości i czułości z naszą kolekcją walentynkowych kolorowanek. Odkryj urocze misie, romantyczne serca, aniołki i wiele innych wzorów, które rozgrzeją serce każdego. Idealne do dzielenia się uczuciami i kreatywnego spędzania czasu.";

generateContentJson(targetCategoryKey, targetCategoryTitle, targetCategoryDescription)
  .catch(console.error);
