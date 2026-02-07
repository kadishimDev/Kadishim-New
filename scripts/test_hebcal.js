
import { HDate, gematriya } from '@hebcal/core';

const h = new HDate();
console.log("Month 'h':", h.getMonthName('h'));
console.log("Month 'a':", h.getMonthName('a')); // Ashkenaz?
console.log("Gematriya 23:", gematriya(23));

const d = new HDate(23, 10, 5760);
console.log("Date(23, 10, 5760) Month:", d.getMonth()); // Should be 10? Tevet?
console.log("Date(23, 10, 5760) Year:", d.getFullYear());

const leap = new HDate(15, 12, 5784); // Adar I?
console.log("Leap Adar:", leap.getMonthName('h'), leap.getMonth());
const leap2 = new HDate(15, 13, 5784); // Adar II?
console.log("Leap Adar 2:", leap2.getMonthName('h'), leap2.getMonth());
