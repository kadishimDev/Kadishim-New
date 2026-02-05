import fs from 'fs';
import path from 'path';

const RAW_FILE = 'src/data/extracted_memorials.json';
const OUTPUT_FILE = 'src/data/memorials.json';

// Mapping based on analysis
const FIELDS = {
    SERVICE_TYPE: '5',
    DECEASED_FIRST: '9',
    DECEASED_LAST: '10',
    FATHER_FIRST: '15',
    FATHER_LAST: '16',
    MOTHER_FIRST: '29',
    MOTHER_LAST: '30',
    GENDER: '28', // "בן" or "בת"
    REQUESTER_NAME: '27',
    GREGORIAN_DATE: '41', // "05/18/2022" or "March 21, 2022"
    HEBREW_DAY_LEGACY: '32',
    HEBREW_MONTH_LEGACY: '33',
    HEBREW_YEAR_LEGACY: '34',
    HEBREW_DAY_NEW: '44', // "כ\"ט"
    HEBREW_MONTH_NEW: '45', // "אייר"
};

function cleanName(first, last) {
    const f = (first || '').trim();
    const l = (last || '').trim();
    if (!f && !l) return '';
    if (!l) return f;
    if (!f) return l;
    return `${f} ${l}`;
}

function normalizeHebrewDate(day, month, year) {
    if (!day || !month) return null;

    // Normalize Day (strip quotes)
    let d = day.replace(/\\"/g, '').replace(/"/g, '').replace(/'/g, '');

    // Normalize Month
    let m = month.replace(/\\"/g, '').replace(/"/g, '').replace(/'/g, '');

    // Normalize Year
    let y = (year || '').replace(/\\"/g, '').replace(/"/g, '').replace(/'/g, '');

    // Construct text
    return `${d} ${m} ${y}`.trim();
}

function parseHebrewDateToStruct(dayStr, monthStr) {
    // This is best effort. Real hdate struct needs numeric values.
    // For now, we will store the text to be safe, and let the Calendar logic handle fuzzy matching or manual cleanup later.
    // Ideally we would map "א" -> 1, "ניסן" -> 1.
    return null; // For now, we rely on the text field or gregorian calc in the app
}

function run() {
    console.log("Starting Migration Transformation...");

    const rawData = JSON.parse(fs.readFileSync(RAW_FILE, 'utf8'));
    const cleanData = [];

    rawData.forEach(entry => {
        // 1. Deceased Name
        const name = cleanName(entry[FIELDS.DECEASED_FIRST], entry[FIELDS.DECEASED_LAST]);
        if (!name || name === 'test' || name === 'בדיקה') return;

        // 2. Parents
        const father = cleanName(entry[FIELDS.FATHER_FIRST], entry[FIELDS.FATHER_LAST]);
        const mother = cleanName(entry[FIELDS.MOTHER_FIRST], entry[FIELDS.MOTHER_LAST]);

        // 3. Dates
        let greg = entry[FIELDS.GREGORIAN_DATE];

        // Hebrew Date Logic: Check "New" fields first, then "Legacy"
        let hebrewDateText = normalizeHebrewDate(entry[FIELDS.HEBREW_DAY_NEW], entry[FIELDS.HEBREW_MONTH_NEW], null);

        if (!hebrewDateText || hebrewDateText.length < 2) {
            hebrewDateText = normalizeHebrewDate(entry[FIELDS.HEBREW_DAY_LEGACY], entry[FIELDS.HEBREW_MONTH_LEGACY], entry[FIELDS.HEBREW_YEAR_LEGACY]);
        }

        // 4. Gender
        let gender = 'male';
        const genderRaw = entry[FIELDS.GENDER];
        if (genderRaw === 'בת' || genderRaw === 'Female') gender = 'female';

        // 5. Requester
        const requester = entry[FIELDS.REQUESTER_NAME];

        // 6. Type
        const typeRaw = entry[FIELDS.SERVICE_TYPE];
        let type = 'kaddish';
        if (typeRaw && typeRaw.includes('משניות')) type = 'mishnayot';


        cleanData.push({
            id: entry.id || Math.random().toString(36).substr(2, 9),
            name: name,
            father_name: father,
            mother_name: mother,
            gender: gender,
            type: type,
            gregorian_date: greg,
            hebrew_date_text: hebrewDateText,
            requester_name: requester,
            details: {
                original_form_id: entry.form_id,
                phone: entry['12'] + '-' + entry['11'] // Best effort phone
            }
        });
    });

    console.log(`Transformed ${cleanData.length} valid records.`);

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(cleanData, null, 2));
    console.log(`Saved to ${OUTPUT_FILE}`);
}

run();
