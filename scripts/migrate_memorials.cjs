const fs = require('fs');
const path = require('path');

// Paths
const legacyPath = path.join(__dirname, '../src/data/kaddish_list.json');
const newDbPath = path.join(__dirname, '../src/data/memorials.json');

// Helper: Custom Gematriya for Day/Year (with quotes/gershayim)
const toGematriya = (num) => {
    if (!num) return '';
    const letters = {
        400: 'ת', 300: 'ש', 200: 'ר', 100: 'ק',
        90: 'צ', 80: 'פ', 70: 'ע', 60: 'ס', 50: 'נ', 40: 'מ', 30: 'ל', 20: 'כ', 10: 'י',
        9: 'ט', 8: 'ח', 7: 'ז', 6: 'ו', 5: 'ה', 4: 'ד', 3: 'ג', 2: 'ב', 1: 'א'
    };

    // Special cases like 15 (טו) and 16 (טז)
    if (num === 15) return 'ט"ו';
    if (num === 16) return 'ט"ז';

    let result = '';
    let remains = num;

    // Thousands (usually handled by removing them for display, e.g. 5784 -> 784)
    if (remains >= 1000) remains = remains % 1000;

    Object.keys(letters).map(Number).sort((a, b) => b - a).forEach(val => {
        while (remains >= val) {
            result += letters[val];
            remains -= val;
        }
    });

    // Add quotes
    if (result.length === 1) {
        return result + "'";
    } else if (result.length > 1) {
        return result.slice(0, -1) + '"' + result.slice(-1);
    }
    return result;
};

// Helper: Strict Hebrew Date Formatter
// Output: כ"ב בכסליו, התשע"ז
const formatStrictHebrew = (hDate) => {
    // hDate is HDate object from hebcal
    const gemDay = toGematriya(hDate.getDate());
    // getMonthName('h') returns "Nisan", "Iyyar" etc (transliterated) by default? 
    // We need real Hebrew. 
    // HDate.toString('h') returns "8th of Nisan, 5780".
    // We can use the locale utility if available, or just a map.
    // Let's use a manual map to be ultra-safe and support the 'ב' prefix correctly.
    const months = {
        1: 'ניסן', 2: 'אייר', 3: 'סיון', 4: 'תמוז', 5: 'אב', 6: 'אלול',
        7: 'תשרי', 8: 'חשון', 9: 'כסלו', 10: 'טבת', 11: 'שבט', 12: 'אדר',
        13: 'אדר ב' // Leap year logic needs care
    };

    // Hebcal months: 1=Nisan... 7=Tishrei. 12=Adar (or Adar I), 13=Adar II.
    // We need to check use of Adar I / II.
    let m = hDate.getMonth();
    let monthName = months[m] || 'ניסן';

    // Handle Adar properly
    if (hDate.isLeapYear()) {
        if (m === 12) monthName = 'אדר א';
        if (m === 13) monthName = 'אדר ב';
    } else {
        if (m === 12) monthName = 'אדר';
    }

    // Add prefix 'ב'
    // Exception: If starts with Aleph? "באייר", "באב", "באלול", "באדר". Yes.
    // "בניסן", "בסיון".
    const strictMonth = 'ב' + monthName;

    // Year logic: 5784 -> 784 -> תשפ"ד -> Add 'ה' prefix -> התשפ"ד
    const yearNum = hDate.getFullYear();
    const gemYear = toGematriya(yearNum);
    const strictYear = 'ה' + gemYear;

    return `${gemDay} ${strictMonth}, ${strictYear}`;
};

const parseDate = (dateStr) => {
    if (!dateStr || dateStr === '0') return null;
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        const d = new Date(`${parts[0]} ${parts[2]}, ${parts[1]}`);
        if (!isNaN(d.getTime())) return d;
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d;
    return null;
};

(async () => {
    try {
        const { HDate, HebrewCalendar } = await import('@hebcal/core');

        const rawLegacy = fs.readFileSync(legacyPath, 'utf8');
        const legacyData = JSON.parse(rawLegacy);

        const normalized = legacyData.map((item, index) => {
            const passedName = [item.details?.passed_name_first, item.details?.passed_name_last].filter(Boolean).join(' ');

            const newItem = {
                id: item.id || index + 1000,
                name: passedName || item.name || "Unknown",
                requester_name: item.name,
                father_name: item.details?.father_name || '',
                mother_name: '',
                gender: 'male',

                gregorian_date: null,
                hebrew_date_text: item.hebrew_date_text || '',
                hebrew_date_struct: null,
                created_at: item.creation_date || new Date().toISOString()
            };

            // 1. Try to establish a primary HDate object
            let hDateObj = null;

            // Strategy A: From Gregorian Input
            if (item.gregorian_date && item.gregorian_date !== '0') {
                const d = parseDate(item.gregorian_date);
                if (d) {
                    newItem.gregorian_date = d.toISOString().split('T')[0];
                    hDateObj = new HDate(d);
                }
            }

            // Strategy B: From Hebrew Struct "09/08/5780"
            if (!hDateObj && item.hebrew_date && item.hebrew_date.includes('/')) {
                const parts = item.hebrew_date.split('/');
                if (parts.length === 3 && parts[0] !== '0') {
                    // Try to make HDate
                    try {
                        hDateObj = new HDate(parseInt(parts[0]), parseInt(parts[1]), parseInt(parts[2]));
                        // Backfill Gregorian
                        newItem.gregorian_date = hDateObj.greg().toISOString().split('T')[0];
                    } catch (e) {
                        console.warn(`Invalid Hebrew Date for ${newItem.name}: ${item.hebrew_date}`);
                    }
                }
            }

            // 2. Normalize Text
            if (hDateObj) {
                // We have a solid date source, strictly format it
                const strictText = formatStrictHebrew(hDateObj);
                newItem.hebrew_date_text = strictText;

                // Save struct for Calendar Widget
                newItem.hebrew_date_struct = {
                    day: hDateObj.getDate(),
                    month: hDateObj.getMonth(),
                    year: hDateObj.getFullYear()
                };
            } else {
                // Fallback: If we only have text, we keep it, but maybe try to parse it later?
                // For now, if no date source, leave as is.
                if (!newItem.hebrew_date_text && item.hebrew_date && !item.hebrew_date.includes('/')) {
                    newItem.hebrew_date_text = item.hebrew_date; // fallback to raw string
                }
            }

            return newItem;
        }).filter(item => item.name !== "Unknown"); // Filter junk

        fs.writeFileSync(newDbPath, JSON.stringify(normalized, null, 2));
        console.log(`Migrated ${normalized.length} records to ${newDbPath}`);

    } catch (e) {
        console.error("Migration Failed:", e);
    }
})();
