import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import SVGtoPDF from "svg-to-pdfkit";
import QRCode from "qrcode";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

// =================================================================
// ============== KONFIGURACJA STOPKI PDF ==========================
// =================================================================

// --- 1. Ogólny Układ Stopki ---
const FOOTER_AREA_HEIGHT = 90;
const PAGE_MARGIN = 40;
// Odstęp całej prawej sekcji ([Logo][Tekst][QR]) od góry obszaru stopki
const RIGHT_SECTION_TOP_Y_OFFSET = 15;
// Poziomy odstęp między elementami na prawej stronie
const RIGHT_SECTION_SPACING = 10;

// --- 2. Sekcja "Artysta" (lewa strona) ---
const ARTIST_FONT_SIZE = 12;
// Odstęp pionowy tekstu "Artysta:" od góry obszaru stopki
const ARTIST_Y_OFFSET = 30;

// --- 3. Logo ---
const LOGO_HEIGHT = 45;
const LOGO_PATH = "public/assets/logo-128x128.png";

// --- 4. Blok Tekstowy ("Pobierz więcej na" i "zamaluj.pl") ---
const INFO_TEXT_FONT_SIZE = 10;
const URL_TEXT_FONT_SIZE = 11;
// Odstęp pionowy bloku tekstowego od góry prawej sekcji
const TEXT_BLOCK_Y_OFFSET = 8;
// Szerokość całego bloku tekstowego
const TEXT_BLOCK_WIDTH = 110;
// Odstęp między linią "Pobierz więcej" a "zamaluj.pl"
const TEXT_LINE_SPACING = 12;

// --- 5. Kod QR ---
const QR_CODE_SIZE = 45;

// =================================================================
// ============== LOGIKA SKRYPTU (NIE ZMIENIAĆ) ====================
// =================================================================

const A4_WIDTH_POINTS = 595.28;
const A4_HEIGHT_POINTS = 841.89;
const LINE_Y = A4_HEIGHT_POINTS - FOOTER_AREA_HEIGHT;
const CONTENT_HEIGHT = LINE_Y - PAGE_MARGIN - 10;

function addFooter(doc, qrCodeDataUrl) {
  const fontRegular = path.join(projectRoot, "public/fonts/Inter-Regular.ttf");
  const fontBold = path.join(projectRoot, "public/fonts/Inter-Bold.ttf");

  doc
    .save()
    .moveTo(PAGE_MARGIN, LINE_Y)
    .lineTo(A4_WIDTH_POINTS - PAGE_MARGIN, LINE_Y)
    .lineWidth(1)
    .strokeColor("#cccccc")
    .stroke()
    .restore();

  const leftTextY = LINE_Y + ARTIST_Y_OFFSET;
  doc
    .fontSize(ARTIST_FONT_SIZE)
    .font(fontRegular)
    .fillColor("#444444")
    .text("Artysta:", PAGE_MARGIN, leftTextY, { lineBreak: false });

  doc
    .save()
    .moveTo(PAGE_MARGIN + 50, leftTextY + ARTIST_FONT_SIZE)
    .lineTo(PAGE_MARGIN + 200, leftTextY + 10)
    .lineWidth(0.5)
    .dash(1, { space: 3 })
    .strokeColor("#999999")
    .stroke()
    .restore();

  const rightSectionTopY = LINE_Y + RIGHT_SECTION_TOP_Y_OFFSET;
  const logoPath = path.join(projectRoot, LOGO_PATH);

  const qrX = A4_WIDTH_POINTS - PAGE_MARGIN - QR_CODE_SIZE;
  try {
    doc.image(qrCodeDataUrl, qrX, rightSectionTopY, { width: QR_CODE_SIZE });
  } catch (e) {
    console.error("Could not generate or place QR Code.", e);
  }

  const textBlockX = qrX - TEXT_BLOCK_WIDTH - RIGHT_SECTION_SPACING;
  const textBlockY = rightSectionTopY + TEXT_BLOCK_Y_OFFSET;

  doc
    .fontSize(INFO_TEXT_FONT_SIZE)
    .font(fontRegular)
    .fillColor("#444444")
    .text("Pobierz więcej na:", textBlockX, textBlockY, {
      width: TEXT_BLOCK_WIDTH,
      align: "center",
    });

  doc
    .fontSize(URL_TEXT_FONT_SIZE)
    .font(fontBold)
    .fillColor("#000000")
    .link(
      textBlockX,
      textBlockY + TEXT_LINE_SPACING,
      TEXT_BLOCK_WIDTH,
      10,
      "https://zamaluj.pl",
    )
    .text("zamaluj.pl", textBlockX, textBlockY + TEXT_LINE_SPACING, {
      width: TEXT_BLOCK_WIDTH,
      align: "center",
    });

  const logoX = textBlockX - LOGO_HEIGHT - RIGHT_SECTION_SPACING;
  if (fs.existsSync(logoPath)) {
    try {
      doc.image(logoPath, logoX, rightSectionTopY, { height: LOGO_HEIGHT });
    } catch (e) {
      console.log("Could not place logo file:", e.message);
    }
  } else {
    console.log(`Logo file not found at: ${logoPath}`);
  }
}

async function convertSvgToPdf(svgFilePath) {
  if (!fs.existsSync(svgFilePath)) {
    throw new Error(`Error: SVG file not found at ${svgFilePath}`);
  }

  if (!svgFilePath.toLowerCase().endsWith(".svg")) {
    throw new Error(
      `Error: Input file must be an SVG. Received: ${svgFilePath}`,
    );
  }

  const svgContent = fs.readFileSync(svgFilePath, "utf8");
  const outputPdfPath = svgFilePath.replace(/\.svg$/i, ".pdf");
  const qrCodeDataUrl = await QRCode.toDataURL(
    "https://zamaluj.pl/?utm_source=pdf_qr",
    {
      errorCorrectionLevel: "H",
      margin: 1,
    },
  );

  const doc = new PDFDocument({
    size: "A4",
    margin: PAGE_MARGIN,
  });

  const stream = fs.createWriteStream(outputPdfPath);
  doc.pipe(stream);

  SVGtoPDF(doc, svgContent, PAGE_MARGIN, PAGE_MARGIN, {
    width: A4_WIDTH_POINTS - PAGE_MARGIN * 2,
    height: CONTENT_HEIGHT,
    preserveAspectRatio: "xMidYMid meet",
    assumePt: true,
  });

  addFooter(doc, qrCodeDataUrl);

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on("finish", () => {
      console.log(`Successfully converted ${svgFilePath} to ${outputPdfPath}`);
      resolve(outputPdfPath);
    });
    stream.on("error", reject);
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const svgFilePath = process.argv[2];

  if (!svgFilePath) {
    console.error("Usage: node scripts/svg_to_pdf.js <path_to_input.svg>");
    process.exit(1);
  }

  convertSvgToPdf(svgFilePath).catch((err) => {
    console.error(
      "An error occurred during SVG to PDF conversion:",
      err.message,
    );
    process.exit(1);
  });
}
