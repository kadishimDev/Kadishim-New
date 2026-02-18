import { HDate, gematriya } from '@hebcal/core';
import { formatHebrewDate } from './dateUtils'; // Use the strict formatter we already fixed

/**
 * Normalizes a memorial record
 * @param {Object} record 
 * @returns {Object} { normalizedRecord, changes: { field: { old, new } }, hasChanges: boolean }
 */
export const normalizeRecord = (record) => {
    let newData = { ...record };
    let changes = {};
    let hasChanges = false;

    // Helper to log change
    const update = (field, oldVal, newVal) => {
        if (oldVal !== newVal) {
            changes[field] = { old: oldVal, new: newVal };
            newData[field] = newVal;
            hasChanges = true;
        }
    };

    // 1. Hebrew Date Normalization
    if (newData.death_date_hebrew) {
        // Try to strict format if it looks "messy"
        // Heuristic: valid string usually has 3 parts. 
        // If year is > 5000 (numeric), fix it.

        let current = newData.death_date_hebrew;
        let formatted = current;

        // Clean up common issues
        formatted = formatted.trim();
        formatted = formatted.replace(/\s+/g, ' '); // double spaces

        // Check for 5000 year
        // Regex for numeric year at end
        const matchYear = formatted.match(/\d{4}$/);
        if (matchYear && parseInt(matchYear[0]) > 5000) {
            // It has a number year like "כ' בכסלו 5784"
            // We can try to re-format using HDate if we can parse the rest, 
            // OR just fix the year part using gematriya
            const numYear = parseInt(matchYear[0]);
            let yearStr = gematriya(numYear);
            // Add 'He' prefix if missing and year > 5000 (standard convention)
            // Actually our formatHebrewDate handles this structure: "5'Month Year"

            // Safer: If we have Gregorian date, just REGENERATE the Hebrew date to be perfect
            if (newData.death_date_gregorian) {
                const d = new Date(newData.death_date_gregorian);
                const hDate = new HDate(d);
                // Check if the generated one matches the *intent* of the current one (hard to say)
                // But usually Gregorian is the source of truth for "calculator" accuracy.
                // HOWEVER, user input Hebrew might differ (after sunset issues).

                // Strategy: Only fix format, don't change date unless obviously wrong format.
            }
        }
    }

    // STRICT REFORMATTING strategy:
    // If we have Gregorian Date, generate a "Proposed Hebrew Date"
    // If original is missing or looks like "5784", take proposed.
    if (newData.death_date_gregorian) {
        const d = new Date(newData.death_date_gregorian);
        const hDate = new HDate(d);

        // Adjust for sunset if flags are present (we don't have sunset flag in all records)
        // Default to "simple" conversion
        const strictHebrew = formatHebrewDate(hDate);

        if (!newData.death_date_hebrew || newData.death_date_hebrew === '00-00-0000' || newData.death_date_hebrew.includes('578')) {
            update('death_date_hebrew', newData.death_date_hebrew, strictHebrew);
        } else {
            // If Hebrew Exists, does it adhere to format?
            // e.g. "כ' כסלו תשפד" -> "כ' בכסלו התשפ\"ד"
            // It's hard to parse arbitrary Hebrew strings. 
            // Logic: If it contains numbers, REPLACE with strict letters?
            if (/\d/.test(newData.death_date_hebrew)) {
                update('death_date_hebrew', newData.death_date_hebrew, strictHebrew); // Aggressive fix for numbers
            }
        }
    }

    // 2. Parents Split (Smart Logic)
    // A. Parse from "Father Name" field (Legacy "Mixed" fields like "Yosef veZahava")
    if (newData.father_name && !newData.mother_name) {
        const separators = [' ו-', ' ו', ', '];
        for (let sep of separators) {
            if (newData.father_name.includes(sep)) {
                const parts = newData.father_name.split(sep);
                if (parts.length === 2) {
                    const fatherPromise = parts[0].trim();
                    const motherPromise = parts[1].trim();
                    if (fatherPromise && motherPromise) {
                        update('father_name', newData.father_name, fatherPromise);
                        update('mother_name', newData.mother_name, motherPromise);
                        if (!newData.notes) newData.notes = '';
                        newData.notes += ` [Auto-Split: ${fatherPromise} & ${motherPromise}]`;
                        hasChanges = true;
                    }
                    break;
                }
            }
        }
    }

    // B. Parse from Deceased Name (If parents missing)
    // Logic: "Moshe Ben Amram" -> Father: Amram
    // Logic: "Dina Bat Leah" -> Mother: Leah (or Father, context dependent, but usually Father in ancient texts, Mother in medical/spiritual context). 
    // In Kaddish context, usually "Ben/Bat [Father]" is the standard for identification, EXCEPT for prayers for the sick which are "Ben/Bat [Mother]". 
    // For Memorial (Yahrzeit), it's usually Father's name.
    if (!newData.father_name && newData.name) {
        const nameParts = newData.name.split(/\s+/); // Split by spaces
        const benIndex = nameParts.findIndex(p => p === 'בן' || p === 'בר' || p === 'ben');
        const batIndex = nameParts.findIndex(p => p === 'בת' || p === 'bat');

        if (benIndex > 0 && benIndex < nameParts.length - 1) {
            // "Moshe Ben Amram"
            const fatherCandidate = nameParts.slice(benIndex + 1).join(' '); // Take everything after 'Ben'
            update('father_name', '', fatherCandidate);

            // Also infer gender
            if (!newData.gender) update('gender', '', 'male');
        } else if (batIndex > 0 && batIndex < nameParts.length - 1) {
            // "Dina Bat Yaakov"
            const fatherCandidate = nameParts.slice(batIndex + 1).join(' ');
            update('father_name', '', fatherCandidate);

            // Also infer gender
            if (!newData.gender) update('gender', '', 'female');
        }
    }

    // 3. Date Synchronization (Two-Way)
    // Case A: Have Gregorian, Missing/Bad Hebrew -> Generate Hebrew
    if (newData.death_date_gregorian && !newData.death_date_hebrew) {
        try {
            const d = new Date(newData.death_date_gregorian);
            const hDate = new HDate(d);
            const strictHebrew = formatHebrewDate(hDate);
            update('death_date_hebrew', '', strictHebrew);
        } catch (e) {
            console.error("Date conversion error", e);
        }
    }

    // Case B: Have Hebrew, Missing Gregorian -> Generate Gregorian (Best Effort)
    // This is harder without a library that parses Hebrew strings reliably. 
    // We will skip this direction for now unless we integrate a heavy parser.

    // 4. Strict Hebrew Date Formatting
    // Fix "5784" numeric years to Hebrew letters if possible, or just re-generate from Gregorian if available.
    if (newData.death_date_hebrew && newData.death_date_gregorian) {
        // If Hebrew date looks "ugly" (contains numbers or dashes), overwrite with Calculated Strict Version
        // Regex: Has digits 0-9
        if (/\d/.test(newData.death_date_hebrew)) {
            const d = new Date(newData.death_date_gregorian);
            const hDate = new HDate(d);
            const strictHebrew = formatHebrewDate(hDate);
            if (strictHebrew !== newData.death_date_hebrew) {
                update('death_date_hebrew', newData.death_date_hebrew, strictHebrew);
            }
        }
    }

    return {
        original: record,
        normalized: newData,
        changes,
        hasChanges
    };
};
