const fs = require('fs');
const path = require('path');

const PAGES_PATH = 'src/data/pages_db.json';
const OUTPUT_PATH = 'src/data/menu_structure.json';

const pages = JSON.parse(fs.readFileSync(PAGES_PATH, 'utf8'));

// Helper to find slug by title (flexible matching)
function findSlug(title) {
    const normalize = (s) => s.replace(/[\u0591-\u05C7]/g, '').replace(/[,"'?\\-]/g, '').replace(/ /g, '').replace(/א/g, 'ה').replace(/י/g, '');
    const target = normalize(title);

    // Exact match first
    let page = pages.find(p => p.title === title);
    if (page) return `/page/${page.slug}`;

    // Normalize match
    page = pages.find(p => normalize(p.title).includes(target) || target.includes(normalize(p.title)));

    if (!page && title.includes('מתי אומרים')) {
        const base = title.replace('מתי אומרים ', '').replace(/\?/, '').trim();
        page = pages.find(p => p.title.includes('מתי אומרים') && p.title.includes(base));
    }

    return page ? `/page/${page.slug}` : null;
}

// Group pages by a keyword
function findGroup(keyword, excludeWords = []) {
    return pages
        .filter(p => p.title.includes(keyword) && !excludeWords.some(w => p.title.includes(w)))
        .map(p => ({
            name: p.title.replace(' - ', ' '),
            path: `/page/${p.slug}`
        }));
}

// Specialized grouping for traditions
function getTraditionItems(traditionKeywords) {
    const items = [];
    pages.forEach(p => {
        const title = p.title;
        if (traditionKeywords.some(k => title.includes(k))) {
            let typeName = "קדיש";
            if (title.includes("חצי")) typeName = "חצי קדיש";
            else if (title.includes("יתום") || title.includes("יהא שלמא")) typeName = "קדיש יתום";
            else if (title.includes("תתקבל")) typeName = "קדיש תתקבל";
            else if (title.includes("דרבנן")) typeName = "קדיש דרבנן";
            else if (title.includes("גדול")) typeName = "קדיש הגדול";

            items.push({
                name: typeName,
                path: `/page/${p.slug}`
            });
        }
    });
    // Remove duplicates by name
    return items.filter((v, i, a) => a.findIndex(t => t.path === v.path) === i);
}

const structure = [
    {
        title: "מידע והלכה",
        path: "#",
        items: [
            { name: "דיני קדיש ובו כב סעיפים", path: findSlug("דיני קדיש, ובו כ\"ב סעיפים") || "#" },
            { name: "מניין הקדישים והזכויות", path: findSlug("מנין הקדישים והזכויות") || "#" },
            { name: "מקור הקדיש ונסח הקדיש", path: findSlug("מקור הקדיש ונסח הקדיש") || "#" },
            { name: "נוסח הקדיש", path: findSlug("נסח הקדיש") || "#" },
            { name: "קדיש לאבלים", path: findSlug("קדיש לאבלים") || "#" },
            { name: "קדיש על המת", path: findSlug("קדיש על המת") || "#" },
            { name: "הזכות שיש לנפטרים על ידי אמירת קדיש", path: findSlug("הזכות שיש לנפטרים על ידי אמירת קדיש") || "#" },
            { name: "בִּזְכוּת הַקַּדִּישׁ", path: findSlug("בִּזְכוּת הַקַּדִּישׁ") || findSlug("בזכות הקדיש") || "#" },
            { name: "יום הקדיש הכללי", path: findSlug("יום הקדיש הכללי") || "#" }
        ]
    },
    {
        title: "ספריית הקדישים",
        path: "/kaddish-library",
        items: [
            { name: "כל ספריית הקדישים", path: "/kaddish-library" },
            {
                name: "נוסח אשכנז",
                items: getTraditionItems(["אשכנז"])
            },
            {
                name: "עדות המזרח וספרדים",
                items: getTraditionItems(["עדות המזרח", "ספרדים", "ארצות המזרח"])
            },
            {
                name: "נוסח ספרד (חסידי)",
                items: getTraditionItems(["ספרד חסידי"])
            },
            {
                name: "נוסח יהודי תימן",
                items: getTraditionItems(["תימן"])
            },
            {
                name: "מתי אומרים קדיש?",
                items: findGroup("מתי אומרים")
            }
        ]
    },
    {
        title: "תפילות לפי שם",
        path: "#",
        items: [
            { name: "פרקי תהילים לפי שם", path: "/generators?tab=tehillim" },
            { name: "משניות לעילוי נשמה", path: "/generators?tab=mishnayot" },
            { name: "סדר תפילה בבית העלמין", path: "/generators?tab=grave" }
        ]
    },
    {
        title: "שירותים רוחניים",
        path: "#",
        items: [
            { name: "סגולות לעילוי נשמה", path: findSlug("סגולות לעילוי נשמה") || "#" }
        ]
    },
    {
        title: "שירותים נוספים",
        path: "#",
        items: [
            { name: "ארגון שבעה", path: findSlug("ארגון שבעה") || "#" },
            { name: "סעודת מצוה", path: findSlug("סעודת מצוה") || "#" },
            { name: "ארגון הלוויות", path: findSlug("ארגון הלוויות") || "#" }
        ]
    },
    {
        title: "מי אנחנו",
        path: findSlug("מי אנחנו") || "/page/מי-אנחנו",
        items: []
    },
    {
        title: "תרומות",
        path: findSlug("תרומות") || "/page/תרומות",
        items: []
    },
    {
        title: "צור קשר",
        path: findSlug("צור קשר") || "/page/contact",
        items: []
    }
];

fs.writeFileSync(OUTPUT_PATH, JSON.stringify(structure, null, 2));
console.log('Menu structure rebuilt successfully!');
