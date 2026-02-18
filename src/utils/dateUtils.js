import { HDate, gematriya } from '@hebcal/core';

/**
 * Returns a strict Hebrew date string in the optimized format: "כ' בכסליו התשע"ז"
 * @param {Date|HDate} date - JS Date object or HDate object
 * @returns {string} Formatted string
 */
export const formatHebrewDate = (date) => {
    try {
        const hDate = date instanceof HDate ? date : new HDate(date);

        const day = hDate.getDate();
        const month = hDate.getMonth();
        const year = hDate.getFullYear();

        // 1. Month with 'B' prefix
        const months = {
            1: 'בניסן', 2: 'באייר', 3: 'בסיון', 4: 'בתמוז', 5: 'באב', 6: 'באלול',
            7: 'בתשרי', 8: 'בחשון', 9: 'בכסלו', 10: 'בטבת', 11: 'בשבט',
            12: 'באדר', 13: 'באדר ב\''
        };

        let monthName = months[month];
        if (HDate.isLeapYear(year)) {
            if (month === 12) monthName = 'באדר א\'';
            if (month === 13) monthName = 'באדר ב\'';
        }

        // Helper to add quotes strictly
        const addQuotes = (str) => {
            const clean = str.replace(/['"״׳]/g, '');
            if (clean.length === 1) return clean + "'";
            return clean.slice(0, -1) + '"' + clean.slice(-1);
        };

        // 2. Day
        const dayStr = addQuotes(gematriya(day));

        // 3. Year
        // Remove 5000, ensure 'Hirik' (5000) is ignored for the text, but add 'He' (5000 implied)
        // Standard practice: 5784 -> תשפד -> התשפ"ד
        const shortYear = year % 1000; // 784
        let yearLetters = gematriya(shortYear).replace(/['"״׳]/g, '');

        // Add 'He' prefix
        yearLetters = 'ה' + yearLetters;

        const yearStr = addQuotes(yearLetters);

        return `${dayStr} ${monthName} ${yearStr}`;

    } catch (e) {
        console.error("Date Format Error:", e);
        return "";
    }
};

/**
 * Returns structured Hebrew date parts for forms
 * @param {Date|HDate} date 
 * @returns {{day: string, month: string, year: string}}
 */
export const getStructuredHebrewDate = (date) => {
    try {
        const hDate = date instanceof HDate ? date : new HDate(date);
        const day = hDate.getDate();
        const month = hDate.getMonth(); // 1-based (Nissan = 1)
        const year = hDate.getFullYear();

        // Helper to add quotes strictly
        const addQuotes = (str) => {
            const clean = str.replace(/['"״׳]/g, '');
            if (clean.length === 1) return clean + "'";
            return clean.slice(0, -1) + '"' + clean.slice(-1);
        };

        // Day
        const dayStr = addQuotes(gematriya(day));

        // Month (Clean, no 'Bet' prefix)
        const monthNames = [
            '', // dummy index 0
            'ניסן', 'אייר', 'סיון', 'תמוז', 'אב', 'אלול',
            'תשרי', 'חשון', 'כסלו', 'טבת', 'שבט',
            'אדר', 'אדר ב\'' // Default, corrected below for leap years
        ];

        // Correct Adar handling
        if (HDate.isLeapYear(year)) {
            monthNames[12] = 'אדר א\'';
            monthNames[13] = 'אדר ב\'';
        } else {
            monthNames[12] = 'אדר';
        }

        const monthStr = monthNames[month] || '';

        // Year
        const shortYear = year % 1000;
        let yearLetters = gematriya(shortYear).replace(/['"״׳]/g, '');
        yearLetters = 'ה' + yearLetters;
        const yearStr = addQuotes(yearLetters);

        return { day: dayStr, month: monthStr, year: yearStr };

    } catch (e) {
        console.error("Structured Date Error", e);
        return { day: '', month: '', year: '' };
    }
};

/**
 * Alias for formatHebrewDate to support legacy imports
 */
export const formatHebrewDateSmart = formatHebrewDate;

/**
 * Normalizes a Hebrew date string for fuzzy matching.
 */
export const normalizeHebrewDate = (text) => {
    if (!text) return '';
    return text
        .replace(/["'״׳]/g, '')
        .replace(/-/g, ' ')
        .replace(/\bב(?=[א-ת])/g, '') // Remove 'Be' prefix
        .replace(/\s+/g, ' ')
        .trim();
};

/**
 * Converts a Gregorian date to HDate
 */
export const toHebrewDate = (date) => {
    return new HDate(date);
};

/**
 * Returns list of Hebrew months for dropdowns logic
 */
export const getHebrewMonths = (year) => {
    const isLeap = new HDate(1, 6, year).isLeapYear();
    if (isLeap) {
        return ['ניסן', 'אייר', 'סיון', 'תמוז', 'אב', 'אלול', 'תשרי', 'חשון', 'כסלו', 'טבת', 'שבט', 'אדר א', 'אדר ב'];
    }
    return ['ניסן', 'אייר', 'סיון', 'תמוז', 'אב', 'אלול', 'תשרי', 'חשון', 'כסלו', 'טבת', 'שבט', 'אדר'];
};

/**
 * Ensures an item has both Hebrew and Gregorian dates.
 * If one is missing, converts from the other.
 */
export const ensureDates = (item) => {
    const newItem = { ...item };

    // 1. Greg -> Heb
    if (newItem.gregorian_date && (!newItem.hebrew_date_text || newItem.hebrew_date_text.length < 5)) {
        try {
            const d = new Date(newItem.gregorian_date);
            if (!isNaN(d.getTime())) {
                newItem.hebrew_date_text = formatHebrewDate(d);
            }
        } catch (e) { console.error("Converter G->H Error", e); }
    }

    // 2. Heb -> Greg
    // Only reliable if we have structured data or can parse strict format
    // This is complex without a robust parser, but we can try simple cases or rely on backend
    return newItem;
};
