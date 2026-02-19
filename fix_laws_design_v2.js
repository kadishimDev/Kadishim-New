import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'src', 'data', 'pages_db.json');

try {
    const rawData = fs.readFileSync(dbPath, 'utf8');
    let pages = JSON.parse(rawData);

    pages = pages.map(page => {
        if (page.slug === 'דיני-קדיש-ובו-כב-סעיפים') {
            console.log(`Fixing Redesign for: ${page.slug}`);

            // 1. Get raw text by stripping HTML tags from the PREVIOUS attempt
            // This resets us to the content, but we might have lost some original structure if we aren't careful.
            // However, the previous script essentially just wrapped text blocks.
            // So stripping tags should get us back to the text lines.
            let text = page.content.replace(/<[^>]+>/g, '\n');

            // Cleanup whitespace weirdness introduced by stripping
            text = text.replace(/\n\s*\n/g, '\n');
            text = text.replace(/&nbsp;/g, ' ');

            let lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

            let structuredHtml = `
                <div class="max-w-4xl mx-auto space-y-8 font-sans">
                    <div class="bg-primary/10 p-6 rounded-2xl text-center mb-8 border border-primary/20">
                         <h2 class="text-3xl font-bold text-gray-900 mb-2">דיני קדיש ובו כ"ב סעיפים</h2>
                         <p class="text-gray-600">הלכות ומנהגים על פי השולחן ערוך והמשנה ברורה</p>
                    </div>
             `;

            let currentBlock = { type: 'text', content: [] };

            // Regex for Section Title: Start of line, Hebrew letters/parens, up to 15 chars.
            // We want to capture the title part separate from the rest.
            const titleRegex = /^([\u0590-\u05FF]{1,3}\s\([\u0590-\u05FF]{1,3}\))(?:\s+(.*))?$/;

            lines.forEach(line => {
                // Detect Mishna Berura Header
                if (line.includes('מִשְׁנָה בְּרוּרָה') || line.includes('משנה ברורה')) {
                    if (currentBlock.content.length > 0) structuredHtml += renderBlock(currentBlock);
                    currentBlock = { type: 'commentary_header', content: [line] };
                }
                // Detect Section Start
                else {
                    const match = line.match(titleRegex);
                    if (match) {
                        const titlePart = match[1]; // "א (א)"
                        const restOfLine = match[2]; // "omrim kaddish..." or undefined

                        // Close previous block
                        if (currentBlock.content.length > 0) structuredHtml += renderBlock(currentBlock);

                        // Render Title Immediately
                        structuredHtml += renderBlock({ type: 'section_title', content: [titlePart] });

                        // Start new text block with the rest of the line (if any)
                        if (restOfLine && restOfLine.trim().length > 0) {
                            currentBlock = { type: 'text', content: [restOfLine] };
                        } else {
                            currentBlock = { type: 'text', content: [] };
                        }
                    } else {
                        // Normal line
                        if (currentBlock.type === 'section_title' || currentBlock.type === 'commentary_header') {
                            structuredHtml += renderBlock(currentBlock);
                            currentBlock = { type: (currentBlock.type === 'commentary_header' ? 'commentary_body' : 'text'), content: [line] };
                        } else {
                            currentBlock.content.push(line);
                        }
                    }
                }
            });

            if (currentBlock.content.length > 0) {
                structuredHtml += renderBlock(currentBlock);
            }

            structuredHtml += '</div>';

            return { ...page, content: structuredHtml };
        }
        return page;
    });

    fs.writeFileSync(dbPath, JSON.stringify(pages, null, 2), 'utf8');
    console.log('Laws page fix complete.');

} catch (error) {
    console.error('Error processing DB:', error);
}

function renderBlock(block) {
    if (!block.content.length) return '';
    const text = block.content.join(' ');

    if (block.type === 'section_title') {
        return `
            <div class="mt-8 mb-4">
                <span class="inline-block bg-primary text-white font-bold px-4 py-1 rounded-full shadow-sm text-lg">
                    ${text}
                </span>
            </div>
        `;
    }

    if (block.type === 'commentary_header') {
        return `
             <div class="flex items-center gap-4 my-6">
                <div class="h-px bg-gray-300 flex-1"></div>
                <h3 class="font-bold text-gray-500 text-sm tracking-wider">משנה ברורה</h3>
                <div class="h-px bg-gray-300 flex-1"></div>
            </div>
        `;
    }

    if (block.type === 'commentary_body') {
        return `
            <div class="bg-gray-50 border-r-4 border-gray-400 p-4 rounded-r mt-2 mb-6 text-base text-gray-700 leading-relaxed">
                ${text}
            </div>
        `;
    }

    // Default Text (Shulchan Aruch)
    return `
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-lg leading-loose text-gray-800 mb-4">
            ${text}
        </div>
    `;
}
