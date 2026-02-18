const fs = require('fs');

try {
    const memorials = JSON.parse(fs.readFileSync('src/data/memorials_v2.json', 'utf8'));

    // Helper: Gematriya for numbers (1-1000)
    // Extended logic for correct formatting (No 'ה' for 5000 in this context, just the year letters)
    // Actually, user wants "התשע"ז". The year is usually 5777. We need 777 part.
    // 5000 = ה (often omitted in short standard, but user requested 'ה' prefix)
    // Let's build a small gematriya function or map.

    const letters = {
        1: 'א', 2: 'ב', 3: 'ג', 4: 'ד', 5: 'ה', 6: 'ו', 7: 'ז', 8: 'ח', 9: 'ט', 10: 'י',
        20: 'כ', 30: 'ל', 40: 'מ', 50: 'נ', 60: 'ס', 70: 'ע', 80: 'פ', 90: 'צ',
        100: 'ק', 200: 'ר', 300: 'ש', 400: 'ת'
    };

    function toGematriya(num) {
        if (num <= 0) return '';
        let str = '';

        // Hundreds
        while (num >= 400) { str += 'ת'; num -= 400; }
        if (num >= 100) {
            let hundreds = Math.floor(num / 100) * 100;
            str += letters[hundreds];
            num -= hundreds;
        }
        // Tens
        if (num >= 10) {
            if (num === 15) { str += 'טו'; num = 0; }
            else if (num === 16) { str += 'טז'; num = 0; }
            else {
                let tens = Math.floor(num / 10) * 10;
                str += letters[tens];
                num -= tens;
            }
        }
        // Units
        if (num > 0) {
            str += letters[num];
        }
        return str;
    }

    function formatDay(day) {
        const letters = toGematriya(day);
        if (letters.length === 1) return letters + "'";
        // Insert " before last letter? No, user said: "כ"ב" -> Yes, before last letter.
        // Wait, for 2 letters it's standard 'middle'. For >1 it's before last.
        // Actually, gematriya usually is just letters. 
        // User said: "להוסיף גרשיים (") בכב לכ"ב".
        return letters.slice(0, letters.length - 1) + '"' + letters.slice(letters.length - 1);
    }

    function formatYear(year) {
        // Year 5780 -> 780 -> תש"פ
        // User wants "התש"פ" (Prefix 'ה')
        let shortYear = year % 1000; // 780
        let str = toGematriya(shortYear);
        // Add 'ה' prefix
        str = 'ה' + str;
        // Insert " before last letter
        if (str.length > 1) {
            return str.slice(0, str.length - 1) + '"' + str.slice(str.length - 1);
        }
        return str + "'"; // Fallback if single letter?
    }

    const months = [
        '', 'ניסן', 'אייר', 'סיון', 'תמוז', 'אב', 'אלול', 'תשרי', 'חשון', 'כסלו', 'טבת', 'שבט', 'אדר'
    ];
    // Handling Adar I/II requires mapping from Hebcal month numbers.
    // Hebcal: 1=Nisan... 12=Adar... 13=Adar II
    // Simple map for strict output:
    // User wants "ב" prefix.
    function getMonthName(m, y) {
        // Start from Nisan (1)
        // Note: In typical "Jewish Date", months are complicated by leap years.
        // However, the struct has `month` (1-13?).
        // If 13 is Adar II? 
        // Let's assume standard mapping:
        // 1=Nisan, 7=Tishrei.
        const names = [
            '',
            'בניסן', 'באייר', 'בסיון', 'בתמוז', 'באב', 'באלול',
            'בתשרי', 'בחשון', 'בכסלו', 'בטבת', 'בשבט', 'באדר', 'באדר א\'', 'באדר ב\''
        ];

        // This is tricky without `isLeapYear`. 
        // But `hebrew_date_struct` usually stores 1-12/13.
        // If year is leap, 12=Adar I, 13=Adar II.
        // If non-leap, 12=Adar.

        // Let's trust the struct month ID if it follows typical convention.
        // Actually, simpler logic: 
        // Just map standard names.

        // Let's reuse names roughly but need to be careful about Adar.
        const standard = ['', 'ניסן', 'אייר', 'סיון', 'תמוז', 'אב', 'אלול', 'תשרי', 'חשון', 'כסלו', 'טבת', 'שבט', 'אדר', 'אדר ב\''];

        // Add 'ב' prefix logic
        let name = standard[m] || '';

        // Handle Adar logic implicitly if m=12 or 13?
        // Let's check typical struct values in the file first to be sure!
        if (m === 12 && standard[13]) { /* Check if leap? */ }

        // For now, assume standard mapping and just prefix 'ב'.
        if (name.startsWith('ב')) return name; // Already has it? No.
        return 'ב' + name;
    }

    // Checking Struct implementation in FILE
    // Example from VIEW:
    // "hebrew_date_struct": { "day": 23, "month": 10, "year": 5760 } -> "כ"ג בטבת, התש"ס"
    // Month 10 = Tevet. (Nisan=1, Iyar=2, Sivan=3, Tamuz=4, Av=5, Elul=6, Tishrei=7, Cheshvan=8, Kislev=9, Tevet=10) -> Correct.

    // Adar Logic:
    // If Month 12 is Adar. 
    // If Month 13 exists? 
    // I need to know if it's Adar I or II.
    // But simplistic mapping 1-13 covers it if data is consistent.

    const monthNames = {
        1: 'בניסן', 2: 'באייר', 3: 'בסיון', 4: 'בתמוז', 5: 'באב', 6: 'באלול',
        7: 'בתשרי', 8: 'בחשון', 9: 'בכסלו', 10: 'בטבת', 11: 'בשבט',
        12: 'באדר', 13: 'באדר ב\''
    };
    // Note: In leap year, 12 becomes Adar I ('באדר א\'').
    // We can't know for sure without checking year leap status.
    // BUT for formatting, 'באדר' is usually acceptable for Adar I/Plain Adar, unless strict distinction needed.
    // User didn't specify strict Adar I/II rules, just format.
    // I will try to be safe. If m=13, m12 MUST be Adar I.

    // Calculate Leap Year for accurate naming
    function isLeap(year) {
        return ((year * 7) + 1) % 19 < 7;
    }

    function getMonthNameCorrect(m, y) {
        if (isLeap(y)) {
            if (m === 12) return 'באדר א\'';
            if (m === 13) return 'באדר ב\'';
        }
        // Non-leap, or other months
        return monthNames[m] || '';
    }

    let updated = 0;

    const newData = memorials.map(item => {
        let newItem = { ...item };
        if (item.hebrew_date_struct && item.hebrew_date_struct.day) {
            const { day, month, year } = item.hebrew_date_struct;

            const dayStr = formatDay(day);
            const monthStr = getMonthNameCorrect(month, year);
            const yearStr = formatYear(year);

            const fullDate = `${dayStr} ${monthStr} ${yearStr}`;

            if (item.hebrew_date_text !== fullDate) {
                newItem.hebrew_date_text = fullDate;
                // newItem.details = { ...newItem.details, old_date_text: item.hebrew_date_text }; // Audit? Maybe overkill
                updated++;
            }
        }
        return newItem;
    });

    console.log(`Total Records: ${memorials.length}`);
    console.log(`Updated Dates: ${updated}`);

    // Check missing
    const missing = newData.filter(i => !i.hebrew_date_struct || !i.hebrew_date_struct.day).length;
    console.log(`Missing Struct (Skipped): ${missing}`);

    fs.writeFileSync('src/data/memorials_v3_dates.json', JSON.stringify(newData, null, 2));

} catch (err) {
    console.error(err);
}
