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

const contentDir = path.join(projectRoot, 'src/content/kolorowanki');
const redirectsPath = path.join(projectRoot, 'src/redirects.json');

export function generateRedirects() {
  const redirects = {};
  const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.json'));

  for (const file of files) {
    const categoryKey = file.replace('.json', '');
    const data = JSON.parse(fs.readFileSync(path.join(contentDir, file), 'utf8'));
    const categorySlug = data.category_slug;

    // 1. Redirect category index if technically different
    if (categoryKey !== categorySlug) {
      redirects[`/${categoryKey}/`] = `/${categorySlug}/`;
    }

    // 2. Redirect each image if technically different
    if (data.images) {
      for (const img of data.images) {
        const oldUrl = `/${categoryKey}/${img.key}/`;
        const newUrl = `/${categorySlug}/${img.slug}/`;
        
        if (oldUrl !== newUrl) {
          redirects[oldUrl] = newUrl;
        }
      }
    }
  }

  fs.writeFileSync(redirectsPath, JSON.stringify(redirects, null, 2), 'utf8');
  console.log(`Generated ${Object.keys(redirects).length} SEO redirects in src/redirects.json`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  generateRedirects();
}
