import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, BookOpen, Download, User, ArrowLeft } from 'lucide-react';
import { tehillimLetters } from '../data/tehillimData';
import { mishnayotLetters } from '../utils/mishnayotData';
import mishnayotFull from '../data/mishnayot_full.json';
import { prayerTexts } from '../utils/prayerText';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const MemorialServiceGenerator = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialTab = searchParams.get('tab') || 'tehillim';

    // Inputs
    const [name, setName] = useState('');
    const [fatherName, setFatherName] = useState(''); // New
    const [motherName, setMotherName] = useState(''); // New
    const [gender, setGender] = useState('male'); // male, female
    const [isBat, setIsBat] = useState(false); // Ben/Bat toggle

    const [activeTab, setActiveTabState] = useState(initialTab);
    const [generatedContent, setGeneratedContent] = useState(null);
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
        if (!name.trim()) return;

        const nameLetters = decomposeName(name);
        // Only add Neshama for pure Tehillim/Mishnah flows if requested
        // For Grave/Memorial Service, it's standard to include it usually
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
                meta: mishnayotLetters[item.normalized], // Original meta
                fullText: mishnayotFull[item.normalized] || "טקסט משנה זמני - יתווסף בהמשך", // Full text from JSON
                type: 'mishnah'
            }));
            setGeneratedContent(content);
        } else if (activeTab === 'grave') {
            // Grave Service Composition
            const tehillimPart = allLetters.map(item => ({ ...item, data: tehillimLetters[item.normalized], type: 'verse' }));
            const prayerPart = [
                { type: 'text', title: prayerTexts.intro.title, text: prayerTexts.intro.text },
                { type: 'header_info', text: `סדר אזכרה ל${gender === 'male' ? 'מנוח' : 'מנוחה'} ${name} ${isBat ? 'בת' : 'בן'} ${motherName || '______'} ` }, // Personalized Header
                { type: 'section_title', text: "פרקי תהילים לפי שם הנפטר" },
                ...tehillimPart,
                { type: 'section_title', text: "משניות לעילוי נשמה" },
                ...allLetters.map(item => ({
                    ...item,
                    fullText: mishnayotFull[item.normalized] || "טקסט משנה...",
                    type: 'mishnah'
                })),
                {
                    type: 'text',
                    title: "אל מלא רחמים",
                    text: gender === 'male' ? prayerTexts.elMaleh.male : prayerTexts.elMaleh.female // Gender logic
                },
                { type: 'text', title: prayerTexts.kaddish.title, text: prayerTexts.kaddish.text }
            ];
            setGeneratedContent(prayerPart);
        }
    };

    const handleDownloadPDF = async () => {
        if (!printRef.current) return;
        setIsGeneratingPdf(true);
        try {
            const canvas = await html2canvas(printRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff'
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`memorial - service - ${name}.pdf`);
        } catch (err) {
            console.error(err);
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-orange-100 my-8">
            {/* Header Tabs */}
            <div className="flex bg-gray-100 border-b border-gray-200">
                <button onClick={() => { setActiveTab('tehillim'); setGeneratedContent(null); }} className={`flex - 1 py - 4 font - bold text - center transition - all ${activeTab === 'tehillim' ? 'bg-orange-600 text-white' : 'text-gray-600 hover:bg-gray-200'} `}>תהילים לפי שם</button>
                <button onClick={() => { setActiveTab('mishnayot'); setGeneratedContent(null); }} className={`flex - 1 py - 4 font - bold text - center transition - all ${activeTab === 'mishnayot' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-200'} `}>משניות לפי שם</button>
                <button onClick={() => { setActiveTab('grave'); setGeneratedContent(null); }} className={`flex - 1 py - 4 font - bold text - center transition - all ${activeTab === 'grave' ? 'bg-gray-800 text-white' : 'text-gray-600 hover:bg-gray-200'} `}>סדר אזכרה מלא</button>
            </div>

            <div className="p-8">
                {/* Visual Config Panel */}
                <form onSubmit={handleGenerate} className="max-w-4xl mx-auto space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-orange-50 p-6 rounded-2xl border border-orange-100">
                        {/* Name Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">שם הנפטר/ת</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="לדוגמה: משה" className="w-full text-lg p-3 rounded-lg border border-gray-300 focus:border-orange-500 outline-none" required />
                        </div>

                        {/* Parent Name (Optional for Title) */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">{activeTab === 'grave' ? 'שם האם (לאזכרה)' : 'שם האב/האם (אופציונלי)'}</label>
                            <input type="text" value={motherName} onChange={(e) => setMotherName(e.target.value)} placeholder="לדוגמה: שרה" className="w-full text-lg p-3 rounded-lg border border-gray-300 focus:border-orange-500 outline-none" />
                        </div>

                        {/* Gender Select */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">מין הנפטר</label>
                            <div className="flex bg-white rounded-lg p-1 border border-gray-200">
                                <button type="button" onClick={() => { setGender('male'); setIsBat(false); }} className={`flex - 1 py - 2 rounded - md text - sm font - bold ${gender === 'male' ? 'bg-blue-100 text-blue-700' : 'text-gray-500'} `}>זכר (בן)</button>
                                <button type="button" onClick={() => { setGender('female'); setIsBat(true); }} className={`flex - 1 py - 2 rounded - md text - sm font - bold ${gender === 'female' ? 'bg-pink-100 text-pink-700' : 'text-gray-500'} `}>נקבה (בת)</button>
                            </div>
                        </div>

                        {/* Options */}
                        <div className="flex items-center pt-8">
                            <input type="checkbox" id="neshama" checked={showNeshama} onChange={(e) => setShowNeshama(e.target.checked)} className="w-5 h-5 text-orange-600 rounded" />
                            <label htmlFor="neshama" className="mr-3 font-medium text-gray-700">הוסף אותיות "נשמה"</label>
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl shadow-lg text-xl transition-all">
                        {activeTab === 'grave' ? 'צור סדר אזכרה להדפסה' : 'הצג תוכן'}
                    </button>
                </form>

                {/* Content Area */}
                {generatedContent && (
                    <div className="mt-12">
                        <div className="flex justify-between items-center mb-6 no-print">
                            <h2 className="text-2xl font-bold text-gray-800">התוכן שלך מוכן</h2>
                            <button onClick={handleDownloadPDF} disabled={isGeneratingPdf} className="flex items-center gap-2 bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors shadow-lg">
                                {isGeneratingPdf ? 'מכין קובץ...' : <><Download size={20} /> הורד כ-PDF</>}
                            </button>
                        </div>

                        {/* Printable Area */}
                        <div ref={printRef} className="bg-white p-10 border border-gray-200 shadow-sm mx-auto max-w-4xl min-h-[800px]">
                            {/* Branding Header for PDF */}
                            <div className="text-center border-b-2 border-orange-500 pb-6 mb-8">
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    {activeTab === 'grave' ? 'סדר אזכרה והנצחה' : `לימוד ${activeTab === 'tehillim' ? 'תהילים' : 'משניות'} לעילוי נשמה`}
                                </h1>
                                <h2 className="text-xl text-gray-600">
                                    לעילוי נשמת {name} {isBat ? 'בת' : 'בן'} {motherName || '______'}
                                </h2>
                                <div className="mt-2 text-sm text-gray-400">הופק ע"י אתר "קדיש וזיכרון"</div>
                            </div>

                            {/* Dynamic Content */}
                            <div className="space-y-8">
                                {generatedContent.map((item, idx) => {
                                    if (item.type === 'verse') return (
                                        <div key={idx} className="relative">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={`flex items - center justify - center w - 8 h - 8 rounded - full font - bold text - lg ${item.isNeshama ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'} `}>{item.char}</span>
                                            </div>
                                            <div className="text-lg leading-loose text-justify font-serif text-gray-800">
                                                {item.data ? item.data.map((l, i) => <span key={i}>{l} </span>) : '...'}
                                            </div>
                                        </div>
                                    );
                                    if (item.type === 'mishnah') return (
                                        <div key={idx} className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                                            <div className="flex items-center gap-3 mb-3 border-b border-gray-200 pb-2">
                                                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold">{item.char}</span>
                                                <span className="font-bold text-gray-700">{item.meta ? `${item.meta.tractate} פרק ${item.meta.chapter} ` : 'פרק משנה'}</span>
                                            </div>
                                            <p className="text-lg leading-relaxed font-serif text-justify text-gray-800">
                                                {item.fullText}
                                            </p>
                                        </div>
                                    );
                                    if (item.type === 'text') return (
                                        <div key={idx} className="bg-orange-50/50 p-6 rounded-xl text-center border border-orange-100">
                                            <h3 className="font-bold text-xl mb-3 text-orange-900">{item.title}</h3>
                                            <p className="whitespace-pre-wrap font-serif text-lg leading-loose">{item.text}</p>
                                        </div>
                                    );
                                    if (item.type === 'section_title') return (
                                        <h3 key={idx} className="text-2xl font-bold text-center text-gray-800 border-b border-gray-200 pb-2 mt-8 mb-4">{item.text}</h3>
                                    );
                                    return null;
                                })}
                            </div>

                            <div className="mt-12 text-center text-xs text-gray-400 border-t pt-4">
                                נוצר באופן אוטומטי באתר קדיש וזיכרון • כל הזכויות שמורות
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MemorialServiceGenerator;
