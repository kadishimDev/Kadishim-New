const fs = require('fs');
const path = require('path');
const readline = require('readline');

const sqlFilePath = 'C:\\Users\\Jacob\\Documents\\פרוייקטים\\קדישים\\20210701_kasdishim_c6a54cdc2450a1738217_20220701122242_archive\\dup-installer\\dup-database__c6a54cd-01122242.sql';
const outputDir = path.join(__dirname, '../src/data');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Target tables to extract
const targetTables = new Set(['wp_posts', 'wp_pmxi_posts', 'wp_wpforms_entry_fields', 'wp_postmeta']);
const tableData = {};
targetTables.forEach(t => tableData[t] = []);

// Regex to capture table name from INSERT INTO statement
// Matches: INSERT INTO `table_name` ... or INSERT INTO table_name ...
const insertRegex = /^INSERT\s+INTO\s+[`"']?(\w+)[`"']?\s+VALUES\s*/i;

function extractRows(lineContent) {
    // Basic parser for extended inserts (row), (row)
    // We assume the content starts after "VALUES "
    let content = lineContent.trim();
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
            // End of row
            rows.push(currentRow);
            continue;
        }

        if (inParen) {
            currentRow += char;
        }
    }

    return rows.map(r => {
        // Parse fields: value, 'value', NULL
        const fields = [];
        let currentField = '';
        let fInQuote = false;
        let fEscape = false;

        for (let j = 0; j < r.length; j++) {
            const c = r[j];
            if (fEscape) { currentField += c; fEscape = false; continue; }
            if (c === '\\') { currentField += c; fEscape = true; continue; }
            if (c === "'") { fInQuote = !fInQuote; continue; } // Strip quotes? keeping them cleaner? let's strip for CSV-like

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

const fileStream = fs.createReadStream(sqlFilePath, { encoding: 'utf8' });
const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
});

rl.on('line', (line) => {
    const trimmed = line.trim();
    // Quick check before regex
    if (!trimmed.toUpperCase().startsWith('INSERT INTO')) return;

    const match = trimmed.match(insertRegex);
    if (match) {
        const tableName = match[1];
        if (targetTables.has(tableName)) {
            console.log(`Found INSERT for ${tableName}`);
            // Extract the content part (after VALUES)
            // match[0] contains "INSERT INTO `table` VALUES " (including spaces)
            const valuesPart = trimmed.substring(match[0].length);
            const data = extractRows(valuesPart);
            console.log(`Extracted ${data.length} rows for ${tableName}`);
            tableData[tableName] = tableData[tableName].concat(data);
        }
    }
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
