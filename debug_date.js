
import { getHebrewDateParts, getFormattedHebrewDate } from './src/utils/hebrewDate.js';

// Mock Intl if needed or just run in node (Node 14+ supports Intl fully)
// We need to see what `getHebrewDateParts` returns for TODAY.

console.log("Date Parts:", getHebrewDateParts());
console.log("Formatted:", getFormattedHebrewDate());

// Check what month Shevat is considered in this environment
const date = new Date();
const options = { calendar: 'hebrew', day: 'numeric', month: 'numeric', year: 'numeric' };
const parts = new Intl.DateTimeFormat('en-u-ca-hebrew', options).formatToParts(date);
console.log("Raw Parts:", parts);
