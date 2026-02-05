import React, { useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { kaddishData } from '../data/kaddishData';
import { BookOpen, ChevronLeft, ArrowRight } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

const KaddishLibrary = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialNusach = searchParams.get('nusach') || 'sephardi';
    const initialType = searchParams.get('type') || 'yatom';

    const [selectedNusach, setSelectedNusachState] = useState(initialNusach);
    const [selectedType, setSelectedTypeState] = useState(initialType);

    const setSelectedNusach = (val) => {
        setSelectedNusachState(val);
        setSearchParams({ nusach: val, type: selectedType });
    };

    const setSelectedType = (val) => {
        setSelectedTypeState(val);
        setSearchParams({ nusach: selectedNusach, type: val });
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

    const currentData = kaddishData[selectedNusach][selectedType];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Navbar />

            <div className="container mx-auto px-4 py-8 flex-grow mt-24">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">ספריית הקדיש</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        נוסחי הקדיש המלאים לכל העדות, מחולקים לפי סוגים ומותאמים לקריאה נוחה.
                    </p>
                </div>

                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">

                    {/* Sidebar Controls */}
                    <div className="md:col-span-1 space-y-8">
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
                        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden min-h-[600px] relative">
                            {/* Decorative Top Border */}
                            <div className="h-2 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600"></div>

                            <div className="p-8 md:p-12">
                                <div className="flex items-center gap-3 text-gray-400 text-sm mb-6 font-medium">
                                    <BookOpen size={16} />
                                    <span>{kaddishData[selectedNusach].label}</span>
                                    <span>/</span>
                                    <span>{typeOptions.find(t => t.id === selectedType).label}</span>
                                </div>

                                <h2 className="text-3xl font-bold text-gray-900 mb-8 border-b border-gray-100 pb-6">
                                    {currentData?.title || "טקסט חסר"}
                                </h2>

                                <div className="prose prose-xl max-w-none text-gray-800 leading-[2.5]" style={{ fontFamily: 'Frank Ruhl Libre, serif' }}>
                                    {currentData?.text ? (
                                        <div className="whitespace-pre-wrap">
                                            {currentData.text}
                                        </div>
                                    ) : (
                                        <div className="text-center py-20 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                            <p>הטקסט עבור בחירה זו יעודכן בקרוב.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Quote / Footer of Card */}
                            <div className="bg-gray-50 p-6 text-center border-t border-gray-100 relative">
                                <p className="text-gray-500 text-sm italic">
                                    "יְהֵא שְׁמֵיהּ רַבָּא מְבָרַךְ לְעָלַם וּלְעָלְמֵי עָלְמַיָּא"
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
