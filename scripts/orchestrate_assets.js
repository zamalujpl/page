import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import os from "os";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { syncAllContentJsons } from "./generate_content_json.js";

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

async function step2_checkResolutions() {
  console.log("Step 2: Checking image resolutions...");
  const { stdout } = await runCmd("bash", ["scripts/check_image_resolutions.sh"], { cwd: projectRoot });
  console.log(stdout.trim());
}

async function step3_convertPngToSvg() {
  await ensureDir(toProcessDir);
  console.log("Step 3: Converting PNGs to SVG via scripts/png_to_svg.sh...");
  const { stdout } = await runCmd("bash", ["scripts/png_to_svg.sh", "-d", toProcessDir], {
    cwd: projectRoot,
  });
  if (stdout.trim()) console.log(stdout.trim());
}

async function step4_blackAndWhiteSvgs() {
  console.log("Step 4: Converting SVGs to black & white...");
  const { stdout } = await runCmd("node", ["scripts/svg_tools/black_white_svg.js", toProcessDir], {
    cwd: projectRoot,
  });
  if (stdout.trim()) console.log(stdout.trim());
}

async function step5_processAndMove() {
  console.log("Step 5: Moving SVGs, creating derivatives (PDF, WEBP), and updating assets.json...");
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
    console.log("Step 5: No SVGs to process.");
    return;
  }

  let count = 0;
  for (const svgName of svgNames) {
    const basePng = svgName.replace(/\.svg$/i, ".png");
    const match = basePng.match(PNG_NAME_REGEX);
    if (!match) continue;
    const category = match[1];
    const key = match[2];

    const srcSvgPath = path.join(toProcessDir, svgName);
    const categoryDir = path.join(publicAssetsDir, category);
    const destSvgPath = path.join(categoryDir, `${key}.svg`);
    await moveFileRobust(srcSvgPath, destSvgPath);
    count++;

    // Integrated PDF/WEBP generation
    try { await runCmd('npm', ['run', 'svg-to-pdf', destSvgPath], { cwd: projectRoot }); } catch (e) { console.error(`  - PDF FAIL: ${svgName}`); }
    try { await runCmd('npm', ['run', 'svg-to-webp', destSvgPath], { cwd: projectRoot }); } catch (e) { console.error(`  - WEBP FAIL: ${svgName}`); }

    // Update assets.json
    if (!assets[category]) {
      assets[category] = { title_key: capitalizeFirst(category), description: "", header: "", items: [] };
    }
    const items = assets[category].items || [];
    let item = items.find((it) => it.key === key);
    const itemData = { 
      key, 
      file: `assets/${category}/${key}.svg`, 
      description: item?.description || findDescription(descriptions, category, key),
      webp_large: `assets/${category}/${key}-1200.webp`,
      webp_thumb: `assets/${category}/${key}-350.webp`,
      pdf_file: `assets/${category}/${key}.pdf`,
    };
    if (!item) items.push(itemData);
    else Object.assign(item, itemData);
    assets[category].items = items;
  }

  await fsp.writeFile(assetsJsonPath, JSON.stringify(assets, null, 2), "utf8");
  console.log(`Step 5: Processed ${count} SVG(s).`);
}

async function main() {
  try {
    console.log("Orchestration started.");
    await step1_movePngsFromDownloads();
    await step2_checkResolutions();
    await step3_convertPngToSvg();
    await step4_blackAndWhiteSvgs();
    await step5_processAndMove();

    console.log("Step 6: Synchronizing content JSON files...");
    await syncAllContentJsons();

    console.log("Step 7: Verifying registry integrity...");
    const { stdout: verifyOut } = await runCmd("node", ["scripts/verify_content_assets.js"], { cwd: projectRoot });
    console.log(verifyOut);

    console.log("Step 8: Checking for broken links (Dev server must be running)...");
    const { stdout: linksOut } = await runCmd("bash", ["scripts/check_all_links.sh"], { cwd: projectRoot });
    console.log(linksOut);

    console.log("All steps completed successfully.");
  } catch (err) {
    console.error("Orchestration failed:", err.message || err);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
