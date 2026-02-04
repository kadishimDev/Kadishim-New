
import { HDate, gematriya } from '@hebcal/core';

console.log("--- TEST START ---");

// Test 1: Date Utils Logic (simulated)
const normalizeHebrew = (text) => {
    if (!text) return '';
    return text.replace(/['"]/g, '').replace(/\s+/g, ' ').trim();
};

console.log("Normalize Check:", normalizeHebrew('כ"ב בטבת') === 'כב בטבת');

// Test 2: HDate Navigation Logic from Widget
let currentHDate = new HDate();
console.log(`Current Date: ${currentHDate.toString()}`);

// Simulation of changeMonth logic
const changeMonth = (delta) => {
    // Exact logic from HebrewCalendarWidget
    const currentAbs = currentHDate.abs();

    console.log(`\nAttempting move by ${delta} months...`);

    // Reproducing the widget's logic to check for NaN or garbage
    // Approx 29.5 days per month.
    const newAbs = currentAbs + (delta * 29);
    const approxDate = new HDate(newAbs);
    const newDate = new HDate(1, approxDate.getMonth(), approxDate.getFullYear());

    console.log(`Result: ${newDate.toString()} (Month: ${newDate.getMonthName('h')})`);
    return newDate;
};

// Navigate Back
currentHDate = changeMonth(-1);
// Navigate Forward
currentHDate = changeMonth(1);

console.log("--- TEST END ---");
