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
            console.log(`Redesigning Laws Page: ${page.slug}`);

            // 1. Get raw text by stripping all HTML tags we previously added
            let text = page.content.replace(/<[^>]+>/g, '\n');

            // 2. Aggressive Cleanup of Artifacts
            text = text.replace(/\\r/g, ''); // Remove literal \r string
            text = text.replace(/\\n/g, '\n'); // Fix literal \n
            text = text.replace(/\r/g, '');   // Remove actual CR
            text = text.replace(/&nbsp;/g, ' ');
            text = text.replace(/\\/g, '');   // Remove stray backslashes

            // 3. Split into lines
            let lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

            // 4. Reconstruction Logic
            // We want to group content by "Siman" (Section) if possible.
            // Pattern: Hebrew letters followed by params "א (א)" or just "סעיף א"
            // But the text is messy. Let's try to detect "Siman" starts.
            // Also detect "Mishna Berura".

            let structuredHtml = `
                <div class="max-w-4xl mx-auto space-y-8 font-sans">
                    <div class="bg-primary/10 p-6 rounded-2xl text-center mb-8 border border-primary/20">
                         <h2 class="text-3xl font-bold text-gray-900 mb-2">דיני קדיש ובו כ"ב סעיפים</h2>
                         <p class="text-gray-600">הלכות ומנהגים על פי השולחן ערוך והמשנה ברורה</p>
                    </div>
             `;

            let currentBlock = { type: 'text', content: [] };

            lines.forEach(line => {
                // Detect Mishna Berura Header
                if (line.includes('מִשְׁנָה בְּרוּרָה') || line.includes('משנה ברורה')) {
                    // Close previous text block if open
                    if (currentBlock.content.length > 0) {
                        structuredHtml += renderBlock(currentBlock);
                        currentBlock = { type: 'text', content: [] };
                    }
                    currentBlock = { type: 'commentary_header', content: [line] };
                }
                // Detect Section Start (Siman) e.g., "א (א)"
                else if (line.match(/^[\u0590-\u05FF]{1,3}\s\([\u0590-\u05FF]{1,3}\)/)) {
                    // Close previous
                    if (currentBlock.content.length > 0) {
                        structuredHtml += renderBlock(currentBlock);
                    }
                    currentBlock = { type: 'section_title', content: [line] };
                }
                else {
                    // Append to current block
                    // If current block is header/title, verify if this line is continuation or new body
                    if (currentBlock.type === 'section_title' || currentBlock.type === 'commentary_header') {
                        structuredHtml += renderBlock(currentBlock);
                        currentBlock = { type: (currentBlock.type === 'commentary_header' ? 'commentary_body' : 'text'), content: [line] };
                    } else {
                        currentBlock.content.push(line);
                    }
                }
            });

            // Flush last block
            if (currentBlock.content.length > 0) {
                structuredHtml += renderBlock(currentBlock);
            }

            structuredHtml += '</div>';

            return { ...page, content: structuredHtml };
        }
        return page;
    });

    fs.writeFileSync(dbPath, JSON.stringify(pages, null, 2), 'utf8');
    console.log('Laws page redesign complete.');

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
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-lg leading-loose text-gray-800 mb-4 hover:shadow-md transition-shadow">
            ${text}
        </div>
    `;
}
