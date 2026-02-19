
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'src', 'data', 'pages_db.json');
const activeSlugs = [
    'דיני-קדיש-ובו-כב-סעיפים',
    'מנין-הקדישים-והזכויות',
    'מקור-הקדיש-ונסח-הקדיש',
    'נסח-הקדיש',
    'קדיש-לאבלים',
    'קדיש-על-המת',
    'הזכות-שיש-לנפטרים-על-ידי-אמירת-קדיש',
    'בִּזְכוּת-הַקַּדִּישׁ',
    'יום-הקדיש-הכללי',
    'מתי-אומרים-חצי-קדיש',
    'קדיש-תתקבל',
    'קדיש-דרבנן',
    'קדיש-יהא-שלמא-קדיש-יתום',
];

try {
    const rawData = fs.readFileSync(dbPath, 'utf8');
    let pages = JSON.parse(rawData);
    let updatedCount = 0;

    pages = pages.map(page => {
        // Check if page needs cleanup (matches active slugs or has WP artifacts)
        const isTargetPage = activeSlugs.some(slug => page.slug.startsWith(slug));

        if (isTargetPage || page.content.includes('<!-- wp:')) {
            let content = page.content;

            // 1. Remove WP Comments
            content = content.replace(/<!-- \/?wp:.*? -->/g, '');

            // 2. Remove empty paragraphs
            content = content.replace(/<p>\s*<\/p>/g, '');

            // 3. Consolidate newlines
            content = content.replace(/\n\s*\n/g, '\n');

            // 4. Fix specific encoding weirdness if found (example: &nbsp;)
            content = content.replace(/&nbsp;/g, ' ');

            // 5. Remove "Unknown" characters often found in Hebrew WP imports
            // (Be careful here, strictly removing known garbage)

            if (content !== page.content) {
                console.log(`Cleaning page: ${page.title} (${page.slug})`);
                updatedCount++;
                return { ...page, content };
            }
        }
        return page;
    });

    if (updatedCount > 0) {
        fs.writeFileSync(dbPath, JSON.stringify(pages, null, 2), 'utf8');
        console.log(`Successfully cleaned ${updatedCount} pages.`);
    } else {
        console.log('No pages needed cleaning.');
    }

} catch (error) {
    console.error('Error processing DB:', error);
}
