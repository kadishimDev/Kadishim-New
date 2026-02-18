const fs = require('fs');
const menu = JSON.parse(fs.readFileSync('./src/data/menu_structure.json', 'utf8'));

console.log('Total categories:', menu.length);
menu.forEach((cat, i) => {
    console.log(`${i + 1}. ${cat.title}: ${cat.items?.length || 0} items`);
});
