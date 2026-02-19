
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'src', 'data', 'pages_db.json');

try {
    const rawData = fs.readFileSync(dbPath, 'utf8');
    const pages = JSON.parse(rawData);

    // Attempt to find by exact slug first
    let page = pages.find(p => p.slug === 'סגולות-לעילוי-נשמה');

    if (!page) {
        console.log("Exact slug match not found. Searching by title...");
        page = pages.find(p => p.title.includes('סגולות'));
    }

    if (page) {
        console.log('--- FOUND PAGE ---');
        console.log('Title:', page.title);
        console.log('Slug:', page.slug);
        console.log('--- CONTENT START ---');
        console.log(page.content);
        console.log('--- CONTENT END ---');
    } else {
        console.log('Page not found via slug or title.');
        console.log('Total pages:', pages.length);
        console.log('Sample slugs:', pages.slice(0, 5).map(p => p.slug));
    }

} catch (error) {
    console.error('Error reading/parsing DB:', error);
}
