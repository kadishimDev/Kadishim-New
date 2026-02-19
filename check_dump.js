// check_dump.js - Quick check of laws_dump.txt
import fs from 'fs';

try {
    const text = fs.readFileSync('laws_dump.txt', 'utf8');
    console.log('File length:', text.length);
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    console.log('Non-empty lines:', lines.length);
    lines.forEach((l, i) => {
        console.log(i + ':', l.substring(0, 100));
    });
} catch (e) {
    console.log('laws_dump.txt not found, checking DB directly...');

    const pages = JSON.parse(fs.readFileSync('src/data/pages_db.json', 'utf8'));

    // Laws page
    const laws = pages.find(p => p.slug === 'דיני-קדיש-ובו-כב-סעיפים');
    console.log('\n=== LAWS PAGE ===');
    console.log('Content length:', laws.content.length);
    const lawsText = laws.content.replace(/<[^>]+>/g, '\n').split('\n').filter(l => l.trim().length > 0);
    console.log('Text lines after strip:', lawsText.length);
    lawsText.forEach((l, i) => console.log(i + ':', l.trim().substring(0, 100)));

    // Merit page
    const merit = pages.find(p => p.slug === 'בזכות-הקדיש');
    console.log('\n=== MERIT PAGE ===');
    console.log('Content length:', merit.content.length);
    const meritText = merit.content.replace(/<[^>]+>/g, '\n').split('\n').filter(l => l.trim().length > 0);
    console.log('Text lines after strip:', meritText.length);
    meritText.forEach((l, i) => console.log(i + ':', l.trim().substring(0, 100)));
}
