import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'src', 'data', 'pages_db.json');

const enrichedContent = {
    'מנין-הקדישים-והזכויות': `
        <div class="space-y-8">
            <div class="bg-gray-50 border-r-4 border-primary p-6 rounded-lg">
                <h3 class="text-2xl font-bold text-gray-900 mb-4">חמישה מיני קדישים</h3>
                <p class="leading-relaxed text-lg">
                    תקנו חכמים חמישה סוגי קדישים שנאמרים במהלך התפילה והלימוד:
                </p>
                <ul class="list-disc list-inside space-y-2 mt-4 text-gray-800">
                    <li><strong>קדיש הגדול:</strong> נאמר אחר צידוק הדין (בהלוויה/סיום מסכת).</li>
                    <li><strong>קדיש דרבנן:</strong> נאמר אחר לימוד הלכה, משנה או אגדה.</li>
                    <li><strong>קדיש יתום (יהא שלמא):</strong> נאמר על ידי האבלים.</li>
                    <li><strong>קדיש שלם (תתקבל):</strong> נאמר על ידי החזן אחר התפילה.</li>
                    <li><strong>חצי קדיש:</strong> נאמר בין חלקי התפילה.</li>
                </ul>
            </div>

            <div class="space-y-4">
                <h3 class="text-xl font-bold text-primary">מנהגי אמירת קדיש</h3>
                <div class="grid md:grid-cols-2 gap-6">
                    <div class="bg-white shadow-sm border border-gray-100 p-5 rounded-xl">
                        <h4 class="font-bold text-gray-900 mb-2">מנהג האשכנזים</h4>
                        <p class="text-gray-700">רק אבל אחד אומר קדיש בכל פעם. אם יש מספר אבלים, מחלקים ביניהם את הקדישים לפי כללי קדימה (בן שבעה, בן שלושים, יארצייט).</p>
                    </div>
                    <div class="bg-white shadow-sm border border-gray-100 p-5 rounded-xl">
                        <h4 class="font-bold text-gray-900 mb-2">מנהג הספרדים</h4>
                        <p class="text-gray-700">כולם אומרים יחד. אחד אומר בקול רם במתינות, והשאר מצטרפים אליו בלחש או בקול נמוך, מילה במילה.</p>
                    </div>
                </div>
            </div>
            
            <div class="bg-blue-50 p-6 rounded-xl">
                <h3 class="text-xl font-bold text-gray-900 mb-3">סדר קדימה בין אבלים (למנהג האשכנזים)</h3>
                <ol class="list-decimal list-inside space-y-2 text-gray-800">
                    <li><strong>בן שבעה:</strong> יש לו את כל הקדישים (דוחה יארצייט ובן שלושים).</li>
                    <li><strong>בן שלושים:</strong> יש לו קדיש בכל תפילה (אך יארצייט דוחה אותו).</li>
                    <li><strong>יארצייט:</strong> דוחה בן שלושים לקדיש אחד.</li>
                    <li><strong>אורח:</strong> אם יש לו יארצייט, מקבל קדיש אחד.</li>
                </ol>
            </div>
            
             <p class="text-sm text-gray-500 mt-8 border-t pt-4">
                מקור: "מעלת הקדיש והאמן" לר' אברהם בן טוב זצ"ל
            </p>
        </div>
    `,
    'יום-הקדיש-הכללי': `
        <div class="space-y-8">
            <div class="relative bg-dark rounded-2xl overflow-hidden text-white p-8 md:p-12 text-center">
                <div class="absolute inset-0 bg-primary opacity-10"></div>
                <h2 class="relative text-3xl md:text-4xl font-bold mb-4">עשרה בטבת - יום הקדיש הכללי</h2>
                <p class="relative text-lg md:text-xl max-w-2xl mx-auto leading-relaxed opacity-90">
                    ביום כ"ז בכסלו תשי"א קבעה הרבנות הראשית לישראל את עשרה בטבת כיום זיכרון לקדושי השואה שיום קבורתם לא נודע.
                </p>
                <a href="/contact" class="relative inline-block mt-8 bg-primary !text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                    שליחת שמות לקדיש ביום זה
                </a>
            </div>

            <div class="prose prose-lg max-w-none text-gray-700">
                <h3 class="text-primary font-bold">משמעות היום</h3>
                <p>
                    יום הקדיש הכללי נועד לאפשר לקרובי הנספים בשואה לנהוג במנהגי יום השנה (יארצייט): להדליק נרות נשמה, לומר קדיש וללמוד משניות לעילוי נשמות הקדושים.
                    עשרה בטבת, שנקבע במקור כצום על תחילת המצור על ירושלים, מסמל את תחילת החורבן והסתר הפנים, ולכן נמצא מתאים לציין בו את זכרם של ששת המיליונים.
                </p>
                
                <h3 class="text-primary font-bold mt-8">פעילות ארגון "קדישים"</h3>
                <p>
                    אנו בארגון "קדישים" לקחנו על עצמנו משימת קודש: לדאוג לאמירת קדיש על כל יהודי שאין מי שיאמר עבורו.
                    ביום הקדיש הכללי, אברכי הכולל שלנו עורכים תפילות מיוחדות ואומרים קדיש עבור רבבות הנספים ועבור שמות שמועברים אלינו על ידי הציבור.
                </p>
            </div>
        </div>
    `,
    'קדיש-על-המת': `
        <div class="space-y-8">
            <div class="bg-gray-50 p-8 rounded-2xl border-r-4 border-primary">
                <h3 class="text-2xl font-bold text-gray-900 mb-4">מעשה ברבי עקיבא</h3>
                <p class="text-lg leading-relaxed italic text-gray-700 mb-4">
                    "מעשה ברבי עקיבא שראה אדם אחד שהיה ערום ושחור כפחם... והיה רץ כמרוצת הסוס..."
                </p>
                <div class="h-px bg-gray-200 my-4"></div>
                <div class="prose prose-lg text-gray-800">
                    <p>
                        פגש רבי עקיבא אדם המתייסר קשות לאחר מותו. כששאל אותו רבי עקיבא למעשיו, סיפר לו האיש שהיה גבאי מס ורשע גמור בחייו, וכעת הוא נענש בחומרה.
                        האיש גילה לרבי עקיבא שרק אם יהיה לו בן שיאמר "ברכו" או "יתגדל ויתקדש", הוא ישוחרר מדינו הקשה.
                    </p>
                    <p>
                        רבי עקיבא חיפש ומצא את בנו של אותו אדם, שהיה עם הארץ גמור. הוא לימדו תורה, קריאת שמע ותפילה, עד שהעמידו לפני הקהל לומר "ברכו" וקדיש.
                    </p>
                    <p class="font-bold text-primary">
                        באותה שעה בא המת לרבי עקיבא בחלום ואמר לו: "תנוח דעתך בגן עדן שהצלת אותי מדינה של גיהנום".
                    </p>
                </div>
            </div>

            <div class="grid md:grid-cols-2 gap-8">
                <div>
                    <h3 class="text-xl font-bold text-gray-900 mb-3">משמעות הקדיש</h3>
                    <p class="text-gray-700 leading-relaxed">
                        הקדיש אינו רק תפילה על המת, אלא <strong>צידוק הדין וקידוש שם שמיים</strong> ברבים. כאשר הבן עומד ומקדש את שמו של הקב"ה למרות הכאב והאובדן, הוא מוכיח את חינוכו ומעלה את נשמת הוריו לדרגות גבוהות.
                    </p>
                </div>
                <div>
                    <h3 class="text-xl font-bold text-gray-900 mb-3">מקורות נוספים</h3>
                    <ul class="list-disc list-inside space-y-2 text-gray-700">
                        <li><strong>זוהר חדש:</strong> בשעה שהבן אומר קדיש, קורעים לנפטר גזר דינו.</li>
                        <li><strong>אור זרוע:</strong> הקדיש מציל את הנפטר מדין גיהנום.</li>
                        <li><strong>תנא דבי אליהו:</strong> גדול כוחה של אמירת קדיש על ידי יתום.</li>
                    </ul>
                </div>
            </div>
             <p class="text-sm text-gray-500 mt-8 border-t pt-4">
                מקור: מתוך הספר "מעלת הקדיש והאמן"
            </p>
        </div>
    `,
    'מקור-הקדיש-ונסח-הקדיש': `
        <div class="space-y-6">
            <h3 class="text-2xl font-bold text-gray-900">מקור הקדיש והתפתחותו</h3>
            <p class="leading-relaxed text-gray-700">
                הקדיש נזכר כבר בתלמוד בשם "יהא שמיה רבא". חז"ל הפליגו במעלת עניית אמן יהא שמיה רבא:
            </p>
            <blockquote class="bg-blue-50 border-r-4 border-blue-500 p-4 rounded-r my-4">
                <p class="text-lg font-serif">"כל העונה אמן יהא שמיה רבא בכל כוחו – קורעין לו גזר דינו" (שבת קי"ט)</p>
            </blockquote>
            
            <h4 class="text-xl font-bold text-gray-900 mt-6">יסודות הקדיש</h4>
            <ul class="list-disc list-inside space-y-3 text-gray-700">
                <li><strong>לשון ארמית:</strong> הקדיש נאמר בארמית (למעט פסוקי הסיום), שהייתה שפת הדיבור בבבל, כדי שכל העם יבין וישתתף.</li>
                <li><strong>שבחים:</strong> בנוסח הקדיש תקנו שבחים כנגד עשרה מאמרות שבהם נברא העולם, או כנגד שבעה רקיעים.</li>
                <li><strong>הקשר לחורבן:</strong> יש אומרים שהקדיש הוא תפילה לתיקון העולם וגילוי מלכותו יתברך שנפגעה כביכול בחורבן בית המקדש.</li>
            </ul>
             <p class="text-sm text-gray-500 mt-8">
                נלקח מתוך הספר "מעלת הקדיש והאמן"
            </p>
        </div>
    `,
    'קדיש-לאבלים': `
         <div class="space-y-6">
            <h3 class="text-2xl font-bold text-gray-900">דיני קדיש יתום</h3>
            <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <ul class="space-y-4">
                    <li class="flex items-start gap-3">
                        <span class="text-primary font-bold text-xl">•</span>
                        <div>
                            <strong>משך הזמן:</strong> אומרים קדיש על אב ואם במשך י"א חודשים (11 חודשים) פחות יום אחד.
                        </div>
                    </li>
                    <li class="flex items-start gap-3">
                        <span class="text-primary font-bold text-xl">•</span>
                        <div>
                            <strong>הטעם:</strong> י"ב חודש הוא זמן משפט רשעים בגיהנום. כדי לא להחזיק את ההורים כרשעים, מסיימים חודש אחד קודם.
                        </div>
                    </li>
                    <li class="flex items-start gap-3">
                        <span class="text-primary font-bold text-xl">•</span>
                        <div>
                            <strong>מי אומר:</strong> החיוב הוא על הבנים הזכרים. אם אין בנים, ניתן לשכור אדם ירא שמיים שיאמר (כמו שירותי "קדישים").
                        </div>
                    </li>
                </ul>
            </div>
            <p class="text-gray-700 leading-relaxed">
                הקדיש מועיל לעילוי נשמה לא רק להצלה מדין, אלא גם להעלאת הנשמה ממדרגה למדרגה בגן עדן, בפרט ביום השנה (יארצייט).
            </p>
        </div>
    `,
    'הזכות-שיש-לנפטרים-על-ידי-אמירת-קדיש': `
         <div class="space-y-6">
            <h3 class="text-2xl font-bold text-gray-900">כוחו של הקדיש</h3>
             <p class="leading-relaxed text-gray-700 text-lg">
                "ברא מזכי אבא" - הבן מזכה את האב. כאשר הבן עומד בבית הכנסת ומכריז קבל עם ועדה את אמונתו בבורא עולם, הוא גורם נחת רוח עצומה לנשמת הוריו.
            </p>
            
            <div class="grid gap-6 mt-6">
                <div class="bg-orange-50 p-5 rounded-lg border-r-4 border-orange-400">
                    <h4 class="font-bold text-gray-900">פדיון מגיהנום</h4>
                    <p class="text-gray-700">
                        "כשהבן מתפלל ומקדש ברבים, פודה אביו ואמו מן הגיהנום" (רמ"א, יורה דעה שע"ו).
                    </p>
                </div>
                <div class="bg-blue-50 p-5 rounded-lg border-r-4 border-blue-400">
                    <h4 class="font-bold text-gray-900">עדויות מהזוהר</h4>
                    <p class="text-gray-700">
                        בספרי מקובלים מובאים סיפורים נוראים על נשמות שהתגלו לחכמים וביקשו שיאמרו עליהם קדיש, וכיצד אמירה זו שינתה את דינם בשמיים מן הקצה אל הקצה.
                    </p>
                </div>
            </div>
        </div>
    `,
    'נסח-הקדיש': `
        <div class="space-y-6">
           <h3 class="text-2xl font-bold text-gray-900">ביאור נוסח הקדיש</h3>
           <p class="text-gray-700">הקדיש מורכב משבחים נשגבים ומתפילות לגאולה השלמה.</p>
           
           <div class="overflow-hidden rounded-xl border border-gray-200">
               <table class="min-w-full divide-y divide-gray-200">
                   <tbody class="bg-white divide-y divide-gray-200">
                       <tr>
                           <td class="px-6 py-4 whitespace-nowrap font-bold text-gray-900 bg-gray-50">יִתְגַּדַּל וְיִתְקַדַּשׁ שְׁמֵיהּ רַבָּא</td>
                           <td class="px-6 py-4 text-gray-700">יתגדל ויתקדש שמו הגדול (של הקב"ה).</td>
                       </tr>
                       <tr>
                           <td class="px-6 py-4 whitespace-nowrap font-bold text-gray-900 bg-gray-50">בְּעָלְמָא דִּי בְרָא כִרְעוּתֵהּ</td>
                           <td class="px-6 py-4 text-gray-700">בעולם שברא כרצונו.</td>
                       </tr>
                       <tr>
                           <td class="px-6 py-4 whitespace-nowrap font-bold text-gray-900 bg-gray-50">וְיַמְלִיךְ מַלְכוּתֵהּ</td>
                           <td class="px-6 py-4 text-gray-700">וימליך את מלכותו (באופן גלוי).</td>
                       </tr>
                       <tr>
                           <td class="px-6 py-4 whitespace-nowrap font-bold text-gray-900 bg-gray-50">בַּעֲגָלָא וּבִזְמַן קָרִיב</td>
                           <td class="px-6 py-4 text-gray-700">במהרה ובזמן קרוב.</td>
                       </tr>
                   </tbody>
               </table>
           </div>
           
           <p class="mt-4 text-gray-600 text-sm">
                * ישנם שינויי נוסח קלים בין העדות (אשכנז, ספרד, תימן), אך הרעיון המרכזי שווה בכולם.
           </p>
        </div>
    `
};

