
// Common Name Mapping (English -> Hebrew)
const commonNames = {
    'avraham': 'אברהם', 'abraham': 'אברהם',
    'yitzhak': 'יצחק', 'isaac': 'יצחק',
    'yaakov': 'יעקב', 'jacob': 'יעקב',
    'david': 'דוד',
    'moshe': 'משה', 'moses': 'משה',
    'aharon': 'אהרן', 'aaron': 'אהרן',
    'yosef': 'יוסף', 'joseph': 'יוסף',
    'sarah': 'שרה', 'sara': 'שרה',
    'rivka': 'רבקה', 'rebecca': 'רבקה',
    'rachel': 'רחל',
    'leah': 'לאה',
    'esther': 'אסתר',
    'miriam': 'מרים',
    'rut': 'רות', 'ruth': 'רות',
    'noa': 'נועה',
    'shira': 'שירה',
    'tamar': 'תמר',
    'chana': 'חנה', 'hannah': 'חנה',
    'shmuel': 'שמואל', 'samuel': 'שמואל',
    'daniel': 'דניאל',
    'michael': 'מיכאל',
    'gabriel': 'גבריאל',
    'jonathan': 'יונתן', 'yonatan': 'יונתן',
    'benjamin': 'בנימין', 'binyamin': 'בנימין',
    'adam': 'אדם',
    'eve': 'חוה', 'chava': 'חוה',
    'noah': 'נח',
    'tester': 'טסטר', // For debugging
    'israel': 'ישראל', 'yisrael': 'ישראל'
};

// Phonetic Mapping (Fallback)
const phoneticMap = {
    'a': 'א',
    'b': 'ב',
    'c': 'ק', // Hard C
    'd': 'ד',
    'e': 'א', // Or ע
    'f': 'פ',
    'g': 'ג',
    'h': 'ה',
    'i': 'י',
    'j': 'ג', // Or י depending on sound, usually G/J sound
    'k': 'ק',
    'l': 'ל',
    'm': 'מ',
    'n': 'נ',
    'o': 'ו',
    'p': 'פ',
    'q': 'ק',
    'r': 'ר',
    's': 'ס',
    't': 'ט',
    'u': 'ו',
    'v': 'ו',
    'w': 'ו',
    'x': 'קס',
    'y': 'י',
    'z': 'ז',
    'th': 'ת',
    'ph': 'פ',
    'sh': 'ש',
    'ch': 'ח'
};

export const transliterateName = (input) => {
    if (!input) return '';

    // clean input
    const lower = input.toLowerCase().trim();

    // 1. Check Dictionary
    if (commonNames[lower]) {
        return commonNames[lower];
    }

    // 2. Phonetic Transliteration
    let hebrew = '';
    let i = 0;
    while (i < lower.length) {
        // Check 2-letter combos
        const twoChars = lower.substr(i, 2);
        if (phoneticMap[twoChars]) {
            hebrew += phoneticMap[twoChars];
            i += 2;
        } else {
            const char = lower[i];
            hebrew += phoneticMap[char] || char; // Keep unknown chars as is
            i++;
        }
    }

    return hebrew;
};

export const isEnglish = (text) => {
    return /^[A-Za-z\s]+$/.test(text);
};
