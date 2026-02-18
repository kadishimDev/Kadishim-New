import React, { useState, useRef } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { kaddishData } from '../data/kaddishData';
import { BookOpen, ChevronLeft, ArrowRight, Download, Image as ImageIcon, Printer } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Helper component for formatted text
const FormattedKaddishText = ({ text }) => {
    if (!text) return null;

    // Split by newlines to preserve stanzas
    const lines = text.split('\n');

    return (
        <div className="space-y-4">
            {lines.map((line, index) => {
                if (!line.trim()) return <div key={index} className="h-4" />;

                // Split by spaces to handle words individually
                const words = line.split(' ');

                return (
                    <p key={index} className="text-2xl leading-relaxed text-gray-800">
                        {words.map((word, i) => {
                            // Clean word for checking (remove punctuation)
                            const cleanWord = word.replace(/[.,:()\-]/g, '');
                            // Check for Amen (exact match with niqqud)
                            const isAmen = cleanWord.includes('אָמֵן');

                            return (
                                <span key={i} className={isAmen ? "font-bold text-primary" : ""}>
                                    {word}{' '}
                                </span>
                            );
                        })}
                    </p>
                );
            })}
        </div>
    );
};

const KaddishLibrary = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialNusach = searchParams.get('nusach') || 'sephardi';
    const initialType = searchParams.get('type') || 'yatom';

    const [selectedNusach, setSelectedNusachState] = useState(initialNusach);
    const [selectedType, setSelectedTypeState] = useState(initialType);
    const [isGenerating, setIsGenerating] = useState(false);
    const contentRef = useRef(null);

    const setSelectedNusach = (val) => {
        setSelectedNusachState(val);
        setSearchParams({ nusach: val, type: selectedType });
    };

    const setSelectedType = (val) => {
        setSelectedTypeState(val);
        setSearchParams({ nusach: selectedNusach, type: val });
    };

    const handleDownloadImage = async () => {
        if (!contentRef.current) return;
        setIsGenerating(true);
        try {
            const canvas = await html2canvas(contentRef.current, {
                useCORS: true,
                scale: 2, // Retain high quality
                backgroundColor: '#ffffff'
            });

            const link = document.createElement('a');
            link.download = `kaddish-${selectedNusach}-${selectedType}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            console.error("Image generation failed", error);
            alert("שגיאה ביצירת התמונה");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownloadPDF = async () => {
        if (!contentRef.current) return;
        setIsGenerating(true);
        try {
            const canvas = await html2canvas(contentRef.current, {
                useCORS: true,
                scale: 2,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });

            // Adjust PDF dimensions to match canvas (or scale canvas to fit A4... but matching canvas is safer for design)
            // Actually usually we want A4. Let's start with auto-size to fit content perfect.
            // If we want A4:
            // const pdf = new jsPDF('p', 'mm', 'a4');
            // const pdfWidth = pdf.internal.pageSize.getWidth();
            // const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            // pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save(`kaddish-${selectedNusach}-${selectedType}.pdf`);
        } catch (error) {
            console.error("PDF generation failed", error);
            alert("שגיאה ביצירת PDF");
        } finally {
            setIsGenerating(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const nusachOptions = Object.entries(kaddishData).map(([key, data]) => ({
        id: key,
        label: data.label
    }));

    const typeOptions = [
        { id: 'yatom', label: 'קדיש יתום' },
        { id: 'derabanan', label: 'קדיש דרבנן' },
        { id: 'half', label: 'חצי קדיש' },
        { id: 'titkabal', label: 'קדיש תתקבל' }
    ];

    const currentNusachData = kaddishData[selectedNusach] || kaddishData['sephardi'];
    const currentTypeOption = typeOptions.find(t => t.id === selectedType) || typeOptions[0];
    const currentData = currentNusachData[selectedType] || currentNusachData['yatom'];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Navbar />

            <div className="container mx-auto px-4 py-8 flex-grow mt-24 print:mt-0 print:p-0">
                {/* Header (Hidden on Print) */}
                <div className="text-center mb-12 print:hidden">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">ספריית הקדיש</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        נוסחי הקדיש המלאים לכל העדות, מחולקים לפי סוגים ומותאמים לקריאה נוחה.
                    </p>
                </div>

                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">

                    {/* Sidebar Controls (Hidden on Print) */}
                    <div className="md:col-span-1 space-y-8 print:hidden">
                        {/* Nusach Selector */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-lg mb-4 text-gray-800 border-b border-gray-100 pb-2">נוסח תפילה</h3>
                            <div className="space-y-2">
                                {nusachOptions.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => setSelectedNusach(option.id)}
                                        className={`w-full text-right px-4 py-3 rounded-xl transition-all font-medium flex justify-between items-center group ${selectedNusach === option.id
                                            ? 'bg-orange-50 text-orange-700 shadow-sm ring-1 ring-orange-200'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                    >
                                        {option.label}
                                        {selectedNusach === option.id && <ChevronLeft size={16} />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Type Selector */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-lg mb-4 text-gray-800 border-b border-gray-100 pb-2">סוג הקדיש</h3>
                            <div className="space-y-2">
                                {typeOptions.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => setSelectedType(option.id)}
                                        className={`w-full text-right px-4 py-3 rounded-xl transition-all font-medium flex justify-between items-center ${selectedType === option.id
                                            ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                    >
                                        {option.label}
                                        {selectedType === option.id && <ChevronLeft size={16} />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Content Display */}
                    <div className="md:col-span-3">
                        {/* Toolbar (Hidden on Print) */}
                        <div className="flex justify-end gap-2 mb-4 print:hidden">
                            <button
                                onClick={handlePrint}
                                disabled={isGenerating}
                                className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 font-medium transition disabled:opacity-50"
                            >
                                <Printer size={18} /> הדפס
                            </button>
                            <button
                                onClick={handleDownloadImage}
                                disabled={isGenerating}
                                className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 font-medium transition disabled:opacity-50"
                            >
                                <ImageIcon size={18} /> תמונה
                            </button>
                            <button
                                onClick={handleDownloadPDF}
                                disabled={isGenerating}
                                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg shadow-md hover:bg-gray-800 font-medium transition disabled:opacity-50"
                            >
                                <Download size={18} /> הורד PDF
                            </button>
                        </div>

                        <div ref={contentRef} className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden min-h-[600px] relative print:shadow-none print:border-none">
                            {/* Decorative Top Border */}
                            <div className="h-2 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 print:hidden"></div>

                            <div className="p-8 md:p-12 print:p-0">
                                <div className="flex items-center gap-3 text-gray-400 text-sm mb-6 font-medium">
                                    <BookOpen size={16} />
                                    <span>{currentNusachData.label}</span>
                                    <span>/</span>
                                    <span>{currentTypeOption.label}</span>
                                </div>

                                <h2 className="text-3xl font-bold text-gray-900 mb-8 border-b border-gray-100 pb-6">
                                    {currentData?.title || "טקסט חסר"}
                                </h2>

                                <div className="prose prose-xl max-w-none text-gray-800" style={{ fontFamily: 'Frank Ruhl Libre, serif' }}>
                                    {currentData?.text ? (
                                        <FormattedKaddishText text={currentData.text} />
                                    ) : (
                                        <div className="text-center py-20 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                            <p>הטקסט עבור בחירה זו יעודכן בקרוב.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer of Card */}
                            <div className="bg-gray-50 p-6 text-center border-t border-gray-100 relative print:bg-white print:border-t-0">
                                <p className="text-gray-500 text-sm italic">
                                    "יְהֵא שְׁמֵיהּ רַבָּא מְבָרַךְ לְעָלַם וּלְעָלְמֵי עָלְמַיָּא"
                                </p>
                                <p className="text-gray-400 text-xs mt-2 print:block hidden">
                                    הודפס מאתר 'פרויקט קדישים' - kadishim.net
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default KaddishLibrary;
