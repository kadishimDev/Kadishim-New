import React from 'react';
import { Heart, Sparkles, BookOpen, Flame, Utensils, Users } from 'lucide-react';
import segulotData from '../data/segulot_data.json';

const iconMap = {
    1: Sparkles, // Tikun Niftarim
    2: BookOpen, // Tehillim
    3: Utensils, // Seuda Shlishit
    4: BookOpen, // Mishnayot (alt)
    5: Flame,    // Candles
    6: Users     // Poor meal
};

const SegulotPage = () => {
    return (
        <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-sans" dir="rtl">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16 animate-fade-in-up">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
                        <span className="text-primary">סגולות</span> לעילוי נשמה
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        פעולות רוחניות וחסד הנעשות לעילוי נשמת יקירכם. בחרו את הסגולה הרצויה והיו שותפים בתיקון ועילוי הנשמה.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {segulotData.map((item, index) => {
                        const Icon = iconMap[item.id] || Sparkles;

                        return (
                            <div
                                key={item.id}
                                className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-100 flex flex-col h-full animate-fade-in-up"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="p-8 flex-grow flex flex-col items-center text-center">
                                    <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl flex items-center justify-center mb-6 text-primary shadow-sm">
                                        <Icon size={40} strokeWidth={1.5} />
                                    </div>

                                    <h3 className="text-2xl font-bold text-gray-900 mb-3 hover:text-primary transition-colors">
                                        {item.title}
                                    </h3>

                                    <p className="text-gray-600 leading-relaxed mb-6 flex-grow">
                                        {item.description}
                                    </p>

                                    <div className="flex items-baseline justify-center gap-1 mb-8">
                                        <span className="text-4xl font-bold text-gray-900">{item.price}</span>
                                        <span className="text-lg text-gray-500">₪</span>
                                    </div>

                                    <a
                                        href={`https://www.kadishim.co.il/%d7%aa%d7%a8%d7%95%d7%9e%d7%95%d7%aa/`} // Keeping original link structure for now
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-primary/30 transition-all duration-300 flex items-center justify-center gap-2 group"
                                    >
                                        <Heart size={20} className="group-hover:scale-110 transition-transform" />
                                        לתרומה והנצחה
                                    </a>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-16 text-center bg-white rounded-2xl p-8 shadow-sm border border-gray-100 max-w-4xl mx-auto">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">חשוב לדעת</h3>
                    <p className="text-gray-600 text-lg mb-4">
                        מתן צדקה ביום הזכרון מועיל הרבה לתיקון נשמת המנוח. כל סכום יתקבל בברכה.
                    </p>
                    <div className="flex flex-col md:flex-row justify-center items-center gap-4 text-gray-700 font-medium bg-gray-50 p-4 rounded-xl inline-block">
                        <span>לפרטים נוספים:</span>
                        <a href="tel:0542233445" className="hover:text-primary transition-colors ltr">054-2233445 (יצחק)</a>
                        <span className="hidden md:inline text-gray-300">|</span>
                        <a href="tel:0547243492" className="hover:text-primary transition-colors ltr">054-7243492 (דן)</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SegulotPage;
