import fs from 'fs';
import path from 'path';
import { HDate, gematriya, HebrewCalendar } from '@hebcal/core';

const DATA_FILE = path.resolve('src/data/memorials.json');

// --- Helpers (Copied/Adapted from dateUtils) ---

const formatHebrewDate = (hDate) => {
    let year = hDate.getFullYear();
    if (year < 0) year = 5780; // Fallback for bad years

    const day = hDate.getDate();
    const monthName = hDate.getMonthName('h');

    // Format day
    let dayStr = "";
    try {
        dayStr = gematriya(day);
    } catch (e) {
        dayStr = "א";
    }

    if (!dayStr.includes('"') && !dayStr.includes("'")) {
        if (dayStr.length === 1) dayStr += "'";
        else dayStr = dayStr.slice(0, -1) + '"' + dayStr.slice(-1);
    }

    // Format year
    let yearStr = "";
    try {
        yearStr = gematriya(year);
    } catch (e) {
        yearStr = "תשפ";
    }

    if (!yearStr.includes('"') && !yearStr.includes("'")) {
        if (yearStr.length === 1) yearStr += "'";
        else yearStr = yearStr.slice(0, -1) + '"' + yearStr.slice(-1);
    }
    const fullYearStr = `ה${yearStr}`;
    const monthWithPrefix = `ב${monthName}`;

    return `${dayStr} ${monthWithPrefix}, ${fullYearStr}`;
};

// --- Main Process ---

async function cleanDB() {
    console.log("Reading DB...");
    const rawData = fs.readFileSync(DATA_FILE, 'utf-8');
    const data = JSON.parse(rawData);
    console.log(`Loaded ${data.length} records.`);

    const cleaned = [];
    let fixedCount = 0;
    let droppedCount = 0;

    for (const item of data) {
        // Basic Validation
        if (!item.name || item.name.length < 2 || item.name === 'R') {
            droppedCount++;
            continue;
        }

        const newItem = { ...item };
        let hDateObj = null;

        // 1. Try to establish a master HDate object

        // A. From Boolean/Struct
        if (newItem.hebrew_date_struct && newItem.hebrew_date_struct.year && newItem.hebrew_date_struct.year > 3000) {
            try {
                hDateObj = new HDate(
                    newItem.hebrew_date_struct.day,
                    newItem.hebrew_date_struct.month,
                    newItem.hebrew_date_struct.year
                );
            } catch (e) {
                // Invalid struct, ignore
            }
        }

        // B. From Gregorian if HDate failed
        if (!hDateObj && newItem.gregorian_date) {
            const d = new Date(newItem.gregorian_date);
            // Strict check: must be valid time and reasonable year (>1900)
            if (!isNaN(d.getTime()) && d.getFullYear() > 1900) {
                hDateObj = new HDate(d);
            }
        }

        // 2. Sync fields based on HDate
        if (hDateObj) {
            // Fill Struct
            newItem.hebrew_date_struct = {
                day: hDateObj.getDate(),
                month: hDateObj.getMonth(),
                year: hDateObj.getFullYear()
            };

            // Fill Text (Strict Format)
            newItem.hebrew_date_text = formatHebrewDate(hDateObj);

            // Fill Gregorian if missing
            if (!newItem.gregorian_date) {
                const g = hDateObj.greg();
                const y = g.getFullYear();
                const m = String(g.getMonth() + 1).padStart(2, '0');
                const d = String(g.getDate()).padStart(2, '0');
                newItem.gregorian_date = `${y}-${m}-${d}`;
            }

            fixedCount++;
        } else {
            // If no valid date found, we keep the record but it won't appear in calendar properly.
            // Ensure fields exist at least
            if (!newItem.hebrew_date_struct) newItem.hebrew_date_struct = null;
        }

        // 3. Name Cleanup (Simple trim)
        newItem.name = newItem.name.trim();

        // 4. Missing Mother Name (Optional - just ensure string)
        if (!newItem.mother_name) newItem.mother_name = "";

        cleaned.push(newItem);
    }

    console.log(`Fixed/Processed: ${fixedCount}`);
    console.log(`Dropped (Invalid): ${droppedCount}`);
    console.log(`Final Count: ${cleaned.length}`);

    fs.writeFileSync(DATA_FILE, JSON.stringify(cleaned, null, 2));
    console.log("Done. Database updated.");
}

cleanDB();