// Function to clean "Laws of Kaddish" page
function cleanLawsPage(content) {
    if (!content) return content;

    // 1. Remove Table Tags, keeping content
    let clean = content.replace(/<table[^>]*>|<tbody>|<tr>|<td[^>]*>|<\/td>|<\/tr>|<\/tbody>|<\/table>/g, '');

    // 2. Remove Divs but replace closing divs with newlines/breaks to preserve separation
    clean = clean.replace(/<\/div>/g, '<br/><br/>');
    clean = clean.replace(/<div[^>]*>/g, '');

    // 3. Improve Typography of "Simanim" (Sections)
    // Looking for patterns like "א (א)" or "ב (ו)" or "סעיף א"
    // Regex for Hebrew lists: Start of line or break, Hebrew letter, parenthesis or dot.

    // Let's just wrap the whole thing in a nice container script
    return `<div class="prose prose-lg max-w-none text-gray-800 leading-loose">
                ${clean}
            </div>`;
}

try {
    const rawData = fs.readFileSync(dbPath, 'utf8');
    let pages = JSON.parse(rawData);
    let updatedCount = 0;

    pages = pages.map(page => {
        if (enrichedContent[page.slug]) {
            console.log(`Enriching page: ${page.slug}`);
            updatedCount++;
            return {
                ...page,
                content: enrichedContent[page.slug]
            };
        }

        if (page.slug === 'דיני-קדיש-ובו-כב-סעיפים') {
            console.log(`Cleaning Laws Page: ${page.slug}`);
            updatedCount++;
            return {
                ...page,
                content: cleanLawsPage(page.content)
            };
        }

        return page;
    });

    if (updatedCount > 0) {
        fs.writeFileSync(dbPath, JSON.stringify(pages, null, 2), 'utf8');
        console.log(`Successfully enriched ${updatedCount} pages.`);
    } else {
        console.log('No pages matched for enrichment.');
    }

} catch (error) {
    console.error('Error processing DB:', error);
}
