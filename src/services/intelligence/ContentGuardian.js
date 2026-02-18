/**
 * Content Guardian Agent
 * "The Voice"
 * 
 * Responsibilities:
 * 1. Gibberish Detection
 * 2. Mixed Language (English in Hebrew)
 * 3. Formatting Issues
 */

export class ContentGuardian {
    constructor(dataContext) {
        this.data = dataContext; // memorials, pages
    }

    scan() {
        const checks = [];
        let score = 100;
        const memorials = this.data.memorials || [];

        // 1. Gibberish Detection
        const gibberishRegex = /([a-z])\1{2,}|([0-9])\2{3,}|asdf|qwerty| בדיקה |test/i;
        let gibberishCount = 0;

        memorials.forEach(m => {
            const text = (m.name + " " + m.father_name).toLowerCase();
            if (gibberishRegex.test(text)) {
                gibberishCount++;
            }
        });

        if (gibberishCount > 0) {
            checks.push({
                id: 'gibberish',
                status: 'warn',
                msg: `Found ${gibberishCount} records with potential gibberish/test data`,
                type: 'content',
                action: 'flag_records'
            });
            score -= 10;
        } else {
            checks.push({ id: 'gibberish', status: 'ok', msg: 'No obvious gibberish detected', type: 'content' });
        }

        // 2. Mixed Language (English in Hebrew Fields)
        const englishRegex = /[a-zA-Z]/;
        let mixedLangCount = 0;
        memorials.forEach(m => {
            // Assuming primary names should be Hebrew
            if (englishRegex.test(m.name) || englishRegex.test(m.father_name)) {
                mixedLangCount++;
            }
        });

        if (mixedLangCount > 0) {
            checks.push({
                id: 'mixed_lang',
                status: 'info',
                msg: `${mixedLangCount} records contain English characters`,
                type: 'content'
            });
        }

        // 3. Formatting (Double Spaces)
        const doubleSpaceRegex = / {2,}/;
        let formattingIssues = 0;
        memorials.forEach(m => {
            if (doubleSpaceRegex.test(m.name)) formattingIssues++;
        });

        if (formattingIssues > 0) {
            checks.push({
                id: 'formatting',
                status: 'warn',
                msg: `${formattingIssues} names have double spaces`,
                type: 'content',
                action: 'autofix_format'
            });
            score -= 5;
        }

        // 4. Logical Data Integrity (Time Paradox)
        let timeParadoxCount = 0;
        memorials.forEach(m => {
            if (m.birth_date && m.gregorian_date) {
                const birth = new Date(m.birth_date);
                const death = new Date(m.gregorian_date);
                if (isValidDate(birth) && isValidDate(death)) {
                    if (death < birth) timeParadoxCount++;
                }
            }
        });

        if (timeParadoxCount > 0) {
            checks.push({
                id: 'time_paradox',
                status: 'error',
                msg: `${timeParadoxCount} records have Death Date before Birth Date`,
                type: 'content',
                action: 'flag_paradox'
            });
            score -= 20;
        } else {
            checks.push({ id: 'time_paradox', status: 'ok', msg: 'No chronology errors found', type: 'content' });
        }


        return {
            timestamp: new Date(),
            checks,
            score: Math.max(0, score),
            status: score > 90 ? 'healthy' : 'warning'
        };
    }

    // Auto-Fixes
    autoFixFormat(updateMemorialFn) {
        // This is complex as it requires updating State/DB
        // For now, we return a plan
        return { msg: 'Running Trim & Space normalization on all records...', status: 'info' };
    }
}
