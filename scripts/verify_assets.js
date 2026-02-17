import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const assetsJsonPath = path.join(projectRoot, 'src/assets.json');
const contentDir = path.join(projectRoot, 'src/content/kolorowanki');
const publicDir = path.join(projectRoot, 'public');

async function verifyAll() {
    console.log('=== GLOBAL ASSET VERIFICATION STARTED ===\n');

    if (!fs.existsSync(assetsJsonPath)) {
        console.error('CRITICAL: File src/assets.json not found!');
        return;
    }

    let assets;
    try {
        assets = JSON.parse(fs.readFileSync(assetsJsonPath, 'utf8'));
    } catch (e) {
        console.error('CRITICAL: Failed to parse src/assets.json:', e.message);
        return;
    }

    const contentFiles = fs.readdirSync(contentDir).filter(f => f.endsWith('.json'));
    let hasErrors = false;

    // 1. Check if every entry in content/*.json exists in assets.json AND has physical files
    console.log('--- Phase 1: Checking Content (pages) vs Assets (registry & files) ---');
    for (const file of contentFiles) {
        let content;
        try {
            content = JSON.parse(fs.readFileSync(path.join(contentDir, file), 'utf8'));
        } catch (e) {
            console.error(`  [ERROR] Failed to parse ${file}:`, e.message);
            hasErrors = true;
            continue;
        }

        const categoryKey = file.replace('.json', '');
        const assetKey = content.asset_key || categoryKey;
        const assetCategory = assets[assetKey];

        if (!content.images || !Array.isArray(content.images)) continue;

        for (const image of content.images) {
            const assetItem = assetCategory?.items?.find(it => it.key === image.key);

            if (!assetItem) {
                console.warn(`  [MISSING REGISTRY] ${file}: Image key "${image.key}" (slug: ${image.slug}) NOT FOUND in assets.json [category: ${assetKey}]`);
                hasErrors = true;
                continue;
            }

            // Check physical files for this registered item
            const fileKeys = ['file', 'webp_large', 'webp_thumb', 'pdf_file'];
            for (const key of fileKeys) {
                if (assetItem[key]) {
                    const fullPath = path.join(publicDir, assetItem[key]);
                    if (!fs.existsSync(fullPath)) {
                        console.warn(`  [MISSING FILE] ${file}: Physical file for "${image.key}" is missing at: public/${assetItem[key]}`);
                        hasErrors = true;
                    }
                }
            }
        }
    }

    // 2. Check if every entry in assets.json has physical files (orphans detection)
    console.log('\n--- Phase 2: Checking Registry (assets.json) vs Physical Files ---');
    let registryTotal = 0;
    for (const [category, data] of Object.entries(assets)) {
        if (!data.items || !Array.isArray(data.items)) continue;
        for (const item of data.items) {
            registryTotal++;
            const fileKeys = ['file', 'webp_large', 'webp_thumb', 'pdf_file'];
            for (const key of fileKeys) {
                if (item[key]) {
                    const fullPath = path.join(publicDir, item[key]);
                    if (!fs.existsSync(fullPath)) {
                        console.warn(`  [MISSING FILE] Registry category "${category}", key "${item.key}": File public/${item[key]} is missing.`);
                        hasErrors = true;
                    }
                }
            }
        }
    }

    if (!hasErrors) {
        console.log('\n✅ SUCCESS: All content entries are correctly registered and all physical files exist.');
    } else {
        console.warn('\n❌ WARNING: Some inconsistencies were found. See logs above.');
    }

    console.log(`\nVerified ${contentFiles.length} category files and ${registryTotal} registered asset items.`);
    console.log('\n=== GLOBAL ASSET VERIFICATION FINISHED ===');
}

verifyAll().catch(err => {
    console.error('Verification crashed:', err);
    process.exit(1);
});
