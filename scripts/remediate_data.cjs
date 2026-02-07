const fs = require('fs');
const path = require('path');

const SQL_FILE_PATH = path.join(__dirname, '..', 'dbexport-947e911b5a326cffd8f7e2034b31b309dfecb5cf-kadishim_up.sql');
const OUTPUT_FILE = path.join(__dirname, '..', 'src', 'data', 'memorials_remediated.json');

function cleanSQLString(str) {
    if (!str) return '';
    let clean = str.trim();
    if (clean.startsWith("'") && clean.endsWith("'")) clean = clean.slice(1, -1);
    clean = clean.replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    return clean;
}

function decodeHebrew(str) {
    try {
        if (str.includes('%')) return decodeURIComponent(str);
        return str;
    } catch (e) {
        return str;
    }
}

function parseInsertValues(sqlContent, tableName) {
    const rows = [];
    // Case insensitive regex for table name
    const tablePattern = new RegExp(`INSERT INTO \`?${tableName}\`? VALUES`, 'gi');

    const insertBlocks = sqlContent.split(tablePattern);
    console.log(`[${tableName}] Found ${insertBlocks.length - 1} INSERT blocks.`);

    for (let i = 1; i < insertBlocks.length; i++) {
        let block = insertBlocks[i];

        let valuesEnd = block.lastIndexOf(');');
        if (valuesEnd === -1) continue;

        let valuesBlock = block.substring(0, valuesEnd).trim();
        if (valuesBlock.startsWith('(')) {
            const valueGroups = valuesBlock.split(/\),\(/);
            valueGroups.forEach((group, idx) => {
                let g = group;
                if (idx === 0) g = g.substring(1);
                if (idx === valueGroups.length - 1 && g.endsWith(')')) g = g.substring(0, g.length - 1);

                const cols = [];
                let current = '';
                let inQuote = false;
                for (let k = 0; k < g.length; k++) {
                    if (g[k] === "'" && g[k - 1] !== '\\') inQuote = !inQuote;
                    else if (g[k] === ',' && !inQuote) {
                        cols.push(cleanSQLString(current));
                        current = '';
                    } else {
                        current += g[k];
                    }
                }
                cols.push(cleanSQLString(current));
                rows.push(cols);
            });
        }
    }
    return rows;
}

console.log('Reading SQL file...');
const sqlContent = fs.readFileSync(SQL_FILE_PATH, 'utf8');

console.log('Scanning tables...');
const posts1 = parseInsertValues(sqlContent, 'wp_posts');
// Also check the other table name if it exists in your specific dump, 
// usually it does if I saw 1745 records before.
const posts2 = parseInsertValues(sqlContent, 'wp_kadishimNewposts');
const allPosts = [...posts1, ...posts2];

console.log(`Total posts scanned: ${allPosts.length}`);

// Filter for prayer_request in any column
const prayerRequests = allPosts.filter(row => row.includes('prayer_request') || row.includes('prayer-request'));
console.log(`Found ${prayerRequests.length} prayer_request items.`);

console.log('Parsing Meta...');
const meta1 = parseInsertValues(sqlContent, 'wp_postmeta');
const meta2 = parseInsertValues(sqlContent, 'wp_kadishimNewpostmeta');
const allMeta = [...meta1, ...meta2];
console.log(`Total meta scanned: ${allMeta.length}`);

const validIds = new Set(prayerRequests.map(r => r[0]));
const metaMap = {};

allMeta.forEach(row => {
    const postId = row[1];
    if (validIds.has(postId)) {
        if (!metaMap[postId]) metaMap[postId] = {};
        metaMap[postId][row[2]] = row[3];
    }
});

// Map to Schema
const memorials = prayerRequests.map(row => {
    const id = row[0];
    const meta = metaMap[id] || {};

    // Name Logic
    const firstName = meta['name_of_the_deceased_first_name'] || meta['first_name'] || '';
    const lastName = meta['name_of_the_deceased_last_name'] || meta['last_name'] || '';
    let fullName = `${firstName} ${lastName}`.trim();

    if (!fullName || fullName.length < 2) {
        fullName = row[5]; // Title
        if (!fullName || fullName.length < 2) {
            if (row[11]) fullName = decodeHebrew(row[11]).replace(/-/g, ' ');
        }
    }

    // Date Logic
    const hDay = meta['day'] || '';
    const hMonth = meta['month'] || '';
    const hYear = meta['sleep'] || meta['year'] || '';
    let hebrewDate = `${hDay} ${hMonth} ${hYear}`.trim();

    // Residence Logic
    const city = meta['home_town'] || meta['city'] || '';
    const street = meta['street'] || '';
    const house = meta['house_no'] || '';
    const neighborhood = meta['neighborhood'] || '';

    let residence = city;
    if (street) residence = `${street} ${house}, ${city}`.trim();
    if (neighborhood && !residence.includes(neighborhood)) residence += ` (${neighborhood})`;
    if (residence.startsWith(',')) residence = residence.substring(1).trim();

    // Contact Logic
    // In many records 'first_name' was used for requester if 'name_of_the_deceased_first_name' exists
    // We need to be careful not to mix them.
    let requester = meta['requester_name'] || meta['contact_name'] || '';
    if (!requester && meta['name_of_the_deceased_first_name']) {
        // If we have explicit deceased name fields, maybe 'first_name' is the requester?
        // Let's check logic: usually 'first_name' in WPForms is the submitter unless mapped otherwise.
        // But for safe fallback:
        requester = meta['first_name'] || '';
    }

    return {
        id: id,
        name: fullName,
        father_name: meta['father_name'] || meta['deceased_father_name'] || '',
        mother_name: meta['motherfather_name'] || meta['mother_name'] || '',
        gender: (meta['songirl'] === 'בן') ? 'male' : (meta['songirl'] === 'בת' ? 'female' : 'male'),
        type: 'kaddish',
        hebrew_date_text: hebrewDate,
        gregorian_date: meta['gregorian_date'] || '',

        // Extended Fields for Edit 
        residence: residence,
        children_names: meta['children_names'] || '',
        contact_name: requester,
        contact_phone: meta['contact_no'] || meta['mob_no'] || meta['phone'] || '',
        contact_email: meta['contact_email'] || meta['email'] || '',

        created_at: row[2],
        details: {
            post_status: row[7],
            service_type: meta['service'],
            // original_meta: meta // Commenting out to save space in final JSON
            original_form_id: meta['_service'] // Keep some trace
        }
    };
});

// Filter duplicates (by ID) and published status
const uniqueMap = new Map();
memorials.forEach(item => {
    if (!uniqueMap.has(item.id)) uniqueMap.set(item.id, item);
});

const cleanMemorials = Array.from(uniqueMap.values()).filter(m => m.details.post_status === 'publish');

console.log(`Unique Clean Count: ${cleanMemorials.length}`);
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(cleanMemorials, null, 2));
