import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, BookOpen, Download, User, ArrowLeft, Type, Printer, Image as ImageIcon } from 'lucide-react';
import { tehillimLetters } from '../data/tehillimData';
import { mishnayotLetters } from '../utils/mishnayotData';
import mishnayotFull from '../data/mishnayot_full.json';
import { prayerTexts, getGenderedText } from '../utils/prayerText';
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
    const [isExportingPdf, setIsExportingPdf] = useState(false);
    const [isExportingImage, setIsExportingImage] = useState(false);
    const [pdfPages, setPdfPages] = useState([]); // Real-time calculated pages
    const masterListRef = useRef(null);

    // Pagination setup
    const PAGE_HEIGHT_PX = 1123; // A4 height at 96 DPI

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

            // 1. Tehillim for FULL Name (name + בן/בת + parent name)
            // e.g., "משה בן איטו" → מ.ש.ה.ב.ן.א.י.ט.ו
            const connector = isBat ? 'בת' : 'בן';
            const processMotherName = motherName && isEnglish(motherName) ? transliterateName(motherName) : motherName;
            const fullNameStr = processMotherName
                ? `${processName} ${connector} ${processMotherName}`
                : processName;
            const fullNameLetters = decomposeName(fullNameStr);
            const tehillimName = fullNameLetters.map(item => ({ ...item, data: tehillimLetters[item.normalized], type: 'verse' }));

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
                // 1. New Custom Intro (Yehi Ratzon)
                {
                    type: 'text',
                    title: "תפילה לפני הלימוד",
                    text: getGenderedText(`יהי רצון מלפניך ה' א-לוהינו וא-לוהי אבותינו, שיעלה לרצון לימוד זה שאנחנו לומדים לשם נשמת המנוח/ה "${cleanDisplay}" בן/בת ${cleanMother || '______'}.
ובזכות לימוד זה, האל הגדול הגיבור והנורא שוכת עד וקדוש שמו, שתצרור נשמתו/ה בצרור החיים, ותשים מחיצתו/ה במחיצת צדיקים חסידים יסודי עולם, העומדים לפניך ונהנים מזיו אור פניך, ותיתן לו/ה מהלכים בין העומדים לפניך, ותמחול ותסלח ותכפר ותמחה ותעביר כל מה שחטא/ה ושעוה/תה ופשע/ה לפניך, או עשה/תה דבר שלא כרצונך.
ואל תזכור לו/ה שום חטא ועון ופשע ועבירה, אלא כל המצוות שעשה/תה תזכירם לו/ה לטובה. ורוחו/ה תרגיע בחלק היושבים בגן עדן, ונשמתו/ה תתעדן בטוב הצפון לצדיקים. ותשיב בכבוד מנוחתו/ה, ולקץ הימין יעמוד/תעמוד לגורלו/ה. וילווה אליו/ה השלום, ועל משכבו/ה יבא שלום: כדכתיב: יבוא שלום ינוחו על משכבותם. הולך נכחו: הוא וכל שוכני עמו ישראל בכלל הרחמים והסליחות והנחמות והישועות ונאמר אמן.

לכו נרננה לה', נריעה לצור ישענו, נקדמה פניו בתודה, בזמירות נריע לו.
כי אל גדול ה', ומלך גדול על כל אלהים.`, gender)
                },

                { type: 'header_info', text: `סדר אזכרה ל${gender === 'male' ? 'מנוח' : 'מנוחה'} ${cleanDisplay} ${isBat ? 'בת' : 'בן'} ${cleanMother || '______'}` },

                // Tehillim Section
                { type: 'section_title', text: getGenderedText(`פרקי תהילים לפי שם הנפטר/ת: ${cleanDisplay} ${cleanMother ? (isBat ? 'בת' : 'בן') + ' ' + cleanMother : ''}`, gender) },
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
                { type: 'text', title: prayerTexts.prayerAfter.title, text: getGenderedText(prayerTexts.prayerAfter.text.replace('[שם הנפטר]', `${cleanDisplay} בן/בת ${cleanMother || '______'}`), gender) },

                // Michtam
                { type: 'text', title: prayerTexts.michtam.title, text: prayerTexts.michtam.text },

                // Kaddish Yatom (again)
                { type: 'text', title: kaddishData[nusach].yatom.title, text: kaddishData[nusach].yatom.text },

                // Hashkava (El Maleh)
                {
                    type: 'text',
                    title: "אל מלא רחמים",
                    text: (gender === 'male' ? prayerTexts.elMaleh.male : prayerTexts.elMaleh.female).replace('[שם הנפטר/ת]', `${cleanDisplay} ${isBat ? 'בת' : 'בן'} ${cleanMother || '______'}`)
                }
            ];
            setGeneratedContent(prayerPart);
        }

        // Store display names for the render view (all modes)
        setGenerationMeta({ name: displayName, motherName: displayMother });
    };

    const generateCanvas = async (element) => {
        if (!element) return null;
        try {
            // Wait for images to load
            const images = Array.from(element.getElementsByTagName('img'));
            await Promise.all(images.map(img => {
                if (img.complete) return Promise.resolve();
                return new Promise(resolve => {
                    img.onload = resolve;
                    img.onerror = resolve; // Continue even if error
                });
            }));

            // Small delay to ensure rendering matches
            await new Promise(resolve => setTimeout(resolve, 500));

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false,
                windowWidth: 1200
            });
            return canvas;
        } catch (err) {
            console.error("Canvas generation failed", err);
            return null;
        }
    };

    // Measurement-based pagination logic
    const calculateLayout = (items) => {
        if (!masterListRef.current) return [items];

        const masterElement = masterListRef.current;
        // Search for the nested space-y-4 container to get accurate item heights
        const container = masterElement.querySelector('.space-y-4');
        const children = container ? Array.from(container.children) : Array.from(masterElement.children);
        const pages = [];
        let currentPage = [];
        let currentHeight = 0;
        let pIdx = 0;

        children.forEach((child, index) => {
            const h = child.offsetHeight;
            const item = items[index];

            // Overhead for headers/footers (Measured in pixel buckets)
            const headerHeight = pIdx === 0 ? 320 : 130;
            const footerHeight = 90;
            const availableHeight = PAGE_HEIGHT_PX - headerHeight - footerHeight;

            if (currentHeight + h > availableHeight && currentPage.length > 0) {
                pages.push(currentPage);
                currentPage = [];
                currentHeight = 0;
                pIdx++;
            }

            currentPage.push(item);
            currentHeight += h;
        });

        if (currentPage.length > 0) {
            pages.push(currentPage);
        }

        return pages;
    };

    const handleDownloadImage = async () => {
        setIsExportingImage(true);
        const canvas = await generateCanvas(printRef.current);
        if (!canvas) {
            setIsExportingImage(false);
            return;
        }

        try {
            const imgData = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = imgData;
            link.download = `tefilla_${name}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error(err);
            alert("שגיאה בשמירת התמונה.");
        } finally {
            setIsExportingImage(false);
        }
    };

    const handleDownloadPDF = async () => {
        setIsExportingPdf(true);
        try {
            // Step 1: Trigger measurement pass by calculating layout from actual DOM heights
            const calculated = calculateLayout(generatedContent);
            setPdfPages(calculated);

            // Step 2: Wait for React to render the pages in the hidden container
            // Increased to 800ms to ensure all fonts and layout settle
            await new Promise(r => setTimeout(r, 800));

            // Step 3: Find the hidden pages and capture them
            const printContainer = document.getElementById('hidden-print-container');
            const pageDivs = Array.from(printContainer.querySelectorAll('.pdf-page-final'));

            if (pageDivs.length === 0) throw new Error("No pages rendered for export");

            const pdf = new jsPDF('p', 'mm', 'a4');

            for (let i = 0; i < pageDivs.length; i++) {
                const canvas = await generateCanvas(pageDivs[i]);
                if (!canvas) continue;

                if (i > 0) pdf.addPage();

                const imgData = canvas.toDataURL('image/jpeg', 0.95);
                pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
            }

            pdf.save(`tefilla_${name}.pdf`);
        } catch (err) {
            console.error(err);
            alert("שגיאה ביצירת הקובץ. נא לנסות שוב.");
        } finally {
            setIsExportingPdf(false);
        }
    };

    // If content is generated, we show the "Result View" mode (Simulating "New Page")
    // We can add a "Back to Edit" button.
    if (generatedContent) {
        return (
            <div className="container mx-auto px-4 py-8 animate-fade-in-up overflow-x-hidden">
                {/* Toolbar - not sticky on mobile to prevent overlapping content */}
                <div className="md:sticky md:top-24 z-30 bg-white/95 backdrop-blur shadow-lg rounded-2xl p-3 md:p-4 mb-6 md:mb-8 border border-gray-200">
                    {/* Row 1: Back button */}
                    <div className="flex justify-between items-center mb-3">
                        <button
                            onClick={() => setGeneratedContent(null)}
                            className="flex items-center gap-2 text-gray-600 hover:text-orange-600 font-bold transition-colors text-sm md:text-base"
                        >
                            <ArrowLeft size={18} /> חזרה לעריכה
                        </button>
                    </div>

                    {/* Row 2: Font options */}
                    <div className="flex flex-wrap items-center gap-2 md:gap-4 mb-3">
                        <div className="flex items-center gap-1">
                            <Type size={16} className="text-gray-400 hidden md:block" />
                            <select
                                value={selectedFont.id}
                                onChange={(e) => setSelectedFont(fontOptions.find(f => f.id === e.target.value))}
                                className="bg-gray-50 border border-gray-300 rounded-lg py-1 px-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                            >
                                {fontOptions.map(font => (
                                    <option key={font.id} value={font.id}>{font.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-1 md:gap-2">
                            <span className="text-gray-400 text-xs md:text-sm hidden md:inline">גודל:</span>
                            <div className="flex bg-gray-100 rounded-lg p-0.5 md:p-1">
                                {fontSizeOptions.map(size => (
                                    <button
                                        key={size.id}
                                        onClick={() => setSelectedSize(size)}
                                        className={`px-2 md:px-3 py-1 rounded text-xs md:text-sm font-bold transition-all ${selectedSize.id === size.id ? 'bg-white shadow text-orange-600' : 'text-gray-500 hover:bg-gray-200'}`}
                                    >
                                        {size.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Row 3: Download buttons */}
                    <div className="flex flex-col sm:flex-row gap-2">
                        <button
                            onClick={handleDownloadPDF}
                            disabled={isExportingPdf || isExportingImage}
                            className={`flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white px-4 md:px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg text-sm md:text-base flex-1 ${(isExportingPdf || isExportingImage) ? 'opacity-70 cursor-wait' : ''}`}
                        >
                            {isExportingPdf ? 'מייצר PDF...' : <><Download size={16} /> הורדה כ-PDF</>}
                        </button>
                        <button
                            onClick={handleDownloadImage}
                            disabled={isExportingPdf || isExportingImage}
                            className={`flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 md:px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg text-sm md:text-base flex-1 ${(isExportingPdf || isExportingImage) ? 'opacity-70 cursor-wait' : ''}`}
                        >
                            {isExportingImage ? 'מייצר תמונה...' : <><ImageIcon size={16} /> הורדה כתמונה</>}
                        </button>
                    </div>
                </div>

                {/* Printable Document Area */}
                <div className="flex justify-center overflow-hidden">
                    <div
                        ref={printRef}
                        className="bg-white p-4 md:p-16 shadow-2xl max-w-[210mm] min-h-[50vh] md:min-h-[297mm] w-full relative"
                        style={{ fontFamily: selectedFont.fontFamily }}
                    >
                        {/* Decorative Border - hidden on mobile to prevent overlap */}
                        <div className="absolute inset-2 md:inset-4 border-[3px] border-double border-orange-200 pointer-events-none hidden md:block"></div>
                        <div className="absolute inset-3 md:inset-5 border border-orange-100 pointer-events-none hidden md:block"></div>

                        {/* Header Section */}
                        <div className="relative z-10 flex flex-row justify-between items-start border-b-2 border-orange-100 pb-4 md:pb-8 mb-6 md:mb-10 gap-2 md:gap-4">
                            {/* Left: Rabbi Image */}
                            <div className="w-16 h-20 md:w-24 md:h-32 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden shadow-sm order-first">
                                <img
                                    src="/assets/rabbi_moshe.jpg"
                                    alt="הרב משה בן-טוב"
                                    crossOrigin="anonymous"
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-xs text-gray-400 text-center p-1">תמונת<br/>הרב</div>' }}
                                />
                            </div>

                            {/* Center: Title */}
                            <div className="text-center pt-2 flex-1">
                                <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-3 tracking-wide" style={{ fontFamily: selectedFont.fontFamily }}>
                                    {activeTab === 'grave' ? 'סדר אזכרה והנצחה' : `לימוד ${activeTab === 'tehillim' ? 'תהילים' : 'משניות'} לעילוי נשמה`}
                                </h1>
                                <div className="text-base md:text-xl text-gray-700 font-medium" style={{ fontFamily: selectedFont.fontFamily }}>
                                    לעילוי נשמת {gender === 'male' ? 'המנוח' : 'המנוחה'} <span className="font-bold text-gray-900">{generationMeta.name || name}</span> {isBat ? 'בת' : 'בן'} <span className="font-bold">{generationMeta.motherName || motherName || '______'}</span>
                                </div>
                                <div className="text-sm text-gray-400 mt-2">הופק ע"י ארגון "קדישים" - kadishim.co.il</div>
                            </div>

                            {/* Right: Logo */}
                            <div className="w-20 h-20 md:w-32 md:h-32 flex items-center justify-center order-last">
                                <img
                                    src="/assets/logo.png"
                                    alt="לוגו האתר"
                                    crossOrigin="anonymous"
                                    className="max-w-full max-h-full object-contain"
                                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block' }}
                                />
                                <div className="hidden text-orange-600 font-bold border-2 border-orange-600 rounded-full p-2 text-center text-xs w-20 h-20 flex items-center justify-center" style={{ display: 'none' }}>
                                    קדיש<br />וזיכרון
                                </div>
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
                                    <h3 key={idx} className="text-2xl font-bold text-center text-gray-800 border-b-2 border-orange-500 inline-block px-8 pb-1 mb-8 mt-12 mx-auto block">{item.text}</h3>
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
                {/* Hidden Multi-Page PDF Renderer (Must be in DOM for html2canvas) */}
                {/* Hidden Multi-Page PDF Renderer (Measurement & Final Generation) */}
                <div className="fixed opacity-0 pointer-events-none left-[-200vw] top-0 overflow-hidden" style={{ width: '210mm' }}>
                    {/* Master Renderer for measuring item heights - MOULDED TO A4 DIMENSIONS */}
                    <div ref={masterListRef} className={`bg-white p-16 ${selectedSize.id}`} style={{ width: '210mm', minHeight: '297mm', fontSize: `${16 * selectedSize.scale}px`, fontFamily: selectedFont.fontFamily }}>
                        <div className="space-y-4">
                            {generatedContent.map((item, idx) => (
                                <div key={idx} className="measurement-item bg-white">
                                    {item.type === 'verse' && (
                                        <div className="mb-3">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full font-bold border bg-orange-50 text-orange-800 border-orange-200" style={{ fontSize: '12px' }}>{item.char}</span>
                                            </div>
                                            <div className="text-justify leading-relaxed text-gray-900">
                                                {item.data ? item.data.map((l, i) => <span key={i}>{l} </span>) : '...'}
                                            </div>
                                        </div>
                                    )}
                                    {item.type === 'mishnah' && (
                                        <div className="mb-4">
                                            <div className="font-bold text-gray-600 mb-1" style={{ fontSize: `${12 * selectedSize.scale}px` }}>{item.meta?.tractate} פרק {item.meta?.chapter}</div>
                                            <p className="text-justify leading-relaxed text-gray-900 pl-4 border-r-2 border-blue-100">{item.fullText}</p>
                                        </div>
                                    )}
                                    {item.type === 'text' && (
                                        <div className="bg-orange-50/20 p-4 rounded-xl text-center border border-orange-100 my-3">
                                            <h3 className="font-bold mb-2 text-orange-900" style={{ fontSize: `${18 * selectedSize.scale}px` }}>{item.title}</h3>
                                            <p className="whitespace-pre-wrap leading-relaxed">{item.text}</p>
                                        </div>
                                    )}
                                    {item.type === 'section_title' && (
                                        <h3 className="font-bold text-center text-gray-800 border-b-2 border-orange-500 inline-block px-4 pb-1 mb-3 mt-3 mx-auto block w-max" style={{ fontSize: `${20 * selectedSize.scale}px` }}>{item.text}</h3>
                                    )}
                                    {item.type === 'header_info' && (
                                        <div className="text-center text-gray-500 font-medium opacity-75 mb-3 italic py-1 bg-gray-50 rounded" style={{ fontSize: `${14 * selectedSize.scale}px` }}>{item.text}</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div id="hidden-print-container">
                        {pdfPages.map((pageItems, pageIdx) => (
                            <div
                                key={pageIdx}
                                className="bg-white p-16 relative mb-10 w-[210mm] h-[297mm] overflow-hidden pdf-page-final"
                                style={{ fontFamily: selectedFont.fontFamily }}
                            >
                                {/* Decorative Border */}
                                <div className="absolute inset-4 border-[3px] border-double border-orange-200 pointer-events-none"></div>
                                <div className="absolute inset-5 border border-orange-100 pointer-events-none"></div>

                                {/* Header (Only on Page 1) */}
                                {pageIdx === 0 && (
                                    <div className="relative z-10 flex justify-between items-start border-b-2 border-orange-100 pb-8 mb-10">
                                        <div className="w-24 h-32 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden shadow-sm order-first">
                                            <img src="/assets/rabbi_moshe.jpg" crossOrigin="anonymous" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="text-center pt-2 flex-1">
                                            <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-wide">{activeTab === 'grave' ? 'סדר אזכרה והנצחה' : `לימוד ${activeTab === 'tehillim' ? 'תהילים' : 'משניות'}`}</h1>
                                            <div className="text-xl text-gray-700 font-medium">לעילוי נשמת {gender === 'male' ? 'המנוח' : 'המנוחה'} {generationMeta.name} {isBat ? 'בת' : 'בן'} {generationMeta.motherName}</div>
                                            <div className="text-sm text-gray-400 mt-2">kadishim.co.il</div>
                                        </div>
                                        <div className="w-32 h-32 flex items-center justify-center order-last">
                                            <img src="/assets/logo.png" crossOrigin="anonymous" className="max-w-full max-h-full object-contain" />
                                        </div>
                                    </div>
                                )}

                                {/* Simple Header on Page 2+ */}
                                {pageIdx > 0 && (
                                    <div className="relative z-10 flex justify-between items-center border-b border-orange-50 pb-4 mb-8">
                                        <div className="text-xs text-gray-400">לעילוי נשמת {generationMeta.name} {isBat ? 'בת' : 'בן'} {generationMeta.motherName}</div>
                                        <div className="text-lg font-bold text-orange-600">ארגון קדישים</div>
                                        <div className="text-xs text-gray-400">עמוד {pageIdx + 1}</div>
                                    </div>
                                )}

                                {/* Content Body */}
                                <div className={`space-y-4 relative z-10 ${selectedSize.id}`} style={{ fontSize: `${16 * selectedSize.scale}px` }}>
                                    {pageItems.map((item, idx) => (
                                        <div key={idx} className="page-break-inside-avoid">
                                            {item.type === 'verse' && (
                                                <div className="mb-3">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full font-bold border bg-orange-50 text-orange-800 border-orange-200" style={{ fontSize: '12px' }}>{item.char}</span>
                                                    </div>
                                                    <div className="text-justify leading-relaxed text-gray-900">
                                                        {item.data ? item.data.map((l, i) => <span key={i}>{l} </span>) : '...'}
                                                    </div>
                                                </div>
                                            )}
                                            {item.type === 'mishnah' && (
                                                <div className="mb-4">
                                                    <div className="font-bold text-gray-600 mb-1" style={{ fontSize: `${12 * selectedSize.scale}px` }}>{item.meta?.tractate} פרק {item.meta?.chapter}</div>
                                                    <p className="text-justify leading-relaxed text-gray-900 pl-4 border-r-2 border-blue-100">{item.fullText}</p>
                                                </div>
                                            )}
                                            {item.type === 'text' && (
                                                <div className="bg-orange-50/20 p-4 rounded-xl text-center border border-orange-100 my-3">
                                                    <h3 className="font-bold mb-2 text-orange-900" style={{ fontSize: `${18 * selectedSize.scale}px` }}>{item.title}</h3>
                                                    <p className="whitespace-pre-wrap leading-relaxed">{item.text}</p>
                                                </div>
                                            )}
                                            {item.type === 'section_title' && (
                                                <h3 className="font-bold text-center text-gray-800 border-b-2 border-orange-500 inline-block px-4 pb-1 mb-3 mt-3 mx-auto block w-max" style={{ fontSize: `${20 * selectedSize.scale}px` }}>{item.text}</h3>
                                            )}
                                            {item.type === 'header_info' && (
                                                <div className="text-center text-gray-500 font-medium opacity-75 mb-3 italic py-1 bg-gray-50 rounded" style={{ fontSize: `${14 * selectedSize.scale}px` }}>{item.text}</div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Footer */}
                                <div className="absolute bottom-6 left-0 right-0 text-center text-[10px] text-gray-300">
                                    הופק ע"י ארגון קדישים • עמוד {pageIdx + 1}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Input Form Mode
    return (
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-orange-100 my-8">
            {/* Header Tabs */}
            <div className="flex flex-col sm:flex-row bg-gray-100 border-b border-gray-200">
                <button onClick={() => { setActiveTab('tehillim'); setGeneratedContent(null); }} className={`flex-1 py-3 md:py-4 font-bold text-center text-sm md:text-base transition-all ${activeTab === 'tehillim' ? 'bg-orange-600 text-white' : 'text-gray-600 hover:bg-gray-200'} `}>תהילים לפי שם</button>
                <button onClick={() => { setActiveTab('mishnayot'); setGeneratedContent(null); }} className={`flex-1 py-3 md:py-4 font-bold text-center text-sm md:text-base transition-all ${activeTab === 'mishnayot' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-200'} `}>משניות לפי שם</button>
                <button onClick={() => { setActiveTab('grave'); setGeneratedContent(null); }} className={`flex-1 py-3 md:py-4 font-bold text-center text-sm md:text-base transition-all ${activeTab === 'grave' ? 'bg-gray-800 text-white' : 'text-gray-600 hover:bg-gray-200'} `}>סדר אזכרה מלא</button>
            </div>

            <div className="p-4 md:p-8">
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
