
// Basic Gematria Helper
export const toGematria = (num) => {
    if (!num) return "";
    const letters = [
        { val: 400, char: 'ת' },
        { val: 300, char: 'ש' },
        { val: 200, char: 'r' },
        { val: 100, char: 'ק' },
        { val: 90, char: 'צ' },
        { val: 80, char: 'פ' },
        { val: 70, char: 'ע' },
        { val: 60, char: 'ס' },
        { val: 50, char: 'נ' },
        { val: 40, char: 'מ' },
        { val: 30, char: 'ל' },
        { val: 20, char: 'כ' },
        { val: 10, char: 'י' },
        { val: 9, char: 'ט' },
        { val: 8, char: 'ח' },
        { val: 7, char: 'ז' },
        { val: 6, char: 'ו' },
        { val: 5, char: 'ה' },
        { val: 4, char: 'ד' },
        { val: 3, char: 'ג' },
        { val: 2, char: 'ב' },
        { val: 1, char: 'א' }
    ];

    let result = '';
    let remaining = num;

    // Special cases for 15 (Tu) and 16 (Tet-Zayin)
    if (remaining === 15) return 'ט"ו';
    if (remaining === 16) return 'ט"ז';

    // Thousands not fully supported in simple version but years usually handled via %1000 or full map
    // For year 5786 -> "תשפ\"ו" (assuming we drop the 5000 or handle it).
    // Simple calc:

    for (const { val, char } of letters) {
        while (remaining >= val) {
            result += char;
            remaining -= val;
        }
    }

    // Add Geresh/Gershayim
    if (result.length === 1) return result + "'";
    return result.slice(0, -1) + '"' + result.slice(-1);
};


export const getFormattedHebrewDate = () => {
    try {
        // Use Intl to get the parts (Day, Month, Year) in Hebrew Calendar
        const options = { calendar: 'hebrew', day: 'numeric', month: 'long', year: 'numeric' };
        const parts = new Intl.DateTimeFormat('en-u-ca-hebrew', options).formatToParts(new Date());

        // parts look like: [{type: "month", value: "Tishri"}, {type: "day", value: "1"}, ...]
        // We need to map English Hebrew Month names to Hebrew if environment returns English (likely in 'en' locale)
        // OR use 'he' locale and parsing. 
        // Best: use 'he-u-ca-hebrew' to get Hebrew Month string directly, and convert Day/Year to Gematria from numeric.

        const hebrewParts = new Intl.DateTimeFormat('he-u-ca-hebrew', options).formatToParts(new Date());

        let day = 0;
        let year = 0;
        let month = "";

        hebrewParts.forEach(p => {
            if (p.type === 'day') day = parseInt(p.value, 10);
            if (p.type === 'year') year = parseInt(p.value.replace(/\D/g, ''), 10); // Remove non-digits
            if (p.type === 'month') month = p.value;
        });

        // Format
        const dayGem = toGematria(day);
        const yearGem = toGematria(year % 1000); // 5786 -> 786 -> תשפ"ו. Usually we add 'ה' at start for 5000 implied? Or just standard usage.

        return `${dayGem} ב${month} ה${yearGem}`;
    } catch (e) {
        console.error("Date Format Error", e);
        return "כ\"ו בשבט התשפ\"ו";
    }
}

export const getHebrewDateParts = () => {
    try {
        const numericOptions = { calendar: 'hebrew', day: 'numeric', month: 'numeric', year: 'numeric' };
        const parts = new Intl.DateTimeFormat('en-u-ca-hebrew', numericOptions).formatToParts(new Date());

        let day = 0;
        let month = 0;
        let year = 0;
        let monthStr = "";

        parts.forEach(p => {
            if (p.type === 'day') day = parseInt(p.value, 10);
            if (p.type === 'month') {
                const val = parseInt(p.value, 10);
                if (!isNaN(val)) {
                    month = val;
                } else {
                    monthStr = p.value;
                }
            }
            if (p.type === 'year') year = parseInt(p.value.replace(/\D/g, ''), 10);
        });

        // Fallback for month names if numeric failed (common in some Node/Browser envs)
        // Mapping based on Civil Calendar (Tishri = 1) which aligns with standard 1..12 usage usually
        if (month === 0 && monthStr) {
            const monthMap = {
                'Tishri': 1, 'Tishrei': 1,
                'Cheshvan': 2, 'Marcheshvan': 2,
                'Kislev': 3,
                'Tevet': 4,
                'Shevat': 5,
                'Adar': 6, 'Adar I': 6,
                'Adar II': 7,
                'Nisan': 8, 'Nissan': 8,
                'Iyar': 9,
                'Sivan': 10,
                'Tamuzo': 11, 'Tamuz': 11,
                'Av': 12,
                'Elul': 13 // Leap year shift? Simply, Adar is usually 6. In leap, Adar I=6, Adar II=7.
            };
            // Normalize
            const cleanKey = Object.keys(monthMap).find(k => monthStr.includes(k));
            if (cleanKey) month = monthMap[cleanKey];
            else {
                // Try simpler mapping 
                const months = ["Tishri", "Cheshvan", "Kislev", "Tevet", "Shevat", "Adar", "Nisan", "Iyar", "Sivan", "Tamuz", "Av", "Elul"];
                month = months.findIndex(m => monthStr.includes(m)) + 1;
            }
        }

        // Handle fallback if still 0
        if (month === 0) month = 5; // Fallback to current approximations if all else fails

        return { day, month, year };
    } catch (e) {
        console.error("Date Parts Error", e);
        return { day: 1, month: 1, year: 5785 }; // Fallback
    }
};

export const formatHebrewDate = (day, month, year) => {
    if (!day || !month || !year) return "";

    // Convert numeric Day/Year to Gematria
    const dayGem = toGematria(day);
    const yearGem = toGematria(year % 1000);

    // Month mapping (assuming standard 1=Tishrei order from the scraper/mocks)
    const monthNames = [
        "", // 0-index padding
        "תשרי", "חשוון", "כסלו", "טבת", "שבט", "אדר",
        "ניסן", "אייר", "סיוון", "תמוז", "אב", "אלול"
    ];

    // Handle Adar I/II if month > 12 or special logic? 
    // For simplicity in this mockup, we assume standard 12 + maybe Adar logic if needed. 
    // Mock data uses 1-12.

    let monthName = monthNames[month] || "ערב חג";

    // Handle Leap Year Adar logic if input differentiates (e.g. 13=Adar II) - standard is complex but for now:
    if (month === 6) monthName = "אדר"; // Or Adar I
    if (month === 13) monthName = "אדר ב'"; // If scrape provides 13

    return `${dayGem} ב${monthName} ה${yearGem}`;
};
