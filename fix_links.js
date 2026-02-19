
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'src', 'data', 'pages_db.json');

try {
    const rawData = fs.readFileSync(dbPath, 'utf8');
    let pages = JSON.parse(rawData);

    const urlRegex = /href="https:\/\/www\.kadishim\.co\.il\/([^"]+)\/?"/g;
    let fixedCount = 0;

    pages = pages.map(page => {
        let content = page.content;
        let hasChanges = false;

        // Replace callback
        const newContent = content.replace(urlRegex, (match, pathPart) => {
            try {
                // Decode URI component to get Hebrew characters back
                let decoded = decodeURIComponent(pathPart).replace(/\/$/, '');

                // Handle edge cases like "contact" which might not be in pages mapped exactly same way
                if (decoded === 'contact') return 'href="/contact"'; // Direct route

                // General case: link to /page/:slug
                // We trust the decoded slug usually matches, or at least is a valid attempt.
                // The previous test showed good matches.
                return `href="/page/${decoded}"`;
            } catch (e) {
                return match; // Return original if error
            }
        });

        if (newContent !== content) {
            fixedCount++;
            return { ...page, content: newContent };
        }
        return page;
    });

    if (fixedCount > 0) {
        fs.writeFileSync(dbPath, JSON.stringify(pages, null, 2), 'utf8');
        console.log(`Successfully fixed links in ${fixedCount} pages.`);
    } else {
        console.log('No links needed fixing.');
    }

} catch (error) {
    console.error('Error processing DB:', error);
}
