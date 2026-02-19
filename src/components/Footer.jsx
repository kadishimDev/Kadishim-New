import React from 'react';
import { Flame, Mail, Phone, MapPin, Facebook, Instagram, Youtube, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';

const Footer = () => {
    const { settings } = useSettings();
    const { t } = useLanguage();
    return (
        <footer className="bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white pt-20 pb-10 border-t border-gray-800 relative overflow-hidden">
            {/* Decorative Top Gradient */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-orange-300 to-orange-500 opacity-70"></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    {/* Column 1: Organization Info */}
                    <div>
                        <div className="flex items-center gap-3 mb-8 group cursor-default">
                            <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-gray-700 transition-colors duration-300 border border-gray-700">
                                <Flame className="w-8 h-8 text-orange-500 animate-pulse-slow" />
                            </div>
                            <span className="font-display text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 group-hover:to-white transition-all duration-500">
                                {settings?.general.siteTitle}
                            </span>
                        </div>
                        <p className="text-gray-400 font-sans leading-loose text-base font-light pr-2 border-r-2 border-gray-800">
                            {t('footer.about_text')}
                        </p>
                    </div>

                    {/* Column 2: Site Map */}
                    <div>
                        <h4 className="font-display text-xl font-bold mb-8 text-white relative inline-block">
                            {t('footer.links_title')}
                            <span className="absolute -bottom-2 right-0 w-12 h-1 bg-orange-500 rounded-full"></span>
                        </h4>
                        <ul className="space-y-4 font-sans text-gray-400">
                            <li><FooterLink to="/">{t('nav.home')}</FooterLink></li>
                            <li><FooterLink to="/request">{t('nav.request')}</FooterLink></li>
                            <li><FooterLink to="/generators">{t('nav.generators')}</FooterLink></li>
                            <li><FooterLink to="/kaddish-library">{t('nav.library')}</FooterLink></li>
                            <li><FooterLink to="/contact">{t('nav.contact')}</FooterLink></li>
                        </ul>
                    </div>

                    {/* Column 3: Declarations */}
                    <div>
                        <h4 className="font-display text-xl font-bold mb-8 text-white relative inline-block">
                            {t('footer.legal_title')}
                            <span className="absolute -bottom-2 right-0 w-12 h-1 bg-orange-500 rounded-full"></span>
                        </h4>
                        <ul className="space-y-4 font-sans text-gray-400">
                            <li><FooterLink to="/legal/privacy">{t('footer.legal')}</FooterLink></li>
                            <li><FooterLink to="/legal/terms">{t('footer.terms')}</FooterLink></li>
                            <li><FooterLink to="/legal/accessibility">{t('footer.accessibility')}</FooterLink></li>
                            <li><Link to="/admin" className="text-gray-600 hover:text-orange-500 text-sm mt-6 block transition-colors duration-300">{t('footer.admin_login')}</Link></li>
                        </ul>
                    </div>

                    {/* Column 4: Contact Info */}
                    <div>
                        <h4 className="font-display text-xl font-bold mb-8 text-white relative inline-block">
                            {t('footer.contact_title')}
                            <span className="absolute -bottom-2 right-0 w-12 h-1 bg-orange-500 rounded-full"></span>
                        </h4>
                        <ul className="space-y-5 font-sans text-gray-300">
                            <li className="flex items-center gap-4 group">
                                <div className="p-2 bg-gray-800 rounded-full text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                                    <Phone size={18} />
                                </div>
                                <a href={`tel:${settings?.contact.phone}`} className="group-hover:text-white transition-colors text-lg" dir="ltr">{settings?.contact.phone}</a>
                            </li>
                            <li className="flex items-center gap-4 group">
                                <div className="p-2 bg-gray-800 rounded-full text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                                    <Mail size={18} />
                                </div>
                                <a href={`mailto:${settings?.contact.email}`} className="group-hover:text-white transition-colors">{settings?.contact.email}</a>
                            </li>
                            <li className="flex items-start gap-4 group">
                                <div className="p-2 bg-gray-800 rounded-full text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300 mt-1">
                                    <MapPin size={18} />
                                </div>
                                <span className="group-hover:text-white transition-colors">{settings?.contact.address}</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 text-center">
                    <p className="text-gray-600 font-sans text-sm">
                        {settings?.general.footerText || `© ${new Date().getFullYear()} ${t('footer.rights')} ${settings?.general.siteTitle || 'Kadishim'}.`}
                    </p>
                </div>
            </div>
        </footer>
    );
};

const FooterLink = ({ to, children }) => (
    <Link to={to} className="hover:text-white transition-colors flex items-center gap-2 group duration-300">
        <span className="text-orange-500/0 text-xs group-hover:text-orange-500 transition-all duration-300 transform -translate-x-2 group-hover:translate-x-0 opacity-0 group-hover:opacity-100">●</span>
        <span className="group-hover:translate-x-1 transition-transform duration-300">{children}</span>
    </Link>
);

export default Footer;
