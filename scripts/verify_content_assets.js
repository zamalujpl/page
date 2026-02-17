import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const assetsJsonPath = path.join(projectRoot, 'src/assets.json');
const contentDir = path.join(projectRoot, 'src/content/kolorowanki');

function verify() {
  console.log("--- Starting Integrity Verification ---");
  const assets = JSON.parse(fs.readFileSync(assetsJsonPath, 'utf8'));
  let totalErrors = 0;

  for (const categoryKey of Object.keys(assets)) {
    const categoryData = assets[categoryKey];
    
    // 1. Check Files
    categoryData.items.forEach(item => {
      const pathsToCheck = [
        path.join(projectRoot, 'public', item.file),
        path.join(projectRoot, 'public', item.webp_large),
        path.join(projectRoot, 'public', item.pdf_file)
      ];

      pathsToCheck.forEach(p => {
        if (!fs.existsSync(p)) {
          console.error(`[MISSING FILE] Category: ${categoryKey}, Key: ${item.key}, File: ${path.relative(projectRoot, p)}`);
          totalErrors++;
        }
      });
    });

    // 2. Check Content JSON
    const contentFiles = fs.readdirSync(contentDir).filter(f => f.endsWith('.json'));
    let foundContentFile = null;
    
    for (const f of contentFiles) {
      const c = JSON.parse(fs.readFileSync(path.join(contentDir, f), 'utf8'));
      // Match by asset_key (this is the reliable link)
      if (c.asset_key === categoryKey) {
        foundContentFile = f;
        const contentKeys = new Set(c.images.map(img => img.key));
        
        categoryData.items.forEach(item => {
          if (!contentKeys.has(item.key)) {
            console.warn(`[MISSING CONTENT ENTRY] Asset '${item.key}' is in assets.json but NOT in content/${f}`);
            totalErrors++;
          }
        });
        break;
      }
    }

    if (!foundContentFile) {
      // Don't report missing content for empty categories if you prefer, 
      // but if there are items, we definitely need a content file.
      if (categoryData.items.length > 0) {
        console.error(`[MISSING CONTENT FILE] No JSON in content/kolorowanki has asset_key: ${categoryKey}`);
        totalErrors++;
      }
    }
  }

  console.log("---------------------------------------");
  if (totalErrors === 0) {
    console.log("✅ All clear! Assets, files, and content are synchronized.");
  } else {
    console.log(`❌ Found ${totalErrors} issues. Please fix them to avoid website errors.`);
  }
}

verify();
