
// Mock of Admin.jsx logic
import kaddishList from './src/data/kaddish_list.json' with { type: "json" };

// Simplified Date Utils Mock (replicated from src/utils/dateUtils.js)
const normalizeHebrewDate = (text) => {
    if (!text) return '';
    return text
        .replace(/["'״׳]/g, '') // Remove all types of quotes
        .replace(/-/g, ' ')      // Replace dashes with space
        .replace(/\bב(?=[א-ת])/g, '') // Remove 'Be' prefix from month if present
        .replace(/\s+/g, ' ')    // Collapse spaces
        .trim();
};

const processedData = () => {
    let data = [...kaddishList];

    // Sanitation (Deep Clean)
    data = data.filter(item => item.name && item.name.trim().length > 0);

    // Deduplicate (Smart: Name + Date)
    const seen = new Map();
    const cleanData = [];
    for (const item of data) {
        const compositeKey = `${item.name}|${item.hebrew_date_text || item.hebrew_date || ''}`;
        if (!seen.has(compositeKey)) {
            seen.set(compositeKey, true);
            cleanData.push(item);
        }
    }
    data = cleanData;

    // Sort logic from Admin.jsx (default: name asc)
    const sortConfig = { key: 'name', direction: 'asc' };


    data.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        // Debug first char codes for specific names
        if (aVal.includes("Evgene") || aVal.includes("אביה")) {
            // console.log(`DEBUG: Comparing ${aVal} vs ${bVal}`);
        }

        // Hebrew Priority Logic
        // Strict Check: Must START with Hebrew character (ignoring whitespace/quotes)
        const isHebrewA = /^\s*["'״׳]*[\u0590-\u05FF]/.test(aVal);
        const isHebrewB = /^\s*["'״׳]*[\u0590-\u05FF]/.test(bVal);

        // Sanity Check Logger
        if (aVal === "Evgene Monastyrsky" && bVal === "אביה רתם") {
            console.log(`DEBUG COMPARE: [${aVal}] (Heb:${isHebrewA}) VS [${bVal}] (Heb:${isHebrewB})`);
            if (isHebrewA && !isHebrewB) console.log("Result: -1 (A is Hebrew)");
            else if (!isHebrewA && isHebrewB) console.log("Result: 1 (B is Hebrew)");
            else console.log("Result: String Compare");
        }

        if (isHebrewA && !isHebrewB) return -1;
        if (!isHebrewA && isHebrewB) return 1;

        if (aVal < bVal) return -1;
        if (aVal > bVal) return 1;
        return 0;
    });

    // Filter Logic
    data = data.filter(item => item.name && item.name.trim() !== '');

    return data.slice(0, 100); // Take first 100 to see more
};

console.log("--- START DEBUG RENDER (Top 10) ---");
const rows = processedData();
rows.slice(0, 10).forEach((item, index) => {
    const isHebrew = /[\u0590-\u05FF]/.test(item.name);
    console.log(`Row #${index + 1} | Name: "${item.name}" [Hebrew: ${isHebrew}]`);
});

console.log("\n--- DEBUG RENDER (Bottom 10) ---");
rows.slice(-10).forEach((item, index) => {
    const isHebrew = /[\u0590-\u05FF]/.test(item.name);
    console.log(`Row #${rows.length - 10 + index + 1} | Name: "${item.name}" [Hebrew: ${isHebrew}]`);
});
console.log("--- END DEBUG RENDER ---");
