
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'src', 'data', 'pages_db.json');

const enrichedContent = {
    'מי-אנחנו': `
        <div class="space-y-6">
            <p class="text-lg leading-relaxed">
                ארגון <strong>"קדישים"</strong> נוסד מתוך שליחות קודש והמשך מורשתו המפוארת של הצדיק הקדוש, <strong>הרב משה בן-טוב זצוק"ל</strong>("רואה המזוזות"), מייסד מוסדות "דור ודור".
            </p>
            <p class="text-lg leading-relaxed">
                הרב בן-טוב, שהיה ידוע באהבת ישראל העצומה שלו ובדאגתו לכל יהודי, הקים בחייו עולה של תורה וחסד. אנו ממשיכים את דרכו ומפעילים רשת כוללים בירושלים, בבאר שבע ובמקומות נוספים בארץ, בהם שוקדים מאות אברכים תלמידי חכמים על התורה ועל העבודה.
            </p>
            <h3 class="text-2xl font-bold text-primary mt-6 mb-2">המשימה שלנו: לכל נשמה מגיע קדיש</h3>
            <p class="leading-relaxed">
                במסגרת פעילות החסד של המוסדות, נחשפנו לצערנו למקרים רבים של נשמות יהודיות יקרות שנפטרו מן העולם ללא מי שיאמר עבורן קדיש, או משפחות שאין ביכולתן להקפיד על אמירת הקדיש שלוש פעמים ביום במשך השנה הראשונה.
            </p>
            <p class="leading-relaxed">
                לשם כך הוקם מערך "קדישים". אברכי הכוללים שלנו, יראי שמים ותלמידי חכמים, לוקחים על עצמם את האחריות הגדולה לאמירת הקדיש, לימוד המשניות ותפילות התיקון, <strong>יום יום, ללא תשלום וללא כל תמורה</strong>, לעילוי נשמת יקירכם.
            </p>
        </div>
    `,
    'סעודת-מצוה': `
        <div class="space-y-6">
            <p class="text-lg leading-relaxed font-semibold text-primary">
                "גדול השלום שנתן הקדוש ברוך הוא לישראל"
            </p>
            <p class="leading-relaxed">
                עריכת סעודת מצווה לעילוי נשמת הנפטר היא מנהג קדוש וקדום בעם ישראל. חכמי הקבלה מלמדים כי כאשר מברכים על המאכלים "שהכל", "העץ", "האדמה", "מזונות" ו"הגפן" ואומרים דברי תורה לעילוי הנשמה, הדבר גורם לנחת רוח עצומה לנפטר ולעליית נשמתו במעלות גן עדן.
            </p>
            
            <h3 class="text-xl font-bold text-gray-800 mt-6 mb-3">אנו מספקים מעטפת מלאה לכל סוגי הסעודות:</h3>
            <ul class="list-none space-y-3">
                <li class="flex items-start gap-3">
                    <span class="text-primary mt-1">✦</span>
                    <div>
                        <strong>סעודות אזכרה (יארצייט):</strong> תפריט עשיר ומכובד לסעודת סיום השבעה, ה-30 או השנה. כולל לחמניות, סלטים, דגים/בשר וברכות לתיקון.
                    </div>
                </li>
                <li class="flex items-start gap-3">
                    <span class="text-primary mt-1">✦</span>
                    <div>
                        <strong>סעודות מצווה כלליות:</strong> סיום מסכת, הכנסת ספר תורה, או חנוכת בית.
                    </div>
                </li>
                <li class="flex items-start gap-3">
                    <span class="text-primary mt-1">✦</span>
                    <div>
                        <strong>שירות עד הבית או באולמות שלנו:</strong> אפשרות לקייטרינג מלא לבית האבלים או שימוש באולמות האירוח של המוסדות בירושלים ובבאר שבע.
                    </div>
                </li>
            </ul>
             <div class="bg-blue-50 p-6 rounded-xl mt-8 border-r-4 border-primary">
                <p class="font-bold text-lg mb-2">לפרטים והזמנות:</p>
                <p>אנו דואגים להכל - מהאוכל ועד לסידורים והדרשה, כדי שאתם תוכלו להתרכז בהנצחת היקיר לכם.</p>
                <a href="/contact" class="inline-block mt-4 text-primary font-bold hover:underline">צור קשר להצעת תפריט >></a>
            </div>
        </div>
    `,
    'ארגון-שבעה': `
        <div class="space-y-6">
            <h3 class="text-2xl font-bold text-gray-900 mb-4">מעטפת תומכת בשעת הצער</h3>
            <p class="leading-relaxed">
                בימי השבעה, כשהכאב טרי והמשפחה מתכנסת לאבל, האחרונה שצריך לדאוג לה היא הלוגיסטיקה. ארגון "קדישים" מעמיד לרשותכם ציוד מלא ואיכותי לניהול ימי השבעה בכבוד וברוגע, בבית המנוח או באוהל אבלים.
            </p>

            <div class="grid md:grid-cols-2 gap-6 mt-6">
                <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <h4 class="font-bold text-lg mb-3 text-primary">ציוד לבית האבל</h4>
                    <ul class="list-disc list-inside space-y-2 text-gray-700">
                        <li>כיסאות נמוכים לאבלים (נוחים ותקניים)</li>
                        <li>כיסאות פלסטיק למנחמים</li>
                        <li>שולחנות מתקפלים</li>
                        <li>מיחם גדול ופלטת שבת</li>
                        <li>מקררים וציוד קירור</li>
                    </ul>
                </div>
                <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <h4 class="font-bold text-lg mb-3 text-primary">צרכי דת ותפילה</h4>
                    <ul class="list-disc list-inside space-y-2 text-gray-700">
                        <li>ספר תורה מהודר + ארון קודש נייד</li>
                        <li>סידורים, חומשים וספרי תהילים</li>
                        <li>משניות ללימוד לעילוי הנשמה</li>
                        <li>ארגון מניינים (שחרית, מנחה, ערבית) בבית האבל</li>
                    </ul>
                </div>
            </div>

            <p class="mt-6 text-gray-600">
                * במקרים של ריבוי מנחמים, אנו מספקים <strong>אוהלי אבלים</strong> ממוזגים ועמידים בכל גודל נדרש, כולל תאורה וחימום/קירור.
            </p>
             <div class="mt-8 text-center">
                <a href="/contact" class="bg-primary text-white py-3 px-8 rounded-full font-bold shadow-lg hover:bg-primary-dark transition-all">הזמנת ציוד לשבעה</a>
            </div>
        </div>
    `,
    'ארגון-הלוויות': `
        <div class="space-y-6">
            <p class="text-lg leading-relaxed">
                פרידה מאדם קרוב היא רגע קשה וכואב. אנו ב"קדישים" רואים בליווי הנפטר בדרכו האחרונה מצווה של "חסד של אמת" - החסד היחיד שבו אין מצפים לתמורה.
            </p>
            <h3 class="text-xl font-bold text-gray-800 mt-4">השירותים שלנו כוללים:</h3>
            <ul class="list-none space-y-4">
                <li class="bg-gray-50 p-4 rounded-lg">
                    <strong>טיפול בבירוקרטיה:</strong> סיוע מול משרד הבריאות, חברה קדישא והמועצות הדתיות להוצאת רישיון קבורה במהירות וללא עיכובים מיותרים.
                </li>
                <li class="bg-gray-50 p-4 rounded-lg">
                    <strong>רכישת חלקות קבר:</strong> ייעוץ וסיוע ברכישת חלקות קבורה בירושלים ובשאר חלקי הארץ, כולל חלקות לתושבי חו"ל המבקשים להיקבר באדמת הקודש.
                </li>
                <li class="bg-gray-50 p-4 rounded-lg">
                    <strong>העברת נפטרים (חו"ל):</strong> טיפול הטסת נפטרים מחו"ל לישראל, כולל שחרור מהמכס ואמבולנס משדה התעופה ישירות לבית העלמין.
                </li>
                <li class="bg-gray-50 p-4 rounded-lg">
                    <strong>עריכת הלוויה:</strong> ארגון טקס הלוויה לפי מנהגי כל העדות (ספרד, אשכנז, תימן), אמירת קדיש והספדים בצורה מכובדת ומרגשת.
                </li>
            </ul>
             <p class="mt-6 font-bold text-center text-primary">
                אנו זמינים 24 שעות ביממה (למעט שבת וחג) לכל שאלה וסיוע דחוף.
            </p>
        </div>
    `,
    'תרומות': `
        <div class="text-center space-y-8 max-w-2xl mx-auto">
            <div>
                <h3 class="text-2xl font-bold text-gray-900 mb-2">היו שותפים בזכויות</h3>
                <p class="text-lg text-gray-600">
                    פעילות "קדישים" ממומנת כולה מתרומות הציבור. 
                    <br/>
                    תרומתכם מאפשרת לאברכים שלנו להמשיך ולומר קדיש, ללמוד משניות ולערוך תיקונים עבור נשמות ישראל שאין להן גואל.
                </p>
            </div>

            <div class="grid md:grid-cols-2 gap-6">
                <!-- Bit -->
                <div class="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex flex-col items-center hover:border-primary transition-colors">
                    <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-600">
                         <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                    </div>
                    <h4 class="font-bold text-lg mb-2">תרומה ב-Bit / פייבוקס</h4>
                    <p class="text-xl font-mono dir-ltr select-all bg-gray-50 px-3 py-1 rounded">054-223-3445</p>
                    <p class="text-sm text-gray-500 mt-2">עבור יצחק - ארגון קדישים</p>
                </div>

                <!-- Bank Transfer -->
                <div class="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex flex-col items-center hover:border-primary transition-colors">
                    <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="21" width="18" height="2"/><rect x="2" y="3" width="20" height="5"/><line x1="4" y1="21" x2="4" y2="8"/><line x1="8" y1="21" x2="8" y2="8"/><line x1="12" y1="21" x2="12" y2="8"/><line x1="16" y1="21" x2="16" y2="8"/><line x1="20" y1="21" x2="20" y2="8"/></svg>
                    </div>
                    <h4 class="font-bold text-lg mb-2">העברה בנקאית</h4>
                    <div class="text-right text-sm space-y-1 bg-gray-50 p-3 rounded w-full">
                        <p><strong>בנק:</strong> פאג"י (52)</p>
                        <p><strong>סניף:</strong> 182</p>
                        <p><strong>חשבון:</strong> 409-456-789</p>
                        <p><strong>שם המוטב:</strong> מוסדות דור ודור</p>
                    </div>
                </div>
            </div>

            <div class="pt-6 border-t border-gray-200">
                <p class="font-bold text-gray-800 mb-2">אישורים וקבלות</p>
                <p class="text-sm text-gray-600">
                    העמותה מוכרת לצרכי מס לפי סעיף 46. קבלה דיגיטלית תישלח לכל תורם.
                    <br/>
                    לפרטים נוספים: <a href="tel:0542233445" class="text-primary hover:underline">054-223-3445</a>
                </p>
            </div>
        </div>
    `,
    'contact': `
        <div class="grid md:grid-cols-2 gap-12 items-start">
            <div class="space-y-8">
                <div>
                    <h3 class="text-3xl font-bold text-gray-900 mb-4">יצירת קשר</h3>
                    <p class="text-lg text-gray-600 leading-relaxed">
                        אנחנו כאן לכל שאלה, בקשה או התייעצות.
                        <br/>
                        ניתן לפנות אלינו בכל שעה (מענה אנושי 24/6) למקרי חירום ופטירה ל"ע.
                    </p>
                </div>

                <div class="space-y-4">
                    <div class="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm">
                        <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500">מוקד ראשי (יצחק)</p>
                            <a href="tel:0542233445" class="text-xl font-bold text-gray-900 hover:text-primary">054-223-3445</a>
                        </div>
                    </div>

                    <div class="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm">
                        <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500">מחלקה משפטית (דן)</p>
                            <a href="tel:0547243492" class="text-xl font-bold text-gray-900 hover:text-primary">054-724-3492</a>
                        </div>
                    </div>
                </div>
            </div>

            <div class="bg-gray-50 p-8 rounded-3xl">
                <h4 class="font-bold text-xl mb-6">השאירו פרטים ונחזור בהקדם</h4>
                [form]
            </div>
        </div>
    `
};

try {
    const rawData = fs.readFileSync(dbPath, 'utf8');
    let pages = JSON.parse(rawData);
    let updatedCount = 0;

    pages = pages.map(page => {
        if (enrichedContent[page.slug]) {
            console.log(`Enriching page: ${page.title} (${page.slug})`);
            updatedCount++;
            return {
                ...page,
                content: enrichedContent[page.slug]
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
