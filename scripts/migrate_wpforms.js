import fs from 'fs';
import readline from 'readline';
import path from 'path';

// Configuration
const SQL_FILE = 'dbexport-947e911b5a326cffd8f7e2034b31b309dfecb5cf-kadishim_up.sql';
const OUTPUT_FILE = 'src/data/extracted_memorials.json';

// Regex to match INSERT INTO statements for entry fields
// Value format: (id, entry_id, form_id, field_id, value, date) - APPROXIMATE, need to be flexible
const INSERT_REGEX = /INSERT INTO `wp_wpforms_entry_fields` VALUES (.*);/;

async function run() {
    console.log(`Reading ${SQL_FILE}...`);

    const fileStream = fs.createReadStream(SQL_FILE, { encoding: 'utf8' });
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    const entries = new Map(); // entry_id -> { field_id: value }

    for await (const line of rl) {
        if (line.includes("INSERT INTO `wp_wpforms_entry_fields`")) {
            // Basic parsing of SQL values
            // This is a naive parser for standard mysqldump. 
            // It assumes values are parenthesis-enclosed and comma-separated sets
            const matches = line.match(/VALUES (.*);/);
            if (!matches) continue;

            const valuesChunk = matches[1];
            // Split by "),(" to get individual rows
            // Note: This might break if value contains "),(" text, but rare in simple fields
            const rows = valuesChunk.split(/\),\(/g);

            rows.forEach(row => {
                // Clean up leading/trailing parens
                let cleanRow = row.replace(/^\(/, '').replace(/\)$/, '');

                // Split by comma, respecting quotes is hard with simple split. 
                // We will try a regex based splitter or a simple CSV-like parse if needed.
                // For now, let's try a regex that matches SQL value patterns
                // 123, 456, 1, 3, 'David', '2023-01-01'

                // Simple parser state machine might be needed if regex fails, 
                // but let's try simple regex for 'quoted string' or number

                const cols = [];
                let inQuote = false;
                let current = '';
                for (let i = 0; i < cleanRow.length; i++) {
                    const char = cleanRow[i];
                    if (char === "'" && (i === 0 || cleanRow[i - 1] !== '\\')) {
                        inQuote = !inQuote;
                    } else if (char === ',' && !inQuote) {
                        cols.push(current.trim());
                        current = '';
                    } else {
                        current += char;
                    }
                }
                cols.push(current.trim());

                // Columns: id, entry_id, form_id, field_id, value, date (usually)
                // Let's print the first row to verify mapping in the console output
                if (entries.size === 0 && cols.length > 3) {
                    console.log("Sample Row Structure:", cols);
                }

                if (cols.length >= 5) {
                    const entryId = cols[1];
                    const formId = cols[2];
                    const fieldId = cols[3];
                    let value = cols[4];

                    // Unquote value
                    if (value.startsWith("'") && value.endsWith("'")) {
                        value = value.slice(1, -1);
                        // Unescape SQL
                        value = value.replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, '\\');
                    }

                    if (!entries.has(entryId)) {
                        entries.set(entryId, { id: entryId, form_id: formId });
                    }
                    const entry = entries.get(entryId);
                    entry[fieldId] = value;
                }
            });
        }
    }

    console.log(`Found ${entries.size} entries.`);

    // Convert map to array
    const result = Array.from(entries.values());

    // Save raw first to verify
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2));
    console.log(`Saved raw extracted data to ${OUTPUT_FILE}`);
}

run().catch(console.error);
