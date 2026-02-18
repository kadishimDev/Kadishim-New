import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

const Navbar = ({ pages = [] }) => {
    const { settings, menu } = useSettings();
    const { t, language, isRtl } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [expandedMobile, setExpandedMobile] = useState({});
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // ... (keep existing visibility logic) ...
    const isPathVisible = (path) => {
        if (path === '/') {
            const homePage = pages?.find(p => p.slug === 'home');
            return homePage ? (homePage.isVisible !== false) : true;
        }
        if (path === '/request' || path === '/kaddish-library' || path === '/generators') return true;
        if (path.startsWith('/page/')) {
            const slug = path.split('/page/')[1];
            if (!pages || pages.length === 0) return true;
            const page = pages.find(p => p.slug === slug);
            return page ? (page.isVisible !== false) : true;
        }
        return true;
    };

    const filterMenu = (items) => {
        if (!items) return [];
        return items.map(item => {
            // 1. Recurse first to find visible children
            const filteredChildren = item.items ? filterMenu(item.items) : [];
            const hasVisibleChildren = filteredChildren.length > 0;

            // 2. Check if this specific page is hidden
            // Logic:
            // a. Global Menu Visibility: If item has explicit isVisible: false, it's hidden (regardless of page).
            // b. CMS Page Visibility: If it's a CMS page, check the page's isVisible status via isPathVisible.

            const isItemVisible = item.isVisible !== false; // Default to true if undefined
            const isPageVisible = item.path ? isPathVisible(item.path) : true;

            // Combined Visibility: Must be BOTH (if applicable)
            // Note: isPathVisible returns TRUE if path is not found in pages (system links), 
            // so we mostly rely on isItemVisible for system links.
            const isVisible = isItemVisible && isPageVisible;

            // 3. Logic:
            // - If it has visible children, we MUST show it as a container (even if the page itself is hidden).
            // - If it has NO children, we respect the isVisible flag.
            if (!hasVisibleChildren && !isVisible) return null;

            // Return item (with filtered children)
            // If parent is hidden but has children, we might want to disable the link? 
            // For now, let's just keep the path but you could map it to '#' if (!isVisible).
            return { ...item, items: filteredChildren };
        }).filter(Boolean);
    };

    // Fallback for missing menu data
    const effectiveMenu = (menu && menu.length > 0) ? menu : (pages ? [] : []);

    const menuItems = filterMenu(effectiveMenu.length > 0 ? effectiveMenu : [
        // Hardcoded backup if EVERYTHING fails
        { title: 'דף הבית', path: '/' },
        { title: 'בקשת קדיש', path: '/request' },
        { title: 'צור קשר', path: '/page/contact' }
    ]);

    // Helper to translate menu items
    // Tries to map known Hebrew names to translation keys
    const translateItem = (name) => {
        // Only map items that actually exist in translation files
        const map = {
            'דף הבית': 'nav.home',
            'בקשת קדיש': 'nav.request',
            'מחוללים': 'nav.generators',
            'ניהול': 'nav.admin',
            'אודות': 'nav.about',
            'צור קשר': 'nav.contact'
        };
        // If no translation key exists, show the Hebrew name as-is
        return map[name] ? t(map[name]) : name;
    };

    const renderMobileMenuItem = (item, level = 0) => {
        const hasSubItems = item.items && item.items.length > 0;
        const isExpanded = expandedMobile[item.name || item.title];
        const paddingRight = level * 16; // Indent

        return (
            <div key={item.name || item.title} className="w-full">
                <div className="flex justify-between items-center py-2" style={{ paddingRight: `${paddingRight}px` }}>
                    {hasSubItems ? (
                        <button
                            onClick={() => setExpandedMobile(prev => ({ ...prev, [item.name || item.title]: !prev[item.name || item.title] }))}
                            className={`font-medium text-lg flex justify-between items-center w-full ${level === 0 ? 'text-primary' : 'text-gray-700'}`}
                        >
                            {translateItem(item.name || item.title)}
                            <ChevronDown size={18} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                    ) : (
                        <Link
                            to={item.path}
                            onClick={() => setIsOpen(false)}
                            className={`block w-full text-right ${level === 0 ? 'font-bold text-xl text-primary' : 'text-lg text-gray-700 hover:text-primary'}`}
                        >
                            {translateItem(item.name || item.title)}
                        </Link>
                    )}
                </div>

                {/* Recursive Children */}
                {hasSubItems && (
                    <div className={`flex flex-col gap-1 border-r-2 border-gray-100 pr-2 transition-all overflow-hidden ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                        {item.items.map(subItem => renderMobileMenuItem(subItem, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <nav
            className={`fixed top-0 w-full z-50 transition-all duration-300 font-sans ${scrolled || location.pathname !== '/' ? 'bg-white shadow-md py-2 border-b border-gray-100' : 'bg-transparent py-4'
                }`}
            dir={isRtl ? 'rtl' : 'ltr'}
        >
            <div className={`container mx-auto px-6 flex justify-between items-center ${scrolled || location.pathname !== '/' ? 'text-dark' : 'text-white'}`}>

                {/* Logo Area */}
                <Link to="/" className="flex items-center gap-2 z-50">
                    <div className={`transition-all duration-300`}>
                        <img
                            src={settings?.general.logoUrl || "/assets/logo.png"}
                            alt={settings?.general.siteTitle || "Logo"}
                            className={`transition-all duration-300 w-auto object-contain ${scrolled ? 'h-20 md:h-24' : 'h-28 md:h-40'}`}
                            style={{
                                filter: `
                                    drop-shadow(0 0 2px #fff) 
                                    drop-shadow(0 0 5px #fff) 
                                    drop-shadow(0 0 15px #fff) 
                                    drop-shadow(0 0 60px rgba(255,255,255,0.85)) 
                                    drop-shadow(0 0 120px rgba(255,255,255,0.85))
                                    drop-shadow(0 0 180px rgba(255,255,255,0.85))`
                            }}
                        />
                    </div>
                </Link>

                {/* Desktop Menu */}
                {/* We use specific flex-row/row-reverse based on direction handled by CSS 'dir' or explicit classes if needed. 
                    Tailwind 'flex-row' is direction-agnostic in RTL mode usually, but allow 'gap' to handle spacing.
                */}
                <div className="hidden lg:flex items-center gap-6">

                    {menuItems.map((category) => (
                        <div key={category.title} className="relative group h-full flex items-center">
                            {category.items && category.items.length > 0 ? (
                                <>
                                    <Link
                                        to={category.path === '#' ? '#' : category.path}
                                        className={`flex items-center gap-1 font-bold text-lg hover:opacity-80 transition-opacity py-4 ${scrolled || location.pathname !== '/' ? 'text-dark' : 'text-white'}`}
                                        onClick={(e) => { if (category.path === '#') e.preventDefault(); }}
                                    >
                                        {translateItem(category.title)}
                                        <ChevronDown size={16} />
                                    </Link>


                                    {/* Dropdown Menu - Supporting Nested Flyouts */}
                                    <div className={`absolute top-full opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[60] ${isRtl ? 'right-0' : 'left-0'}`}>
                                        <div className="bg-white shadow-xl rounded-lg py-2 border border-gray-100 min-w-[220px]">
                                            {category.items.map((item) => (
                                                <div key={item.name} className="relative group/submenu">
                                                    {item.items && item.items.length > 0 ? (
                                                        <>
                                                            {/* Item with Sub-menu */}
                                                            <div className="flex items-center justify-between px-4 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors font-medium cursor-pointer">
                                                                <div className="flex items-center justify-between w-full">
                                                                    <span>{translateItem(item.name)}</span>
                                                                    <div className={`${isRtl ? 'mr-2 rotate-90' : 'ml-2 -rotate-90'}`}>
                                                                        <ChevronDown size={14} />
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Nested Flyout Menu */}
                                                            <div className={`absolute top-0 opacity-0 invisible group-hover/submenu:opacity-100 group-hover/submenu:visible transition-all duration-200 z-[70] ${isRtl ? 'right-full mr-0.5' : 'left-full ml-0.5'}`}>
                                                                <div className="bg-white shadow-xl rounded-lg py-2 border border-gray-100 min-w-[200px]">
                                                                    {item.items.map((subItem) => (
                                                                        <Link
                                                                            key={subItem.name}
                                                                            to={subItem.path}
                                                                            className="block px-4 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors text-sm"
                                                                        >
                                                                            {subItem.name}
                                                                        </Link>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        /* Standalone Link */
                                                        <Link
                                                            to={item.path}
                                                            className="block px-4 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors font-medium"
                                                        >
                                                            {translateItem(item.name)}
                                                        </Link>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <Link to={category.path} className={`font-bold text-lg hover:opacity-80 transition-opacity py-4 ${scrolled || location.pathname !== '/' ? 'text-dark' : 'text-white'}`}>
                                    {translateItem(category.title)}
                                </Link>
                            )}
                        </div>
                    ))}

                    {/* CTA Button & Language */}
                    <div className="flex items-center gap-4">
                        <LanguageSwitcher />
                        <Link
                            to="/request"
                            className={`px-6 py-2.5 rounded-lg font-bold transition-all duration-300 ${scrolled || location.pathname !== '/'
                                ? 'bg-primary text-dark hover:bg-yellow-400 shadow-sm'
                                : 'bg-white text-dark hover:bg-gray-100'
                                }`}
                        >
                            {t('nav.request')}
                        </Link>
                    </div>
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`lg:hidden p-2 z-50 ${isOpen ? 'text-dark' : 'text-current'}`}
                    aria-label={isOpen ? t('accessibility.toggle') : t('accessibility.toggle')}
                    aria-expanded={isOpen}
                >
                    {isOpen ? <X size={28} /> : <Menu size={28} />}
                </button>

                {/* Mobile Overlay */}
                <div className={`fixed inset-0 bg-white z-40 transition-transform duration-300 ${isOpen ? (isRtl ? 'translate-x-0' : 'translate-x-0') : (isRtl ? 'translate-x-full' : '-translate-x-full')}`}>
                    <div className="h-full overflow-y-auto pt-24 px-6 text-dark text-center pb-10" dir={isRtl ? 'rtl' : 'ltr'}>
                        <div className="flex flex-col gap-4">
                            {menuItems.map((item) => renderMobileMenuItem(item, 0))}

                            <div className="mt-4 border-t border-gray-100 pt-4">
                                <Link
                                    to="/request"
                                    onClick={() => setIsOpen(false)}
                                    className="block w-full bg-primary text-dark font-bold py-4 rounded-xl shadow-lg hover:bg-yellow-400 text-center"
                                >
                                    {t('nav.request')}
                                </Link>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-center">
                            <LanguageSwitcher />
                        </div>
                    </div>
                </div>
            </div>
        </nav >
    );
};

export default Navbar;
