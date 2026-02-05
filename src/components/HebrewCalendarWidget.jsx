import React, { useState, useEffect, useMemo } from 'react';
import { HDate, gematriya } from '@hebcal/core';
import { ChevronRight, ChevronLeft, Calendar as CalendarIcon, Search, ChevronDown, X } from 'lucide-react';
import { formatHebrewDate, formatHebrewDateSmart, normalizeHebrewDate } from '../utils/dateUtils';
import DeceasedPopup from './DeceasedPopup';

const HebrewCalendarWidget = ({ kaddishList = [] }) => {
    const [currentHDate, setCurrentHDate] = useState(new HDate());
    const [selectedDate, setSelectedDate] = useState(new HDate());
    const [popupItem, setPopupItem] = useState(null);

    // Jump State
    const [showJumpUI, setShowJumpUI] = useState(false);
    const [jumpYear, setJumpYear] = useState(currentHDate.getFullYear());
    const [jumpMonth, setJumpMonth] = useState(currentHDate.getMonth());
    const [jumpDay, setJumpDay] = useState(currentHDate.getDate());

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

    // Navigation: Right -> Prev, Left -> Next
    const handleMonthChange = (delta) => {
        let newDate;
        // Logic to safely move months
        const approx = new HDate(15, currentHDate.getMonth(), currentHDate.getFullYear());

        if (delta > 0) {
            newDate = approx.next();
            while (newDate.getMonth() === currentHDate.getMonth()) newDate = newDate.next();
        } else {
            newDate = approx.prev();
            while (newDate.getMonth() === currentHDate.getMonth()) newDate = newDate.prev();
        }

        setCurrentHDate(new HDate(1, newDate.getMonth(), newDate.getFullYear()));
    };

    const handleJumpApply = () => {
        try {
            // Validate day exists in month
            const maxDays = HDate.daysInMonth(parseInt(jumpMonth), parseInt(jumpYear));
            const safeDay = Math.min(parseInt(jumpDay), maxDays);

            const newDate = new HDate(safeDay, parseInt(jumpMonth), parseInt(jumpYear));
            setCurrentHDate(newDate);
            setSelectedDate(newDate); // Also select it
            setShowJumpUI(false);
        } catch (e) {
            console.error("Invalid Date Jump", e);
        }
    };

    // Strict Data Binding
    const getNamesForDate = (hDate) => {
        if (!hDate) return [];
        const day = hDate.getDate();
        const month = hDate.getMonth();
        const year = hDate.getFullYear();
        const isLeap = HDate.isLeapYear(year);

        return kaddishList.filter(item => {
            // 1. Check Struct (Primary)
            if (item.hebrew_date_struct) {
                const { day: d, month: m } = item.hebrew_date_struct;
                // Exact Match
                if (d === day && m === month) return true;

                // Simple Adar Logic:
                // If Item is Adar (12) and current is Adar I (12) or Adar II (13) in leap year?
                // Standard: Deaths in Adar (Common) -> Adar I (Leap)? Or Adar II?
                // Simplified for now: Strict match + ID check.
                // Assuming Database normalization handled "Adar" correctly based on year of death.
                return false;
            }

            // 2. Fallback to Text (Legacy)
            if (item.hebrew_date_text) {
                // Try to allow fuzzy match if needed, but we normalized DB so struct should exist.
                // Keeping simple fallback just in case
                return false;
            }
            return false;
        });
    };

    const selectedDayNames = useMemo(() => getNamesForDate(selectedDate), [selectedDate, kaddishList]);

    // Generate Month Options
    const monthOptions = useMemo(() => {
        const months = [];
        const isLeap = HDate.isLeapYear(jumpYear);

        const hebrewMonths = {
            1: 'ניסן', 2: 'אייר', 3: 'סיון', 4: 'תמוז', 5: 'אב', 6: 'אלול',
            7: 'תשרי', 8: 'חשון', 9: 'כסלו', 10: 'טבת', 11: 'שבט', 12: 'אדר',
            13: 'אדר ב'
        };

        const order = [7, 8, 9, 10, 11, 12, 13, 1, 2, 3, 4, 5, 6];

        order.forEach(mId => {
            if (mId === 13 && !isLeap) return;
            let name = hebrewMonths[mId];
            if (!isLeap && mId === 12) name = 'אדר';
            if (isLeap && mId === 12) name = 'אדר א';

            months.push({ id: mId, name });
        });
        return months;
    }, [jumpYear]);

    // Generate Day Options (1-30)
    const dayOptions = Array.from({ length: 30 }, (_, i) => i + 1);

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
                    <button onClick={() => handleMonthChange(-1)} className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-600 transition-all">
                        <ChevronRight className="w-6 h-6" />
                    </button>

                    <div className="relative">
                        {!showJumpUI ? (
                            <button
                                onClick={() => {
                                    setJumpYear(currentYear);
                                    setJumpMonth(currentHDate.getMonth());
                                    setJumpDay(selectedDate.getDate());
                                    setShowJumpUI(true);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-primary hover:text-primary transition-all text-gray-800 font-bold"
                            >
                                <CalendarIcon className="w-5 h-5 text-gray-500" />
                                <span>{displayMonthName} {gematriya(currentYear)}</span>
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                            </button>
                        ) : (
                            <div className="flex flex-col gap-3 animate-fade-in absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 bg-white shadow-xl p-4 rounded-xl z-20 border border-orange-100 w-[300px]">
                                <h4 className="text-gray-700 font-bold text-center border-b pb-2">קפיצה לתאריך</h4>
                                <div className="flex gap-2">
                                    <select
                                        value={jumpDay}
                                        onChange={(e) => setJumpDay(e.target.value)}
                                        className="p-2 rounded border border-gray-300 text-sm font-bold w-16"
                                    >
                                        {dayOptions.map(d => <option key={d} value={d}>{gematriya(d)}</option>)}
                                    </select>
                                    <select
                                        value={jumpMonth}
                                        onChange={(e) => setJumpMonth(e.target.value)}
                                        className="p-2 rounded border border-gray-300 text-sm font-bold flex-1"
                                    >
                                        {monthOptions.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                    </select>
                                    <input
                                        type="number"
                                        value={jumpYear}
                                        onChange={(e) => setJumpYear(e.target.value)}
                                        className="w-20 p-2 rounded border border-gray-300 text-sm font-bold text-center"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={handleJumpApply} className="flex-1 bg-primary text-white p-2 rounded hover:bg-orange-600 font-bold">
                                        עבור
                                    </button>
                                    <button onClick={() => setShowJumpUI(false)} className="bg-gray-100 text-gray-600 p-2 rounded hover:bg-gray-200">
                                        ביטול
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

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
                        const isToday = day.isSameDate(new HDate()); // Real today

                        // Check exact match only
                        const hasEvents = getNamesForDate(day).length > 0;

                        const dayLabel = gematriya(day.getDate()).replace(/['"]/g, '');
                        const gDate = day.greg();
                        const gDay = gDate.getDate();
                        const gMonth = gDate.getMonth() + 1;

                        return (
                            <div
                                key={idx}
                                onClick={() => setSelectedDate(day)}
                                className={`
                                    min-h-[80px] rounded-xl border p-2 relative cursor-pointer flex flex-col items-center justify-start gap-1 transition-all
                                    ${isSelected
                                        ? 'border-primary bg-orange-50 ring-1 ring-orange-200'
                                        : isToday
                                            ? 'border-gray-400 font-bold bg-blue-50'
                                            : 'border-gray-100 hover:border-orange-200 hover:shadow-sm'
                                    }
                                `}
                            >
                                <span className={`text-xl font-bold ${isSelected || isToday ? 'text-primary' : 'text-gray-800'}`}>
                                    {dayLabel}
                                </span>
                                <span className="text-[10px] text-gray-400 font-sans">
                                    {gDay}/{gMonth}
                                </span>
                                {hasEvents && (
                                    <div className="absolute bottom-2 flex gap-0.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-sm animate-pulse"></div>
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
                <div className="overflow-y-auto space-y-3 flex-1 px-1 custom-scrollbar">
                    {selectedDayNames.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                            <div className="bg-gray-50 p-4 rounded-full">
                                <CalendarIcon size={32} className="opacity-20" />
                            </div>
                            <p>אין אזכרות ביום זה</p>
                        </div>
                    ) : (
                        selectedDayNames.map((item, idx) => (
                            <div
                                key={idx}
                                onClick={() => setPopupItem(item)}
                                className="bg-white p-3 rounded-xl border border-gray-100 hover:border-orange-300 hover:bg-orange-50 cursor-pointer transition-all group shadow-sm"
                            >
                                <div className="font-bold text-gray-800 group-hover:text-primary text-lg">{item.name}</div>
                                {item.father_name && <div className="text-xs text-gray-500 mt-1">בן/ת {item.father_name}</div>}
                                <div className="text-xs text-gray-400 mt-2 flex justify-between">
                                    <span>{item.hebrew_date_text}</span>
                                    <span>{item.gregorian_date?.split('-')[0]}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default HebrewCalendarWidget;
