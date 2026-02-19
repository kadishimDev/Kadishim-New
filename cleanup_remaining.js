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

    // Regex to remove WP shortcodes like [vc_row], [/vc_column_text], etc.
    const shortcodeRegex = /\[\/?vc_[^\]]+\]/g;

    // Regex to remove empty p tags or p tags just extending space which might remain
    const emptyTagRegex = /<p>\s*<\/p>/g;

    // Regex to clean up excessive newlines
    const newlineRegex = /(\r\n|\n|\r)/gm;

    const cleanedPages = pages.map(page => {
        if (page.content && (page.content.includes('[vc_') || page.content.includes('[/vc_'))) {
            // console.log(`Cleaning dirty page: ${page.title} (${page.slug})`);

            let newContent = page.content;

            // 1. Remove shortcodes
            newContent = newContent.replace(shortcodeRegex, '');

            // 2. Remove specific WP classes if needed (optional)

            // 3. Simple whitespace cleanup
            // Replace <br /> with simple newlines for now, or keep them? 
            // Better to keep structure but remove the garbage wrapping.

            // If the content was wrapped in [vc_column_text]...[/vc_column_text], it might be inside a <p> tag in the specific JSON we saw.
            // Example: <p>[vc_row]...[/vc_column_text][/vc_column][/vc_row]</p>
            // Removing the shortcodes leaves <p>...content...</p> which is fine.

            // Check for potential duplicate p tags or empty leftovers
            newContent = newContent.replace(emptyTagRegex, '');

            // Trim
            newContent = newContent.trim();

            if (newContent !== page.content) {
                console.log(`Cleaned: ${page.slug}`);
                updatedCount++;
                return { ...page, content: newContent };
            }
        }
        return page;
    });

    if (updatedCount > 0) {
        fs.writeFileSync(dbPath, JSON.stringify(cleanedPages, null, 2), 'utf8');
        console.log(`Successfully cleaned ${updatedCount} pages.`);
    } else {
        console.log('No dirty pages found.');
    }

} catch (error) {
    console.error('Error processing DB:', error);
}
