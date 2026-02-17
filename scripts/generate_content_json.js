import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

function createSlug(text) {
  return text
    .toString()
    .replace(/ł/g, 'l')
    .replace(/Ł/g, 'l')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const descriptionsJsonPath = path.join(projectRoot, 'private/assets/to_process/descriptions.json');
const assetsJsonPath = path.join(projectRoot, 'src/assets.json');
const contentDir = path.join(projectRoot, 'src/content/kolorowanki');

export async function syncAllContentJsons() {
  const assets = JSON.parse(fs.readFileSync(assetsJsonPath, 'utf8'));
  const descriptions = fs.existsSync(descriptionsJsonPath) 
    ? JSON.parse(fs.readFileSync(descriptionsJsonPath, 'utf8')) 
    : [];

  for (const categoryKey of Object.keys(assets)) {
    const categoryData = assets[categoryKey];
    // Technical key is the filename
    const contentFilePath = path.join(contentDir, `${categoryKey}.json`);

    let contentData = {
      category_slug: createSlug(categoryData.title_key || categoryKey),
      category_title: categoryData.title_key || categoryKey,
      category_description: categoryData.description || "",
      asset_key: categoryKey,
      images: []
    };

    if (fs.existsSync(contentFilePath)) {
      contentData = JSON.parse(fs.readFileSync(contentFilePath, 'utf8'));
      contentData.asset_key = categoryKey;
    }

    const existingKeys = new Set(contentData.images.map(img => img.key));
    let addedCount = 0;

    for (const item of categoryData.items) {
      if (!existingKeys.has(item.key)) {
        const descObj = descriptions.find(d => d.category === categoryKey && d.filename === item.key);
        let description = descObj?.description || item.description || "";
        if (description.endsWith('.')) description = description.slice(0, -1);
        
        const title = description ? (description.charAt(0).toUpperCase() + description.slice(1)) : item.key;

        contentData.images.push({
          key: item.key,
          slug: createSlug(title),
          title: title,
          description: description
        });
        addedCount++;
      }
    }

    fs.writeFileSync(contentFilePath, JSON.stringify(contentData, null, 2), 'utf8');
    if (addedCount > 0) {
      console.log(`Updated ${categoryKey}.json: added ${addedCount} new images.`);
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  syncAllContentJsons().catch(console.error);
}
