import React, { useState, useEffect } from 'react';
import { Eye, RefreshCcw, Volume2, Square, Sun, Moon, Zap } from 'lucide-react';

const AccessibilityWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [settings, setSettings] = useState({
        fontSize: 0, // 0=normal, 1=large, 2=extra large
        contrast: 'normal', // normal, high
        grayscale: false,
        highlightLinks: false
    });
    const [isSpeaking, setIsSpeaking] = useState(false);

    // Apply Settings
    useEffect(() => {
        // Target HTML specifically for Font Size (rem scaling)
        const html = document.documentElement;

        // Reset
        html.classList.remove('acc-text-lg', 'acc-text-xl', 'acc-high-contrast', 'acc-highlight-links');

        // Font Size
        if (settings.fontSize === 1) html.classList.add('acc-text-lg');
        if (settings.fontSize === 2) html.classList.add('acc-text-xl');

        // Contrast
        if (settings.contrast === 'high') html.classList.add('acc-high-contrast');

        // Highlight Links
        if (settings.highlightLinks) html.classList.add('acc-highlight-links');

        // Grayscale is handled via the separate Overlay component

    }, [settings]);

    const resetSettings = () => {
        setSettings({
            fontSize: 0,
            contrast: 'normal',
            grayscale: false,
            highlightLinks: false
        });
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    };

    const handleSpeak = () => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }

        const text = document.body.innerText;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'he-IL';

        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
    };

    return (
        <>
            {/* Styles Injection */}
            <style>{`
                /* Font Size Scaling on HTML Root */
                html.acc-text-lg { font-size: 18px !important; }
                html.acc-text-xl { font-size: 20px !important; }
                
                /* High Contrast */
                html.acc-high-contrast body { 
                    background-color: #000 !important; 
                    color: #fff !important; 
                }
                html.acc-high-contrast * { 
                    background-color: #000 !important; 
                    color: #fff !important; 
                    border-color: #fff !important;
                }
                html.acc-high-contrast img, html.acc-high-contrast video { filter: contrast(120%); }

                /* Links */
                html.acc-highlight-links a { 
                    text-decoration: underline !important; 
                    background-color: yellow !important; 
                    color: black !important; 
                }
            `}</style>

            {/* Grayscale Overlay - Sits ABOVE content but BELOW widget */}
            {settings.grayscale && (
                <div
                    className="fixed inset-0 z-[9998] pointer-events-none"
                    style={{ backdropFilter: 'grayscale(100%)', WebkitBackdropFilter: 'grayscale(100%)' }}
                />
            )}

            <div className="fixed right-4 bottom-4 z-[9999] flex flex-col items-end gap-2 rtl:right-4 rtl:left-auto">

                {/* Panel */}
                {isOpen && (
                    <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-4 w-64 animate-fade-in-up mb-2">
                        <div className="flex justify-between items-center mb-4 border-b pb-2">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <Eye size={18} className="text-primary" /> נגישות
                            </h3>
                            <button onClick={resetSettings} className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1">
                                <RefreshCcw size={12} /> איפוס
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Speech */}
                            <button
                                onClick={handleSpeak}
                                className={`w-full flex items-center justify-between p-2 rounded-lg text-sm border transition-colors ${isSpeaking ? 'bg-red-500 text-white border-red-500' : 'bg-blue-50 border-blue-200 hover:bg-blue-100'}`}
                            >
                                <span className="flex items-center gap-2">
                                    {isSpeaking ? <Square size={16} fill="currentColor" /> : <Volume2 size={16} />}
                                    {isSpeaking ? 'עצור הקראה' : 'הקרא את הדף'}
                                </span>
                            </button>

                            {/* Font Size */}
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">גודל טקסט</span>
                                <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                                    {[0, 1, 2].map(size => (
                                        <button
                                            key={size}
                                            onClick={() => setSettings(s => ({ ...s, fontSize: size }))}
                                            className={`p-1.5 rounded text-xs font-bold w-8 ${settings.fontSize === size ? 'bg-primary text-white shadow' : 'text-gray-600'}`}
                                        >
                                            {size === 0 ? 'A' : size === 1 ? 'A+' : 'A++'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Contrast */}
                            <button
                                onClick={() => setSettings(s => ({ ...s, contrast: s.contrast === 'normal' ? 'high' : 'normal' }))}
                                className={`w-full flex items-center justify-between p-2 rounded-lg text-sm border transition-colors ${settings.contrast === 'high' ? 'bg-black text-white border-black' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}
                            >
                                <span className="flex items-center gap-2"><Sun size={16} /> ניגודיות גבוהה</span>
                                {settings.contrast === 'high' && <CheckIcon />}
                            </button>

                            {/* Grayscale */}
                            <button
                                onClick={() => setSettings(s => ({ ...s, grayscale: !s.grayscale }))}
                                className={`w-full flex items-center justify-between p-2 rounded-lg text-sm border transition-colors ${settings.grayscale ? 'bg-gray-600 text-white border-gray-600' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}
                            >
                                <span className="flex items-center gap-2"><Moon size={16} /> גווני אפור</span>
                                {settings.grayscale && <CheckIcon />}
                            </button>

                            {/* Links */}
                            <button
                                onClick={() => setSettings(s => ({ ...s, highlightLinks: !s.highlightLinks }))}
                                className={`w-full flex items-center justify-between p-2 rounded-lg text-sm border transition-colors ${settings.highlightLinks ? 'bg-yellow-300 text-black border-yellow-400' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}
                            >
                                <span className="flex items-center gap-2"><Zap size={16} /> הדגשת קישורים</span>
                                {settings.highlightLinks && <CheckIcon />}
                            </button>
                        </div>
                    </div>
                )}

                {/* Toggle Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform focus:outline-none focus:ring-4 focus:ring-primary/30 ${isSpeaking ? 'bg-red-500 animate-pulse' : 'bg-primary'} text-white`}
                    aria-label="פתח תפריט נגישות"
                >
                    {isSpeaking ? <Volume2 size={24} /> : <Eye size={24} />}
                    {(settings.fontSize > 0 || settings.grayscale || settings.contrast === 'high') && !isSpeaking ? (
                        <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                    ) : null}
                </button>
            </div>
        </>
    );
};

const CheckIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

export default AccessibilityWidget;
