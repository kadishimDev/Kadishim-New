// DEFINITIVE FIX for Laws + Merit pages
// Uses laws_dump.txt as the authoritative source text for Laws page
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'src', 'data', 'pages_db.json');

// ═══════════════════════════════════════════════
// HELPER: Highlight inline seif markers (א), (ב) etc.
// ═══════════════════════════════════════════════
function highlightMarkers(text) {
    return text.replace(/\(([א-ת]{1,3})\)/g,
        '<span class="inline-flex items-center justify-center bg-primary/15 text-primary font-bold text-sm min-w-[24px] h-6 px-1 rounded mx-0.5 align-middle not-italic">$1</span>');
}

// ═══════════════════════════════════════════════
// PART 1: BUILD LAWS PAGE
// ═══════════════════════════════════════════════
function buildLawsPage() {
    const rawText = fs.readFileSync(path.join(__dirname, 'laws_dump.txt'), 'utf8');
    let lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    // Skip meta/title lines (first 9 lines are duplicated titles/headers)
    const skipPatterns = [
        /^דיני קדיש/,
        /^כ"ב סעיפים/,
        /^שולחן ערוך/,
        /^הקדמה/,
        /^הצג פירוש/,
        /^משנה ברורה$/,
        /^מקור:/,
    ];

    lines = lines.filter(l => !skipPatterns.some(p => p.test(l)));

    console.log('Laws: Non-meta lines:', lines.length);

    // Parse into sections: each "ס"ק X" starts a section
    let rawSections = [];
    let currentSection = null;

    lines.forEach(line => {
        const sqMatch = line.match(/^ס"ק\s+([\u0590-\u05FF]{1,3})\s*$/);
        if (sqMatch) {
            if (currentSection) rawSections.push(currentSection);
            currentSection = { number: sqMatch[1], text: '' };
            return;
        }
        if (currentSection) {
            currentSection.text += (currentSection.text ? ' ' : '') + line;
        }
    });
    if (currentSection) rawSections.push(currentSection);

    console.log('Laws: Raw sections found:', rawSections.length);
    rawSections.forEach((s, i) => console.log(`  ${i}: ס"ק ${s.number} (${s.text.substring(0, 50)}...)`));

    // Pair consecutive sections with the same number as SA + MB
    // Structure from the dump:
    // [0] ס"ק א - SA (Siman 55, Seif 1)
    // [1] ס"ק א - MB (Commentary on Seif 1)
    // [2] ס"ק ב - SA (Siman 55, Seif 2) — includes passage about Siman 56
    // [3] ס"ק א - SA (Siman 56, Seif 1 about answering)
    // [4] ס"ק א - MB (Commentary on Siman 56 Seif 1) — HUGE text with all the details
    // [5] ס"ק ב - SA/MB (Siman 56, about after Yitbarach)
    // [6] ס"ק ז - MB (Siman 104, about not interrupting Shmoneh Esreh)

    let pairedSections = [];
    let i = 0;
    while (i < rawSections.length) {
        let section = { ...rawSections[i], mb: '' };
        // Check if next section has same number → it's the MB
        if (i + 1 < rawSections.length && rawSections[i + 1].number === rawSections[i].number) {
            section.mb = rawSections[i + 1].text;
            i += 2;
        } else {
            i++;
        }
        pairedSections.push(section);
    }

    console.log('Laws: Paired sections:', pairedSections.length);

    // Generate HTML
    let html = `
<div class="max-w-4xl mx-auto pb-16" style="direction: rtl;">
    <div class="text-center mb-8">
        <p class="text-lg text-gray-500">הלכות ומנהגים על פי השולחן ערוך והמשנה ברורה</p>
        <div class="w-16 h-1 bg-primary mx-auto mt-4 rounded-full"></div>
    </div>
    <div class="space-y-6">`;

    pairedSections.forEach((section, idx) => {
        const lawText = highlightMarkers(section.text);
        const mbText = section.mb ? highlightMarkers(section.mb) : '';

        html += `
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="flex items-center gap-3 px-6 py-3 bg-gradient-to-l from-primary/10 to-white border-b border-gray-100">
                <span class="bg-primary text-white font-bold text-lg w-10 h-10 rounded-xl flex items-center justify-center shadow">${section.number}</span>
                <span class="text-gray-500 text-sm font-medium">סעיף ${section.number}</span>
            </div>
            <div class="p-6 md:p-8 text-xl leading-[2.2] text-gray-900 text-justify" style="font-family: 'David Libre', 'Frank Ruhl Libre', serif;">
                ${lawText}
            </div>${mbText ? `
            <details class="border-t border-amber-200 group">
                <summary class="flex items-center gap-2 px-6 py-3 cursor-pointer bg-amber-50 hover:bg-amber-100 transition-colors select-none">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-amber-600 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                    <span class="text-amber-800 font-bold text-sm">פירוש משנה ברורה</span>
                </summary>
                <div class="px-6 md:px-8 py-5 bg-amber-50/50 text-lg leading-[2] text-gray-800 text-justify" style="font-family: 'David Libre', 'Frank Ruhl Libre', serif;">
                    ${mbText}
                </div>
            </details>` : ''}
        </div>`;
    });

    html += `
    </div>
    <div class="text-center mt-10 text-gray-400 text-xs">
        <p>מקור: שולחן ערוך, אורח חיים, סימנים נ"ה-נ"ו</p>
    </div>
</div>`;

    return html;
}

// ═══════════════════════════════════════════════
// PART 2: BUILD MERIT PAGE
// Consolidate into ONE flowing block, not card-per-line
// ═══════════════════════════════════════════════
function buildMeritPage(currentContent) {
    // Strip HTML to get raw text
    let text = currentContent.replace(/<[^>]+>/g, '\n');
    text = text.replace(/\\r/g, '').replace(/\\n/g, '\n').replace(/\r/g, '').replace(/&nbsp;/g, ' ');
    let lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    // Deduplicate intro lines
    const introPattern = /סיפור מופלא/;
    let seenIntro = false;
    lines = lines.filter(l => {
        if (introPattern.test(l)) {
            if (seenIntro) return false;
            seenIntro = true;
        }
        return true;
    });

    // Remove title duplicates
    lines = lines.filter(l => l !== 'בזכות הקדיש');

    console.log('Merit: Content lines:', lines.length);

    // Generate HTML — one single flowing card, not individual cards
    let html = `
<div class="max-w-3xl mx-auto pb-16" style="direction: rtl;">
    <div class="text-center mb-8">
        <p class="text-lg text-gray-500">סיפור מופלא מהזוהר הקדוש על כוחו של הקדיש להציל נשמות</p>
        <div class="w-16 h-1 bg-primary mx-auto mt-4 rounded-full"></div>
    </div>
    <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-10">
        <div class="text-xl leading-[2.2] text-gray-800 text-justify space-y-5" style="font-family: 'David Libre', 'Frank Ruhl Libre', serif;">`;

    let sourceAttribution = '';

    lines.forEach((line) => {
        // Source attribution — save for the footer
        if (line.includes('נלקח מתוך')) {
            sourceAttribution = line;
            return;
        }

        // Section headers (Midrash, Ma'amar)
        if (line.includes('מִדְרָשׁ') || line.includes('מַאֲמָר') || line.includes('מדרש') || line.includes('מאמר')) {
            html += `
            <div class="flex items-center gap-3 my-4 not-italic">
                <div class="h-px bg-primary/20 flex-1"></div>
                <span class="text-primary font-bold text-sm px-3 py-1 bg-primary/5 rounded-lg font-sans">${line}</span>
                <div class="h-px bg-primary/20 flex-1"></div>
            </div>`;
            return;
        }

        // Regular paragraph — just a <p>, no wrapping card
        html += `
            <p>${line}</p>`;
    });

    html += `
        </div>${sourceAttribution ? `
        <div class="text-center mt-8 pt-6 border-t border-gray-100">
            <span class="text-gray-400 text-sm font-sans">${sourceAttribution}</span>
        </div>` : ''}
    </div>
</div>`;

    return html;
}

// ═══════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════
try {
    let pages = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

    pages = pages.map(page => {
        if (page.slug === 'דיני-קדיש-ובו-כב-סעיפים') {
            page.title = 'דיני קדיש ובו כ"ב סעיפים';
            page.content = buildLawsPage();
            return page;
        }
        if (page.slug === 'בזכות-הקדיש') {
            page.content = buildMeritPage(page.content);
            return page;
        }
        return page;
    });

    fs.writeFileSync(dbPath, JSON.stringify(pages, null, 2), 'utf8');
    console.log('\n✅ Both pages rebuilt successfully.');

} catch (error) {
    console.error('Error:', error);
}
