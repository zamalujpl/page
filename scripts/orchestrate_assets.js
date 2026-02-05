/**
 * 4) Move SVGs to public/assets/{category}/{filename}.svg and update src/assets.json
 * 5) Convert each new SVG to a PDF with a footer (uses scripts/svg_to_pdf.js)
 * 6) Convert each new SVG to a WEBP for web use (uses scripts/svg_to_webp.js)
 *
 * Assumptions:
 * - Filenames follow pattern: {category}__{key}.png (letters, numbers, underscores)
 * - Optional descriptions can be provided in private/assets/to_process/descriptions.json with schema:
 *   [{ "category": "animals", "filename": "cat", "description": "..." }, ...]
 * - Requires ImageMagick `convert` and `potrace` (used by scripts/png_to_svg.sh)
 *
 * Usage:
 *   node scripts/orchestrate_assets.js
 */

import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import os from "os";
import { spawn } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

// Paths
const downloadsDir = path.join(os.homedir(), "Downloads");
const toProcessDir = path.join(projectRoot, "private/assets/to_process");
const publicAssetsDir = path.join(projectRoot, "public/assets");
const assetsJsonPath = path.join(projectRoot, "src/assets.json");
const descriptionsJsonPath = path.join(toProcessDir, "descriptions.json");

// Regex to match required filename format
const PNG_NAME_REGEX = /^([A-Za-z0-9_]+)__([A-Za-z0-9_]+)\.png$/i;

// Util: run a command with args, collect output
function runCmd(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      stdio: ["ignore", "pipe", "pipe"],
      ...opts,
    });
    let out = "";
    let err = "";
    child.stdout.on("data", (d) => (out += d.toString()));
    child.stderr.on("data", (d) => (err += d.toString()));
    child.on("close", (code) => {
      if (code === 0) resolve({ stdout: out, stderr: err, code });
      else reject(new Error(`${cmd} ${args.join(" ")} failed (${code}): ${err || out}`));
    });
  });
}

async function ensureDir(dir) {
  await fsp.mkdir(dir, { recursive: true });
}

async function moveFileRobust(src, dest) {
  await ensureDir(path.dirname(dest));
  try {
    await fsp.rename(src, dest);
  } catch (e) {
    // Cross-device move fallback
    if (e.code === "EXDEV") {
      await fsp.copyFile(src, dest);
      await fsp.unlink(src);
    } else {
      throw e;
    }
  }
}

function capitalizeFirst(s) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

async function readJsonIfExists(p, fallback) {
  try {
    const data = await fsp.readFile(p, "utf8");
    return JSON.parse(data);
  } catch {
    return fallback;
  }
}

function findDescription(descriptions, category, filename) {
  if (!Array.isArray(descriptions)) return "";
  const hit = descriptions.find(
    (d) => d.category === category && d.filename === filename,
  );
  return hit?.description ?? "";
}

async function step1_movePngsFromDownloads() {
  await ensureDir(toProcessDir);
  const entries = await fsp.readdir(downloadsDir, { withFileTypes: true });
  const candidates = entries
    .filter((e) => e.isFile())
    .map((e) => e.name)
    .filter((n) => PNG_NAME_REGEX.test(n));
  if (candidates.length === 0) {
    console.log("Step 1: No matching PNGs found in ~/Downloads.");
    return [];
  }
  const moved = [];
  for (const name of candidates) {
    const src = path.join(downloadsDir, name);
    const dest = path.join(toProcessDir, name);
    await moveFileRobust(src, dest);
    moved.push(dest);
  }
  console.log(`Step 1: Moved ${moved.length} PNG(s) to ${path.relative(projectRoot, toProcessDir)}`);
  return moved;
}

async function step2_convertPngToSvg() {
  // Use existing script: scripts/png_to_svg.sh -d private/assets/to_process
  await ensureDir(toProcessDir);
  console.log("Step 2: Converting PNGs to SVG via scripts/png_to_svg.sh...");
  const { stdout } = await runCmd("bash", ["scripts/png_to_svg.sh", "-d", toProcessDir], {
    cwd: projectRoot,
  });
  if (stdout.trim()) console.log(stdout.trim());
}

