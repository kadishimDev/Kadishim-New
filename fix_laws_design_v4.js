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
            console.log(`Fixing Redesign V4 for: ${page.slug}`);

            // 0. Fix Title
            page.title = 'דיני קדיש ובו כ"ב סעיפים';

            // 1. Get raw text
            let text = page.content.replace(/<[^>]+>/g, '\n');
            text = text.replace(/\\r/g, '');
            text = text.replace(/\\n/g, '\n');
            text = text.replace(/\r/g, '');
            text = text.replace(/&nbsp;/g, ' ');

            let lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

            let structuredHtml = `
                <div class="max-w-4xl mx-auto space-y-12 font-sans pb-12">
                    <div class="bg-primary/10 p-8 rounded-3xl text-center border border-primary/20 shadow-sm relative overflow-hidden">
                         <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0"></div>
                         <h2 class="text-4xl font-bold text-gray-900 mb-3">${page.title}</h2>
                         <p class="text-lg text-gray-600">הלכות ומנהגים על פי השולחן ערוך והמשנה ברורה</p>
                    </div>
             `;

            // Regex for Headers
            // Law: "א (א)"
            // MB: "א (א)" but usually inside an MB block

            let currentMode = 'law'; // law, mb
            let buffer = [];

            // Helper to flush buffer
            const flush = () => {
                if (buffer.length === 0) return;
                const content = buffer.join(' ');

                if (currentMode === 'mb_header') {
                    // It's the "Mishna Berura" Title
                    structuredHtml += `
                        <div class="flex items-center gap-4 py-8">
                            <div class="h-px bg-gray-300 flex-1"></div>
                            <span class="text-gray-500 font-bold tracking-widest text-sm uppercase">משנה ברורה</span>
                            <div class="h-px bg-gray-300 flex-1"></div>
                        </div>
                     `;
                } else if (currentMode === 'section_header') {
                    // e.g. "Siman 55"
                    structuredHtml += `
                        <div class="bg-gray-100 text-gray-800 text-center font-bold text-xl py-3 rounded-lg shadow-inner my-8">
                            ${content}
                        </div>
                     `;
                } else if (currentMode === 'law_seif') {
                    // The "Aleph (Aleph)" header for Law
                    structuredHtml += `
                        <div class="mt-8 mb-2">
                             <span class="inline-flex items-center justify-center bg-primary text-white font-bold text-lg px-4 py-1 rounded-full shadow-md">
                                סעיף ${content.split('(')[0].trim()}
                             </span>
                        </div>
                     `;
                } else if (currentMode === 'mb_seif') {
                    // The "Aleph (Aleph)" header for MB
                    structuredHtml += `
                        <div class="mt-4 mb-2 mr-4">
                             <span class="inline-flex items-center justify-center bg-gray-200 text-gray-700 font-bold text-sm px-3 py-1 rounded-full">
                                ס"ק ${content.split('(')[0].trim()}
                             </span>
                        </div>
                     `;
                } else if (currentMode === 'law_text') {
                    structuredHtml += `
                        <div class="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 text-xl leading-loose text-gray-900 text-justify mb-4">
                            ${content}
                        </div>
                     `;
                } else if (currentMode === 'mb_text') {
                    structuredHtml += `
                        <div class="bg-gray-50 border-r-4 border-gray-300 p-5 rounded-r text-lg leading-relaxed text-gray-700 text-justify mb-4 mr-4">
                            ${content}
                        </div>
                     `;
                }

                buffer = [];
            };

            let globalMode = 'law'; // tracks if we are broadly in law or MB section

            lines.forEach(line => {
                // 1. Detect Explicit Transitions
                if (line.includes('משנה ברורה')) {
                    flush();
                    currentMode = 'mb_header';
                    buffer = ['משנה ברורה'];
                    flush();
                    globalMode = 'mb';
                    return;
                }
                if (line.includes('הלכות') && line.includes('סימן')) { // e.g. Hilchot Brachot Siman 55
                    flush();
                    currentMode = 'section_header';
                    buffer = [line];
                    flush();
                    globalMode = 'law'; // Reset to law
                    return;
                }

                // 2. Detect Seif Headers "X (X)"
                const isSeifHeader = /^[\u0590-\u05FF]{1,3}\s?\(.+\)/.test(line) && line.length < 20;

                if (isSeifHeader) {
                    flush();
                    // Decide if it's Law Seif or MB Seif based on globalMode
                    if (globalMode === 'law') {
                        currentMode = 'law_seif';
                    } else {
                        currentMode = 'mb_seif';
                    }
                    buffer = [line];
                    flush();

                    // Next content will be text corresponding to this seif
                    currentMode = (globalMode === 'law') ? 'law_text' : 'mb_text';
                }
                else {
                    // It's text content.
                    // Ensure we are in a text mode
                    if (currentMode !== 'law_text' && currentMode !== 'mb_text') {
                        // Fallback default
                        currentMode = (globalMode === 'law') ? 'law_text' : 'mb_text';
                    }
                    buffer.push(line);
                }
            });

            flush();

            structuredHtml += '</div>';

            return { ...page, content: structuredHtml };
        }
        return page;
    });

    fs.writeFileSync(dbPath, JSON.stringify(pages, null, 2), 'utf8');
    console.log('Laws page redesign V4 complete.');

} catch (error) {
    console.error('Error processing DB:', error);
}
