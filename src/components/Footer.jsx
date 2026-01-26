import React from 'react';
import { Flame, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-black text-white pt-16 pb-8 border-t border-gray-900">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-3 mb-6">
                            <Flame className="w-8 h-8 text-primary" />
                            <span className="font-heading text-3xl font-bold text-white">קדישים</span>
                        </div>
                        <p className="text-gray-400 font-sans leading-relaxed max-w-sm">
                            ארגון "קדישים" הוקם במטרה לסייע למשפחות אבלות בהנצחת יקיריהם באמירת קדיש ולימוד משניות, על ידי תלמידי חכמים יראי שמים.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-heading text-xl font-bold mb-6 text-primary">קישורים מהירים</h4>
                        <ul className="space-y-4 font-sans text-gray-300">
                            <li><Link to="/" className="hover:text-white transition-colors">דף הבית</Link></li>
                            <li><Link to="/request" className="hover:text-white transition-colors">בקשת קדיש</Link></li>
                            <li><a href="#about" className="hover:text-white transition-colors">אודות</a></li>
                            <li><Link to="/contact" className="hover:text-white transition-colors">צור קשר</Link></li>
                            <li><Link to="/admin" className="hover:text-white transition-colors text-gray-600 hover:text-gray-500 text-sm">ניהול מערכת</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 text-center">
                    <p className="text-gray-600 font-sans text-sm">
                        © {new Date().getFullYear()} כל הזכויות שמורות לארגון קדישים.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
