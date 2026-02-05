import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const assetsJsonPath = path.join(projectRoot, 'src/assets.json');

async function fixAssetsJsonPdf() {
    console.log('Reading assets.json to add missing pdf_file paths...');
    const assets = JSON.parse(fs.readFileSync(assetsJsonPath, 'utf8'));

    let updatedCount = 0;

    for (const category in assets) {
        if (assets[category].items) {
            for (const item of assets[category].items) {
                if (item.file && item.file.endsWith('.svg') && !item.pdf_file) {
                    item.pdf_file = item.file.replace(/\.svg$/i, '.pdf');
                    updatedCount++;
                    console.log(`- Updated item with PDF path: ${item.key}`);
                }
            }
        }
    }

    if (updatedCount > 0) {
        fs.writeFileSync(assetsJsonPath, JSON.stringify(assets, null, 2), 'utf8');
        console.log(`Successfully updated ${updatedCount} items in assets.json with PDF paths.`);
    } else {
        console.log('No items needed updating in assets.json.');
    }
}

fixAssetsJsonPdf().catch(err => {
    console.error('Failed to fix assets.json for PDFs:', err.message);
});
