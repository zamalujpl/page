const fs = require('fs');
const path = require('path');

const filePath = process.argv[2];
const newTitle = process.argv[3];
const newDescription = process.argv[4];

if (!filePath || !newTitle || !newDescription) {
    console.error('Usage: node recreate_svg_title_description.cjs <filePath> "<newTitle>" "<newDescription>"');
    process.exit(1);
}

try {
    let svgContent = fs.readFileSync(filePath, 'utf8');

    // Regex to find and replace the content within <title> and <desc> tags
    // This assumes the title and desc tags are at the end, just before </svg>,
    // and have a simple content structure. It also handles potential leading/trailing whitespace.
    const titleRegex = /<title>[\s\S]*?<\/title>/;
    const descRegex = /<desc>[\s\S]*?<\/desc>/;

    if (svgContent.match(titleRegex)) {
        svgContent = svgContent.replace(titleRegex, `<title>${newTitle}</title>`);
    } else {
        console.warn(`Warning: <title> tag not found in ${filePath}. Attempting to add it.`);
        // Find the last </g> or any tag before </svg> and insert there, or just before </svg>
        const svgEndIndex = svgContent.lastIndexOf('</svg>');
        if (svgEndIndex !== -1) {
            svgContent = svgContent.substring(0, svgEndIndex) + `  <title>${newTitle}</title>\n` + svgContent.substring(svgEndIndex);
        } else {
             console.error(`Error: Could not find </svg> tag in ${filePath} to insert <title>.`);
             process.exit(1);
        }
    }

    if (svgContent.match(descRegex)) {
        svgContent = svgContent.replace(descRegex, `<desc>${newDescription}</desc>`);
    } else {
        console.warn(`Warning: <desc> tag not found in ${filePath}. Attempting to add it.`);
        // Find the last </g> or any tag before </svg> and insert there, or just before </svg>
        const svgEndIndex = svgContent.lastIndexOf('</svg>');
        if (svgEndIndex !== -1) {
            svgContent = svgContent.substring(0, svgEndIndex) + `  <desc>${newDescription}</desc>\n` + svgContent.substring(svgEndIndex);
        } else {
            console.error(`Error: Could not find </svg> tag in ${filePath} to insert <desc>.`);
            process.exit(1);
        }
    }

    fs.writeFileSync(filePath, svgContent, 'utf8');
    console.log(`Successfully updated title and description in ${filePath}`);

} catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    process.exit(1);
}
