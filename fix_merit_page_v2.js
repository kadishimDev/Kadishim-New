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
            console.log(`Fixing Merit Page V2 (Storytelling) for: ${page.slug}`);

            // 1. Get raw text
            let text = page.content.replace(/<[^>]+>/g, '\n');
            text = text.replace(/\\r/g, '');
            text = text.replace(/\\n/g, '\n');
            text = text.replace(/\r/g, '');
            text = text.replace(/&nbsp;/g, ' ');

            let lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

            let structuredHtml = `
                <div class="max-w-4xl mx-auto font-serif pb-20">
                    <!-- Hero Section -->
                    <div class="relative bg-gray-900 text-white p-12 rounded-3xl mb-16 overflow-hidden text-center shadow-xl">
                         <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                         <div class="relative z-10">
                             <h2 class="text-5xl font-bold mb-4 font-sans tracking-tight">בזכות הקדיש</h2>
                             <div class="w-24 h-1 bg-orange-500 mx-auto mb-6"></div>
                             <p class="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                                סיפור מופלא מהזוהר הקדוש המגלה את כוחו העצום של הקדיש להציל נשמות משערי גיהנום ולהעלותן לגן עדן.
                             </p>
                         </div>
                    </div>
                    
                    <div class="relative border-r-2 border-orange-200 mr-4 md:mr-10 space-y-12">
             `;

            lines.forEach((line, index) => {
                // Check if line starts with Hebrew numbering like "קג." or "קי."
                const match = line.match(/^([\u0590-\u05FF]{1,3})\.(.*)/);

                if (match) {
                    const number = match[1];
                    const content = match[2].trim();

                    // Alternate styles or just consistent timeline?
                    // Let's do a consistent timeline card

                    structuredHtml += `
                        <div class="relative pr-8 md:pr-12 group">
                            <!-- Timeline Dot -->
                            <div class="absolute -right-[9px] top-6 w-4 h-4 rounded-full bg-orange-500 border-4 border-white shadow-sm group-hover:scale-125 transition-transform"></div>
                            
                            <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
                                <span class="text-5xl text-orange-100 font-bold absolute top-4 left-6 select-none font-sans z-0">${number}</span>
                                <div class="relative z-10">
                                    <p class="text-xl text-gray-800 leading-loose text-justify font-serif">
                                        ${content}
                                    </p>
                                </div>
                            </div>
                        </div>
                     `;
                } else if (line.includes('נלקח מתוך הספר')) {
                    structuredHtml += `</div>
                        <div class="mt-16 text-center">
                            <span class="inline-block px-6 py-2 rounded-full bg-gray-100 text-gray-600 text-sm font-sans font-medium">
                                ${line}
                            </span>
                        </div>
                     `;
                } else {
                    // Intro paragraph?
                    structuredHtml += `
                        <div class="relative pr-8 md:pr-12">
                             <p class="text-xl text-gray-600 leading-relaxed italic mb-8">${line}</p>
                        </div>
                     `;
                }
            });

            structuredHtml += `
                </div>
             `;

            return { ...page, content: structuredHtml };
        }
        return page;
    });

    fs.writeFileSync(dbPath, JSON.stringify(pages, null, 2), 'utf8');
    console.log('Merit page redesign V2 (Storytelling) complete.');

} catch (error) {
    console.error('Error processing DB:', error);
}
