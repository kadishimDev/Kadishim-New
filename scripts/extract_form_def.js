import fs from 'fs';
import readline from 'readline';

const SQL_FILE = 'dbexport-947e911b5a326cffd8f7e2034b31b309dfecb5cf-kadishim_up.sql';

async function run() {
    console.log(`Scanning for Form 545 definition...`);

    const fileStream = fs.createReadStream(SQL_FILE, { encoding: 'utf8' });
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    for await (const line of rl) {
        // Look for the JSON blob containing Form ID 545 in wp_posts or similar
        if (line.includes('"545"') && line.includes('"fields"')) {
            console.log("Found likely definition line.");

            // Extract potential JSON object using basic braces matching (simplified)
            // We look for {"id":"545" ... }
            const startIndex = line.indexOf('{"id":"545"');
            if (startIndex !== -1) {
                let jsonCandidate = line.substring(startIndex);
                // Cut off at the end of the SQL value
                const endIndex = jsonCandidate.indexOf("}',");
                if (endIndex !== -1) {
                    jsonCandidate = jsonCandidate.substring(0, endIndex + 1);
                }

                // Unescape SQL
                jsonCandidate = jsonCandidate.replace(/\\"/g, '"').replace(/\\\\/g, '\\');

                console.log("Extracted JSON Snippet:");
                // We will write this to a file to avoid console overflow
                fs.writeFileSync('form_545_def.json', jsonCandidate);
                console.log("Saved to form_545_def.json");
                process.exit(0);
            }
        }
    }
}

run().catch(console.error);
