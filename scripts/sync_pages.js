/**
 * sync_pages.js
 * Syncs Astro page files in src/pages/ with assets.json.
 * - Creates/removes category folders in src/pages/
 * - Creates/removes individual image Astro pages in src/pages/{category}/{image}.astro
 * - Creates/updates category index pages in src/pages/{category}/index.astro
 *
 * Usage: node scripts/sync_pages.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ASSETS_JSON = path.resolve(__dirname, "../src/assets.json");
const PAGES_DIR = path.resolve(__dirname, "../src/pages");

function readAssetsData() {
  return JSON.parse(fs.readFileSync(ASSETS_JSON, "utf-8"));
}

function ensureDirSync(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getExistingCategories() {
  return fs.readdirSync(PAGES_DIR).filter((entry) => {
    const fullPath = path.join(PAGES_DIR, entry);
    return fs.statSync(fullPath).isDirectory();
  });
}

function getExistingImagePages(category) {
  const categoryDir = path.join(PAGES_DIR, category);
  if (!fs.existsSync(categoryDir)) return [];
  return fs
    .readdirSync(categoryDir)
    .filter((f) => f.endsWith(".astro") && f !== "index.astro")
    .map((f) => path.basename(f, ".astro"));
}

function createCategoryIndexPage(category, title, items) {
  const categoryDir = path.join(PAGES_DIR, category);
  ensureDirSync(categoryDir);
  const indexPath = path.join(categoryDir, "index.astro");
  const content = `---
import assets from '../../assets.json';
const cat = assets["${category}"];
---
<html lang="en">
  <head>
    <title>${title}</title>
  </head>
  <body>
    <h1>${title}</h1>
    <div>
      ${items
        .map(
          (item) => `
        <div>
          <a href="/${category}/${item.key}">
            <img src="/${item.file}" alt="${item.key}" style="max-width:180px;max-height:180px;" />
            <div>${item.key}</div>
          </a>
        </div>
        `,
        )
        .join("\n")}
    </div>
  </body>
</html>
`;
  fs.writeFileSync(indexPath, content, "utf-8");
}

function createImagePage(category, imageKey, imageFile) {
  const categoryDir = path.join(PAGES_DIR, category);
  ensureDirSync(categoryDir);
  const imagePagePath = path.join(categoryDir, `${imageKey}.astro`);
  const title = imageKey
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
  const content = `---
const image = {
  key: "${imageKey}",
  file: "${imageFile}",
  category: "${category}"
};
---
<html lang="en">
  <head>
    <title>${title}</title>
  </head>
  <body>
    <h1>${title}</h1>
    <img src="/${imageFile}" alt="${imageKey}" style="max-width:400px;max-height:400px;" />
    <div>
      <a href="/${category}">Back to ${category}</a>
    </div>
  </body>
</html>
`;
  fs.writeFileSync(imagePagePath, content, "utf-8");
}

function deleteCategoryDir(category) {
  const categoryDir = path.join(PAGES_DIR, category);
  if (fs.existsSync(categoryDir)) {
    fs.rmSync(categoryDir, { recursive: true, force: true });
    console.log(`Deleted category directory: src/pages/${category}`);
  }
}

function deleteImagePage(category, imageKey) {
  const imagePagePath = path.join(PAGES_DIR, category, `${imageKey}.astro`);
  if (fs.existsSync(imagePagePath)) {
    fs.unlinkSync(imagePagePath);
    console.log(`Deleted image page: src/pages/${category}/${imageKey}.astro`);
  }
}

function main() {
  const assetsData = readAssetsData();
  const yamlCategories = Object.keys(assetsData);
  const existingCategories = getExistingCategories();

  // Create/update category folders and index pages
  yamlCategories.forEach((category) => {
    const catData = assetsData[category];
    const title = catData.title_key || category;
    ensureDirSync(path.join(PAGES_DIR, category));
    createCategoryIndexPage(category, title, catData.items);

    // Sync image pages
    const existingImagePages = getExistingImagePages(category);
    const yamlImages = catData.items.map((item) => item.key);

    // Create missing image pages
    yamlImages.forEach((imageKey) => {
      if (!existingImagePages.includes(imageKey)) {
        const imageData = catData.items.find((item) => item.key === imageKey);
        if (imageData) {
          createImagePage(category, imageKey, imageData.file);
          console.log(
            `Created image page: src/pages/${category}/${imageKey}.astro`,
          );
        }
      }
    });

    // Delete extra image pages
    existingImagePages
      .filter((imageKey) => !yamlImages.includes(imageKey))
      .forEach((imageKey) => deleteImagePage(category, imageKey));
  });

  // Delete extra category directories
  existingCategories
    .filter((category) => !yamlCategories.includes(category))
    .forEach((category) => deleteCategoryDir(category));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
