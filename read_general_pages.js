
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'src', 'data', 'pages_db.json');
const targetSlugs = [
    'ארגון-שבעה',
    'סעודת-מצוה',
    'ארגון-הלוויות',
    'מי-אנחנו',
    'תרומות',
    'contact'
];

try {
    const rawData = fs.readFileSync(dbPath, 'utf8');
    const pages = JSON.parse(rawData);

    targetSlugs.forEach(slug => {
        const page = pages.find(p => p.slug === slug);
        if (page) {
            console.log(`\n--- PAGE: ${page.title} (${slug}) ---`);
            console.log(page.content);
            console.log('-----------------------------------');
        } else {
            console.log(`\n--- PAGE NOT FOUND: ${slug} ---`);
        }
    });

} catch (error) {
    console.error('Error:', error);
}
