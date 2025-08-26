/**
 * Script to recursively check SVG files in a given directory.
 * Ensures all colors are only black (#000, #000000, rgb(0,0,0)) or white (#fff, #ffffff, rgb(255,255,255)).
 * Any other color is replaced with white.
 *
 * Usage:
 *   node scripts/svg_tools/black_white_svg.js <directory>
 */

const fs = require("fs");
const path = require("path");

// Regex to match color values in SVG attributes and styles
const COLOR_REGEX =
  /(#(?:[0-9a-fA-F]{3}){1,2}|rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\))/gi;

// Acceptable black/white colors
const ALLOWED_COLORS = [
  "#000",
  "#000000",
  "rgb(0,0,0)",
  "#fff",
  "#ffffff",
  "rgb(255,255,255)",
];

// Normalize color for comparison
function normalizeColor(color) {
  color = color.toLowerCase();
  if (color.startsWith("rgb")) {
    // Remove spaces
    color = color.replace(/\s+/g, "");
  }
  return color;
}

// Replace non-black/white colors with white
function fixSvgColors(svgContent) {
  return svgContent.replace(COLOR_REGEX, (match) => {
    const norm = normalizeColor(match);
    if (ALLOWED_COLORS.includes(norm)) {
      return match;
    }
    // Replace with white
    return "#fff";
  });
}

// Recursively find SVG files
function findSvgFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(findSvgFiles(filePath));
    } else if (file.toLowerCase().endsWith(".svg")) {
      results.push(filePath);
    }
  });
  return results;
}

// Main
function main() {
  const targetDir = process.argv[2];
  if (!targetDir) {
    console.error(
      "Usage: node scripts/svg_tools/black_white_svg.js <directory>",
    );
    process.exit(1);
  }

  const absDir = path.resolve(targetDir);
  if (!fs.existsSync(absDir) || !fs.statSync(absDir).isDirectory()) {
    console.error(`Directory does not exist: ${absDir}`);
    process.exit(1);
  }

  const svgFiles = findSvgFiles(absDir);
  let changedCount = 0;

  svgFiles.forEach((file) => {
    const original = fs.readFileSync(file, "utf8");
    const fixed = fixSvgColors(original);
    if (original !== fixed) {
      fs.writeFileSync(file, fixed, "utf8");
      console.log(`Fixed colors in: ${file}`);
      changedCount++;
    }
  });

  console.log(
    `Checked ${svgFiles.length} SVG files. Fixed ${changedCount} files.`,
  );
}

if (require.main === module) {
  main();
}
