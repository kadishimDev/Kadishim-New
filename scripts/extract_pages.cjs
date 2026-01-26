const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '../src/data/wp_posts.json');
const outputPath = path.join(__dirname, '../src/data/pages_db.json');

try {
    const raw = fs.readFileSync(inputPath, 'utf8');
    const data = JSON.parse(raw);

    const pages = [];

    // Columns based on my analysis:
    // 4: post_content
    // 5: post_title
    // 7: post_status
    // 11: post_name (slug)
    // 20: post_type

    data.forEach(row => {
        const type = row[20];
        const status = row[7];

        // We want pages, but maybe also posts if the old site used 'post' for content.
        // Let's grab both 'page' and 'post' just in case, filtering only 'publish'.
        if (status === 'publish' && (type === 'page' || type === 'post')) {
            let title = row[5];
            let content = row[4];
            let slug = row[11];

            // Decode percent-encoded slugs
            try {
                slug = decodeURIComponent(slug);
            } catch (e) {
                // keep original if fails
            }

            // content might be escaped newlines "\\n" -> "\n"
            content = content.replace(/\\n/g, '\n').replace(/\\"/g, '"');

            // Clean up WordPress shortcodes if possible, or leave them.
            // Some [form] shortcodes might be trash.

            pages.push({
                title: title,
                slug: slug,
                content: content,
                type: type
            });
        }
    });

    fs.writeFileSync(outputPath, JSON.stringify(pages, null, 2));
    console.log(`Extracted ${pages.length} pages/posts to ${outputPath}`);

} catch (e) {
    console.error("Error:", e);
}
