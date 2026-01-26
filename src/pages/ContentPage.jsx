import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { ChevronLeft, Flame, ArrowRight } from 'lucide-react';
import pagesDb from '../data/cleaned_pages.json';

// Map of internal slugs to Heb titles in pages_db
// This connects our clean English URLs to the messy Hebrew titles in the DB
const slugToHebrewMap = {
    // Halacha Types (Sub-menu items)
    'half-kaddish': ['חצי קדיש', 'חצי קדיש, נסח אשכנזי', 'חצי קדיש נסח עדות המזרח'],
    'kaddish-yatom': ['קדיש יהא שלמא - קדיש יתום', 'קדיש יתום', 'מתי אומרים קדיש יהא שלמא'],
    'kaddish-titkabel': ['קדיש תתקבל', 'מתי אומרים קדיש תתקבל', 'קדיש תתקבל - נסח ספרד'],
    'kaddish-rabanan': ['קדיש דרבנן', 'מתי אומרים קדיש דרבנן', 'קדיש דרבנן נסח אשכנז'],
    'kaddish-dead': ['קדיש על המת', 'קדיש לאבלים'],
    'kaddish-gadol': ['קדיש גדול', 'מתי אומרים קדיש גדול?'],

    // General Halacha
    'types': ['סוגי קדיש'],
    'traditions': ['קדיש על פי עדות', 'מנהגי עדות', 'חצי קדיש נסח עדות המזרח'],
    'laws': ['דיני קדיש', 'דיני קדיש, ובו כ"ב סעיפים'],
    'source': ['מקור הקדיש', 'מקור הקדיש ונסח הקדיש'],
    'virtue': ['מעלת הקדיש', 'בִּזְכוּת הַקַּדִּישׁ', 'הזכות שיש לנפטרים על ידי אמירת קדיש'],
    'general-kaddish': ['יום הקדיש הכללי'],

    // Spirituality
    'saying-kaddish': ['אמירת קדיש', 'מנין הקדישים והזכויות'],
    'devotion': ['כוחה של דבקות', 'קדיש תתקבל', 'משמעות הקדיש', 'בִּזְכוּת הַקַּדִּישׁ'],
    'stories': ['סיפורי מסירות נפש', 'קדיש דרבנן'],
    'virtues': ['סגולות לעילוי נשמה', 'סגולות'],
    'tikkun': ['תיקון נפטרים'],
    'commemoration': ['הנצחה', 'הנצחת נפטרים'],
    'spiritual': ['שירותים רוחניים', 'תיקון נפטרים', 'הזכות שיש לנפטרים על ידי אמירת קדיש'],

    // Services
    'shiva': ['ארגון שבעה', 'השאלת ציוד לאבלים'],
    'meal': ['סעודת מצוה'],
    'funeral': ['ארגון הלוויות', 'לוויות'],

    // Org
    'donate': ['תרומות'],
    'contact': ['צור קשר', 'Contact form 1', 'Form'],
    'about': ['מי אנחנו', 'אודות הארגון'],
    'rabbi': ['הרב משה בן-טוב', 'הרב משה בן-טוב זצוק"ל']
};

const ContentPage = () => {
    const { slug } = useParams();
    const [pageData, setPageData] = useState(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        setLoading(true);
        const hebTitles = slugToHebrewMap[slug] || [];
        const decodedSlug = decodeURIComponent(slug || '');
        const isContactPath = location.pathname === '/contact' || location.pathname === '/page/contact' || slug === 'contact';

        if (isContactPath) {
            setPageData({
                title: 'צור קשר',
                slug: 'contact',
                content: '' // Empty content, acts as trigger for form
            });
            setLoading(false);
            return;
        }

        const foundPage = pagesDb.find(p =>
            hebTitles.includes(p.title) ||
            hebTitles.includes(p.slug) ||
            p.slug === slug ||
            p.slug === decodedSlug ||
            hebTitles.some(t => p.title.includes(t))
        );

        if (foundPage) {
            setPageData(foundPage);
        } else {
            setPageData({ title: 'תוכן חסר', content: '<div class="text-center py-10"><p class="text-xl text-gray-500">התוכן לדף זה טרם הוזן.</p></div>' });
        }
        setLoading(false);
    }, [slug, location.pathname]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!pageData) return null;

    const renderContent = () => {
        const isContact = pageData.slug === 'contact' || pageData.title === 'צור קשר';

        if (isContact) {
            return (
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl border-t-8 border-primary">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">יצירת קשר</h2>
                            <p className="text-gray-600 text-lg">יש לכם שאלה? רוצים להנציח יקיר? השאירו פרטים ונחזור אליכם בהקדם.</p>
                        </div>

                        <form className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">שם מלא</label>
                                    <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-primary outline-none transition-all" placeholder="ישראל ישראלי" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">טלפון</label>
                                    <input type="tel" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-primary outline-none transition-all" placeholder="050-0000000" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">אימייל (לא חובה)</label>
                                <input type="email" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-primary outline-none transition-all" placeholder="example@email.com" />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">תוכן ההודעה</label>
                                <textarea rows="5" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-primary outline-none transition-all" placeholder="כתוב את הודעתך כאן..."></textarea>
                            </div>

                            <button type="button" className="w-full bg-black text-white text-lg font-bold py-4 rounded-xl hover:bg-gray-800 transition-transform active:scale-95 shadow-lg">
                                שליחת הודעה
                            </button>
                        </form>
                    </div>

                    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-lg mb-2">מוקד טלפוני</h3>
                            <p className="text-primary font-bold text-xl" dir="ltr">054-XXXXXXX</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-lg mb-2">אימייל</h3>
                            <p className="text-gray-600">office@kadishim.co.il</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-lg mb-2">כתובת</h3>
                            <p className="text-gray-600">ירושלים, ישראל</p>
                        </div>
                    </div>
                </div>
            );
        }

        // Sanitize content: Replace legacy links
        const contentWithFixedLinks = pageData.content
            .replace(/href="https?:\/\/(www\.)?kadishim\.co\.il/g, 'href="')
            .replace(/href="http:\/\/(www\.)?kadishim\.co\.il/g, 'href="');

        return (
            <div
                className="prose prose-xl prose-stone max-w-none text-right font-serif leading-loose text-gray-800"
                dangerouslySetInnerHTML={{ __html: contentWithFixedLinks }}
            />
        );
    };

    return (
        <div className="min-h-screen bg-[#f8f9fa] pt-28 pb-20">
            <div className="container mx-auto px-4 max-w-5xl">
                {/* Breadcrumbs */}
                <div className="mb-8 flex items-center gap-2 text-sm text-gray-400">
                    <Link to="/" className="hover:text-primary transition-colors">דף הבית</Link>
                    <ChevronLeft size={14} />
                    <span className="text-gray-900 font-bold">{pageData.title}</span>
                </div>

                {pageData.slug !== 'contact' && (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-16 mb-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-full h-2 bg-gradient-to-l from-primary to-orange-500"></div>
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-10 leading-tight">
                            {pageData.title}
                        </h1>
                        {renderContent()}
                    </div>
                )}

                {pageData.slug === 'contact' && renderContent()}
            </div>
        </div>
    );
};

export default ContentPage;
