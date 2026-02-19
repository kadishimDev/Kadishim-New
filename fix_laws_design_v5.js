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
            console.log(`Fixing Redesign V5 (Premium) for: ${page.slug}`);

            // 0. Fix Title
            page.title = 'דיני קדיש ובו כ"ב סעיפים';

            // 1. Get raw text (strip previous HTML)
            let text = page.content.replace(/<[^>]+>/g, '\n');
            text = text.replace(/\\r/g, '');
            text = text.replace(/\\n/g, '\n');
            text = text.replace(/\r/g, '');
            text = text.replace(/&nbsp;/g, ' ');

            let lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

            let sections = [];
            let currentSection = { title: 'הקדמה', law: [], mb: [] };
            let mode = 'law'; // 'law' or 'mb'

            // Regex (same as V4 logic)
            const headerRegex = /^[\u0590-\u05FF]{1,4}[\s\.]*\([\u0590-\u05FF]{1,4}\)$/;

            lines.forEach(line => {
                if (line.includes('משנה ברורה')) {
                    mode = 'mb'; return;
                }

                const isHeader = headerRegex.test(line) || (line.length < 15 && line.includes('(') && line.includes(')'));
                if (isHeader) {
                    if (mode === 'law') {
                        if (currentSection.law.length > 0 || currentSection.mb.length > 0) sections.push(currentSection);
                        currentSection = { title: line, law: [], mb: [] };
                        mode = 'law';
                    } else {
                        currentSection.mb.push({ type: 'header', text: line });
                    }
                } else {
                    if (mode === 'law') currentSection.law.push(line);
                    else currentSection.mb.push({ type: 'text', text: line });
                }
            });
            if (currentSection.law.length > 0 || currentSection.mb.length > 0) sections.push(currentSection);

            // Render Premium HTML Layout
            // Using <details> for accordion effect to maintain user engagement without overwhelm
            let structuredHtml = `
                <div class="max-w-3xl mx-auto font-sans pb-16">
                    <!-- Premium Header -->
                    <div class="text-center py-12 px-4 mb-10 bg-gradient-to-b from-orange-50 to-white rounded-b-3xl shadow-sm border-b border-orange-100">
                         <div class="inline-block p-3 rounded-full bg-orange-100 text-primary mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                         </div>
                         <h2 class="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">דיני קדיש</h2>
                         <div class="flex items-center justify-center gap-2 text-gray-500 font-medium">
                            <span>כ"ב סעיפים</span>
                            <span class="w-1 h-1 bg-gray-300 rounded-full"></span>
                            <span>שולחן ערוך ומשנה ברורה</span>
                         </div>
                    </div>
             
                    <div class="space-y-6 px-4">
             `;

            sections.forEach((section, index) => {
                if (section.law.length === 0 && section.mb.length === 0) return;

                // Clean title for display (remove parens sometimes? No, keep standard)
                const number = (index + 1); // rough index

                structuredHtml += `
                    <div class="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden relative">
                        <!-- Law Section (Always Visible) -->
                        <div class="p-6 md:p-8 relative z-10 bg-white">
                            <div class="flex items-start gap-4">
                                <div class="flex-shrink-0 mt-1">
                                    <span class="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-primary font-bold text-sm">
                                        ${section.title.split('(')[0]}
                                    </span>
                                </div>
                                <div class="flex-1">
                                    <div class="text-xl leading-relaxed text-gray-800 text-justify font-serif">
                                        ${section.law.map(l => `<p class="mb-2">${l}</p>`).join('')}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Commentary Accordion -->
                        ${renderAccordionMB(section.mb)}
                    </div>
                 `;
            });

            structuredHtml += `
                    </div>
                    <div class="text-center mt-12 text-gray-400 text-sm">
                        <p>מקור: שולחן ערוך אורח חיים סימן נ"ה</p>
                    </div>
                </div>
             `;

            return { ...page, content: structuredHtml };
        }
        return page;
    });

    fs.writeFileSync(dbPath, JSON.stringify(pages, null, 2), 'utf8');
    console.log('Laws page redesign V5 (Accordions) complete.');

} catch (error) {
    console.error('Error processing DB:', error);
}

function renderAccordionMB(mbContent) {
    if (!mbContent || mbContent.length === 0) return '';

    return `
        <details class="group/accordion border-t border-gray-100 bg-gray-50/50">
            <summary class="flex items-center gap-2 px-6 py-3 cursor-pointer select-none text-gray-500 hover:text-primary hover:bg-orange-50/50 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform group-open/accordion:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
                <span class="text-sm font-bold tracking-wide">הצג פירוש משנה ברורה</span>
            </summary>
            <div class="px-8 pb-6 pt-2 text-gray-600 space-y-3 text-lg leading-relaxed text-justify animate-fade-in">
                ${mbContent.map(item => {
        if (item.type === 'header') {
            return `<span class="inline-block bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded mr-1 font-bold">${item.text}</span>`;
        }
        return `<span>${item.text} </span>`;
    }).join('')}
            </div>
        </details>
    `;
}
