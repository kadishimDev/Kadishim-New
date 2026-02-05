import fs from 'fs';

const DATA_FILE = 'src/data/extracted_memorials.json';

// Helper to get non-empty samples
function getSamples(data, fieldId, count = 5) {
    return data
        .map(row => row[fieldId])
        .filter(val => val && val.trim() !== '')
        .slice(0, count);
}

async function run() {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const data = JSON.parse(raw);

    // Collect all unique field IDs
    const fieldIds = new Set();
    data.forEach(row => {
        Object.keys(row).forEach(k => fieldIds.add(k));
    });

    console.log(`Analyzing ${data.length} records...`);
    console.log("------------------------------------------------");

    const sortedIds = Array.from(fieldIds).sort((a, b) => parseInt(a) - parseInt(b));

    sortedIds.forEach(id => {
        if (id === 'id' || id === 'form_id') return;

        const samples = getSamples(data, id);
        console.log(`Field [${id}]: ${JSON.stringify(samples)}`);
    });
}

run();
