import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'src', 'data', 'pages_db.json');
const menuPath = path.join(__dirname, 'src', 'data', 'menu_structure.json');

// 1. Fix Menu Link
try {
    const rawMenu = fs.readFileSync(menuPath, 'utf8');
    let menu = JSON.parse(rawMenu);

    // Find the relevant item and update its path
    // Path to find: /page/בִּזְכוּת-הַקַּדִּישׁ -> /page/בזכות-הקדיש

    const updatePath = (items) => {
        items.forEach(item => {
            if (item.path === '/page/בִּזְכוּת-הַקַּדִּישׁ') {
                console.log(`Fixing menu link for: ${item.name}`);
                item.path = '/page/בזכות-הקדיש';
            }
            if (item.items) updatePath(item.items);
        });
    };

    updatePath(menu);
    fs.writeFileSync(menuPath, JSON.stringify(menu, null, 2), 'utf8');
    console.log('Menu link updated.');

} catch (error) {
    console.error('Error updating menu:', error);
}

// 2. Refine Laws Page Content
try {
    const rawData = fs.readFileSync(dbPath, 'utf8');
    let pages = JSON.parse(rawData);

    pages = pages.map(page => {
        if (page.slug === 'דיני-קדיש-ובו-כב-סעיפים') {
            console.log(`Refining Laws Page: ${page.slug}`);

            // The current content is wrapped in a prose div, but inside it's messy.
            // We need to fetch the inner text (simulated) and format it.
            // Since we don't have a DOM parser easily, and we know the content is basically text with \r\n

            // Let's take the raw content string we observed (approximated logic)
            // It looks like: <div ...> \r\n ... \r\n א (א) ... \r\n משנה ברורה ...

            // We will do a rough cleanup:
            // 1. Remove the wrapper div we added last time to get back to "raw" text (or close to it)
            let text = page.content.replace(/<div[^>]*>|<\/div>/g, '');

            // 2. Split by newlines to process paragraphs
            let lines = text.split(/\r\n|\n|\r/);

            let structuredHtml = '<div class="space-y-6">';

            lines.forEach(line => {
                line = line.trim();
                if (!line) return;

                // Check for Headers like "א (א)" or "משנה ברורה"
                // Regex: Starts with Hebrew char, space, parenthesized Hebrew char? 
                // Or just visually distinct short lines?

                if (line.includes('מִשְׁנָה בְּרוּרָה')) {
                    structuredHtml += `<h3 class="text-xl font-bold text-primary mt-6 mb-2 border-b border-gray-200 pb-2">${line}</h3>`;
                } else if (line.match(/^[\u0590-\u05FF]{1,2}\s\([\u0590-\u05FF]{1,2}\)/)) {
                    // Matches "א (א)" pattern
                    structuredHtml += `<h4 class="text-lg font-bold text-gray-900 mt-4">${line}</h4>`;
                } else {
                    structuredHtml += `<p class="leading-relaxed text-gray-700">${line}</p>`;
                }
            });

            structuredHtml += '</div>';

            return { ...page, content: structuredHtml };
        }
        return page;
    });

    fs.writeFileSync(dbPath, JSON.stringify(pages, null, 2), 'utf8');
    console.log('Laws page refined.');

} catch (error) {
    console.error('Error processing DB:', error);
}
