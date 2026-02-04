import React, { useState, useEffect, useMemo } from 'react';
import { HDate, gematriya, HebrewCalendar } from '@hebcal/core';
import { ChevronRight, ChevronLeft, Calendar as CalendarIcon, Search, ChevronDown, X } from 'lucide-react';
import { formatHebrewDate, getHebrewMonths, formatHebrewDateSmart, normalizeHebrewDate } from '../utils/dateUtils';
import DeceasedPopup from './DeceasedPopup';

const HebrewCalendarWidget = ({ kaddishList = [] }) => {
    const [currentHDate, setCurrentHDate] = useState(new HDate());
    const [selectedDate, setSelectedDate] = useState(new HDate());
    const [popupItem, setPopupItem] = useState(null);

    // Jump State
    const [showJumpUI, setShowJumpUI] = useState(false);
    const [jumpYear, setJumpYear] = useState(currentHDate.getFullYear());
    const [jumpMonth, setJumpMonth] = useState(currentHDate.getMonth()); // 1-based or enum? HDate.getMonth() returns month id

    // Derived Display Values
    const currentYear = currentHDate.getFullYear();
    const currentMonthName = currentHDate.getMonthName('h');

    // Calendar Grid Logic
    const daysInMonth = useMemo(() => {
        const arr = [];
        const year = currentHDate.getFullYear();
        const month = currentHDate.getMonth();
        const daysCount = HDate.daysInMonth(month, year);
        const firstDayOfWeek = new HDate(1, month, year).getDay(); // 0=Sun, 6=Sat

        // Pad start (Sunday is 0. If RTL grid, first cell is Sunday).
        for (let i = 0; i < firstDayOfWeek; i++) arr.push(null);
        for (let d = 1; d <= daysCount; d++) arr.push(new HDate(d, month, year));

        return arr;
    }, [currentHDate]);

    // Navigation: Right -> Prev (-1), Left -> Next (+1)
    const handleMonthChange = (delta) => {
        let newDate;
        // Logic to safely move months without skipping days/leap weirdness
        // Set to 15th of current month -> move -> set to 1st
        const approx = new HDate(15, currentHDate.getMonth(), currentHDate.getFullYear());

        if (delta > 0) {
            // Next Month
            newDate = approx.next();
            while (newDate.getMonth() === currentHDate.getMonth()) newDate = newDate.next();
        } else {
            // Prev Month
            newDate = approx.prev();
            while (newDate.getMonth() === currentHDate.getMonth()) newDate = newDate.prev();
        }

        // Reset to 1st of that month
        setCurrentHDate(new HDate(1, newDate.getMonth(), newDate.getFullYear()));
    };

    const handleJumpApply = () => {
        // Create new HDate from selected Month/Year
        // HDate(day, month, year)
        try {
            const newDate = new HDate(1, parseInt(jumpMonth), parseInt(jumpYear));
            setCurrentHDate(newDate);
            setShowJumpUI(false);
        } catch (e) {
            console.error("Invalid Date Jump", e);
        }
    };

    const getNamesForDate = (hDate) => {
        if (!hDate) return [];
        const day = hDate.getDate();
        const month = hDate.getMonth();
        const monthName = hDate.getMonthName('h');

        // Prepare search terms
        const dayGeo = gematriya(day).replace(/['"]/g, ''); // "כה"
        const monthClean = monthName.replace(/['"]/g, ''); // "ניסן"

        // Strict: "כה ניסן", "כה בניסן"
        // Also include formatted with gershayim if available in utils, but simplify here:
        const searchTerms = [
            `${dayGeo} ${monthClean}`,
            `${dayGeo} ב${monthClean}`,
            `${dayGeo}' ${monthClean}`, // Apostrophe
            `${dayGeo}' ב${monthClean}`,
            `${dayGeo}׳ ${monthClean}`, // Hebrew Gershayim
            `${dayGeo}׳ ב${monthClean}`
        ];

        return kaddishList.filter(item => {
            // 1. Structured Match (Best)
            if (item.hebrew_date && item.hebrew_date.day === day && item.hebrew_date.month === month) return true;

            // 2. Fuzzy Text Match
            if (item.hebrew_date_text) {
                // Check if our day+month terms are inside the text
                // Normalize both side just in case
                const text = normalizeHebrewDate ? normalizeHebrewDate(item.hebrew_date_text) : item.hebrew_date_text;

                // A. Check exact phrases
                if (searchTerms.some(term => item.hebrew_date_text.includes(term) || (normalizeHebrewDate && text.includes(normalizeHebrewDate(term))))) {
                    return true;
                }

                // B. Fallback: Loose match - contains Day AND Month (e.g. "יום ג' לחודש שבט")
                // Be careful with short days like "ב", "ג" matching inside other words.
                // But for "שבט" and "ג׳" it's safer.
                const hasMonth = item.hebrew_date_text.includes(monthClean);
                const hasDay = item.hebrew_date_text.includes(dayGeo);
                if (hasMonth && hasDay) return true;
            }
            return false;
        });
    };

    const selectedDayNames = useMemo(() => getNamesForDate(selectedDate), [selectedDate, kaddishList]);

    // Generate Month Options for Year (Handle Leap Years properly)
    const monthOptions = useMemo(() => {
        const months = [];
        const isLeap = HDate.isLeapYear(jumpYear);

        // Month names strictly in Hebrew
        const hebrewMonths = {
            1: 'ניסן', 2: 'אייר', 3: 'סיון', 4: 'תמוז', 5: 'אב', 6: 'אלול',
            7: 'תשרי', 8: 'חשון', 9: 'כסלו', 10: 'טבת', 11: 'שבט', 12: 'אדר',
            13: 'אדר ב'
        };

        // Order: Tishrei (7) -> Elul (6)
        const order = [7, 8, 9, 10, 11, 12, 13, 1, 2, 3, 4, 5, 6];

        order.forEach(mId => {
            if (mId === 13 && !isLeap) return;
            // Handle Adar in non-leap
            let name = hebrewMonths[mId];
            if (!isLeap && mId === 12) name = 'אדר';
            if (isLeap && mId === 12) name = 'אדר א';

            months.push({ id: mId, name });
        });
        return months;
    }, [jumpYear]);

    // Current Month Display logic
    const displayMonthName = useMemo(() => {
        const m = currentHDate.getMonth();
        const y = currentHDate.getFullYear();
        const isLeap = HDate.isLeapYear(y);
        const hebrewMonths = {
            1: 'ניסן', 2: 'אייר', 3: 'סיון', 4: 'תמוז', 5: 'אב', 6: 'אלול',
            7: 'תשרי', 8: 'חשון', 9: 'כסלו', 10: 'טבת', 11: 'שבט', 12: 'אדר', 13: 'אדר ב'
        };
        let name = hebrewMonths[m];
        if (!isLeap && m === 12) name = 'אדר';
        if (isLeap && m === 12) name = 'אדר א';
        return name;
    }, [currentHDate]);


    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative" dir="rtl">
            {popupItem && <DeceasedPopup data={popupItem} onClose={() => setPopupItem(null)} />}

            {/* Calendar Widget */}
            <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

                {/* Header */}
                <div className="flex justify-between items-center mb-6 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    {/* Right Arrow = Prev Month (Past) */}
                    <button onClick={() => handleMonthChange(-1)} className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-600 transition-all">
                        <ChevronRight className="w-6 h-6" />
                    </button>

                    <div className="relative">
                        {!showJumpUI ? (
                            <button
                                onClick={() => {
                                    setJumpYear(currentYear);
                                    setJumpMonth(currentHDate.getMonth());
                                    setShowJumpUI(true);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-primary hover:text-primary transition-all text-gray-800 font-bold"
                            >
                                <CalendarIcon className="w-5 h-5 text-gray-500" />
                                <span>{displayMonthName} {gematriya(currentYear)}</span>
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                            </button>
                        ) : (
                            <div className="flex items-center gap-2 animate-fade-in absolute top-0 -translate-y-2 bg-white shadow-lg p-2 rounded-xl z-20 border border-orange-100 w-max">
                                <select
                                    value={jumpMonth}
                                    onChange={(e) => {
                                        setJumpMonth(e.target.value);
                                    }}
                                    className="p-2 rounded border border-gray-300 text-sm font-bold outline-none focus:border-primary"
                                >
                                    {monthOptions.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                </select>
                                <input
                                    type="number"
                                    value={jumpYear}
                                    onChange={(e) => setJumpYear(e.target.value)}
                                    className="w-20 p-2 rounded border border-gray-300 text-sm font-bold text-center outline-none focus:border-primary"
                                />
                                <button onClick={handleJumpApply} className="bg-primary text-white p-2 rounded hover:bg-orange-600">
                                    <Search size={16} />
                                </button>
                                <button onClick={() => setShowJumpUI(false)} className="bg-gray-200 text-gray-600 p-2 rounded hover:bg-gray-300">
                                    <X size={16} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Left Arrow = Next Month (Future) */}
                    <button onClick={() => handleMonthChange(1)} className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-600 transition-all">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-2 text-center text-sm mb-2 text-gray-400 font-bold">
                    <div>א</div><div>ב</div><div>ג</div><div>ד</div><div>ה</div><div>ו</div><div>ש</div>
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {daysInMonth.map((day, idx) => {
                        if (!day) return <div key={`empty-${idx}`} />;
                        const isSelected = day.isSameDate(selectedDate);
                        const isToday = day.isSameDate(new HDate());
                        const dayLabel = gematriya(day.getDate()).replace(/['"]/g, '');
                        // Gregorian Date
                        const gDate = day.greg();
                        const gDay = gDate.getDate();
                        const gMonth = gDate.getMonth() + 1; // 0-indexed

                        const hasEvents = getNamesForDate(day).length > 0;

                        return (
                            <div
                                key={idx}
                                onClick={() => setSelectedDate(day)}
                                className={`
                                    min-h-[80px] rounded-xl border p-2 relative cursor-pointer flex flex-col items-center justify-start gap-1 transition-all
                                    ${isSelected ? 'border-primary bg-orange-50' : isToday ? 'border-gray-400 font-bold bg-gray-50' : 'border-gray-100 hover:border-orange-200 hover:shadow-sm'}
                                `}
                            >
                                <span className={`text-xl font-bold ${isSelected || isToday ? 'text-primary' : 'text-gray-800'}`}>
                                    {dayLabel}
                                </span>
                                <span className="text-[10px] text-gray-400 font-sans">
                                    {gDay}/{gMonth}
                                </span>
                                {hasEvents && (
                                    <div className="flex gap-0.5 mt-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Sidebar List */}
            <div className="md:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-[600px]">
                <h3 className="text-lg font-bold border-b border-gray-100 pb-4 mb-4 text-center text-gray-800">
                    אזכרות ליום {formatHebrewDateSmart(formatHebrewDate(selectedDate))}
                </h3>
                <div className="overflow-y-auto space-y-3 flex-1 px-1">
                    {selectedDayNames.length === 0 ? (
                        <div className="text-center text-gray-400 mt-10">אין אזכרות ליום זה</div>
                    ) : (
                        selectedDayNames.map((item, idx) => (
                            <div
                                key={idx}
                                onClick={() => setPopupItem(item)}
                                className="bg-gray-50 p-3 rounded-xl border border-gray-100 hover:border-orange-300 hover:bg-orange-50 cursor-pointer transition-all group"
                            >
                                <div className="font-bold text-gray-800 group-hover:text-primary">{item.name}</div>
                                <div className="text-xs text-gray-500">{formatHebrewDateSmart(item.hebrew_date_text || '')}</div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default HebrewCalendarWidget;
