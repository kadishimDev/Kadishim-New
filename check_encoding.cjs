const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/data/wp_posts.json');

try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw);

    // Find a post with Hebrew title
    // data is array of rows. Columns? The extracted JSON was just array of arrays of strings.
    // I need to know which column is the title. Usually 5th or so.
    // In the dump: ID, post_author, post_date, post_date_gmt, post_content, post_title...
    // Let's print the first 2 rows.

    console.log("Row 1:", JSON.stringify(data[0], null, 2));

    // Check for "QUESTION MARK" characters
    const text = JSON.stringify(data[0]);
    if (text.includes("????")) {
        console.log("Encoding check: FAILED (Found many question marks)");
    } else {
        console.log("Encoding check: PASSED (or at least no obvious question mark blocks)");
    }
} catch (e) {
    console.error("Error reading file:", e.message);
}
