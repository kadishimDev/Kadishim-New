const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '../src/data/pages_db.json');
const outputPath = path.join(__dirname, '../src/data/cleaned_pages.json');

try {
    const raw = fs.readFileSync(inputPath, 'utf8');
    let pages = JSON.parse(raw);

    const cleanContent = (html) => {
        if (!html) return '';
        let cleaned = html;

        // 1. Remove [vc_...] shortcodes but KEEP content inside if possible?
        // Actually, [vc_column_text] content [/vc_column_text] usually has the text.
        // [vc_row] ... [/vc_row] wrappers can be removed.
        // Simple regex to strip all [vc_...] tags.
        cleaned = cleaned.replace(/\[\/?vc_[^\]]*\]/g, '');

        // 2. Remove other common shortcodes
        cleaned = cleaned.replace(/\[\/?wpforms[^\]]*\]/g, ''); // We'll handle forms separately or they just disappear
        cleaned = cleaned.replace(/\[\/?contact-form-7[^\]]*\]/g, '');

        // 3. Remove excess whitespace/newlines
        cleaned = cleaned.replace(/\\r\\n/g, '<br>');
        cleaned = cleaned.replace(/\\n/g, '<br>');
        cleaned = cleaned.replace(/\\"/g, '"');

        // 4. Double check for "" replacement? (Encoding issue might be deeper, but let's try)
        // If the source JSON has , it's already lost. We can't fix it here if `wp_posts.json` has it.
        // But we can check if it looks like UTF-8 issues.

        return cleaned;
    };

    pages = pages.map(page => {
        return {
            ...page,
            content: cleanContent(page.content)
        };
    });

    fs.writeFileSync(outputPath, JSON.stringify(pages, null, 2));
    console.log(`Cleaned ${pages.length} pages. Saved to ${outputPath}`);

} catch (e) {
    console.error("Error:", e);
}
