
import fs from 'fs/promises';
import path from 'path';
import { Parser, Builder } from 'xml2js';

const parser = new Parser();
const builder = new Builder();

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

async function processSvgFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    const result = await parser.parseStringPromise(data);

    if (!result.svg) {
      console.log(`Skipping non-SVG file: ${filePath}`);
      return;
    }
    
    const titleContent = generateTitleFromFilename(filePath);

    // Add title if missing
    if (!result.svg.title) {
      result.svg.title = [titleContent];
      console.log(`Added title to ${filePath}`);
    }

    // Add description if missing
    if (!result.svg.desc) {
      result.svg.desc = [titleContent]; // Using title as description for now
      console.log(`Added description to ${filePath}`);
    }
    
    const xml = builder.buildObject(result);
    await fs.writeFile(filePath, xml);

  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
  }
}

(async () => {
  const assetsDir = path.join(process.cwd(), 'public/assets');
  for await (const file of getSvgFiles(assetsDir)) {
    await processSvgFile(file);
  }
  console.log('SVG optimization complete.');
})();
