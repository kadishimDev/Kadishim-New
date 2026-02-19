
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'src', 'data', 'pages_db.json');

try {
    const rawData = fs.readFileSync(dbPath, 'utf8');
    const pages = JSON.parse(rawData);

    const urlRegex = /href="https:\/\/www\.kadishim\.co\.il\/([^"]+)\/?"/g;

    let linksFound = 0;

    pages.forEach(page => {
        let match;
        while ((match = urlRegex.exec(page.content)) !== null) {
            linksFound++;
            const originalUrl = match[0];
            const pathPart = match[1];

            try {
                const decoded = decodeURIComponent(pathPart).replace(/\/$/, '');
                console.log(`Found link in [${page.slug}]:`);
                console.log(`  Original: ${pathPart}`);
                console.log(`  Decoded : ${decoded}`);

                // Check if this decoded slug exists in our DB
                const targetPage = pages.find(p => p.slug === decoded);
                if (targetPage) {
                    console.log(`  -> MATCH FOUND: /page/${targetPage.slug}`);
                } else {
                    console.log(`  -> NO MATCH in DB`);
                }

            } catch (e) {
                console.log(`  Error decoding: ${pathPart}`);
            }
        }
    });

    console.log(`Total external links found: ${linksFound}`);

} catch (error) {
    console.error('Error:', error);
}
