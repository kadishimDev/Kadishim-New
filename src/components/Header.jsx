import React from 'react';
import { Link } from 'react-router-dom';
import { Flame } from 'lucide-react';

const Header = () => {
    return (
        <nav className="fixed top-0 w-full z-50 glass py-4">
            <div className="container mx-auto px-4 flex justify-between items-center">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="bg-white p-2 rounded-full shadow-lg border border-amber-100 group-hover:scale-110 transition-transform duration-300">
                        <Flame className="w-8 h-8 text-primary fill-current" />
                    </div>
                    <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-amber-200 drop-shadow-md">
                        קדישים
                    </span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8">
                    <Link to="/" className="text-gray-300 hover:text-white transition-colors">דף הבית</Link>
                    <a href="#about" className="text-gray-300 hover:text-white transition-colors">אודות</a>

                    <Link
                        to="/request"
                        className="bg-gradient-to-r from-primary to-amber-500 text-black font-bold py-2 px-6 rounded-full hover:shadow-lg hover:shadow-amber-500/20 transition-all transform hover:-translate-y-0.5"
                    >
                        בקשת קדיש
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Header;
