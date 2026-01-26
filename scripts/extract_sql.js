const fs = require('fs');
const path = require('path');
const readline = require('readline');

const sqlFilePath = 'C:\\Users\\Jacob\\Documents\\פרוייקטים\\קדישים\\20210701_kasdishim_c6a54cdc2450a1738217_20220701122242_archive\\dup-installer\\dup-database__c6a54cd-01122242.sql';
const outputDir = path.join(__dirname, '../src/data');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

function parseValues(valueString) {
    // This is a naive parser. It splits by "),(" which works for standard mysqldumps usually.
    // A better approach would be a state machine, but this is a quick extraction.
    // We strip the leading "(" and trailing ");" or ")" first.
    let clean = valueString.trim();
    if (clean.endsWith(';')) clean = clean.slice(0, -1);

    // Split by ")," not just "," to separate rows
    // Note: This might fail if a string contains "),".
    // For safer parsing, we should validate the split.
    // However, given the observation of the file, it looks like standard extended inserts.

    // A safer regex split:
    const rows = clean.split(/\),\s*\(/);

    return rows.map(row => {
        // Fix up the start/end parens if they were lost in split
        let r = row;
        if (!r.startsWith('(')) r = '(' + r; // Actually we split by "),(", so we lost the closing ) of prev and opening ( of next
        // No, split consumes the separator.
        // The first item has start (, missing end )
        // Middle items missing both
        // Last item missing start )

        // Wait, split('),(') gives:
        // Item 1: (val1, val2
        // Item 2: val1, val2
        // Item 3: val1, val2)

        // Let's just re-add them or just parse the content.
        // Actually, let's just process the raw row string.

        // Basic CSV-like parsing within the row
        // We can matches values: '([^']|'')*'|NULL|\d+
        const values = [];
        let currentVal = '';
        let inQuote = false;

        for (let i = 0; i < r.length; i++) {
            const char = r[i];
            if (char === "'" && (i === 0 || r[i - 1] !== '\\')) { // simplistic quote check
                inQuote = !inQuote;
            }
            if (char === ',' && !inQuote) {
                values.push(currentVal.trim());
                currentVal = '';
            } else {
                currentVal += char;
            }
        }
        values.push(currentVal.trim());
        return values.map(v => {
            if (v.startsWith("'") && v.endsWith("'")) return v.slice(1, -1);
            return v;
        });
    });
}

// Better parser for the whole VALUES (...) part
function extractRows(line, tableName) {
    const startMarker = `INSERT INTO \`${tableName}\` VALUES `;
    if (!line.startsWith(startMarker)) return [];

    let content = line.substring(startMarker.length).trim();
    if (content.endsWith(';')) content = content.slice(0, -1);

    // We need to parse: (1, ...), (2, ...)
    // We can iterate char by char to handle quotes correctly
    const rows = [];
    let currentRow = '';
    let inParen = false;
    let inQuote = false;
    let escape = false;

    for (let i = 0; i < content.length; i++) {
        const char = content[i];

        if (escape) {
            currentRow += char;
            escape = false;
            continue;
        }

        if (char === '\\') {
            currentRow += char;
            escape = true;
            continue;
        }

        if (char === "'" && !escape) {
            inQuote = !inQuote;
            currentRow += char;
            continue;
        }

        if (char === '(' && !inQuote && !inParen) {
            inParen = true;
            currentRow = ''; // Start new row, don't include the opening paren in our buffer if we want clean content? 
            // Or include it. Let's include it for debugging, or cleaner: keep buffer as contents
            continue;
        }

        if (char === ')' && !inQuote && inParen) {
            inParen = false;
            rows.push(currentRow); // Push the row content
            continue;
        }

        if (inParen) {
            currentRow += char;
        }
    }

    return rows.map(r => {
        // Parse individual fields in the row: 1,'string',NULL
        const fields = [];
        let currentField = '';
        let fInQuote = false;
        let fEscape = false;

        for (let j = 0; j < r.length; j++) {
            const c = r[j];
            if (fEscape) { currentField += c; fEscape = false; continue; }
            if (c === '\\') { currentField += c; fEscape = true; continue; }
            if (c === "'") { fInQuote = !fInQuote; /* keep quote or strip? let's strip later or keep for structure */ continue; }

            if (c === ',' && !fInQuote) {
                fields.push(currentField);
                currentField = '';
            } else {
                currentField += c;
            }
        }
        fields.push(currentField);
        return fields;
    });
}


const targetTables = ['wp_posts', 'wp_pmxi_posts', 'wp_wpforms_entry_fields', 'wp_postmeta'];
const tableData = {
    'wp_posts': [],
    'wp_pmxi_posts': [],
    'wp_wpforms_entry_fields': [],
    'wp_postmeta': []
};

const fileStream = fs.createReadStream(sqlFilePath, { encoding: 'utf8' });
const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
});

rl.on('line', (line) => {
    targetTables.forEach(table => {
        if (line.trim().startsWith(`INSERT INTO \`${table}\``)) {
            console.log(`Found INSERT for ${table}`);
            const data = extractRows(line.trim(), table);
            console.log(`Extracted ${data.length} rows for ${table}`);
            tableData[table] = tableData[table].concat(data);
        }
    });
});

rl.on('close', () => {
    console.log('Finished reading file.');
    targetTables.forEach(table => {
        if (tableData[table].length > 0) {
            const outputPath = path.join(outputDir, `${table}.json`);
            fs.writeFileSync(outputPath, JSON.stringify(tableData[table], null, 2));
            console.log(`Saved ${table} to ${outputPath}`);
        } else {
            console.log(`No data found for ${table}`);
        }
    });
});
