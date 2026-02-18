import React from 'react';
import { Flame, Mail, Phone, MapPin, Facebook, Instagram, Youtube, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useSettings } from '../context/SettingsContext';

const Footer = () => {
    const { settings } = useSettings();
    return (
        <footer className="bg-black text-white pt-16 pb-8 border-t border-gray-900">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Column 1: Organization Info */}
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <Flame className="w-8 h-8 text-primary" />
                            <span className="font-heading text-2xl font-bold text-white">{settings?.general.siteTitle}</span>
                        </div>
                        <p className="text-gray-400 font-sans leading-relaxed text-sm">
                            ארגון "קדישים" הוקם במטרה לסייע למשפחות אבלות בהנצחת יקיריהם באמירת קדיש ולימוד משניות, על ידי תלמידי חכמים יראי שמים.
                        </p>
                    </div>

                    {/* Column 2: Site Map */}
                    <div>
                        <h4 className="font-heading text-lg font-bold mb-6 text-primary border-b border-gray-800 pb-2 inline-block">מפת האתר</h4>
                        <ul className="space-y-3 font-sans text-gray-300">
                            <li><Link to="/" className="hover:text-white transition-colors flex items-center gap-2"><span className="text-primary/50 text-xs">●</span> דף הבית</Link></li>
                            <li><Link to="/request" className="hover:text-white transition-colors flex items-center gap-2"><span className="text-primary/50 text-xs">●</span> בקשת קדיש</Link></li>
                            <li><a href="#about" className="hover:text-white transition-colors flex items-center gap-2"><span className="text-primary/50 text-xs">●</span> מי אנחנו</a></li>
                            <li><Link to="/kaddish-library" className="hover:text-white transition-colors flex items-center gap-2"><span className="text-primary/50 text-xs">●</span> ספריית הקדיש</Link></li>
                            <li><Link to="/contact" className="hover:text-white transition-colors flex items-center gap-2"><span className="text-primary/50 text-xs">●</span> צור קשר</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Declarations */}
                    <div>
                        <h4 className="font-heading text-lg font-bold mb-6 text-primary border-b border-gray-800 pb-2 inline-block">הצהרות ומידע</h4>
                        <ul className="space-y-3 font-sans text-gray-300">
                            <li><Link to="/legal/privacy" className="hover:text-white transition-colors text-sm flex items-center gap-2"><span className="text-gray-600 text-xs">●</span> מדיניות פרטיות</Link></li>
                            <li><Link to="/legal/terms" className="hover:text-white transition-colors text-sm flex items-center gap-2"><span className="text-gray-600 text-xs">●</span> תנאי שימוש</Link></li>
                            <li><Link to="/legal/accessibility" className="hover:text-white transition-colors text-sm flex items-center gap-2"><span className="text-gray-600 text-xs">●</span> הצהרת נגישות</Link></li>
                            <li><Link to="/admin" className="hover:text-white transition-colors text-gray-500 hover:text-gray-400 text-sm mt-4 block">כניסת מנהלים</Link></li>
                        </ul>
                    </div>

                    {/* Column 4: Contact Info */}
                    <div>
                        <h4 className="font-heading text-lg font-bold mb-6 text-primary border-b border-gray-800 pb-2 inline-block">צור קשר</h4>
                        <ul className="space-y-4 font-sans text-gray-300">
                            <li className="flex items-center gap-3">
                                <Phone size={18} className="text-primary shrink-0" />
                                <a href={`tel:${settings?.contact.phone}`} className="hover:text-white transition-colors" dir="ltr">{settings?.contact.phone}</a>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail size={18} className="text-primary shrink-0" />
                                <a href={`mailto:${settings?.contact.email}`} className="hover:text-white transition-colors break-all">{settings?.contact.email}</a>
                            </li>
                            <li className="flex items-start gap-3">
                                <MapPin size={18} className="text-primary shrink-0 mt-1" />
                                <span>{settings?.contact.address}</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 text-center">
                    <p className="text-gray-600 font-sans text-sm">
                        {settings?.general.footerText || `© ${new Date().getFullYear()} כל הזכויות שמורות לארגון קדישים.`}
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
