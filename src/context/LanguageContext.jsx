import React, { createContext, useState, useContext, useEffect } from 'react';
import { translations } from '../data/translations';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
    // Load from localStorage or default to 'he'
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('site_language') || 'he';
    });

    // Helper to get nested translation
    // Usage: t('nav.home') -> "דף הבית"
    const t = (path) => {
        const keys = path.split('.');
        let current = translations[language];

        for (const key of keys) {
            if (current && current[key]) {
                current = current[key];
            } else {
                // Fallback to Hebrew if missing
                let fallback = translations['he'];
                for (const k of keys) fallback = fallback ? fallback[k] : null;
                return fallback || path;
            }
        }
        return current;
    };

    // Handle Side Effects (Direction, Persistence)
    useEffect(() => {
        const currentData = translations[language];

        // 1. Update Direction (RTL/LTR)
        document.documentElement.dir = currentData.dir;
        document.body.dir = currentData.dir;

        // 2. Persist
        localStorage.setItem('site_language', language);

        // 3. Accessibility attribute
        document.documentElement.lang = language;

    }, [language]);

    const changeLanguage = (langCode) => {
        if (translations[langCode]) {
            setLanguage(langCode);
        }
    };

    const value = {
        language,
        currentData: translations[language],
        availableLanguages: Object.keys(translations),
        changeLanguage,
        t,
        isRtl: translations[language].dir === 'rtl'
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};
