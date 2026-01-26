import React, { useState, useEffect, useMemo } from 'react';
import { HDate, HebrewCalendar, Location, gematriya } from '@hebcal/core';
import { ChevronRight, ChevronLeft, Calendar } from 'lucide-react';

const HebrewCalendarWidget = ({ kaddishList = [] }) => {
    const [currentHDate, setCurrentHDate] = useState(new HDate());
    const [selectedDate, setSelectedDate] = useState(new HDate());

    // Ensure accurate month/year rendering
    const currentMonthName = currentHDate.getMonthName('h');
    const currentYear = currentHDate.getFullYear();

    // Get days in current Hebrew month
    const daysInMonth = useMemo(() => {
        const days = [];
        const year = currentHDate.getFullYear();
        const month = currentHDate.getMonth();
        const daysCount = HDate.daysInMonth(month, year);

        for (let d = 1; d <= daysCount; d++) {
            days.push(new HDate(d, month, year));
        }
        return days;
    }, [currentHDate]);

    // Navigation
    const changeMonth = (delta) => {
        const currentAbs = currentHDate.abs();
        const newAbs = currentAbs + (delta * 29);
        const newDate = new HDate(newAbs);
        setCurrentHDate(new HDate(1, newDate.getMonth(), newDate.getFullYear()));
    };

    // Helper: Normalize Hebrew text for fuzzy comparison
    // Removes quotes, gershayim, and leading 'b' (ב) from months if present
    const normalizeHebrew = (text) => {
        if (!text) return '';
        return text
            .replace(/['"]/g, '') // Remove quotes
            .replace(/\s+/g, ' ') // Collapse spaces
            .trim();
    };

    // Filter Kaddish names for a specific Hebrew Date
    const getNamesForDate = (hDate) => {
        const day = hDate.getDate();
        const monthName = hDate.getMonthName('h'); // e.g., "ניסן"

        // Construct variations: "כה ניסן", "כה בניסן"
        // We compare normalized versions
        const dayGeo = gematriya(day).replace(/['"]/g, ''); // "כה"
        const monthClean = monthName.replace(/['"]/g, ''); // "ניסן"

        // Possible patterns in DB: "כ״ה בניסן", "כה ניסן", "כ'ה בשבט"
        const searchTerms = [
            `${dayGeo} ${monthClean}`,     // "כה ניסן"
            `${dayGeo} ב${monthClean}`,    // "כה בניסן"
        ];

        return kaddishList.filter(item => {
            // 1. Structured Match (Best)
            if (item.hebrew_date &&
                item.hebrew_date.day === day &&
                item.hebrew_date.month === hDate.getMonth()) {
                return true;
            }

            // 2. Fuzzy Text Match
            if (item.hebrew_date_text) {
                const normalizedItem = normalizeHebrew(item.hebrew_date_text);
                // Check if our day+month patterns exist in the item text
                return searchTerms.some(term => normalizedItem.includes(term));
            }

            return false;
        });
    };

    const selectedDayNames = useMemo(() => getNamesForDate(selectedDate), [selectedDate, kaddishList]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Calendar Grid */}
            <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-6">
                    <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-100 rounded-full"><ChevronRight /></button>
                    <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                        <Calendar className="text-primary" />
                        {currentMonthName} {gematriya(currentYear)}
                    </h2>
                    <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft /></button>
                </div>

                <div className="grid grid-cols-7 gap-2 text-center text-sm mb-2 text-gray-500 font-bold">
                    <div>א</div><div>ב</div><div>ג</div><div>ד</div><div>ה</div><div>ו</div><div>ש</div>
                </div>

                <div className="grid grid-cols-7 gap-1 md:gap-2">
                    {daysInMonth.map((day, idx) => {
                        const names = getNamesForDate(day);
                        const isToday = day.isSameDate(new HDate());
                        const isSelected = day.isSameDate(selectedDate);

                        // Render strictly the day letters, no year
                        const dayLabel = gematriya(day.getDate());

                        return (
                            <div
                                key={idx}
                                onClick={() => setSelectedDate(day)}
                                className={`
                                    min-h-[60px] md:min-h-[80px] border rounded-xl p-2 text-right relative cursor-pointer transition-all duration-200
                                    ${isSelected ? 'border-primary bg-orange-50 ring-2 ring-primary/20' :
                                        isToday ? 'border-gray-300 bg-gray-50' : 'border-gray-100 hover:border-primary/50 hover:shadow-md'}
                                `}
                            >
                                <span className={`text-sm ${isSelected ? 'text-primary font-medium' : 'text-gray-700'}`}>
                                    {dayLabel}
                                </span>

                                {names.length > 0 && (
                                    <div className="mt-1 flex justify-end">
                                        <span className="bg-black text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                                            {names.length}
                                        </span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Selected Day View */}
            <div className="md:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
                <h3 className="text-lg font-bold border-b border-gray-100 pb-4 mb-4">
                    אזכרות ליום {gematriya(selectedDate.getDate())} ב{selectedDate.getMonthName('h')}
                    <span className="block text-sm text-gray-400 font-normal mt-1">{selectedDate.render('he')}</span>
                </h3>

                <div className="flex-grow overflow-y-auto max-h-[400px]">
                    {selectedDayNames.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">
                            <p>אין אזכרות בתאריך זה</p>
                        </div>
                    ) : (
                        <ul className="space-y-3">
                            {selectedDayNames.map((item, idx) => (
                                <li key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <div className="font-bold text-gray-800">{item.name}</div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {item.details?.father_name ? `בן/בת ${item.details.father_name}` : ''}
                                    </div>
                                    <span className="text-xs bg-white border border-gray-200 px-2 py-0.5 rounded-full mt-2 inline-block">
                                        {item.type || 'כללי'}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                    <button className="w-full bg-primary/10 text-primary font-bold py-2 rounded-lg hover:bg-primary/20 transition-colors text-sm">
                        + הוסף אזכרה ליום זה
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HebrewCalendarWidget;
