/**
 * Script to recursively check SVG files in a given directory and ensure
 * all colors are only black (#000, #000000, rgb(0,0,0)) or white (#fff, #ffffff, rgb(255,255,255)).
 * Any other detected color literal is replaced with white (#fff).
 *
 * Usage:
 *   node scripts/svg_tools/black_white_svg.js <directory>
 *
 * Notes:
 * - This file is an ES module (project has "type": "module").
 * - It was converted from a CommonJS version that used require().
 */

import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Regex to match color values in SVG attributes and styles.
// Matches:
//   - #rgb or #rrggbb
//   - rgb(r,g,b) with optional spaces
const COLOR_REGEX =
  /(#(?:[0-9a-fA-F]{3}){1,2}|rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\))/gi;

// Acceptable black/white colors (normalized forms also considered)
const ALLOWED_COLORS = new Set([
  "#000",
  "#000000",
  "rgb(0,0,0)",
  "#fff",
  "#ffffff",
  "rgb(255,255,255)",
]);

function normalizeColor(color) {
  let c = color.toLowerCase();
  if (c.startsWith("rgb")) {
    c = c.replace(/\s+/g, "");
  }
  return c;
}

/**
 * Replace non black/white colors with white (#fff)
 * @param {string} svgContent
 * @returns {string}
 */
export function fixSvgColors(svgContent) {
  return svgContent.replace(COLOR_REGEX, (match) => {
    const norm = normalizeColor(match);
    if (ALLOWED_COLORS.has(norm)) return match;
    return "#fff";
  });
}

/**
 * Recursively collect SVG file paths
 * @param {string} dir
 * @returns {Promise<string[]>}
 */
async function findSvgFiles(dir) {
  const results = [];
  async function walk(current) {
    const entries = await fsp.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".svg")) {
        results.push(full);
      }
    }
  }
  await walk(dir);
  return results;
}

async function processFile(filePath) {
  const original = await fsp.readFile(filePath, "utf8");
  const fixed = fixSvgColors(original);
  if (fixed !== original) {
    await fsp.writeFile(filePath, fixed, "utf8");
    console.log(`Fixed colors in: ${filePath}`);
    return true;
  }
  return false;
}

async function main() {
  const targetDir = process.argv[2];
  if (!targetDir) {
    console.error(
      "Usage: node scripts/svg_tools/black_white_svg.js <directory>",
    );
    process.exitCode = 1;
    return;
  }

  const absDir = path.resolve(targetDir);
  let stat;
  try {
    stat = await fsp.stat(absDir);
  } catch {
    console.error(`Directory does not exist: ${absDir}`);
    process.exitCode = 1;
    return;
  }
  if (!stat.isDirectory()) {
    console.error(`Not a directory: ${absDir}`);
    process.exitCode = 1;
    return;
  }

  const svgFiles = await findSvgFiles(absDir);
  let changedCount = 0;

  // Process sequentially to avoid overwhelming FS (SVG count typically small)
  for (const file of svgFiles) {
    const changed = await processFile(file);
    if (changed) changedCount++;
  }

  console.log(
    `Checked ${svgFiles.length} SVG files. Fixed ${changedCount} files.`,
  );
}

// Detect direct execution (similar to require.main === module in CommonJS)
if (import.meta.url === `file://${process.argv[1]}`) {
  // Wrap in top-level await pattern via immediately invoked async
  (async () => {
    try {
      await main();
    } catch (err) {
      console.error("Error:", err?.message || err);
      process.exitCode = 1;
    }
  })();
}
