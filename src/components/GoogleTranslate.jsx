import React, { useEffect } from 'react';

const GoogleTranslate = () => {
    useEffect(() => {
        // Define global callback
        window.googleTranslateElementInit = () => {
            if (window.google && window.google.translate) {
                new window.google.translate.TranslateElement(
                    {
                        pageLanguage: 'he',
                        includedLanguages: 'en,fr,ru,es,yi,ar,he',
                        autoDisplay: false
                        // layout property REMOVED to allow dropdown rendering
                    },
                    'google_translate_element'
                );
            }
        };

        // Inject script if missing
        const scriptId = 'google-translate-script';
        if (!document.getElementById(scriptId)) {
            const script = document.createElement('script');
            script.id = scriptId;
            script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

    // Render hidden container
    return (
        <div id="google_translate_element" style={{ position: 'absolute', top: 0, left: 0, width: '1px', height: '1px', overflow: 'hidden', visibility: 'hidden', zIndex: -1 }}></div>
    );
};

export default GoogleTranslate;
