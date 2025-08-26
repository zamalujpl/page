import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const projectRoot = path.resolve(__dirname, "..");
const toProcessDir = path.join(projectRoot, "public/assets/to_process");
const assetsJsonPath = path.join(projectRoot, "src/assets.json");
const descriptionsPath = path.join(toProcessDir, "descriptions.json");
const assetsBaseDir = path.join(projectRoot, "public/assets");

// Read descriptions
if (!fs.existsSync(descriptionsPath)) {
  console.error("descriptions.json not found in to_process directory.");
  process.exit(1);
}
const descriptions = JSON.parse(fs.readFileSync(descriptionsPath, "utf8"));

// Helper: get description for filename
function getDescription(category, filename) {
  return descriptions.find(
    (desc) => desc.category === category && desc.filename === filename,
  );
}

// Read all PNG files
if (!fs.existsSync(toProcessDir)) {
  console.error("to_process directory not found.");
  process.exit(1);
}
const files = fs.readdirSync(toProcessDir).filter((f) => f.endsWith(".png"));

if (!fs.existsSync(assetsJsonPath)) {
  console.error("assets.json not found in src directory.");
  process.exit(1);
}
let assetsJson = JSON.parse(fs.readFileSync(assetsJsonPath, "utf8"));

// Process each file
files.forEach((file) => {
  // Parse category and filename
  const match = file.match(/^([a-zA-Z0-9_]+)__([a-zA-Z0-9_]+)\.png$/);
  if (!match) {
    console.warn(`Skipping file with unexpected name: ${file}`);
    return;
  }
  const category = match[1];
  const filename = match[2];

  // Find description
  const descObj = getDescription(category, filename);
  if (!descObj) {
    console.warn(`No description found for ${category}__${filename}`);
    return;
  }

  // Ensure category folder exists
  const categoryDir = path.join(assetsBaseDir, category);
  if (!fs.existsSync(categoryDir)) {
    fs.mkdirSync(categoryDir, { recursive: true });
  }

  // Move file
  const srcPath = path.join(toProcessDir, file);
  const destPath = path.join(categoryDir, `${filename}.png`);
  fs.renameSync(srcPath, destPath);

  // Add to assets.json
  if (!assetsJson[category]) {
    assetsJson[category] = {
      title_key: category.charAt(0).toUpperCase() + category.slice(1),
      description: "",
      header: "",
      items: [],
    };
  }
  assetsJson[category].items.push({
    key: filename,
    file: `assets/${category}/${filename}.png`,
    description: descObj.description,
  });
});

// Write updated assets.json
fs.writeFileSync(assetsJsonPath, JSON.stringify(assetsJson, null, 2), "utf8");

console.log("Processing complete!");
