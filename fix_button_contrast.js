import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'src', 'data', 'pages_db.json');

try {
    const rawData = fs.readFileSync(dbPath, 'utf8');
    let pages = JSON.parse(rawData);
    let updatedCount = 0;

    // Regex to find elements with bg-primary and ensure they have !text-white
    // We look for class="..." containing bg-primary
    // This is a simple regex and might need care, but for our structured content it should be okay.
    // We want to replace 'bg-primary' with 'bg-primary !text-white' if !text-white isn't already there.
    // But we need to be careful not to double add or break things.

    // Better approach: parse HTML? No, regex is faster for this specific class fix.
    // We match `class="...bg-primary..."`

    pages = pages.map(page => {
        if (page.content && page.content.includes('bg-primary')) {
            let newContent = page.content;

            // basic replace: if we see bg-primary and NOT !text-white in the same class string...
            // It's hard to regex "same class string".
            // Let's just blindly replace 'bg-primary' with 'bg-primary !text-white' 
            // and then fix double !text-white if we created it.

            newContent = newContent.replace(/bg-primary/g, 'bg-primary !text-white');
            newContent = newContent.replace(/!text-white !text-white/g, '!text-white'); // Fix duplicates
            newContent = newContent.replace(/text-white !text-white/g, '!text-white'); // Fix conflict

            if (newContent !== page.content) {
                console.log(`Fixed contrast on page: ${page.slug}`);
                updatedCount++;
                return { ...page, content: newContent };
            }
        }
        return page;
    });

    if (updatedCount > 0) {
        fs.writeFileSync(dbPath, JSON.stringify(pages, null, 2), 'utf8');
        console.log(`Successfully fixed contrast on ${updatedCount} pages.`);
    } else {
        console.log('No pages needed contrast fix.');
    }

} catch (error) {
    console.error('Error processing DB:', error);
}
