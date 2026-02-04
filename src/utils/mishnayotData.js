// Mapping of Hebrew letters to Mishnayot chapters (Standard "Otiot Neshama" custom or generic)
// Ideally, this maps to:
// Aleph -> Mikvaot 7 (or similar standard study chapters per letter)
// For this MVP, we will use a generic placeholder mapping or a known subset.
// Since a full mapping is huge, we'll map letters to "Topic Concepts" or specific Perek names.

export const mishnayotLetters = {
    'א': { tractate: 'ברכות', chapter: 'פרק א', description: 'מֵאֵימָתַי קוֹרִין אֶת שְׁמַע...' },
    'ב': { tractate: 'בבא מציעא', chapter: 'פרק ב', description: 'אֵלּוּ מְצִיאוֹת שֶׁלּוֹ...' },
    'ג': { tractate: 'גיטין', chapter: 'פרק ג', description: 'כָּל הַגֵּט שֶׁנִּכְתַּב...' },
    'ד': { tractate: 'דמאי', chapter: 'פרק ד', description: 'הַלּוֹקֵחַ פֵּרוֹת...' },
    'ה': { tractate: 'הוריות', chapter: 'פרק ה', description: 'כֹּהֵן מָשִׁיחַ שֶׁחָטָא...' },
    'ו': { tractate: 'זבחים', chapter: 'פרק ו', description: 'קָדְשֵׁי קָדָשִׁים...' }, // Vav is hard, using Zevachim generic
    'ז': { tractate: 'זבחים', chapter: 'פרק ז', description: 'חַטָּאת הָעוֹף...' },
    'ח': { tractate: 'חולין', chapter: 'פרק ח', description: 'כָּל הַבָּשָׂר אָסוּר...' },
    'ט': { tractate: 'טהרות', chapter: 'פרק ט', description: 'הַזֵּיתִים שֶׁכְּנָסָם...' },
    'י': { tractate: 'יומא', chapter: 'פרק י', description: 'יוֹם הַכִּפּוּרִים אָסוּר...' },
    'כ': { tractate: 'כריתות', chapter: 'פרק א', description: 'שְׁלֹשִׁים וְשֵׁשׁ כָּרֵתוֹת...' },
    'ל': { tractate: 'מעשר שני', chapter: 'פרק א', description: 'מַעֲשֵׂר שֵׁנִי אֵין מוֹכְרִין...' }, // Lamed? using Maaser
    'מ': { tractate: 'מגילה', chapter: 'פרק א', description: 'מְגִלָּה נִקְרֵאת בְּי"א...' },
    'נ': { tractate: 'נדרים', chapter: 'פרק א', description: 'כָּל כִּנּוּיֵי נְדָרִים...' },
    'ס': { tractate: 'סוטה', chapter: 'פרק א', description: 'הַמְקַנֵּא לְאִשְׁתּוֹ...' },
    'ע': { tractate: 'עוקצין', chapter: 'פרק א', description: 'כָּל שֶׁהֵם יָדוֹת...' },
    'פ': { tractate: 'פאה', chapter: 'פרק א', description: 'אֵלּוּ דְבָרִים שֶׁאֵין לָהֶם שִׁעוּר...' },
    'צ': { tractate: 'בבא קמא', chapter: 'פרק א', description: 'אַרְבָּעָה אֲבוֹת נְזִיקִין...' }, // Tzadi?
    'ק': { tractate: 'קידושין', chapter: 'פרק א', description: 'הָאִשָּׁה נִקְנֵית...' },
    'ר': { tractate: 'ראש השנה', chapter: 'פרק א', description: 'אַרְבָּעָה רָאשֵׁי שָׁנִים הֵם...' },
    'ש': { tractate: 'שבת', chapter: 'פרק א', description: 'יְצִיאוֹת הַשַּׁבָּת שְׁתַּיִם...' },
    'ת': { tractate: 'תמיד', chapter: 'פרק א', description: 'בִּשְׁלֹשָׁה מְקוֹמוֹת...' },

    // Final Forms
    'ך': { tractate: 'כריתות', chapter: 'פרק א', description: 'שְׁלֹשִׁים וְשֵׁשׁ כָּרֵתוֹת...' },
    'ם': { tractate: 'מגילה', chapter: 'פרק א', description: 'מְגִלָּה נִקְרֵאת בְּי"א...' },
    'ן': { tractate: 'נדרים', chapter: 'פרק א', description: 'כָּל כִּנּוּיֵי נְדָרִים...' },
    'ף': { tractate: 'פאה', chapter: 'פרק א', description: 'אֵלּוּ דְבָרִים שֶׁאֵין לָהֶם שִׁעוּר...' },
    'ץ': { tractate: 'בבא קמא', chapter: 'פרק א', description: 'אַרְבָּעָה אֲבוֹת נְזִיקִין...' },
};