async function step3_blackAndWhiteSvgsInToProcess() {
  // Use existing script: scripts/svg_tools/black_white_svg.js private/assets/to_process
  console.log("Step 3: Converting SVGs to black & white in private/assets/to_process...");
  const { stdout } = await runCmd("node", ["scripts/svg_tools/black_white_svg.js", toProcessDir], {
    cwd: projectRoot,
  });
  if (stdout.trim()) console.log(stdout.trim());
}

async function step4_processAndMoveSvgs() {
  console.log("Step 4: Moving SVGs, updating assets.json, and creating derivatives (PDF, WEBP)...");
  await ensureDir(publicAssetsDir);
  const descriptions = await readJsonIfExists(descriptionsJsonPath, []);
  const assets = await readJsonIfExists(assetsJsonPath, {});
  const toProcessEntries = await fsp.readdir(toProcessDir, { withFileTypes: true });
  const svgNames = toProcessEntries
    .filter((e) => e.isFile())
    .map((e) => e.name)
    .filter((n) => n.toLowerCase().endsWith(".svg"))
    .filter((n) => {
      const base = n.replace(/\.svg$/i, ".png");
      return PNG_NAME_REGEX.test(base);
    });

  if (svgNames.length === 0) {
    console.log("Step 4: No SVGs to process.");
    return;
  }

  let processedCount = 0;

  for (const svgName of svgNames) {
    const basePng = svgName.replace(/\.svg$/i, ".png");
    const match = basePng.match(PNG_NAME_REGEX);
    if (!match) continue;
    const category = match[1];
    const key = match[2];

    // Move SVG to public/assets/{category}/{key}.svg
    const srcSvgPath = path.join(toProcessDir, svgName);
    const categoryDir = path.join(publicAssetsDir, category);
    const destSvgPath = path.join(categoryDir, `${key}.svg`);
    await moveFileRobust(srcSvgPath, destSvgPath);
    processedCount++;

    // --- Step 5 (integrated): Convert this SVG to PDF ---
    console.log(`  - Converting ${path.relative(projectRoot, destSvgPath)} to PDF...`);
    try {
        await runCmd('npm', ['run', 'svg-to-pdf', destSvgPath], { cwd: projectRoot });
    } catch (pdfErr) {
        console.error(`  - FAILED to convert ${svgName} to PDF. Continuing...`, pdfErr.message);
    }
    
    // --- Step 6 (integrated): Convert this SVG to WEBP ---
    console.log(`  - Converting ${path.relative(projectRoot, destSvgPath)} to WEBP...`);
    try {
        await runCmd('npm', ['run', 'svg-to-webp', destSvgPath], { cwd: projectRoot });
    } catch (webpErr) {
        console.error(`  - FAILED to convert ${svgName} to WEBP. Continuing...`, webpErr.message);
    }

    // Update assets.json
    if (!assets[category]) {
      assets[category] = {
        title_key: capitalizeFirst(category),
        description: "",
        header: "",
        items: [],
      };
    }
    const items = assets[category].items || [];
    let item = items.find((it) => it.key === key);
    if (!item) {
      item = { 
        key, 
        file: `assets/${category}/${key}.svg`, 
        description: "",
        webp_large: `assets/${category}/${key}-1200.webp`,
        webp_thumb: `assets/${category}/${key}-350.webp`,
        pdf_file: `assets/${category}/${key}.pdf`,
      };
      items.push(item);
    } else {
      item.file = `assets/${category}/${key}.svg`;
      item.webp_large = `assets/${category}/${key}-1200.webp`;
      item.webp_thumb = `assets/${category}/${key}-350.webp`;
      item.pdf_file = `assets/${category}/${key}.pdf`;
    }
    // Apply description if available and not already present
    if (!item.description) {
      item.description = findDescription(descriptions, category, key);
    }
    assets[category].items = items;
  }

  await fsp.writeFile(assetsJsonPath, JSON.stringify(assets, null, 2), "utf8");
  console.log(
    `Step 4, 5, & 6: Processed ${processedCount} SVG(s) (moved, created PDFs & WEBPs, and updated assets.json).`,
  );
}

async function main() {
  try {
    console.log("Orchestration started.");
    const moved = await step1_movePngsFromDownloads();

    // Proceed regardless of whether step1 found files, to handle existing to_process content
    await step2_convertPngToSvg();
    await step3_blackAndWhiteSvgsInToProcess();
    await step4_processAndMoveSvgs();

    console.log("All steps completed successfully.");
  } catch (err) {
    console.error("Orchestration failed:", err.message || err);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
