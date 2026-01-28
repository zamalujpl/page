const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const assetsPath = path.join(__dirname, '..', 'src', 'assets.json');
const baseDir = path.join(__dirname, '..');
const kolorowankiDir = path.join(baseDir, 'src', 'content', 'kolorowanki');
const updateScriptPath = path.join(__dirname, 'recreate_svg_title_description.cjs');

try {
    const assets = JSON.parse(fs.readFileSync(assetsPath, 'utf8'));

    for (const category in assets) {
        if (assets.hasOwnProperty(category)) {
            console.log(`Processing category: ${category}`);

            const categoryJsonPath = path.join(kolorowankiDir, `${category}.json`);
            if (!fs.existsSync(categoryJsonPath)) {
                console.warn(`Warning: Category JSON not found for '${category}' at ${categoryJsonPath}. Skipping.`);
                continue;
            }

            const categoryData = JSON.parse(fs.readFileSync(categoryJsonPath, 'utf8'));
            const titlesAndDescriptions = new Map(
                categoryData.images.map(image => [image.key, { title: image.title, description: image.description }])
            );

            const categoryItems = assets[category].items;
            if (categoryItems) {
                for (const item of categoryItems) {
                    const svgPath = path.join(baseDir, 'public', item.file);
                    const details = titlesAndDescriptions.get(item.key);

                    if (details && fs.existsSync(svgPath)) {
                        const { title, description } = details;
                        const command = `node "${updateScriptPath}" "${svgPath}" "${title}" "${description}"`;

                        exec(command, (error, stdout, stderr) => {
                            if (error) {
                                console.error(`Error updating ${svgPath}: ${error.message}`);
                                return;
                            }
                            if (stderr) {
                                console.error(`Error output for ${svgPath}: ${stderr}`);
                                return;
                            }
                            console.log(stdout.trim());
                        });
                    } else if (!details) {
                        console.warn(`Warning: No title/description found for key '${item.key}' in category '${category}'.`);
                    } else {
                        console.warn(`Warning: SVG file not found at ${svgPath}.`);
                    }
                }
            }
        }
    }
} catch (error) {
    console.error('An error occurred:', error);
    process.exit(1);
}
