const fs = require('fs');
const path = require('path');

const metaPath = path.join(__dirname, '../src/data/wp_postmeta.json');
const rawMeta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));

// Target Post ID
const targetPostId = '3980';

console.log(`Searching for meta for post_id: ${targetPostId}`);

const meta = rawMeta.filter(row => row[1] === targetPostId);

meta.forEach(row => {
    console.log(`Key: ${row[2]}, Value: ${row[3]}`);
});

if (meta.length === 0) {
    console.log('No meta found for this post ID.');
}
