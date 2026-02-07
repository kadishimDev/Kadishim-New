import { HDate, gematriya } from '@hebcal/core';

/**
 * Returns a strict Hebrew date string in the format: "כ"ב בכסליו, התשע"ז"
 * @param {Date|HDate} date - JS Date object or HDate object
 * @returns {string} Formatted string
 */
export const formatHebrewDate = (date) => {
    const hDate = date instanceof HDate ? date : new HDate(date);

    const day = hDate.getDate();
    const month = hDate.getMonth();
    const year = hDate.getFullYear();

    // 1. Month Mapping
    const months = ['', 'ניסן', 'אייר', 'סיון', 'תמוז', 'אב', 'אלול', 'תשרי', 'חשון', 'כסלו', 'טבת', 'שבט'];
    let monthName = '';

    if (HDate.isLeapYear(year)) {
        if (month === 12) monthName = 'אדר א';
        else if (month === 13) monthName = 'אדר ב';
        else monthName = months[month];
    } else {
        if (month === 12) monthName = 'אדר';
        else monthName = months[month];
    }

    // 2. Day Format
    let dayStr = gematriya(day).replace(/['"]/g, '').replace(/״/g, '');
    if (dayStr.length === 1) dayStr += "'";
    else dayStr = dayStr.slice(0, -1) + '"' + dayStr.slice(-1);

    // 3. Year Format
    let yearStr = gematriya(year).replace(/['"]/g, '').replace(/״/g, '');
    // Add 'Ha' prefix
    const fullYearStr = `ה${yearStr}`;
    // Add quotes to final year string
    let finalYear = fullYearStr;
    if (fullYearStr.length > 1) {
        finalYear = fullYearStr.slice(0, -1) + '"' + fullYearStr.slice(-1);
    }

    // 4. Month Prefix 'Be'
    const monthWithPrefix = `ב${monthName}`;

    return `${dayStr} ${monthWithPrefix}, ${finalYear}`;
};

/**
 * Normalizes a Hebrew date string for fuzzy matching.
 * Removes quotes, dashes, prefixes (like 'ב' before month), and extra spaces.
 * @param {string} text 
 * @returns {string}
 */
export const normalizeHebrewDate = (text) => {
    if (!text) return '';
    return text
        .replace(/["'״׳]/g, '') // Remove all types of quotes
        .replace(/-/g, ' ')      // Replace dashes with space
        .replace(/\bב(?=[א-ת])/g, '') // Remove 'Be' prefix from month if present (naive check)
        .replace(/\s+/g, ' ')    // Collapse spaces
        .trim();
};

/**
 * Converts a Gregorian date to HDate
 * @param {Date} date 
 * @returns {HDate}
 */
export const toHebrewDate = (date) => {
    return new HDate(date);
};

/**
 * Returns list of Hebrew months for dropdowns
 * @returns {string[]}
 */
export const getHebrewMonths = (year) => {
    // If year is leap, we might have Adar I / II
    // For simplicity in UI, we can list standard months or generate based on year
    if (new HDate(1, 6, year).isLeapYear()) {
        return ['ניסן', 'אייר', 'סיון', 'תמוז', 'אב', 'אלול', 'תשרי', 'חשון', 'כסלו', 'טבת', 'שבט', 'אדר א', 'אדר ב'];
    }
    return ['ניסן', 'אייר', 'סיון', 'תמוז', 'אב', 'אלול', 'תשרי', 'חשון', 'כסלו', 'טבת', 'שבט', 'אדר'];
};
/**
 * Smartly formats a Hebrew date string by adding Gershayim (quotes) where appropriate.
 * e.g., "כב תשעז" -> "כ״ב בתשע״ז" (simplified)
 * e.g., "א תשרי" -> "א׳ בתשרי"
 * Also handles basic prefixing.
 */
export const formatHebrewDateSmart = (rawDate) => {
    if (!rawDate) return '';
    let formatted = rawDate.trim();

    // 1. Add Gershayim to the year if it looks like a year (e.g. תשעז -> תשע״ז, התשעח -> התשע״ח)
    // Basic regex for year at end of string
    formatted = formatted.replace(/(\b[ת][\u0590-\u05FF]{3}\b)$/, (match) => {
        // Init letter + quote + rest
        // Actually Hebcal gematriya output usually is correct, but raw user input might not be.
        // Let's just ensure if it's 3-4 letters starting with Tav, it gets quotes before last char.
        if (!match.includes('״') && !match.includes('"')) {
            return match.slice(0, match.length - 1) + '״' + match.slice(match.length - 1);
        }
        return match;
    });

    // 2. Add quotes to Day if missing (e.g. כב -> כ״ב)
    // Scan for 1-2 letter words at start that match common day numerals
    formatted = formatted.replace(/^(\b[\u0590-\u05FF]{1,2}\b)/, (match) => {
        if (!match.includes('״') && !match.includes("'")) {
            if (match.length === 1) return match + "׳";
            return match[0] + '״' + match[1];
        }
        return match;
    });

    return formatted;
};

/**
 * Ensures an item has both Hebrew and Gregorian dates.
 * If one is missing, converts from the other.
 */
export const ensureDates = (item) => {
    // Clone to avoid mutation issues if used directly
    const newItem = { ...item };

    // 1. If we have Gregorian but no Hebrew
    if (newItem.gregorian_date && !newItem.hebrew_date_text) {
        try {
            const d = new Date(newItem.gregorian_date);
            if (!isNaN(d.getTime())) {
                const hDate = new HDate(d);
                newItem.hebrew_date_text = hDate.toString('h');
                newItem.hebrew_date = hDate.toString('h');
            }
        } catch (e) {
            console.error("Failed to convert Greg->Heb", e);
        }
    }

    // 2. If we have Hebrew but no Gregorian
    // This is harder because Hebrew strings vary. Ideally we need structured HDate.
    // If we only have text string "כ״ב בשבט", we can't easily guess year if missing.
    // Assuming we might have `hebrew_date` raw field.

    return newItem;
};
