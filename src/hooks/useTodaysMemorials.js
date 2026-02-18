import { useState, useEffect, useMemo } from 'react';
import { HDate, gematriya } from '@hebcal/core';
import { useData } from '../context/DataContext';

export const useTodaysMemorials = () => {
    const { memorials, loading } = useData();
    const [currentHDate, setCurrentHDate] = useState(new HDate());

    // Update date on mount (and potentially set up an interval if needed, but overkill for now)
    useEffect(() => {
        setCurrentHDate(new HDate());
    }, []);

    const todaysNames = useMemo(() => {
        if (!memorials.length) return [];

        const todayDay = currentHDate.getDate();
        const todayMonth = currentHDate.getMonth();

        return memorials.filter(item => {
            // Priority 1: Check via Gregorian Date converted to Hebrew Yahrzeit
            if (item.death_date_gregorian) {
                try {
                    const deathHDate = new HDate(new Date(item.death_date_gregorian));
                    return deathHDate.getDate() === todayDay && deathHDate.getMonth() === todayMonth;
                } catch (e) {
                    // console.warn("Invalid date in record:", item);
                }
            }

            // Priority 2: Parse Hebrew String (Simple/Fuzzy)
            if (item.death_date_hebrew) {
                const todayStr = gematriya(todayDay).replace(/['"]/g, '');
                const monthName = currentHDate.getMonthName('h');

                // Strip quotes from item date for comparison
                const cleanItemDate = item.death_date_hebrew.replace(/['"]/g, '');

                return cleanItemDate.includes(todayStr) && item.death_date_hebrew.includes(monthName);
            }

            return false;
        });
    }, [currentHDate, memorials]);

    const hebrewDateStr = `${gematriya(currentHDate.getDate())} ב${currentHDate.getMonthName('h')}`;

    return {
        todaysNames,
        loading,
        hebrewDateStr,
        count: todaysNames.length
    };
};
