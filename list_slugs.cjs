const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/data/wp_posts.json');
const raw = fs.readFileSync(filePath, 'utf8');
const data = JSON.parse(raw); // Array of arrays

// Structure: 4=Content, 5=Title, 7=Status, 11=Slug, 20=Type

const pages = data.filter(row => row[20] === 'page' && row[7] === 'publish');

console.log("Found", pages.length, "published pages.");
pages.forEach(row => {
    console.log(`Slug: ${row[11]} | Title: ${row[5]}`);
});
