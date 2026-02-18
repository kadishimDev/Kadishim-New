const fs = require('fs');
const path = require('path');
const { HDate, gematriya } = require('@hebcal/core');

// Mock or import the date utils if possible, but for a standalone script, defining helpers here is often safer/easier
// to avoid ES module import issues if the project isn't set up for it in scripts.

// --- CONFIG ---
const INPUT_FILE = './public/data/memorials.json'; // Assuming we dump DB here or it exists
const OUTPUT_FILE = './public/data/memorials_dev_normalized.json';

// --- HELPERS ---

function formatHebrewDateStrict(hDate) {
    try {
        const day = hDate.getDate();
        const month = hDate.getMonth();
        const year = hDate.getFullYear();

        const months = {
            1: 'בניסן', 2: 'באייר', 3: 'בסיון', 4: 'בתמוז', 5: 'באב', 6: 'באלול',
            7: 'בתשרי', 8: 'בחשון', 9: 'בכסלו', 10: 'בטבת', 11: 'בשבט',
            12: 'באדר', 13: 'באדר ב\'\'\' '
        };

        let monthName = months[month];
        if (HDate.isLeapYear(year)) {
            if (month === 12) monthName = 'באדר א\'\'\'';
            if (month === 13) monthName = 'באדר ב\'\'\'';
        }

        const addQuotes = (str) => {
            const clean = str.replace(/[\'\"״׳]/g, '');
            if (clean.length === 1) return clean + "\'";
            return clean.slice(0, -1) + '\"' + clean.slice(-1);
        };

        const dayStr = addQuotes(gematriya(day));

        const shortYear = year % 1000;
        let yearLetters = gematriya(shortYear).replace(/[\'\"״׳]/g, '');
        yearLetters = 'ה' + yearLetters;
        const yearStr = addQuotes(yearLetters);

        return `${dayStr} ${monthName} ${yearStr}`;
    } catch (e) {
        return "";
    }
}

// --- MAIN ---

async function main() {
    console.log("Starting Data Normalization...");

    // 1. Read Data
    let terminals = [];
    try {
        const raw = fs.readFileSync(INPUT_FILE, 'utf8');
        memorials = JSON.parse(raw);
    } catch (e) {
        console.error("Error reading input file:", e.message);
        console.log("Creating dummy data for testing if file missing.");
        memorials = [];
    }

    console.log(`Loaded ${memorials.length} records.`);

    const normalized = memorials.map((m, index) => {
        let log = [];
        let newData = { ...m };

        // A. Fix Year 5000 / Hebrew Date Format
        if (newData.death_date_hebrew) {
            // parsing logic would be complex for strings, but let's assume we use the Gregorian if available to RE-GENERATE the Hebrew
            // This is the safest way to ensure strict format.
            if (newData.death_date_gregorian) {
                const d = new Date(newData.death_date_gregorian);
                const hDate = new HDate(d);
                const newHebrew = formatHebrewDateStrict(hDate);

                if (newHebrew !== newData.death_date_hebrew) {
                    // log.push(`Updated Hebrew Date: ${newData.death_date_hebrew} -> ${newHebrew}`);
                    newData.death_date_hebrew = newHebrew;
                }
            }
        }

        // B. Fill Missing Gregorian from Hebrew? 
        // Parsing Hebrew string back to date is hard without structured data. 
        // For now, we prioritize GREGORIAN -> HEBREW flow.

        // C. Split Parents if needed (basic heuristic)
        // If "father_name" contains " ו", split? (Assuming user might have put both in one)

        return newData;
    });

    // 2. Write Output
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(normalized, null, 2));
    console.log(`Saved normalized data to ${OUTPUT_FILE}`);
}

main();
