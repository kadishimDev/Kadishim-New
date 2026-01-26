const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../src/data');
const pmxiPath = path.join(dataDir, 'wp_pmxi_posts.json');
const postsPath = path.join(dataDir, 'wp_posts.json');
const metaPath = path.join(dataDir, 'wp_postmeta.json'); // New

const kaddishListPath = path.join(dataDir, 'kaddish_list.json');
const siteContentPath = path.join(dataDir, 'site_content.json');

// Process Kaddish List
if (fs.existsSync(pmxiPath)) {
    const rawPmxi = JSON.parse(fs.readFileSync(pmxiPath, 'utf8'));

    // Build Meta Lookup
    let metaLookup = {};
    if (fs.existsSync(metaPath)) {
        const rawMeta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
        // Optimize: grouping by post_id
        rawMeta.forEach(row => {
            const postId = row[1];
            const key = row[2];
            const value = row[3];

            if (!metaLookup[postId]) metaLookup[postId] = {};
            metaLookup[postId][key] = value;
        });
    }

    const kaddishList = rawPmxi
        .map(row => {
            // Row structure: [ID, PostID, ?, Title, ?, ?, ?]
            const postId = row[1]; // Correct Post ID index from extracting pmxi
            const title = row[3];
            if (!title) return null;

            // Parse "Name - Type - ID"
            const parts = title.split(' - ');

            if (parts.length < 2) return null;
            if (parts[0].length === 1) return null;

            const id = parts[parts.length - 1]; // This is the ID in the string, usually matches listing ID but post_id is actual WP ID

            // Fields
            let type = 'Unknown';
            let name = title;

            if (/^\d+$/.test(id)) {
                type = parts[parts.length - 2];
                name = parts.slice(0, parts.length - 2).join(' - ');
            } else {
                // Fallback
                name = title;
                // id remains non-numeric part?
            }

            // Enrich with Meta
            const meta = metaLookup[postId] || {};
            const hebrewDate = meta['hebrew_date_numeric'] ||
                (meta['day'] && meta['month'] && meta['sleep'] ? `${meta['day']} ${meta['month']} ${meta['sleep']}` : '');
            const gregorianDate = meta['gregorian_date'] || '';

            // Formatted Hebrew Date Text if components exist
            const hebrewDateText = (meta['day'] || '') + ' ' + (meta['month'] || '') + ' ' + (meta['sleep'] || '');

            return {
                original_string: title,
                name: name,
                type: type,
                id: id, // The ID from string (e.g. 5530)
                post_id: postId,
                hebrew_date: hebrewDate,
                hebrew_date_text: hebrewDateText.trim(),
                gregorian_date: gregorianDate,
                details: {
                    father_name: meta['motherfather_name'], // "Father/Mother name" label in meta is weirdly keys? inspect_meta showed 'motherfather_name'
                    passed_name_first: meta['name_of_the_deceased_first_name'],
                    passed_name_last: meta['name_of_the_deceased_last_name']
                }
            };
        })
        .filter(item => item !== null);

    fs.writeFileSync(kaddishListPath, JSON.stringify(kaddishList, null, 2));
    console.log(`Saved ${kaddishList.length} kaddish entries to ${kaddishListPath}`);
} else {
    console.error('wp_pmxi_posts.json not found');
}

// Process Site Content
if (fs.existsSync(postsPath)) {
    const rawPosts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));
    // Find Home (ID 2 usually, or post_name='home')
    const homePage = rawPosts.find(row => row[0] === '2' && row[13] === 'home');
    const content = {};

    if (homePage) {
        // Content is at index 4
        // Title is at index 7 ("Home")
        content.home = {
            title: homePage[7],
            content: homePage[4]
        };
        console.log('Found Home page content');
    }

    // Find About page if exists?
    // Let's look for titles with "אודות"
    const aboutPage = rawPosts.find(row => row[7] && row[7].includes('אודות'));
    if (aboutPage) {
        content.about = {
            title: aboutPage[7],
            content: aboutPage[4]
        };
        console.log('Found About page content');
    }

    fs.writeFileSync(siteContentPath, JSON.stringify(content, null, 2));
    console.log(`Saved site content to ${siteContentPath}`);
} else {
    console.error('wp_posts.json not found');
}
