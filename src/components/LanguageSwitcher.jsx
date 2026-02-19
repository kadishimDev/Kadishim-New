import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../data/translations';

const LanguageSwitcher = ({ dropUp = false }) => {
    const { language, changeLanguage } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const currentLangData = translations[language];

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
                aria-label="בחר שפה / Select Language"
            >
                <span className="text-xl" role="img" aria-hidden="true">{currentLangData.flag}</span>
                <span className="text-sm font-medium hidden md:inline-block text-gray-700">
                    {currentLangData.name}
                </span>
                <ChevronDown size={14} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className={`absolute ${dropUp ? 'bottom-full mb-2' : 'top-full mt-2'} w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in-up ltr:right-0 rtl:left-0 transform origin-top`}>
                    <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 mb-1">
                        Select Language
                    </div>
                    {Object.entries(translations).map(([code, data]) => (
                        <button
                            key={code}
                            onClick={() => {
                                changeLanguage(code);
                                setIsOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 
                                ${language === code ? 'text-primary font-bold bg-primary/5' : 'text-gray-700'}
                            `}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-lg shadow-sm rounded-sm overflow-hidden">{data.flag}</span>
                                <span>{data.name}</span>
                            </div>
                            {language === code && <Check size={16} />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LanguageSwitcher;
