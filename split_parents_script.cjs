const fs = require('fs');

// Load Data
try {
    const memorials = JSON.parse(fs.readFileSync('src/data/memorials_v2.json', 'utf8'));
    // Embedded Names to avoid encoding issues
    const maleNames = [
        "אברהם", "יצחק", "יעקב", "משה", "אהרן", "דוד", "שלמה", "יוסף", "חיים", "שמואל",
        "צבי", "אריה", "יהודה", "שמעון", "ראובן", "לוי", "יששכר", "זבולון", "דן", "נפתלי",
        "גד", "אשר", "בנימין", "ניסים", "יגאל", "מנחם", "מרדכי", "אליהו", "מאיר", "ישראל",
        "דב", "רוני", "אייזיק", "מתושלח", "בן ציון", "רפאל", "מיכאל", "עמרם", "שלום", "יורם",
        "זאב", "וולף", "מכלוף", "אחיעזר", "יהושע", "אלימלך", "מרכוס", "נח", "שמחה", "אליעזר", "אנטון", "ניסן", "מנשה", "אלתר", "מסעוד", "אלברט",
        "ליאון", "מבורך", "חווטי", "הרמן", "מנדל", "שאול", "ציון", "יחזקל", "פנחס", "יחיאל", "נתן",
        "בוריס", "מנחם ז\"ל", "יחזקאל", "ארי'ה", "ישראל משה", "לאון", "אפריים", "שרלי", "משה אידל", "לייב", "ששון", "צדוק", "זכריה", "זלקה", "ברוך", "מנצור", "ניסים ז\"ל",
        "שלמה חיים", "יעקב ישראל", "ולנטין", "לייב ז\"ל", "אוון", "איליה", "מורי יחיא", "דניאל", "שמואל ציון", "בוריס גולדנבויים", "מנשה שהרבני", "שלמה אלג'ם", "אישק"
    ];
    const femaleNames = [
        "שרה", "רבקה", "רחל", "לאה", "חנה", "מרים", "אסתר", "רות", "נעמי", "עליזה",
        "מטילדה", "ברכה", "נטי", "נלי", "ציפורה", "אידה", "סוזנה", "שושנה", "זלדה",
        "בלה", "רוזה", "הילה", "יפה", "מלכה", "יוכבד", "דבורה", "חיה", "דינה", "תמר",
        "פסיה", "רייזל", "שפרה", "פייגא", "רגינה", "פיגא", "ירדנה", "סוסיה", "אנה", "בשיה", "נחה", "גניה", "כדיה", "לוסי", "זילפה", "הינדה", "ורדה", "רעיה", "בכורה", "בוקה", "בת שבע", "איטו", "מינה", "טוני", "סוניה", "ויטלה", "טובה", "ראיסה", "קרלה"
    ];

    let updatedCount = 0;
    let failedCount = 0;
    let logs = [];

    const isMale = (name) => maleNames.includes(name.trim());
    const isFemale = (name) => femaleNames.includes(name.trim());

    // Map through data
    const newData = memorials.map(item => {
        let newItem = { ...item };

        // Check "Mother Name" for pairs
        if (newItem.mother_name && (newItem.mother_name.includes(' ו') || newItem.mother_name.includes('ו-') || newItem.mother_name.includes(','))) {

            // Basic Split: "Yosef veZahava" -> ["Yosef", "Zahava"]
            // Regex handles " va", " ve-", " ,"
            const parts = newItem.mother_name.split(/ ו-| ו|,/).map(s => s.trim().replace(/[()]/g, ''));

            if (parts.length >= 2) {
                const part1 = parts[0];
                const part2 = parts[1];

                let father = '';
                let mother = '';
                let found = false;

                // Logic 1: Find Known Male
                if (isMale(part1)) {
                    father = part1;
                    mother = part2;
                    found = true;
                } else if (isMale(part2)) {
                    father = part2;
                    mother = part1;
                    found = true;
                }
                // Logic 2: Find Known Female (Assume other is Father)
                else if (isFemale(part1)) {
                    mother = part1;
                    father = part2;
                    found = true;
                } else if (isFemale(part2)) {
                    mother = part2;
                    father = part1;
                    found = true;
                }

                if (found) {
                    newItem.father_name = father;
                    newItem.mother_name = mother; // Overwrite combined string with just Mother
                    if (!newItem.details) newItem.details = {};
                    newItem.details.original_mother_split = item.mother_name;

                    updatedCount++;
                    logs.push(`FIXED [${item.id}]: "${item.mother_name}" -> F: "${father}" | M: "${mother}"`);
                } else {
                    failedCount++;
                    logs.push(`FAILED [${item.id}]: "${item.mother_name}" (Unknown names: ${part1}, ${part2})`);
                }
            }
        }
        return newItem;
    });

    console.log('--- MIGRATION REPORT ---');
    console.log(`Total Records: ${memorials.length}`);
    console.log(`Updated (Split): ${updatedCount}`);
    console.log(`Failed (Unknown Names): ${failedCount}`);
    // --- VALIDATION PHASE ---
    console.log('\n--- GENDER VALIDATION SCAN ---');
    let genderErrors = 0;
    let genderWarnings = 0;

    const validationLogs = [];

    newData.forEach(item => {
        let father = item.father_name ? item.father_name.trim() : '';
        let mother = item.mother_name ? item.mother_name.trim() : '';

        // --- AUTO-FIX: SWAP GENDER ---

        let swapped = false;

        // Case 1: Mother is Male (and Father is not Male)
        if (mother && isMale(mother) && !isMale(father)) {
            // Swap!
            const temp = father;
            father = mother;
            mother = temp;
            swapped = true;
        }
        // Case 2: Father is Female (and Mother is not Female)
        else if (father && isFemale(father) && !isFemale(mother)) {
            // Swap!
            const temp = father;
            father = mother;
            mother = temp;
            swapped = true;
        }

        if (swapped) {
            item.father_name = father;
            item.mother_name = mother;
            updatedCount++; // It counts as an update/fix
            logs.push(`SWAPPED [${item.id}]: F="${item.father_name}", M="${item.mother_name}" -> F="${father}", M="${mother}"`);
        }

        // Re-validate after swap
        if (father && isFemale(father)) {
            genderErrors++;
            validationLogs.push(`ERROR [${item.id}]: Father "${father}" appears in FEMALE list!`);
        }
        if (mother && isMale(mother)) {
            genderErrors++;
            validationLogs.push(`ERROR [${item.id}]: Mother "${mother}" appears in MALE list!`);
        }

        // unknown name detection (Warning)
        if (father && !isMale(father) && !isFemale(father)) {
            genderWarnings++;
            // Limit log volume
            if (genderWarnings < 50) validationLogs.push(`WARNING [${item.id}]: Father "${father}" is unknown gender.`);
        }
    });

    console.log(`Gender Swap Errors: ${genderErrors}`);
    console.log(`Unknown Names (Warnings): ${genderWarnings}`);
    console.log('\n--- VALIDATION LOGS ---');
    console.log(validationLogs.slice(0, 30).join('\n'));

    // Write output preview
    fs.writeFileSync('src/data/memorials_v3_preview.json', JSON.stringify(newData, null, 2));

} catch (err) {
    console.error("Script Error:", err);
}
