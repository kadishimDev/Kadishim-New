import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import menuData from '../data/menu_structure.json';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Load menu from external JSON structure
    const menuItems = menuData;

    return (
        <nav
            className={`fixed top-0 w-full z-50 transition-all duration-300 font-sans ${scrolled || location.pathname !== '/' ? 'bg-white shadow-md py-2 border-b border-gray-100' : 'bg-transparent py-4'
                }`}
        >
            <div className={`container mx-auto px-6 flex justify-between items-center ${scrolled || location.pathname !== '/' ? 'text-dark' : 'text-white'}`}>

                {/* Logo Area */}
                {/* Logo Area */}
                <Link to="/" className="flex items-center gap-2 z-50">
                    <div className="bg-white/90 p-1.5 rounded-lg shadow-sm backdrop-blur-sm hover:bg-white transition-colors">
                        <img
                            src="/assets/logo.png"
                            alt="Logo"
                            className="transition-all duration-300 h-16 w-auto" // Adjusted height slightly to fit container
                        />
                    </div>
                </Link>

                {/* Desktop Menu - Changed to flex-row (from reverse) to swap order: Info Right, Contact Left */}
                <div className="hidden lg:flex items-center gap-6 flex-row">

                    {menuItems.map((category) => (
                        <div key={category.title} className="relative group h-full flex items-center">
                            {category.items && category.items.length > 0 ? (
                                <>
                                    <button className={`flex items-center gap-1 font-bold text-lg hover:opacity-80 transition-opacity py-4 ${scrolled || location.pathname !== '/' ? 'text-dark' : 'text-white'}`}>
                                        {category.title}
                                        <ChevronDown size={16} />
                                    </button>

                                    {/* Level 1 Dropdown - Anchor Left (left-0) to grow Right */}
                                    {/* REMOVED pt-2 to fix gap/floating issue - now totally flush */}
                                    <div className="absolute top-full left-0 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[60]">
                                        <div className="bg-white shadow-xl rounded-lg py-2 border border-gray-100">
                                            {category.items.map((item) => (
                                                <div key={item.name} className="relative group/sub">
                                                    {item.items ? (
                                                        /* Nested Item with Level 2 Dropdown */
                                                        <>
                                                            <button className="w-full flex items-center justify-between px-4 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors text-right font-medium">
                                                                <span className="flex items-center gap-1">
                                                                    {/* Rotate -90 to point Right */}
                                                                    <ChevronDown size={14} className="-rotate-90" />
                                                                    {item.name}
                                                                </span>
                                                            </button>

                                                            {/* Level 2 Dropdown - Opens to Right (left-full) */}
                                                            {/* Removed pl-1 to fix floating gap */}
                                                            <div className="absolute top-0 left-full w-60 opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-200 z-[70]">
                                                                <div className="bg-white shadow-xl rounded-lg py-2 border border-gray-100">
                                                                    {item.items.map((subItem) => (
                                                                        <div key={subItem.name} className="relative group/deep">
                                                                            {subItem.items ? (
                                                                                /* Level 3 Item (Nusach) */
                                                                                <>
                                                                                    <button className="w-full flex items-center justify-between px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors text-right text-sm font-medium">
                                                                                        <span className="flex items-center gap-1">
                                                                                            <ChevronDown size={12} className="-rotate-90" />
                                                                                            {subItem.name}
                                                                                        </span>
                                                                                    </button>

                                                                                    {/* Level 3 Dropdown - Opens to Right (left-full) */}
                                                                                    <div className="absolute top-0 left-full w-64 opacity-0 invisible group-hover/deep:opacity-100 group-hover/deep:visible transition-all duration-200 z-[80]">
                                                                                        <div className="bg-white shadow-xl rounded-lg py-2 border border-gray-100">
                                                                                            {subItem.items.map((deepItem) => (
                                                                                                <Link
                                                                                                    key={deepItem.name}
                                                                                                    to={deepItem.path}
                                                                                                    className="block px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors text-right text-sm"
                                                                                                >
                                                                                                    {deepItem.name}
                                                                                                </Link>
                                                                                            ))}
                                                                                        </div>
                                                                                    </div>
                                                                                </>
                                                                            ) : (
                                                                                /* Standard Level 2 Link */
                                                                                <Link
                                                                                    to={subItem.path}
                                                                                    className="block px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors text-right text-sm"
                                                                                >
                                                                                    {subItem.name}
                                                                                </Link>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        /* Standard Link */
                                                        <Link
                                                            to={item.path}
                                                            className="block px-4 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors text-right font-medium"
                                                        >
                                                            {item.name}
                                                        </Link>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <Link to={category.path} className={`font-bold text-lg hover:opacity-80 transition-opacity py-4 ${scrolled || location.pathname !== '/' ? 'text-dark' : 'text-white'}`}>
                                    {category.title}
                                </Link>
                            )}
                        </div>
                    ))}

                    {/* CTA Button - Moved to End for correct RTL Order (Leftmost) */}
                    <Link
                        to="/request"
                        className={`px-6 py-2.5 rounded-lg font-bold transition-all duration-300 ${scrolled || location.pathname !== '/'
                            ? 'bg-primary text-dark hover:bg-yellow-400 shadow-sm'
                            : 'bg-white text-dark hover:bg-gray-100'
                            }`}
                    >
                        שליחת בקשה לקדיש
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`lg:hidden p-2 z-50 ${isOpen ? 'text-dark' : 'text-current'}`}
                >
                    {isOpen ? <X size={28} /> : <Menu size={28} />}
                </button>

                {/* Mobile Overlay */}
                <div className={`fixed inset-0 bg-white z-40 transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="h-full overflow-y-auto pt-24 px-6 text-dark text-center pb-10">
                        <div className="flex flex-col gap-6">
                            {menuItems.map((category) => (
                                <div key={category.title}>
                                    <h3 className="font-bold text-xl text-primary mb-3">
                                        {category.path !== '#' ? (
                                            <Link to={category.path} onClick={() => setIsOpen(false)}>{category.title}</Link>
                                        ) : category.title}
                                    </h3>
                                    <div className="flex flex-col gap-3">
                                        {category.items && category.items.map(item => (
                                            item.items ? (
                                                <div key={item.name} className="bg-gray-50 p-3 rounded-lg">
                                                    <div className="font-bold mb-2">{item.name}</div>
                                                    {item.items.map(sub => (
                                                        sub.items ? (
                                                            /* Level 3 with children (Nusach) */
                                                            <div key={sub.name} className="my-2 mr-2 border-r-2 border-gray-100 pr-3">
                                                                <div className="font-medium text-gray-500 text-sm mb-1">{sub.name}</div>
                                                                {sub.items.map(deep => (
                                                                    <Link
                                                                        key={deep.name}
                                                                        to={deep.path}
                                                                        onClick={() => setIsOpen(false)}
                                                                        className="block py-1 text-sm text-gray-400 hover:text-primary transition-colors"
                                                                    >
                                                                        {deep.name}
                                                                    </Link>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            /* Standard Level 2/3 Link */
                                                            <Link key={sub.name} to={sub.path} onClick={() => setIsOpen(false)} className="block py-1 text-sm text-gray-600 hover:text-primary">
                                                                {sub.name}
                                                            </Link>
                                                        )
                                                    ))}
                                                </div>
                                            ) : (
                                                <Link key={item.name} to={item.path} onClick={() => setIsOpen(false)} className="block text-lg text-gray-700">
                                                    {item.name}
                                                </Link>
                                            )
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </nav >
    );
};

export default Navbar;
