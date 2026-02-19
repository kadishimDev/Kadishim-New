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
        if (page.slug === 'בזכות-הקדיש') {
            console.log(`Fixing Merit Page: ${page.slug}`);

            // 1. Get raw text by stripping HTML tags
            let text = page.content.replace(/<[^>]+>/g, '\n');

            // 2. Aggressive Cleanup of Artifacts
            text = text.replace(/\\r/g, '');
            text = text.replace(/\\n/g, '\n');
            text = text.replace(/\r/g, '');
            text = text.replace(/&nbsp;/g, ' ');
            text = text.replace(/\\/g, '');

            let lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

            let structuredHtml = `
                <div class="max-w-3xl mx-auto space-y-8 font-serif">
                    <div class="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl text-center mb-10 shadow-sm border border-blue-100">
                         <h2 class="text-4xl font-bold text-gray-900 mb-4 font-sans">בזכות הקדיש</h2>
                         <p class="text-lg text-gray-600 font-sans">סיפור מופלא מהזוהר הקדוש על כוחו של הקדיש להציל נשמות</p>
                    </div>
                    
                    <div class="prose prose-lg max-w-none text-gray-800 leading-loose">
             `;

            lines.forEach(line => {
                // Check if line starts with Hebrew numbering like "קג." or "קי."
                if (line.match(/^[\u0590-\u05FF]{1,3}\./)) {
                    // Make it a paragraph with a slight indent or style
                    // Highlight the number
                    const parts = line.split('.');
                    const number = parts[0] + '.';
                    const rest = parts.slice(1).join('.').trim();

                    structuredHtml += `
                        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 transition-transform hover:scale-[1.01]">
                            <span class="text-primary font-bold text-xl block mb-2 font-sans">${number}</span>
                            <p class="text-lg text-gray-800 leading-relaxed">
                                ${rest}
                            </p>
                        </div>
                     `;
                } else if (line.includes('נלקח מתוך הספר')) {
                    structuredHtml += `
                        <div class="mt-12 text-center border-t pt-6">
                            <p class="text-sm text-gray-500 font-sans italic">${line}</p>
                        </div>
                     `;
                } else {
                    structuredHtml += `<p class="mb-4">${line}</p>`;
                }
            });

            structuredHtml += `
                    </div>
                </div>
             `;

            return { ...page, content: structuredHtml };
        }
        return page;
    });

    fs.writeFileSync(dbPath, JSON.stringify(pages, null, 2), 'utf8');
    console.log('Merit page fix complete.');

} catch (error) {
    console.error('Error processing DB:', error);
}
