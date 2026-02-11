
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const kolorowankiDir = path.join(__dirname, '../src/content/kolorowanki');
const outputFilePath = path.join(__dirname, '../src/data/image_ids.js');

const imageIds = {};
let currentId = 0; // Fallback in case of hash collision (unlikely but good to have)

const files = fs.readdirSync(kolorowankiDir);
for (const file of files) {
    const filePath = path.join(kolorowankiDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);
    const categoryKey = file.replace('.json', '');

    for (const image of data.images) {
        const idString = `${categoryKey}__${image.key}`;
        const hash = crypto.createHash('sha256').update(idString).digest('hex');
        const imageId = parseInt(hash.substring(0, 8), 16); // Take first 8 chars for a reasonably unique number

        // Ensure uniqueness, though hash collisions are highly unlikely for 8 chars
        // and a limited number of images
        if (imageIds[idString] && imageIds[idString] !== imageId) {
            console.warn(`Hash collision detected for ${idString}. Using incremental ID.`);
            imageIds[idString] = currentId++;
        } else {
            imageIds[idString] = imageId;
        }
    }
}

const fileContent = `export default ${JSON.stringify(imageIds, null, 2)};`;
fs.writeFileSync(outputFilePath, fileContent, 'utf-8');
console.log(`Generated image IDs to ${outputFilePath}`);
