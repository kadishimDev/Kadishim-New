import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, BookOpen, Download, User, ArrowLeft, Type, Printer, Settings } from 'lucide-react';
import { tehillimLetters } from '../data/tehillimData';
import { mishnayotLetters } from '../utils/mishnayotData';
import mishnayotFull from '../data/mishnayot_full.json';
import { prayerTexts } from '../utils/prayerText';
import { kaddishData } from '../data/kaddishData';
import { transliterateName, isEnglish } from '../utils/nameConverter';
import html2canvas from 'html2canvas'; // Keeping html2canvas for simple image generation if needed
import jsPDF from 'jspdf';

// Font options
const fontOptions = [
    { id: 'David', label: 'דוד (רגיל)', fontFamily: 'David, sans-serif' },
    { id: 'Frank Ruhl Libre', label: 'פרנק-ריהל (קלאסי)', fontFamily: '"Frank Ruhl Libre", serif' },
    { id: 'Cardo', label: 'Cardo (יוקרתי)', fontFamily: '"Cardo", serif' },
    { id: 'Assistant', label: 'אסיסטנט (מודרני)', fontFamily: '"Assistant", sans-serif' },
];

const fontSizeOptions = [
    { id: 'text-lg', label: 'רגיל', scale: 1 },
    { id: 'text-xl', label: 'גדול', scale: 1.25 },
    { id: 'text-2xl', label: 'ענק', scale: 1.5 },
];

