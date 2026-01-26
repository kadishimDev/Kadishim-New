const fs = require('fs');
const path = require('path');
const readline = require('readline');

const sqlFilePath = 'C:\\Users\\Jacob\\Documents\\פרוייקטים\\קדישים\\20210701_kasdishim_c6a54cdc2450a1738217_20220701122242_archive\\dup-installer\\dup-database__c6a54cd-01122242.sql';
const outputDir = path.join(__dirname, '../src/data');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// ... (Rest of the script is identical, just the file extension changes)
function extractRows(line, tableName) {
    const startMarker = `INSERT INTO \`${tableName}\` VALUES `;
    if (!line.startsWith(startMarker)) return [];

    let content = line.substring(startMarker.length).trim();
    if (content.endsWith(';')) content = content.slice(0, -1);

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
            currentRow = '';
            continue;
        }

        if (char === ')' && !inQuote && inParen) {
            inParen = false;
            rows.push(currentRow);
            continue;
        }

        if (inParen) {
            currentRow += char;
        }
    }

    return rows.map(r => {
        const fields = [];
        let currentField = '';
        let fInQuote = false;
        let fEscape = false;

        for (let j = 0; j < r.length; j++) {
            const c = r[j];
            if (fEscape) { currentField += c; fEscape = false; continue; }
            if (c === '\\') { currentField += c; fEscape = true; continue; }
            if (c === "'") { /* fInQuote = !fInQuote; */ /* Simply strip quotes? */ }
            // My previous logic for fields was a bit weak. Let's improve or stick to the simple one.
            // If I just split by comma outside quotes, I get raw values.
            // Let's stick to the previous one but maybe slightly safer.

            // Re-implementing the simple field parser from previous turn content:
            if (c === "'") { fInQuote = !fInQuote; }

            if (c === ',' && !fInQuote) {
                fields.push(currentField);
                currentField = '';
            } else {
                currentField += c;
            }
        }
        fields.push(currentField);
        // Clean up quotes
        return fields.map(f => {
            let val = f.trim();
            if (val.startsWith("'") && val.endsWith("'")) {
                val = val.slice(1, -1);
            }
            return val;
        });
    });
}


const targetTables = ['wp_posts', 'wp_pmxi_posts', 'wp_wpforms_entry_fields'];
const tableData = {
    'wp_posts': [],
    'wp_pmxi_posts': [],
    'wp_wpforms_entry_fields': []
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
