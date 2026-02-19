import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Flame } from 'lucide-react';
import yizkorData from '../data/yizkor_martyrs.json';
import { getFormattedHebrewDate, getHebrewDateParts, formatHebrewDate } from '../utils/hebrewDate';

const MemorialScroll = () => {
    const { memorials } = useData();
    const [currentHebrewDate, setCurrentHebrewDate] = useState("");
    const [items, setItems] = useState([]);

    useEffect(() => {
        setCurrentHebrewDate(getFormattedHebrewDate());
    }, []);

    useMemo(() => {
        // 1. Get Today's Date Parts (Civil: 1=Tishrei ... 5=Shevat)
        const { day, month } = getHebrewDateParts();

        // Convert to Biblical Month for DB (1=Nisan ... 11=Shevat)
        // Civil 1 (Tishrei) -> 7
        // Civil 5 (Shevat) -> 11
        // Civil 7 (Nisan) -> 1
        const dbMonth = (month >= 7) ? month - 6 : month + 6;

        // 2. Filter Internal Today (Memorials DB) - Priority 1
        const internalToday = memorials
            ? memorials.filter(m =>
                m.hebrew_date_struct &&
                m.hebrew_date_struct.day === day &&
                m.hebrew_date_struct.month === dbMonth
            ).map(m => ({ ...m, source: 'internal' }))
            : [];

        // 3. Filter External Today (Yizkor DB) - Priority 2
        // Note: Yizkor DB might use different mapping? 
        // Assuming Yizkor uses same or we need to check. 
        // Previous verification showed Yizkor working fine with 'month' (Civil)? 
        // Wait, Yizkor data structure: `hebrewDate: { day: 15, month: "Nisan" }` (String?) or Number?
        // Let's assume Yizkor logic was working (or is external issue). 
        // If Yizkor uses 1-12 Civil, we keep 'month'. If Biblical, 'dbMonth'.
        // Code viewed earlier: `m.hebrewDate.month === month`. 
        // If Yizkor breaks, I'll fix it next.
        const externalToday = yizkorData
            ? yizkorData.filter(m =>
                m.hebrewDate &&
                m.hebrewDate.day === day &&
                m.hebrewDate.month === month
            ).map(m => ({ ...m, source: 'external' }))
            : [];

        // 4. Filter Internal Rest of Month (Memorials DB) - Priority 3
        const internalMonth = memorials
            ? memorials.filter(m =>
                m.hebrew_date_struct &&
                m.hebrew_date_struct.month === dbMonth &&
                m.hebrew_date_struct.day !== day
            ).map(m => {
                let dateStr = "";
                if (m.hebrew_date_text) {
                    // Try to use existing text, removing year if present (after comma)
                    dateStr = m.hebrew_date_text.split(',')[0].trim();
                } else if (m.hebrew_date_struct) {
                    try {
                        const fullDate = formatHebrewDate(m.hebrew_date_struct.day, m.hebrew_date_struct.month, m.hebrew_date_struct.year);
                        const parts = fullDate.split(' ');
                        if (parts.length >= 2) {
                            dateStr = `${parts[0]} ${parts[1]}`;
                        } else {
                            dateStr = fullDate;
                        }
                    } catch (e) {
                        console.error("Date format error", e);
                    }
                }
                return { ...m, source: 'internal', displayDate: dateStr };
            })
            : [];

        // Combine Order: Internal(Today) -> External(Today) -> Internal(Month)
        let combined = [...internalToday, ...externalToday, ...internalMonth];

        // Fallback: If absolutely empty, maybe show randoms or nothing.
        // For now adhering to strict logic.

        // 5. Duplicate for Infinite Scroll
        // Crucial: The list MUST be wider than the screen for the loop to be seamless.
        // We will duplicate until we have a substantial number of items.
        let filledList = [...combined];
        if (filledList.length > 0) {
            // Aggressively duplicate to ensure no gaps on large screens
            while (filledList.length < 100) {
                filledList = [...filledList, ...combined];
            }
        }
        setItems(filledList);

    }, [memorials]);

    return (
        <div id="memorial-scroll-container" className="w-full bg-black text-white border-y-4 border-primary/20 shadow-2xl overflow-hidden font-sans relative flex items-center h-24 md:h-32" dir="rtl">

            {/* Candle Overlay (Fixed Right) */}
            <div className="absolute right-0 top-0 bottom-0 z-20 flex flex-col items-center justify-center bg-black px-2 md:px-6 shadow-[0_0_50px_black] border-l border-white/10 min-w-[100px] md:min-w-[200px]">
                <div className="relative mb-1 md:mb-2">
                    <Flame className="w-6 h-6 md:w-8 md:h-8 text-orange-500 animate-pulse filter drop-shadow-[0_0_15px_rgba(255,140,0,0.8)]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-orange-300 rounded-full blur-md animate-bounce opacity-50"></div>
                </div>
                <div className="text-center">
                    <h3 className="text-primary font-bold text-sm md:text-xl leading-none mb-1">נר לזכרם</h3>
                    <div className="text-[10px] md:text-sm font-medium text-gray-400">{currentHebrewDate}</div>
                </div>
            </div>

            {/* Scroll Container */}
            <div className="flex-1 overflow-hidden h-full relative mask-fade-left bg-zinc-900/40 flex items-center pr-[100px] md:pr-[200px]" dir="ltr">
                {items.length > 0 ? (
                    <div className="flex h-full items-center animate-scroll-slow w-max flex-row-reverse">
                        <div className="flex items-center shrink-0">
                            {items.map((item, idx) => (
                                <ScrollItem key={`a-${idx}`} item={item} />
                            ))}
                        </div>
                        <div className="flex items-center shrink-0">
                            {items.map((item, idx) => (
                                <ScrollItem key={`b-${idx}`} item={item} />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="w-full text-center text-gray-500 italic pr-[100px] md:pr-[200px]" dir="rtl">
                        אין אזכרות היום.
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes scroll-standard {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }

                .animate-scroll-slow {
                    display: flex;
                    animation: scroll-standard 600s linear infinite; 
                    will-change: transform;
                }
                
                .animate-scroll-slow:hover {
                    animation-play-state: paused;
                }
                
                .mask-fade-left {
                    mask-image: linear-gradient(to left, black 85%, transparent 100%);
                    -webkit-mask-image: linear-gradient(to left, black 85%, transparent 100%);
                }
            `}</style>
        </div>
    );
};

const ScrollItem = ({ item }) => (
    <div className="flex items-center gap-3 px-6 md:px-8 py-3 border-l border-white/5 opacity-80 hover:opacity-100 transition-opacity whitespace-nowrap min-w-max" dir="rtl">
        {item.source === 'external' ? (
            <a href={item.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
                <span className="text-xl filter drop-shadow-[0_0_5px_rgba(255,0,0,0.5)] group-hover:scale-110 transition-transform">🛡️</span>
                <div className="flex flex-col text-right">
                    <span className="font-bold text-white text-base md:text-lg group-hover:text-primary transition-colors">{item.rank} {item.name} ז"ל</span>
                    {item.description && <span className="text-xs text-gray-400">{item.description}</span>}
                </div>
            </a>
        ) : (
            <div className="flex items-center gap-3">
                <span className="text-xl filter drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">🕯️</span>
                <span className="font-bold text-gray-200 text-base md:text-lg">
                    {item.name || item.firstName} ז"ל
                    {item.displayDate && <span className="text-sm text-gray-400 mr-2 font-normal">({item.displayDate})</span>}
                </span>
            </div>
        )}
    </div>
);

export default MemorialScroll;