const MemorialServiceGenerator = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialTab = searchParams.get('tab') || 'tehillim';

    // Inputs
    const [name, setName] = useState('');
    const [fatherName, setFatherName] = useState('');
    const [motherName, setMotherName] = useState('');
    const [gender, setGender] = useState('male'); // male, female
    const [isBat, setIsBat] = useState(false); // Ben/Bat toggle

    // Settings
    const [selectedFont, setSelectedFont] = useState(fontOptions.find(f => f.id === 'Frank Ruhl Libre') || fontOptions[0]);
    const [selectedSize, setSelectedSize] = useState(fontSizeOptions[1]); // Default XL

    // Kaddish Nusach Selection
    const [nusach, setNusach] = useState('sephardi'); // Default to Sephardi/Edot HaMizrach based on common usage


    const [activeTab, setActiveTabState] = useState(initialTab);
    const [generatedContent, setGeneratedContent] = useState(null);
    const [generationMeta, setGenerationMeta] = useState({ name: '', motherName: '' }); // Store resolved Hebrew names
    const [showNeshama, setShowNeshama] = useState(true);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    const setActiveTab = (tab) => {
        setActiveTabState(tab);
        setSearchParams({ tab });
    };

    useEffect(() => {
        const currentTab = searchParams.get('tab');
        if (currentTab && currentTab !== activeTab) {
            setActiveTabState(currentTab);
        }
    }, [searchParams, activeTab]);

    const printRef = useRef(null);

    const decomposeName = (inputName) => {
        if (!inputName) return [];
        const cleanName = inputName.replace(/['"״׳]/g, '').trim();
        const letters = cleanName.split('');
        const map = { 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' };

        return letters.map(char => ({
            char: char,
            normalized: map[char] || char
        })).filter(item => item.normalized >= 'א' && item.normalized <= 'ת');
    };

    const handleGenerate = (e) => {
        e.preventDefault();
        console.log("Generating for:", name);
        if (!name.trim()) return;

        // Auto-Transliterate if English
        let processName = name;
        let displayName = name;
        let displayMother = motherName;

        if (isEnglish(name)) {
            const hebrewName = transliterateName(name);
            processName = hebrewName;
            displayName = hebrewName; // Show Hebrew in result
        }

        if (motherName && isEnglish(motherName)) {
            displayMother = transliterateName(motherName);
        }

        const nameLetters = decomposeName(processName);
        const neshamaLetters = showNeshama ? ['נ', 'ש', 'מ', 'ה'].map(c => ({ char: c, normalized: c, isNeshama: true })) : [];
        const allLetters = [...nameLetters, ...neshamaLetters];

        if (activeTab === 'tehillim') {
            const content = allLetters.map(item => ({
                ...item,
                data: tehillimLetters[item.normalized],
                type: 'verse'
            }));
            setGeneratedContent(content);
        } else if (activeTab === 'mishnayot') {
            const content = allLetters.map(item => ({
                ...item,
                meta: mishnayotLetters[item.normalized],
                fullText: mishnayotFull[item.normalized] || "טקסט משנה זמני - יתווסף בהמשך",
                type: 'mishnah'
            }));
            setGeneratedContent(content);
        } else if (activeTab === 'grave') {
            // Grave Service Composition based on user feedback (Full Traditional Order)

            // 1. Tehillim for Name
            const tehillimName = nameLetters.map(item => ({ ...item, data: tehillimLetters[item.normalized], type: 'verse' }));

            // 2. Tehillim for Neshama (N.S.M.H)
            const neshamaArr = ['נ', 'ש', 'מ', 'ה'].map(c => ({ char: c, normalized: c === 'ה' ? 'ה' : c === 'מ' ? 'מ' : c === 'ש' ? 'ש' : 'נ', isNeshama: true })); // Simple map
            const tehillimNeshama = showNeshama ? neshamaArr.map(item => ({
                ...item,
                normalized: item.char === 'ה' ? 'ה' : item.char === 'מ' ? 'מ' : item.char === 'ש' ? 'ש' : 'נ', // Normalize just in case
                data: tehillimLetters[item.char === 'מ' ? 'מ' : item.char === 'נ' ? 'נ' : item.char],
                type: 'verse'
            })) : [];

            // 3. Tehillim for Kra Satan (K.R.A.S.T.N) - Standard addition for Grave
            const kraSatanChars = ['ק', 'ר', 'ע', 'ש', 'ט', 'ן'];
            const kraSatanLetters = kraSatanChars.map(c => {
                const normalized = c === 'ן' ? 'נ' : c;
                return {
                    char: c,
                    normalized: normalized,
                    data: tehillimLetters[normalized],
                    type: 'verse',
                    isKraSatan: true
                };
            });

            // 4. Mishnayot for Neshama (N.S.M.H)
            const mishnayotNeshama = neshamaArr.map(item => {
                const normalized = item.char === 'מ' ? 'מ' : item.char === 'נ' ? 'נ' : item.char;
                return {
                    ...item,
                    normalized: normalized,
                    meta: mishnayotLetters[normalized],
                    fullText: mishnayotFull[normalized] || "טקסט משנה...",
                    type: 'mishnah'
                };
            });

            // Clean display name (remove quotes if any)
            const cleanDisplay = displayName.replace(/['"״׳]/g, '').trim();
            const cleanMother = (displayMother || '').replace(/['"״׳]/g, '').trim();

            const prayerPart = [
                { type: 'text', title: prayerTexts.intro.title, text: prayerTexts.intro.text },
                { type: 'header_info', text: `סדר אזכרה ל${gender === 'male' ? 'מנוח' : 'מנוחה'} ${cleanDisplay} ${isBat ? 'בת' : 'בן'} ${cleanMother || '______'}` },

                // Tehillim Section
                { type: 'section_title', text: `פרקי תהילים לפי שם הנפטר: ${cleanDisplay}` },
                ...tehillimName,

                { type: 'section_title', text: 'אותיות נשמה - קריעת רוע גזר הדין' }, // Neshama + Kra Satan
                ...tehillimNeshama,
                ...kraSatanLetters,

                // Kaddish Yatom
                { type: 'text', title: kaddishData[nusach].yatom.title, text: kaddishData[nusach].yatom.text },

                // Mishnayot Section
                { type: 'section_title', text: "משניות לעילוי נשמה" },
                ...mishnayotNeshama,

                // Zohar
                { type: 'text', title: prayerTexts.zohar.title, text: prayerTexts.zohar.text },

                // Hanania
                { type: 'text', title: "", text: prayerTexts.hanania.text }, // No title, just text

                // Kaddish DeRabanan
                { type: 'text', title: kaddishData[nusach].derabanan.title, text: kaddishData[nusach].derabanan.text },

                // Prayer After
                { type: 'text', title: prayerTexts.prayerAfter.title, text: prayerTexts.prayerAfter.text.replace('[שם הנפטר]', `${cleanDisplay} בן/בת ${cleanMother}`) },

                // Michtam
                { type: 'text', title: prayerTexts.michtam.title, text: prayerTexts.michtam.text },

                // Kaddish Yatom (again)
                { type: 'text', title: kaddishData[nusach].yatom.title, text: kaddishData[nusach].yatom.text },

                // Hashkava (El Maleh)
                {
                    type: 'text',
                    title: "אל מלא רחמים",
                    text: (gender === 'male' ? prayerTexts.elMaleh.male : prayerTexts.elMaleh.female).replace('[שם הנפטר/ת]', `${cleanDisplay} בן/בת ${cleanMother}`)
                }
            ];
            setGeneratedContent(prayerPart);
        }

        // Store display names for the render view if simple generation
        if (activeTab !== 'grave') {
            // We need a way to pass the converted names to the render view without changing the input state (optional, or we just rely on generated content?). 
            // Actually, the render view uses 'name' and 'motherName' state variables.
            // We should probably update a temp state or just force update the state?
            // User might want to see the Hebrew name in the input box... usually better UX to update the input?
            // Let's decide: implied requirement is "if user wrote SARAH, generate for Sarah". 
            // The render view sees {name}. Let's update a separate state for "displayName" or just use the local variables if we pass them?
            // Easiest: pass them in the content object or separate state.
            // But 'generatedContent' is just the array.
            // Let's create a 'generationMeta' state or similar.
            setGenerationMeta({ name: displayName, motherName: displayMother });
        }
    };

    const handleDownloadPDF = async () => {
        if (!printRef.current) return;
        setIsGeneratingPdf(true);

        try {
            const element = printRef.current;
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false,
                windowWidth: 1200
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');

            const imgWidth = 210; // A4 Width in mm
            const pageHeight = 297; // A4 Height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            let heightLeft = imgHeight;
            let position = 0;

            // First Page
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            // Extra Pages
            while (heightLeft > 0) {
                position = heightLeft - imgHeight; // Negative offset to show next chunk
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(`tefilla_${name}.pdf`);
        } catch (err) {
            console.error(err);
            alert("שגיאה ביצירת הקובץ. נא לנסות שוב.");
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    // If content is generated, we show the "Result View" mode (Simulating "New Page")
    // We can add a "Back to Edit" button.
    if (generatedContent) {
        return (
            <div className="container mx-auto px-4 py-8 animate-fade-in-up">
                {/* Toolbar */}
                <div className="sticky top-24 z-30 bg-white/95 backdrop-blur shadow-lg rounded-2xl p-4 mb-8 flex flex-wrap gap-4 justify-between items-center border border-gray-200">
                    <button
                        onClick={() => setGeneratedContent(null)}
                        className="flex items-center gap-2 text-gray-600 hover:text-orange-600 font-bold transition-colors"
                    >
                        <ArrowLeft size={20} /> חזרה לעריכה
                    </button>

                    <div className="flex items-center gap-6">
                        {/* Font Family */}
                        <div className="flex items-center gap-2">
                            <Type size={18} className="text-gray-400" />
                            <select
                                value={selectedFont.id}
                                onChange={(e) => setSelectedFont(fontOptions.find(f => f.id === e.target.value))}
                                className="bg-gray-50 border border-gray-300 rounded-lg py-1 px-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                            >
                                {fontOptions.map(font => (
                                    <option key={font.id} value={font.id}>{font.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Font Size */}
                        <div className="flex items-center gap-2 border-r border-gray-200 pr-6 mr-2">
                            <span className="text-gray-400 text-sm">גודל טקסט:</span>
                            <div className="flex bg-gray-100 rounded-lg p-1">
                                {fontSizeOptions.map(size => (
                                    <button
                                        key={size.id}
                                        onClick={() => setSelectedSize(size)}
                                        className={`px-3 py-1 rounded text-sm font-bold transition-all ${selectedSize.id === size.id ? 'bg-white shadow text-orange-600' : 'text-gray-500 hover:bg-gray-200'}`}
                                    >
                                        {size.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleDownloadPDF}
                            disabled={isGeneratingPdf}
                            className={`flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-6 py-2 rounded-xl font-bold transition-all shadow-xl ${isGeneratingPdf ? 'opacity-70 cursor-wait' : ''}`}
                        >
                            {isGeneratingPdf ? 'מייצא...' : <><Download size={18} /> הורדה כ-PDF</>}
                        </button>
                    </div>
                </div>

                {/* Printable Document Area */}
                <div className="flex justify-center">
                    <div
                        ref={printRef}
                        className="bg-white p-16 shadow-2xl max-w-[210mm] min-h-[297mm] w-full relative"
                        style={{ fontFamily: selectedFont.fontFamily }} // Apply global font choice
                    >
                        {/* Decorative Border */}
                        <div className="absolute inset-4 border-[3px] border-double border-orange-200 pointer-events-none"></div>
                        <div className="absolute inset-5 border border-orange-100 pointer-events-none"></div>

                        {/* Header Section */}
                        <div className="relative z-10 flex justify-between items-start border-b-2 border-orange-100 pb-8 mb-10">
                            {/* Right: Logo */}
                            <div className="w-24 h-24 flex items-center justify-center">
                                {/* Use actual logo path if exists, otherwise placeholder styling */}
                                <img src="/assets/logo.png" alt="לוגו האתר" className="max-w-full max-h-full object-contain" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block' }} />
                                <div className="hidden text-orange-600 font-bold border-2 border-orange-600 rounded-full p-2 text-center text-xs w-20 h-20 flex items-center justify-center" style={{ display: 'none' }}>
                                    קדיש<br />וזיכרון
                                </div>
                            </div>

                            {/* Center: Title */}
                            <div className="text-center pt-2">
                                <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-wide" style={{ fontFamily: selectedFont.fontFamily }}>
                                    {activeTab === 'grave' ? 'סדר אזכרה והנצחה' : `לימוד ${activeTab === 'tehillim' ? 'תהילים' : 'משניות'} לעילוי נשמה`}
                                </h1>
                                <div className="text-xl text-gray-700 font-medium" style={{ fontFamily: selectedFont.fontFamily }}>
                                    לעילוי נשמת <span className="font-bold text-gray-900">{generationMeta.name || name}</span> {isBat ? 'בת' : 'בן'} <span className="font-bold">{generationMeta.motherName || motherName || '______'}</span>
                                </div>
                                <div className="text-sm text-gray-400 mt-2">הופק ע"י ארגון "קדישים"</div>
                            </div>

                            {/* Left: Rabbi Image (Real Asset) */}
                            <div className="w-24 h-32 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                                <img
                                    src="/assets/rabbi_moshe.jpg"
                                    alt="הרב משה בן-טוב"
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-xs text-gray-400 text-center p-1">תמונת<br/>הרב</div>' }}
                                />
                            </div>
                        </div>

                        {/* Content Body */}
                        <div className={`space-y-8 relative z-10 ${selectedSize.id}`}>
                            {generatedContent.map((item, idx) => {
                                if (item.type === 'verse') return (
                                    <div key={idx} className="relative mb-6">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-lg border ${item.isNeshama ? 'bg-blue-50 text-blue-800 border-blue-200' : 'bg-orange-50 text-orange-800 border-orange-200'}`}>
                                                {item.char}
                                            </span>
                                        </div>
                                        <div className="text-justify leading-[1.8] text-gray-900 opacity-90">
                                            {item.data ? item.data.map((l, i) => <span key={i}>{l} </span>) : '...'}
                                        </div>
                                    </div>
                                );
                                if (item.type === 'mishnah') return (
                                    <div key={idx} className="mb-8">
                                        <div className="flex items-center gap-3 mb-3 border-b border-gray-100 pb-2">
                                            <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-800 border border-blue-200 flex items-center justify-center font-bold text-lg">{item.char}</span>
                                            <span className="font-bold text-gray-600 text-base">{item.meta ? `${item.meta.tractate} פרק ${item.meta.chapter} ` : 'פרק משנה'}</span>
                                        </div>
                                        <p className="text-justify leading-[1.8] text-gray-900 opacity-90 pl-4 border-r-2 border-blue-100 pr-4">
                                            {item.fullText}
                                        </p>
                                    </div>
                                );
                                if (item.type === 'text') return (
                                    <div key={idx} className="bg-orange-50/30 p-6 rounded-xl text-center border border-orange-100 my-6">
                                        <h3 className="font-bold text-xl mb-3 text-orange-900">{item.title}</h3>
                                        <p className="whitespace-pre-wrap leading-[2]">{item.text}</p>
                                    </div>
                                );
                                if (item.type === 'section_title') return (
                                    <h3 key={idx} className="text-2xl font-bold text-center text-gray-800 border-b-2 border-orange-500 inline-block px-8 pb-1 mb-8 mt-12 mx-auto block w-max">{item.text}</h3>
                                );
                                if (item.type === 'header_info') return (
                                    <div key={idx} className="text-center text-gray-600 font-medium text-lg mb-8 italic bg-gray-50 py-2 rounded">
                                        {item.text}
                                    </div>
                                );
                                return null;
                            })}
                        </div>

                        {/* Footer */}
                        <div className="absolute bottom-6 left-0 right-0 text-center text-xs text-gray-400">
                            הופק באמצעות אתר "קדישים" • כל הזכויות שמורות
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Input Form Mode
    return (
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-orange-100 my-8">
            {/* Header Tabs */}
            <div className="flex bg-gray-100 border-b border-gray-200">
                <button onClick={() => { setActiveTab('tehillim'); setGeneratedContent(null); }} className={`flex-1 py-4 font-bold text-center transition-all ${activeTab === 'tehillim' ? 'bg-orange-600 text-white' : 'text-gray-600 hover:bg-gray-200'} `}>תהילים לפי שם</button>
                <button onClick={() => { setActiveTab('mishnayot'); setGeneratedContent(null); }} className={`flex-1 py-4 font-bold text-center transition-all ${activeTab === 'mishnayot' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-200'} `}>משניות לפי שם</button>
                <button onClick={() => { setActiveTab('grave'); setGeneratedContent(null); }} className={`flex-1 py-4 font-bold text-center transition-all ${activeTab === 'grave' ? 'bg-gray-800 text-white' : 'text-gray-600 hover:bg-gray-200'} `}>סדר אזכרה מלא</button>
            </div>

            <div className="p-8">
                {/* Visual Config Panel */}
                <form onSubmit={handleGenerate} className="max-w-4xl mx-auto space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-orange-50 p-6 rounded-2xl border border-orange-100">
                        {/* Name Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">שם הנפטר/ת</label>
                            <div className="relative">
                                <User className="absolute right-3 top-3.5 text-orange-400" size={20} />
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="לדוגמה: משה" className="w-full text-lg p-3 pr-10 rounded-lg border border-gray-300 focus:border-orange-500 outline-none" required />
                            </div>
                        </div>

                        {/* Parent Name (Optional for Title) */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">{activeTab === 'grave' ? 'שם האם (לאזכרה)' : 'שם האב/האם (אופציונלי)'}</label>
                            <input type="text" value={motherName} onChange={(e) => setMotherName(e.target.value)} placeholder="לדוגמה: שרה" className="w-full text-lg p-3 rounded-lg border border-gray-300 focus:border-orange-500 outline-none" />
                        </div>

                        {/* Gender Select */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">מין הנפטר</label>
                            <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
                                <button type="button" onClick={() => { setGender('male'); setIsBat(false); }} className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${gender === 'male' ? 'bg-blue-50 text-blue-700 border border-blue-100 shadow-sm' : 'text-gray-400 hover:bg-gray-50'} `}>זכר (בן)</button>
                                <button type="button" onClick={() => { setGender('female'); setIsBat(true); }} className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${gender === 'female' ? 'bg-pink-50 text-pink-700 border border-pink-100 shadow-sm' : 'text-gray-400 hover:bg-gray-50'} `}>נקבה (בת)</button>
                            </div>
                        </div>

                        {/* Nusach Selector - Only for Grave/Prayer modes where Kaddish is relevant */}
                        {activeTab === 'grave' && (
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">נוסח התפילה</label>
                                <select
                                    value={nusach}
                                    onChange={(e) => setNusach(e.target.value)}
                                    className="w-full text-lg p-3 rounded-lg border border-gray-300 focus:border-orange-500 outline-none bg-white"
                                >
                                    {Object.entries(kaddishData).map(([key, data]) => (
                                        <option key={key} value={key}>{data.label}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Options */}
                        <div className="flex items-center pt-8">
                            <label className="flex items-center cursor-pointer group">
                                <div className="relative">
                                    <input type="checkbox" id="neshama" checked={showNeshama} onChange={(e) => setShowNeshama(e.target.checked)} className="peer sr-only" />
                                    <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                                </div>
                                <span className="mr-3 font-medium text-gray-700 group-hover:text-orange-700 transition-colors">הוסף אותיות "נשמה"</span>
                            </label>
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-gradient-to-l from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-bold py-4 rounded-xl shadow-lg text-xl transition-all transform hover:scale-[1.01]">
                        {activeTab === 'grave' ? 'צור סדר אזכרה להדפסה' : 'הצג תוכן לקריאה ולשמירה'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default MemorialServiceGenerator;
