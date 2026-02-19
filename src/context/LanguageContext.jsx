import React, { createContext, useState, useContext, useEffect } from 'react';
import { translations } from '../data/translations';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
    // Load from localStorage or default to 'he'
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('site_language') || 'he';
    });

    // Helper to get nested translation (Always returns Hebrew source for Google Translate)
    const t = (path) => {
        const keys = path.split('.');
        let current = translations['he']; // Always use Hebrew as source

        for (const key of keys) {
            if (current && current[key]) {
                current = current[key];
            } else {
                return path;
            }
        }
        return current;
    };

    // Google Translate Cookie Helper
    const setGoogleTranslateCookie = (lang) => {
        // Map our codes to Google Translate codes
        const googleLangMap = {
            'he': 'iw', // Google uses 'iw' for Hebrew sometimes, or 'he'
            'en': 'en',
            'fr': 'fr',
            'ru': 'ru',
            'es': 'es',
            'yi': 'yi',
            'mor': 'ar' // Best approximating Moroccan to Arabic
        };

        const target = googleLangMap[lang] || lang;

        console.log(`[LanguageContext] Setting Google Translate Cookie: /he/${target}`);

        // Set cookie: /SOURCE_LANG/TARGET_LANG
        // Try multiple formats to ensure it sticks across domains/subdomains/localhost
        document.cookie = `googtrans=/he/${target}; path=/`;
        document.cookie = `googtrans=/he/${target}; path=/; domain=${window.location.hostname}`;

        // Also set localStorage for persistence in our app
        localStorage.setItem('site_language', lang);
    };

    // Handle Side Effects
    useEffect(() => {
        // We no longer manually handle direction or lang attribute here
        // Google Translate handles it, OR we can set it for initial load
        if (language === 'he') {
            document.documentElement.dir = 'rtl';
        } else {
            // Let Google handle it, or default to LTR
            // Actually, keep it simple
        }
    }, [language]);

    const changeLanguage = (langCode) => {
        setLanguage(langCode);
        localStorage.setItem('site_language', langCode);

        // Special handling for Hebrew (Back to Source)
        if (langCode === 'he') {
            // Clear Google Translate cookies to disable translation
            document.cookie = 'googtrans=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            document.cookie = `googtrans=; Path=/; Domain=${window.location.hostname}; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
            document.cookie = `googtrans=; Path=/; Domain=.${window.location.hostname}; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;

            window.location.reload();
            return;
        }

        // Google Translate Logic
        const googleLangMap = {
            'he': 'iw',
            'en': 'en',
            'fr': 'fr',
            'ru': 'ru',
            'es': 'es',
            'yi': 'yi',
            'mor': 'ar'
        };
        const targetLang = googleLangMap[langCode] || langCode;

        // Try direct DOM manipulation first (smoother)
        const select = document.querySelector('.goog-te-combo');
        if (select) {
            select.value = targetLang;
            select.dispatchEvent(new Event('change'));
        } else {
            // Fallback to cookie + reload
            document.cookie = `googtrans=/he/${targetLang}; path=/`;
            document.cookie = `googtrans=/he/${targetLang}; path=/; domain=${window.location.hostname}`;
            window.location.reload();
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
