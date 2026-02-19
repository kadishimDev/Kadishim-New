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
            console.log(`Fixing Redesign V3 for: ${page.slug}`);

            // 0. Fix Title
            page.title = page.title.replace(/\\"/g, '"').replace(/"/g, ''); // Clean quotes

            // 1. Get raw text
            let text = page.content.replace(/<[^>]+>/g, '\n');

            // 2. Cleanup
            text = text.replace(/\\r/g, '');
            text = text.replace(/\\n/g, '\n');
            text = text.replace(/\r/g, '');
            text = text.replace(/&nbsp;/g, ' ');

            let lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

            let sections = [];
            let currentSection = { title: 'הקדמה', law: [], mb: [] };
            let mode = 'law'; // 'law' or 'mb'

            // Regex for Section Title: e.g. "א (א)" or "ב (ו)"
            // Matches Hebrew chars, optional space, parens with Hebrew chars. Approx length limit.
            const headerRegex = /^[\u0590-\u05FF]{1,4}[\s\.]*\([\u0590-\u05FF]{1,4}\)$/;

            lines.forEach(line => {
                // Check for "Mishna Berura" marker
                if (line.includes('מִשְׁנָה בְּרוּרָה') || line.includes('משנה ברורה')) {
                    mode = 'mb';
                    return; // Skip the marker line itself
                }

                // Check for Header
                // We treat short lines ending in (x) as headers too, to be safe
                const isHeader = headerRegex.test(line) || (line.length < 15 && line.includes('(') && line.includes(')'));

                if (isHeader) {
                    // If we are in 'law' mode, this is definitely a new section.
                    if (mode === 'law') {
                        // Push old section if it has content
                        if (currentSection.law.length > 0 || currentSection.mb.length > 0) {
                            sections.push(currentSection);
                        }
                        currentSection = { title: line, law: [], mb: [] };
                        mode = 'law'; // Ensure we are in law mode for the new section
                    }
                    // If we are in 'mb' mode, it's just a sub-header reference inside MB
                    else {
                        currentSection.mb.push({ type: 'header', text: line });
                    }
                } else {
                    // Normal Text
                    if (mode === 'law') {
                        currentSection.law.push(line);
                    } else {
                        currentSection.mb.push({ type: 'text', text: line });
                    }
                }
            });

            // Push final section
            if (currentSection.law.length > 0 || currentSection.mb.length > 0) {
                sections.push(currentSection);
            }

            // Render HTML
            let structuredHtml = `
                <div class="max-w-4xl mx-auto space-y-12 font-sans pb-12">
                    <div class="bg-primary/10 p-8 rounded-3xl text-center border border-primary/20 shadow-sm">
                         <h2 class="text-4xl font-bold text-gray-900 mb-3">${page.title}</h2>
                         <p class="text-lg text-gray-600">הלכות ומנהגים על פי השולחן ערוך והמשנה ברורה</p>
                    </div>
             `;

            sections.forEach(section => {
                // Skip empty sections
                if (section.law.length === 0 && section.mb.length === 0) return;

                structuredHtml += `
                    <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <!-- Header -->
                        <div class="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100 flex items-center">
                            <span class="bg-primary text-white font-bold px-4 py-1 rounded-full shadow-sm text-lg">
                                ${section.title}
                            </span>
                        </div>
                        
                        <!-- Law Content -->
                        <div class="p-6 md:p-8 text-xl leading-loose text-gray-900 text-justify" style="text-align-last: center;">
                            ${section.law.map(l => `<p class="mb-4">${l}</p>`).join('')}
                        </div>
                        
                        <!-- Mishna Berura -->
                        ${renderMB(section.mb)}
                    </div>
                 `;
            });

            structuredHtml += '</div>';

            return { ...page, content: structuredHtml };
        }
        return page;
    });

    fs.writeFileSync(dbPath, JSON.stringify(pages, null, 2), 'utf8');
    console.log('Laws page redesign V3 complete.');

} catch (error) {
    console.error('Error processing DB:', error);
}

function renderMB(mbContent) {
    if (!mbContent || mbContent.length === 0) return '';

    return `
        <div class="bg-gray-50 p-6 md:p-8 border-t border-gray-200">
            <div class="flex items-center gap-3 mb-4 opacity-70">
                 <div class="h-px bg-gray-400 flex-1"></div>
                 <span class="text-sm font-bold text-gray-600 tracking-wider">משנה ברורה</span>
                 <div class="h-px bg-gray-400 flex-1"></div>
            </div>
            <div class="text-lg leading-relaxed text-gray-700 text-justify">
                ${mbContent.map(item => {
        if (item.type === 'header') {
            return `<span class="font-bold text-primary block mt-4 mb-1">${item.text}</span>`;
        }
        return `<span>${item.text} </span>`;
    }).join('')}
            </div>
        </div>
    `;
}
