import React, { useState, useMemo, useEffect } from 'react';
import { HDate, gematriya } from '@hebcal/core';
import { ChevronRight, ChevronLeft, X, Check } from 'lucide-react';
import { getHebrewMonths, formatHebrewDate as dateUtilsFormat } from '../utils/dateUtils';

const HebrewDatePicker = ({ isOpen, onClose, onSelect, initialDate }) => {
    // initialDate can be HDate or Date or null
    const [currentHDate, setCurrentHDate] = useState(new HDate());
    const [selectedDate, setSelectedDate] = useState(new HDate());

    // Sync with initialDate when opening
    useEffect(() => {
        if (isOpen && initialDate) {
            const d = new HDate(initialDate);
            setCurrentHDate(d);
            setSelectedDate(d);
        }
    }, [isOpen, initialDate]);

    // Jump State
    const [jumpYear, setJumpYear] = useState(currentHDate.getFullYear());
    const [jumpMonth, setJumpMonth] = useState(currentHDate.getMonth());

    // Update jump state when current HDate changes
    useEffect(() => {
        setJumpYear(currentHDate.getFullYear());
        setJumpMonth(currentHDate.getMonth());
    }, [currentHDate]);

    const daysInMonth = useMemo(() => {
        const arr = [];
        const year = currentHDate.getFullYear();
        const month = currentHDate.getMonth();
        const daysCount = HDate.daysInMonth(month, year);
        const firstDayOfWeek = new HDate(1, month, year).getDay();

        for (let i = 0; i < firstDayOfWeek; i++) arr.push(null);
        for (let d = 1; d <= daysCount; d++) arr.push(new HDate(d, month, year));
        return arr;
    }, [currentHDate]);

    // Helper for Hebrew Month Names
    const getHebrewMonthName = (m, y) => {
        const hebrewMonthNames = {
            1: 'ניסן', 2: 'אייר', 3: 'סיון', 4: 'תמוז', 5: 'אב', 6: 'אלול',
            7: 'תשרי', 8: 'חשון', 9: 'כסלו', 10: 'טבת', 11: 'שבט', 12: 'אדר',
            13: 'אדר ב'
        };
        const isLeap = HDate.isLeapYear(y);
        let name = hebrewMonthNames[m];
        if (isLeap && m === 12) name = 'אדר א';
        if (!isLeap && m === 12) name = 'אדר'; // Explicit standard Adar
        return name;
    };

    // Year Options (Current +/- 60 years)
    const yearOptions = useMemo(() => {
        const current = new HDate().getFullYear();
        const start = current - 80;
        const end = current + 20;
        const years = [];
        for (let y = start; y <= end; y++) {
            const letters = gematriya(y);
            // Add 'Hei' prefix if missing (standard for 5000s)
            const formatted = letters.startsWith('ה') ? letters : `ה${letters}`;
            years.push({ value: y, label: formatted });
        }
        return years.reverse(); // Newest first
    }, []);

    const formatYearLabel = (y) => {
        const letters = gematriya(y);
        return letters.startsWith('ה') ? letters : `ה${letters}`;
    };

    if (!isOpen) return null;

    const handleMonthChange = (delta) => {
        let newDate;
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

    const handleJump = () => {
        const newDate = new HDate(1, parseInt(jumpMonth), parseInt(jumpYear));
        setCurrentHDate(newDate);
    };

    const handleSelect = () => {
        onSelect(selectedDate);
        onClose();
    };

    const displayMonthName = getHebrewMonthName(currentHDate.getMonth(), currentHDate.getFullYear());
    const currentYear = currentHDate.getFullYear();


    // Better Month Options Logic
    const months = [];
    const isLeap = HDate.isLeapYear(jumpYear);
    const order = [7, 8, 9, 10, 11, 12, 13, 1, 2, 3, 4, 5, 6]; // Tishrei start

    const generatedMonthOptions = order.map(mId => {
        if (mId === 13 && !isLeap) return null;
        return { id: mId, name: getHebrewMonthName(mId, jumpYear) };
    }).filter(Boolean);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative" dir="rtl">
                {/* Header */}
                <div className="bg-primary p-4 text-white flex justify-between items-center">
                    <h3 className="font-bold text-lg">בחר תאריך עברי</h3>
                    <button onClick={onClose} className="hover:bg-white/20 p-1 rounded transition">
                        <X size={24} />
                    </button>
                </div>

                {/* Controls */}
                <div className="p-4 bg-gray-50 border-b border-gray-100 flex flex-col gap-3">
                    <div className="flex gap-2">
                        <select
                            value={jumpMonth}
                            onChange={(e) => setJumpMonth(e.target.value)}
                            className="flex-1 p-2 rounded border border-gray-300 font-bold text-sm"
                        >
                            {generatedMonthOptions.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>

                        <select
                            value={jumpYear}
                            onChange={(e) => setJumpYear(e.target.value)}
                            className="w-32 p-2 rounded border border-gray-300 font-bold text-center text-sm"
                        >
                            {yearOptions.map(y => (
                                <option key={y.value} value={y.value}>{y.label}</option>
                            ))}
                        </select>

                        <button
                            onClick={handleJump}
                            className="bg-dark text-white px-4 rounded font-bold hover:bg-gray-800"
                        >
                            עבור
                        </button>
                    </div>

                    <div className="flex justify-between items-center mt-2">
                        <button onClick={() => handleMonthChange(1)} className="p-1 hover:bg-gray-200 rounded"><ChevronRight /></button>
                        <span className="font-bold text-lg text-primary">
                            {displayMonthName} {formatYearLabel(currentYear)}
                        </span>
                        <button onClick={() => handleMonthChange(-1)} className="p-1 hover:bg-gray-200 rounded"><ChevronLeft /></button>
                    </div>
                </div>

                {/* Grid */}
                <div className="p-4">
                    <div className="grid grid-cols-7 text-center font-bold text-gray-400 text-xs mb-2">
                        <div>א</div><div>ב</div><div>ג</div><div>ד</div><div>ה</div><div>ו</div><div>ש</div>
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {daysInMonth.map((day, i) => {
                            if (!day) return <div key={`empty-${i}`} />;
                            const isSelected = day.isSameDate(selectedDate);
                            const isToday = day.isSameDate(new HDate());

                            return (
                                <button
                                    key={i}
                                    onClick={() => setSelectedDate(day)}
                                    className={`
                                        aspect-square rounded-lg flex flex-col items-center justify-center transition-all
                                        ${isSelected ? 'bg-primary text-white shadow-lg scale-105' :
                                            isToday ? 'bg-orange-50 text-orange-600 border border-orange-200' :
                                                'hover:bg-gray-100 text-gray-700'}
                                    `}
                                >
                                    <span className="font-bold text-lg">{gematriya(day.getDate())}</span>
                                    <span className="text-[10px] opacity-70">{day.getDate()}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50">
                    <div className="text-sm text-gray-500">
                        {dateUtilsFormat(selectedDate)}
                    </div>
                    <button
                        onClick={handleSelect}
                        className="bg-primary text-white px-6 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-orange-600 shadow-lg hover:shadow-xl transition-all"
                    >
                        <Check size={18} />
                        בחר תאריך זה
                    </button>
                </div>
            </div>
        </div>
    );
};

// Helper for formatted date display
const formatHebrewDateDisplay = (hDate) => {
    // Rely on the robust util
    return dateUtilsFormat(hDate);
};

export default HebrewDatePicker;
