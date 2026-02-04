import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

// =================================================================
// ============== KONFIGURACJA WEBP ================================
// =================================================================

// Szerokość dla dużej wersji obrazka WebP
const WEBP_LARGE_WIDTH = 1200;
// Opcje kompresji dla dużej wersji (bezstratna)
const WEBP_LARGE_OPTIONS = { lossless: true };

// Szerokość dla miniatury obrazka WebP
const WEBP_THUMB_WIDTH = 350;
// Opcje kompresji dla miniatury (bezstratna - można zmienić na stratną z quality np. { quality: 85 } jeśli plik jest za duży)
const WEBP_THUMB_OPTIONS = { lossless: true };

// =================================================================
// ============== LOGIKA SKRYPTU (NIE ZMIENIAĆ) ====================
// =================================================================

/**
 * Converts an SVG file to two WEBP files (large and thumbnail).
 * @param {string} svgFilePath The path to the input SVG file.
 * @returns {Promise<string[]>} A promise that resolves with an array of paths to the generated WEBP files.
 */
async function convertSvgToWebp(svgFilePath) {
    if (!fs.existsSync(svgFilePath)) {
        throw new Error(`Error: SVG file not found at ${svgFilePath}`);
    }

    if (!svgFilePath.toLowerCase().endsWith('.svg')) {
        throw new Error(`Error: Input file must be an SVG. Received: ${svgFilePath}`);
    }

    const baseName = svgFilePath.replace(/\.svg$/i, '');
    const generatedFiles = [];

    // Generate large WEBP
    const outputWebpLargePath = `${baseName}-${WEBP_LARGE_WIDTH}.webp`;
    try {
        await sharp(svgFilePath)
            .resize(WEBP_LARGE_WIDTH)
            .webp(WEBP_LARGE_OPTIONS)
            .toFile(outputWebpLargePath);
        
        console.log(`Successfully converted ${svgFilePath} to ${outputWebpLargePath}`);
        generatedFiles.push(outputWebpLargePath);
    } catch (error) {
        console.error(`Failed to convert large WEBP for ${svgFilePath}: ${error.message}`);
    }

    // Generate thumbnail WEBP
    const outputWebpThumbPath = `${baseName}-${WEBP_THUMB_WIDTH}.webp`;
    try {
        await sharp(svgFilePath)
            .resize(WEBP_THUMB_WIDTH)
            .webp(WEBP_THUMB_OPTIONS)
            .toFile(outputWebpThumbPath);
        
        console.log(`Successfully converted ${svgFilePath} to ${outputWebpThumbPath}`);
        generatedFiles.push(outputWebpThumbPath);
    } catch (error) {
        console.error(`Failed to convert thumbnail WEBP for ${svgFilePath}: ${error.message}`);
    }

    if (generatedFiles.length === 0) {
        throw new Error(`No WEBP files were generated for ${svgFilePath}.`);
    }

    return generatedFiles;
}

// Command-line interface
if (process.argv[1] === __filename) {
    const svgFilePath = process.argv[2];

    if (!svgFilePath) {
        console.error('Usage: node scripts/svg_to_webp.js <path_to_input.svg>');
        process.exit(1);
    }

    convertSvgToWebp(svgFilePath)
        .catch(err => {
            console.error(err.message);
            process.exit(1);
        });
}