
import fs from 'fs';
import path from 'path';
import { HDate, gematriya, HebrewCalendar } from '@hebcal/core';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_FILE = path.resolve(__dirname, '../src/data/memorials_remediated.json');
const OUTPUT_FILE_V2 = path.resolve(__dirname, '../src/data/memorials_v2.json');

// Helper to format strictly: כ"ב בכסליו, התשע"ז
function formatStrictHebrewDate(hDate) {
    const day = hDate.getDate();
    const month = hDate.getMonth();
    const year = hDate.getFullYear();

    // 1. Day: gematriya with quotes
    let dayStr = gematriya(day);
    // Replace Gershayim with standard Double Quote
    dayStr = dayStr.replace(/״/g, '"');

    // Ensure quotes exists for > 1 char
    if (!dayStr.includes('"') && !dayStr.includes("'")) {
        if (dayStr.length > 1) {
            dayStr = dayStr.slice(0, -1) + '"' + dayStr.slice(-1);
        } else {
            dayStr += "'";
        }
    }

    // 2. Month: Manual Mapping (to ensure Hebrew)
    const months = ['', 'ניסן', 'אייר', 'סיון', 'תמוז', 'אב', 'אלול', 'תשרי', 'חשוון', 'כסלו', 'טבת', 'שבט'];
    let monthStr = '';

    if (HDate.isLeapYear(year)) {
        if (month === 12) monthStr = 'אדר א';
        else if (month === 13) monthStr = 'אדר ב';
        else monthStr = months[month];
    } else {
        if (month === 12) monthStr = 'אדר';
        else monthStr = months[month];
    }

    // Prefix with 'ב'
    monthStr = 'ב' + monthStr;

    // 3. Year: gematriya with 'ה' prefix and quotes
    let yearStr = gematriya(year);
    // Replace Gershayim
    yearStr = yearStr.replace(/״/g, '"');

    // Remove all quotes to start fresh
    let yearRaw = yearStr.replace(/["'״]/g, '');
    let yearWithHe = 'ה' + yearRaw;

    // Add quotes before last letter
    if (yearWithHe.length > 1) {
        yearStr = yearWithHe.slice(0, -1) + '"' + yearWithHe.slice(-1);
    } else {
        yearStr = yearWithHe;
    }

    return `${dayStr} ${monthStr}, ${yearStr}`;
}

// Basic Hebrew Parse
const HEBREW_MONTHS = {
    'ניסן': 1, 'אייר': 2, 'סיון': 3, 'תמוז': 4, 'אב': 5, 'אלול': 6,
    'תשרי': 7, 'חשון': 8, 'חשוון': 8, 'כסלו': 9, 'טבת': 10, 'שבט': 11, 'אדר': 12, 'אדר א': 12, 'אדר ב': 13
};

function parseHebrewDateString(text) {
    if (!text) return null;
    // Normalize: remove dashes, punctuation, extra spaces
    const clean = text.replace(/[-,'"״׳]/g, ' ').replace(/\s+/g, ' ').trim();
    const parts = clean.split(' ');
    // Expect parts: Day, Month, Year (e.g., י אב תשעג)

    let dayStr, monthName, yearStr;
    let monthNum = 0;
    let monthIndex = -1;

    // FIND MONTH
    for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        if (HEBREW_MONTHS[p]) {
            monthNum = HEBREW_MONTHS[p];
            monthIndex = i;
            // Check for 'א' or 'ב' after Adar
            if (p === 'אדר') {
                if (parts[i + 1] === 'א') { monthNum = 12; i++; } // Consumed
                else if (parts[i + 1] === 'ב') { monthNum = 13; i++; }
            }
            break;
        }
    }

    if (monthNum === 0) return null;

    // DAY (before month)
    // Join parts before month (usually just one)
    const dayParts = parts.slice(0, monthIndex);
    const dayClean = dayParts.join(''); // e.g. "י" or "כג"

    // YEAR (after month)
    // Join parts after month
    // Need to handle "Adar A" consumption which logic above did via loop index check... wait, slice uses original index.
    // Let's rely on filter? No.
    // Let's just grab everything after the month word(s).
    // If month word was index `monthIndex`.
    // If double word, it was cleared?
    // Actually simplicity:
    // Just find matching month name in string again? No.

    // Re-split logic slightly:
    let afterMonthParts = parts.slice(monthIndex + 1);
    if (monthNum === 12 && afterMonthParts[0] === 'א') afterMonthParts.shift();
    if (monthNum === 13 && afterMonthParts[0] === 'ב') afterMonthParts.shift();

    const yearClean = afterMonthParts.join('');

    // DECODE GEMATRIYA
    function decode(str) {
        if (!str) return 0;
        const map = {
            'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5, 'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9,
            'י': 10, 'כ': 20, 'ל': 30, 'מ': 40, 'נ': 50, 'ס': 60, 'ע': 70, 'פ': 80, 'צ': 90,
            'ק': 100, 'ר': 200, 'ש': 300, 'ת': 400
        };
        let sum = 0;
        for (let char of str) {
            sum += map[char] || 0;
        }
        return sum;
    }

    const day = decode(dayClean);
    let year = decode(yearClean);
    if (year > 0 && year < 1000) year += 5000; // Assume 5700s
    if (year === 0) return null; // Need year

    try {
        return new HDate(day, monthNum, year);
    } catch (e) {
        return null;
    }
}

async function fixDates() {
    console.log(`Reading from ${INPUT_FILE}...`);
    const rawData = fs.readFileSync(INPUT_FILE, 'utf-8');
    const memorials = JSON.parse(rawData);

    let processedCount = 0;
    let fixedCount = 0;

    const fixedMemorials = memorials.map(record => {
        processedCount++;
        let hDate = null;

        // Strategy A: Gregorian
        if (record.gregorian_date && record.gregorian_date.trim()) {
            try {
                const gDate = new Date(record.gregorian_date);
                if (!isNaN(gDate.getTime())) {
                    hDate = new HDate(gDate);
                }
            } catch (e) { }
        }

        // Strategy B: Hebrew Parse
        if (!hDate && record.hebrew_date_text) {
            const parsed = parseHebrewDateString(record.hebrew_date_text);
            if (parsed) {
                hDate = parsed;
                // console.log(`[INFO] Parsed: ${record.hebrew_date_text} -> ${hDate.toString()}`);
            }
        }

        // Apply Fixes
        if (hDate) {
            // 1. Strict Format
            record.hebrew_date_text = formatStrictHebrewDate(hDate);

            // 2. Struct
            record.hebrew_date_struct = {
                day: hDate.getDate(),
                month: hDate.getMonth(),
                year: hDate.getFullYear()
            };

            // 3. Gregorian Fill
            if (!record.gregorian_date || record.gregorian_date === '0' || !record.gregorian_date.match(/\d{4}-\d{2}-\d{2}/)) {
                try {
                    const g = hDate.greg();
                    record.gregorian_date = g.toISOString().split('T')[0];
                } catch (e) { }
            }

            fixedCount++;
        }

        return record;
    });

    console.log(`Processed ${processedCount} records.`);
    console.log(`Fixed/Enriched ${fixedCount} records.`);

    fs.writeFileSync(OUTPUT_FILE_V2, JSON.stringify(fixedMemorials, null, 2), 'utf-8');
    console.log(`Wrote output to ${OUTPUT_FILE_V2}`);
}

fixDates().catch(console.error);
