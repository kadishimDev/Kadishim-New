import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Shield, BookOpen, Star, ArrowLeft, ChevronDown, CheckCircle } from 'lucide-react';
import MemorialServiceGenerator from '../components/TehillimGenerator';
import ContactForm from '../components/ContactForm';
import MemorialScroll from '../components/MemorialScrollNew'; // Cache Bypass

const Home = ({ pages }) => {
    // Find Home Page Data
    const homePage = pages?.find(p => p.slug === 'home');

    // Helper to render content with shortcodes (Shared logic)
    const renderContent = (htmlContent) => {
        if (!htmlContent) return null;

        // Check for [form] shortcode
        if (htmlContent.includes('[form]')) {
            const parts = htmlContent.split('[form]');
            return (
                <div>
                    <div dangerouslySetInnerHTML={{ __html: parts[0] }} />
                    <ContactForm />
                    {parts[1] && <div dangerouslySetInnerHTML={{ __html: parts[1] }} />}
                </div>
            );
        }

        return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
    };


    const services = [
        {
            icon: <BookOpen className="w-8 h-8" />,
            title: "אמירת קדיש",
            desc: "אמירת קדיש יתום בכל יום מימי האבל ובימי הזיכרון על ידי אברכים יראי שמים."
        },
        {
            icon: <Heart className="w-8 h-8" />,
            title: "הנצחת נפטרים",
            desc: "לימוד משניות וזוהר לעילוי נשמת יקיריכם, והזכרת שמות במועדים מיוחדים."
        },
        {
            icon: <Shield className="w-8 h-8" />,
            title: "תיקון נפטרים",
            desc: "עריכת תיקון מיוחד לנפטרים על פי סודות הקבלה והמסורת היהודית."
        },
        {
            icon: <Star className="w-8 h-8" />,
            title: "יום הקדיש הכללי",
            desc: "תפילה מרוכזת ועוצמתית ביום הקדיש הכללי לזכר נספי השואה ומערכות ישראל."
        }
    ];

    return (
        <div className="font-sans text-dark bg-white relative">


            {/* Hero Section - Soul Candle / Flame Theme */}
            <header className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden bg-[#0a0500]">

                {/* Parallax Background - User Video Loop */}
                <div className="absolute inset-0 z-0">
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover opacity-50"
                    >
                        <source src="/assets/background_candle.mp4" type="video/mp4" />
                    </video>
                    {/* Dark Overlay Mask */}
                    <div className="absolute inset-0 bg-black/60"></div>
                </div>

                <div className="container mx-auto px-6 relative z-10 text-center text-white mt-24 md:mt-32 flex flex-col items-center gap-6">

                    {/* 1. Soul Candle GIF - Removed Glow/Blend as requested */}
                    <div className="mb-4 animate-fade-in-up">
                        <img
                            src="/assets/ner.gif"
                            alt="נר נשמה"
                            className="w-32 h-32 md:w-30 md:h-30 object-contain"
                        />
                    </div>

                    {/* 2. Primary Button: Request Kaddish */}
                    <div className="animate-fade-in-up animation-delay-200 w-full flex justify-center">
                        <Link
                            to="/request"
                            className="inline-flex items-center justify-center px-12 py-4 bg-gradient-to-r from-orange-700 to-red-800 text-white rounded-full font-bold text-xl hover:from-orange-600 hover:to-red-700 hover:scale-105 transition-all shadow-[0_0_25px_rgba(234,88,12,0.5)] border border-orange-500/30"
                        >
                            שליחת בקשה לקדיש
                        </Link>
                    </div>

                    {/* 3. Title: Kadishim (Smaller, less gold) */}
                    <h1 className="text-5xl md:text-7xl font-bold leading-tight animate-fade-in-up animation-delay-400 drop-shadow-xl mt-2">
                        <span className="text-transparent bg-clip-text bg-gradient-to-b from-orange-200 via-orange-400 to-orange-700">קדישים</span>
                    </h1>

                    {/* 4. Description Text (Smaller, constrained width for 3 lines) */}
                    <div className="text-lg md:text-xl text-gray-300 font-light leading-relaxed drop-shadow-md max-w-2xl mx-auto animate-fade-in-up animation-delay-600 space-y-4 text-justify-center">
                        <p>
                            ארגון 'קדישים' לקח על עצמו את משימת החסד, לדאוג לאמירת קדיש על כל יהודי/ה שאין מי שיאמר עבורו/ה קדיש לעילוי נשמתו/ה.
                        </p>
                        <p className="text-base md:text-lg text-gray-400">
                            אמירת הקדיש, יום יום, במשך אחד עשר חודשי האבלות ובכל יום השנה, מתבצעת על ידי אברכים בני תורה הממומנים מטעם ארגון 'קדישים'.
                        </p>
                        <p className="text-base md:text-lg text-gray-400">
                            בנוסף באתר "קדישים" תוכלו למצוא מידע תורני, <Link to="/generators" className="text-orange-300 hover:text-orange-200 underline decoration-dotted">יצירת תפילה על פי שם הנפטר</Link> (תהילים / משניות / תפילה ביום האזכרה) ושירותים רוחניים נוספים.
                        </p>
                    </div>

                    {/* 5. Create Prayer Button (Restored with Arrow) */}
                    <div className="mt-4 animate-fade-in-up animation-delay-800">
                        <a
                            href="#tehillim-generator"
                            onClick={(e) => {
                                e.preventDefault();
                                document.getElementById('tehillim-generator')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="inline-flex items-center gap-2 text-orange-300/80 hover:text-white transition-colors text-sm md:text-base font-medium group cursor-pointer"
                        >
                            <BookOpen size={18} />
                            <span>יצירת תפילה אישית</span>
                            <ChevronDown size={16} className="group-hover:translate-y-1 transition-transform" />
                        </a>
                    </div>

                </div>
            </header>

            <style jsx>{`
                .fire-text {
                    text-shadow: 0 0 20px rgba(255, 100, 0, 0.5);
                }
            `}</style>

            {/* Memorial Scroll Widget */}
            <div className="relative z-30 -mt-8 mb-4 container mx-auto px-0 md:px-6">
                <MemorialScroll />
            </div>

            {/* Services Grid - White Background */}
            <section className="py-20 bg-white relative z-20 container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {services.map((service, index) => (
                        <div key={index} className="bg-white p-8 rounded-2xl shadow-card hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-gray-50 flex flex-col items-center text-center group">
                            <div className="w-16 h-16 rounded-full bg-light flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-dark transition-colors">
                                {service.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-dark">{service.title}</h3>
                            <p className="text-gray-500 leading-relaxed text-sm">
                                {service.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* About Section - Extended Content (ID=about) */}
            <section id="about" className="py-24 bg-gray-50">
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg border-r-4 border-primary overflow-hidden">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

                            {/* Text Column (Right in RTL) */}
                            <div className="order-2 md:order-1">
                                <div className="mb-8">
                                    <span className="text-primary font-bold uppercase tracking-widest text-sm mb-2 block">מי אנחנו</span>
                                    <h2 className="text-3xl md:text-5xl font-bold text-dark">
                                        ארגון <span className="text-primary">"תורת משה"</span>
                                    </h2>
                                    <p className="text-lg text-gray-500 mt-2 font-medium">מיסודו של הצדיק הרב משה בן-טוב זצוק"ל</p>
                                </div>

                                <div className="prose prose-lg max-w-none text-gray-700 leading-8 text-justify">
                                    {homePage && homePage.content && homePage.content.length > 50 ? (
                                        renderContent(homePage.content)
                                    ) : (
                                        <>
                                            <p className="mb-6">
                                                ארגון <strong>"תורת משה"</strong> מיסודו של הרב <strong>משה בן-טוב זצוק"ל</strong>, מפעיל ומחזיק מספר מסגרות לימוד תורה בירושלים, בבאר שבע ובמקומות נוספים בארץ, בהם שוקדים על לימודים מאות אברכים מצוינים, תמורת מלגה חודשית.
                                            </p>

                                            <div className="bg-primary/5 p-6 rounded-xl border border-primary/10 my-6">
                                                <h4 className="flex items-center gap-2 text-xl font-bold text-dark mb-3">
                                                    <Shield className="text-primary w-6 h-6" />
                                                    שליחות של חסד
                                                </h4>
                                                <p className="text-base">
                                                    במסגרת פעילות החסד נתקלנו במקרים רבים של נשמות יהודיות שנפטרו ללא מי שיאמר עליהם קדיש.
                                                </p>
                                            </div>

                                            <p className="mb-6">
                                                לכן, ארגון <strong>"קדישים"</strong> לקח על עצמו לדאוג לאמירת קדיש על כל יהודי ויהודיה ללא תשלום.
                                            </p>
                                        </>
                                    )}
                                </div>

                                <div className="mt-8">
                                    <Link to="/generators" className="inline-flex items-center justify-center px-8 py-3 text-base font-bold leading-6 text-white transition duration-150 ease-in-out bg-dark border border-transparent rounded-full hover:bg-gray-800 shadow-lg">
                                        יצירת תפילה לפי שם
                                        <ArrowLeft className="mr-2 w-5 h-5 text-primary" />
                                    </Link>
                                </div>
                            </div>

                            {/* Image Column (Left in RTL) */}
                            <div className="order-1 md:order-2 flex justify-center md:justify-end">
                                <div className="relative w-full max-w-md aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl rotate-1 hover:rotate-0 transition-transform duration-500 border-4 border-white">
                                    <img
                                        src="./assets/rabbi_moshe.jpg"
                                        alt="הרב משה בן-טוב זצוקל"
                                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                                    />
                                    {/* Overlay Gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                                    <div className="absolute bottom-4 right-4 text-white text-right">
                                        <p className="font-bold text-lg">הרב משה בן-טוב זצוק"ל</p>
                                        <p className="text-sm opacity-90">מייסד הארגון</p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </section>

            {/* NEW: Memorial Service Generator Section */}
            <section id="tehillim-generator" className="py-12 bg-gray-50">
                <div className="container mx-auto px-4 text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">יצירת סדר אזכרה ותהילים אישי</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto text-lg text-justify-center">
                        הזינו את שם הנפטר/ת ושם האם, ובחרו את סוג התפילה הרצוי. המערכת תפיק עבורכם קובץ PDF מסודר להדפסה הכולל את פרקי התהילים והמשניות לפי השם, יחד עם סדר האזכרה המלא.
                    </p>
                </div>
                <div className="container mx-auto px-4">
                    <MemorialServiceGenerator />
                </div>
            </section>

            {/* CTA Section - Light background to verify separation from Footer */}
            <section className="py-20 bg-white border-t border-gray-100">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">הנצחה שמאירה עולמות</h2>
                    <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
                        הצטרפו למעגל ההנצחה והחסד העולמי. כל קדיש, כל משנה וכל תרומה פועלים ישועות בשמים ובארץ.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link to="/page/contact" className="px-10 py-4 bg-primary text-dark rounded-full font-bold text-lg shadow-lg hover:shadow-xl hover:bg-yellow-400 transition-all">
                            תרומה להנצחה
                        </Link>
                        <Link to="/request" className="px-10 py-4 bg-gray-100 text-dark border border-gray-200 rounded-full font-bold text-lg hover:bg-gray-200 transition-all">
                            בקשת קדיש
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
