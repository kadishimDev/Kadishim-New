import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Flame } from 'lucide-react';

const Header = () => {
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const isHome = location.pathname === '/';

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${scrolled ? 'glass-light shadow-sm py-3 border-gray-100/50' : 'bg-transparent border-transparent py-5'}`}>
            <div className="container mx-auto px-6 flex justify-between items-center">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 group">
                    <div className={`p-2 rounded-xl shadow-lg border border-amber-50 group-hover:scale-110 transition-transform duration-300 ${scrolled ? 'bg-white' : 'bg-white/90 backdrop-blur'}`}>
                        <Flame className="w-8 h-8 text-orange-500 fill-orange-500 animate-candle-flicker" />
                    </div>
                    <span className={`text-3xl font-black tracking-tight drop-shadow-sm ${scrolled ? 'text-gray-900' : 'text-gray-900'} font-display`}>
                        קדישים
                    </span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8">
                    <NavLink to="/" current={location.pathname}>דף הבית</NavLink>
                    <NavLink to="/generators" current={location.pathname}>יצירת תפילות</NavLink>
                    <a href="#about" className="relative group font-medium text-gray-600 hover:text-orange-600 transition-colors">
                        אודות
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
                    </a>

                    <Link
                        to="/request"
                        className="bg-gray-900 text-white font-bold py-2.5 px-6 rounded-full hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/30 transition-all transform hover:-translate-y-0.5"
                    >
                        בקשת קדיש
                    </Link>
                </div>
            </div>
        </nav>
    );
};

const NavLink = ({ to, current, children }) => {
    const isActive = current === to;
    return (
        <Link to={to} className={`relative group font-medium transition-colors ${isActive ? 'text-orange-600' : 'text-gray-600 hover:text-orange-600'}`}>
            {children}
            <span className={`absolute -bottom-1 left-0 h-0.5 bg-orange-500 transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
        </Link>
    );
};

export default Header;
