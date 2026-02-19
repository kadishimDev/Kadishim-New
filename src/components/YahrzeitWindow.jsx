import React, { useState, useEffect, useMemo } from 'react';
import { HDate, gematriya } from '@hebcal/core';
import { X, Flame, ChevronUp, ChevronDown } from 'lucide-react';
import memorialsData from '../data/memorials_v2.json'; // Keep import
import { normalizeRecord } from '../utils/dataNormalization';
import { formatHebrewDate } from '../utils/dateUtils';

const YahrzeitWindow = () => {
    const [isOpen, setIsOpen] = useState(true);
    const [isMinimized, setIsMinimized] = useState(false);
    const [currentHDate, setCurrentHDate] = useState(new HDate());
    const [memorials, setMemorials] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch Data (API + Fallback)
    useEffect(() => {
        const loadData = async () => {
            try {
                // Try API first
                const res = await fetch('/api/get_all_memorials.php');
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data) && data.length > 0) {
                        setMemorials(data);
                        setLoading(false);
                        return;
                    }
                }
                throw new Error("API failed or empty");
            } catch (err) {
                console.warn("API Error, using local data:", err);
                // Fallback to local JSON
                setMemorials(memorialsData);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Calc today's names
    const todaysNames = useMemo(() => {
        const todayDay = currentHDate.getDate();
        const todayMonth = currentHDate.getMonth();

        return memorials
            .map(item => normalizeRecord(item).normalized) // Normalize first
            .filter(item => {
                // 1. Check Structured Data (Most Reliable)
                if (item.hebrew_date_struct) {
                    return item.hebrew_date_struct.day === todayDay &&
                        item.hebrew_date_struct.month === todayMonth;
                }

                // 2. Check Gregorian Date
                if (item.death_date_gregorian || item.gregorian_date) {
                    try {
                        const gDate = item.death_date_gregorian || item.gregorian_date;
                        const d = new Date(gDate);
                        const h = new HDate(d);
                        // Simple match:
                        return h.getDate() === todayDay && h.getMonth() === todayMonth;
                    } catch (e) { }
                }

                return false;
            });
    }, [currentHDate, memorials]);

    // Don't render if no names (and not loading? or wait?)
    if (loading) return null;
    if (todaysNames.length === 0) return null;

    if (isMinimized) {
        return (
            <div
                className="fixed bottom-4 left-4 z-[9999] bg-white rounded-full shadow-2xl border border-orange-200 p-3 cursor-pointer hover:bg-orange-50 transition-all animate-fade-in-up flex items-center gap-3 group max-w-[calc(100vw-2rem)]"
                onClick={() => setIsMinimized(false)}
                dir="rtl"
            >
                <div className="relative shrink-0">
                    <div className="absolute inset-0 bg-orange-400 rounded-full animate-ping opacity-20"></div>
                    <Flame className="text-orange-600 w-6 h-6 animate-pulse" fill="#ea580c" />
                    <div className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-sm">
                        {todaysNames.length}
                    </div>
                </div>
                <div className="flex flex-col min-w-0">
                    <span className="font-bold text-gray-900 text-sm leading-tight truncate">היום באזכרה</span>
                    <span className="text-[10px] text-gray-500 truncate">{gematriya(currentHDate.getDate())} ב{currentHDate.getMonthName('h')}</span>
                </div>
            </div>
        );
    }

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:right-auto md:w-80 z-[9999] bg-white rounded-2xl shadow-2xl border-t-4 border-orange-500 overflow-hidden animate-slide-up ring-1 ring-black/5 mx-auto md:mx-0 max-w-sm" dir="rtl">
            {/* Header */}
            <div className="bg-orange-50/50 p-3 md:p-4 border-b border-orange-100 flex justify-between items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-orange-200/20 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>

                <div className="flex items-center gap-3 relative z-10">
                    <div className="bg-white p-2 rounded-full shadow-md border border-orange-100">
                        <Flame className="text-orange-500 w-5 h-5 animate-candle-flicker" fill="#f97316" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-base leading-tight">נר זיכרון יומי</h3>
                        <p className="text-xs text-orange-800/70 font-medium mt-0.5">
                            {gematriya(currentHDate.getDate())} ב{currentHDate.getMonthName('h')}
                        </p>
                    </div>
                </div>

                <div className="flex gap-1 relative z-10">
                    <button
                        onClick={() => setIsMinimized(true)}
                        className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-100 rounded-lg transition-colors"
                        title="מזער"
                    >
                        <ChevronDown size={16} />
                    </button>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="סגור"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="max-h-[250px] md:max-h-[300px] overflow-y-auto custom-scrollbar bg-white">
                {todaysNames.length > 0 ? (
                    <div className="divide-y divide-gray-50">
                        {todaysNames.map((item, idx) => (
                            <div key={idx} className="p-3 md:p-4 hover:bg-orange-50/30 transition-colors flex items-center gap-3 group">
                                <div className="w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 font-serif text-xs border border-gray-100 group-hover:border-orange-200 group-hover:bg-white group-hover:text-orange-600 group-hover:shadow-sm transition-all">
                                    ז"ל
                                </div>
                                <div className="min-w-0">
                                    <div className="font-bold text-gray-800 text-sm truncate">{item.deceased_name || item.name}</div>
                                    <div className="text-xs text-gray-500 truncate mt-0.5">
                                        {(item.father_name || item.mother_name) ? `בן/ת ${item.father_name || ''} ${item.mother_name ? (item.father_name ? 'ו' : '') + item.mother_name : ''}` : 'זכר צדיק לברכה'}
                                        <span className="mx-1">•</span>
                                        <span className="text-orange-600">{item.death_date_hebrew || item.hebrew_date_text || ''}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center text-gray-400 text-sm">
                        אין אזכרות רשומות להיום
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 p-2 text-center text-[10px] text-gray-400 border-t border-gray-100 font-medium">
                לעילוי נשמתם הטהורה של כל הנפטרים
            </div>
        </div>
    );
};

export default YahrzeitWindow;
