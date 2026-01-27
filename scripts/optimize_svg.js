
import fs from 'fs/promises';
import path from 'path';
import { Parser, Builder } from 'xml2js';

const parser = new Parser({ explicitArray: false, mergeAttrs: true });
const builder = new Builder({ headless: true });

async function getAssetsData() {
  const assetsPath = path.join(process.cwd(), 'src', 'assets.json');
  const assetsData = await fs.readFile(assetsPath, 'utf-8');
  return JSON.parse(assetsData);
}

async function getAllCategoryContents(categories) {
  const categoryContents = {};
  for (const category of categories) {
    const categoryPath = path.join(process.cwd(), 'src', 'content', 'kolorowanki', `${category}.json`);
    try {
      const categoryData = await fs.readFile(categoryPath, 'utf-8');
      categoryContents[category] = JSON.parse(categoryData);
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.warn(`No content file found for category: ${category}`);
      } else {
        console.error(`Error reading content file for category ${category}:`, error);
      }
    }
  }
  return categoryContents;
}

async function* getSvgFiles(dir) {
  const dirents = await fs.readdir(dir, { withFileTypes: true });
  for (const dirent of dirents) {
    const res = path.resolve(dir, dirent.name);
    if (dirent.isDirectory()) {
      yield* getSvgFiles(res);
    } else if (res.endsWith('.svg')) {
      yield res;
    }
  }
}

function generateTitleFromFilename(filename) {
  const basename = path.basename(filename, '.svg');
  return basename
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

async function processSvgFile(filePath, assetsData, categoryContents) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    const result = await parser.parseStringPromise(data);

    if (!result.svg) {
      console.log(`Skipping non-SVG file: ${filePath}`);
      return;
    }

    const pathParts = filePath.split(path.sep);
    const fileName = path.basename(filePath, '.svg');
    const categoryDir = pathParts[pathParts.length - 2]; // e.g., 'animals'

    let finalTitle = generateTitleFromFilename(filePath);
    let finalDescription = finalTitle; // Default to title

    const assetCategory = assetsData[categoryDir];

    if (assetCategory) {
      const assetItem = assetCategory.items.find(item => item.key === fileName);
      if (assetItem) {
        const categoryContent = categoryContents[categoryDir];
        if (categoryContent) {
          const imageContent = categoryContent.images.find(img => img.key === fileName);
          if (imageContent) {
            finalTitle = imageContent.title;
            finalDescription = imageContent.description;
          } else {
            console.warn(`No image content found for ${fileName} in ${categoryDir} content file. Using generated title/description.`);
          }
        } else {
          console.warn(`No category content found for ${categoryDir}. Using generated title/description.`);
        }
      } else {
        console.warn(`No asset item found for ${fileName} in assets.json for category ${categoryDir}. Using generated title/description.`);
      }
    } else {
      console.warn(`No asset category found for ${categoryDir} in assets.json. Using generated title/description.`);
    }

    // Ensure title and desc are present
    if (!result.svg.title) {
      result.svg.title = finalTitle;
      console.log(`Added title "${finalTitle}" to ${filePath}`);
    } else if (result.svg.title !== finalTitle) {
      // If title exists but is different, update it
      // This is a decision point: overwrite or keep existing? For SEO, overwriting might be better.
      result.svg.title = finalTitle;
      console.log(`Updated title to "${finalTitle}" in ${filePath}`);
    }

    if (!result.svg.desc) {
      result.svg.desc = finalDescription;
      console.log(`Added description "${finalDescription}" to ${filePath}`);
    } else if (result.svg.desc !== finalDescription) {
      // If description exists but is different, update it
      result.svg.desc = finalDescription;
      console.log(`Updated description to "${finalDescription}" in ${filePath}`);
    }
    
    const xml = builder.buildObject(result);
    await fs.writeFile(filePath, xml);

  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
  }
}

(async () => {
  const assetsData = await getAssetsData();
  const categoryNames = Object.keys(assetsData);
  const categoryContents = await getAllCategoryContents(categoryNames);

  const assetsDir = path.join(process.cwd(), 'public/assets');
  for await (const file of getSvgFiles(assetsDir)) {
    await processSvgFile(file, assetsData, categoryContents);
  }
  console.log('SVG optimization complete.');
})();
