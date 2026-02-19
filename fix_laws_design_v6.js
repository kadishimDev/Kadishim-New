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
            console.log(`Fixing Redesign V6 (Sources & Contrast) for: ${page.slug}`);

            page.title = 'דיני קדיש ובו כ"ב סעיפים';

            // 1. Get raw text
            let text = page.content.replace(/<[^>]+>/g, '\n');
            text = text.replace(/\\r/g, '');
            text = text.replace(/\\n/g, '\n');
            text = text.replace(/\r/g, '');
            text = text.replace(/&nbsp;/g, ' ');

            let lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

            // 2. Parser Logic that respects Source Boundaries
            let sources = [];
            let currentSource = { title: 'הלכות קדיש (כללי)', seifim: [] };
            let currentSeif = { title: 'הקדמה', law: [], mb: [] };
            let mode = 'law';

            const isSourceHeader = (line) => line.includes('סימן') || line.includes('שולחן ערוך הרב');
            const isSeifHeader = (line) => /^[\u0590-\u05FF]{1,4}[\s\.]*\([\u0590-\u05FF]{1,4}\)$/.test(line);

            lines.forEach(line => {
                // Check for Source Change
                if (isSourceHeader(line)) {
                    // Push current seif to current source
                    if (currentSeif.law.length > 0 || currentSeif.mb.length > 0) currentSource.seifim.push(currentSeif);
                    // Push current source to list
                    if (currentSource.seifim.length > 0) sources.push(currentSource);

                    // Start new Source
                    currentSource = { title: line, seifim: [] };
                    currentSeif = { title: 'פתיחה', law: [], mb: [] };
                    mode = 'law';
                    return;
                }

                // Check for Mishna Berura
                if (line.includes('משנה ברורה')) {
                    mode = 'mb';
                    return;
                }

                // Check for Seif Header
                if (isSeifHeader(line)) {
                    if (mode === 'law') {
                        if (currentSeif.law.length > 0 || currentSeif.mb.length > 0) currentSource.seifim.push(currentSeif);
                        currentSeif = { title: line, law: [], mb: [] };
                        mode = 'law';
                    } else {
                        // MB Header
                        currentSeif.mb.push({ type: 'header', text: line });
                    }
                } else {
                    // Content
                    if (mode === 'law') currentSeif.law.push(line);
                    else currentSeif.mb.push({ type: 'text', text: line });
                }
            });

            // Flush End
            if (currentSeif.law.length > 0 || currentSeif.mb.length > 0) currentSource.seifim.push(currentSeif);
            if (currentSource.seifim.length > 0) sources.push(currentSource);

            // Render V6 High Contrast Layout
            let structuredHtml = `
                <div class="max-w-4xl mx-auto font-sans pb-20">
                    <div class="bg-white border-b-4 border-primary/20 p-8 mb-10 text-center">
                         <h1 class="text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">דיני קדיש</h1>
                         <p class="text-2xl text-gray-600 font-serif">ליקוט הלכות ממשנה ברורה ושולחן ערוך הרב</p>
                    </div>
                    
                    <div class="space-y-16 px-4 md:px-0">
             `;

            sources.forEach((source, sIdx) => {
                structuredHtml += `
                    <div class="source-section">
                        <div class="flex items-center gap-4 mb-8">
                            <span class="bg-gray-900 text-white text-xl font-bold px-4 py-2 rounded shadow-lg">פרק ${sIdx + 1}</span>
                            <h2 class="text-3xl font-bold text-gray-800 border-b-2 border-gray-200 pb-2 flex-1">${source.title}</h2>
                        </div>
                        
                        <div class="space-y-8">
                 `;

                source.seifim.forEach((seif, idx) => {
                    // Clean title
                    const seifTitle = seif.title.includes('(') ? seif.title.split('(')[0] : seif.title;

                    structuredHtml += `
                        <div class="bg-white rounded-xl border-2 border-gray-100 shadow-sm overflow-hidden hover:border-primary/30 transition-colors">
                            <!-- Law Part -->
                            <div class="p-8">
                                <div class="flex gap-6">
                                    <div class="flex-shrink-0">
                                        <span class="block w-12 h-12 bg-primary text-white text-2xl font-bold flex items-center justify-center rounded-lg shadow-md">
                                            ${seifTitle}
                                        </span>
                                    </div>
                                    <div class="space-y-4 text-xl leading-loose text-gray-900 font-medium text-justify w-full">
                                        ${seif.law.map(l => `<p>${l}</p>`).join('')}
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Commentary Part (Always Visible for Contrast/Accessibility) -->
                            ${renderMB_V6(seif.mb)}
                        </div>
                     `;
                });

                structuredHtml += `
                        </div>
                    </div>
                 `;
            });

            structuredHtml += `</div></div>`;

            return { ...page, content: structuredHtml };
        }
        return page;
    });

    fs.writeFileSync(dbPath, JSON.stringify(pages, null, 2), 'utf8');
    console.log('Laws page redesign V6 complete.');

} catch (error) {
    console.error('Error processing DB:', error);
}

function renderMB_V6(mbContent) {
    if (!mbContent || mbContent.length === 0) return '';

    return `
        <div class="bg-gray-100 p-8 border-t-2 border-gray-200">
            <div class="flex items-center gap-3 mb-4">
                 <span class="text-base font-bold text-gray-600 uppercase tracking-widest border border-gray-400 px-2 py-0.5 rounded">משנה ברורה</span>
            </div>
            <div class="text-lg leading-relaxed text-gray-800 text-justify">
                ${mbContent.map(item => {
        if (item.type === 'header') {
            return `<span class="font-bold text-primary block mt-4 mb-1 text-lg">${item.text}</span>`;
        }
        return `<span>${item.text} </span>`;
    }).join('')}
            </div>
        </div>
    `;
}
