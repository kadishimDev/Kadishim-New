import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Shield, BookOpen, Star, ArrowLeft, ChevronDown, CheckCircle } from 'lucide-react';

const Home = () => {

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
        <div className="font-sans text-dark bg-white">
            {/* Hero Section - Soul Candle / Flame Theme */}
            <header className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden bg-[#0a0500]">

                {/* 1. Base Background Image - Soul Candle */}
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: "url('/assets/soul_candle_bg.png')" }}
                >
                    {/* Overlay gradient to ensure text readability at bottom/top */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60"></div>
                </div>

                <div className="container mx-auto px-6 relative z-10 text-center text-white mt-16">
                    <div className="inline-block mb-4 px-4 py-1.5 border border-orange-500/30 rounded-full bg-black/30 backdrop-blur-sm text-orange-400 text-sm font-medium tracking-wide animate-fade-in-up">
                        שמופעל על ידיי ארגון "תורת משה" | מיסודו של הרב משה בן-טוב זצוק"ל
                    </div>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight animate-fade-in-up animation-delay-200 drop-shadow-2xl">
                        אתר <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-orange-400 to-red-500">"קדישים"</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-200 mb-10 max-w-2xl mx-auto font-light leading-relaxed animate-fade-in-up animation-delay-400 drop-shadow-md">
                        מפעלי חסד והנצחה, לימוד תורה ואמירת קדיש לעילוי נשמת יקיריכם.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up animation-delay-600">
                        <Link
                            to="/request"
                            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full font-bold text-lg hover:from-orange-400 hover:to-red-500 hover:scale-105 transition-all shadow-[0_0_30px_rgba(234,88,12,0.4)]"
                        >
                            הזמנת קדיש
                        </Link>
                        <a
                            href="#about"
                            className="w-full sm:w-auto px-8 py-4 bg-black/20 backdrop-blur-md text-white border border-white/10 rounded-full font-bold text-lg hover:bg-white/10 transition-all hover:border-orange-500/50"
                        >
                            אודות הארגון
                        </a>
                    </div>
                </div>

                {/* Scrolldown indicator */}
                <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce text-orange-200/50">
                    <ChevronDown size={32} />
                </div>
            </header>

            {/* Services Grid - White Background */}
            <section className="py-20 bg-white relative -mt-20 z-20 container mx-auto px-6">
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

                                <div className="prose prose-lg max-w-none text-gray-700 leading-8">
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
                                </div>

                                <div className="mt-8">
                                    <Link to="/request" className="inline-flex items-center justify-center px-8 py-3 text-base font-bold leading-6 text-white transition duration-150 ease-in-out bg-dark border border-transparent rounded-full hover:bg-gray-800 shadow-lg">
                                        לשליחת שמות לקדיש חינם
                                        <ArrowLeft className="mr-2 w-5 h-5 text-primary" />
                                    </Link>
                                </div>
                            </div>

                            {/* Image Column (Left in RTL) */}
                            <div className="order-1 md:order-2 flex justify-center md:justify-end">
                                <div className="relative w-full max-w-md aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl rotate-1 hover:rotate-0 transition-transform duration-500 border-4 border-white">
                                    <img
                                        src="/assets/rabbi_moshe.jpg"
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

            {/* CTA Section - Light background to verify separation from Footer */}
            <section className="py-20 bg-white border-t border-gray-100">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">הנצחה שמאירה עולמות</h2>
                    <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
                        הצטרפו למעגל ההנצחה והחסד העולמי. כל קדיש, כל משנה וכל תרומה פועלים ישועות בשמים ובארץ.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link to="/org/donate" className="px-10 py-4 bg-primary text-dark rounded-full font-bold text-lg shadow-lg hover:shadow-xl hover:bg-yellow-400 transition-all">
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
