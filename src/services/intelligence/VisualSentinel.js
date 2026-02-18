/**
 * Visual Sentinel Agent
 * "The Eyes"
 * 
 * Responsibilities:
 * 1. DOM Overflow Detection
 * 2. Broken Assets (Images, Links)
 * 3. Empty Containers
 */

export class VisualSentinel {
    scan() {
        const checks = [];
        let score = 100;

        // 1. Overflow Detection
        const allElements = document.querySelectorAll('*');
        const docWidth = document.documentElement.clientWidth;
        let overflowCount = 0;

        allElements.forEach(el => {
            if (el.scrollWidth > Math.ceil(docWidth) && // Rounded up to avoid sub-pixel false positives
                getComputedStyle(el).overflowX !== 'hidden' &&
                getComputedStyle(el).overflowX !== 'scroll') {
                // Verify it's not the body/html
                if (el.tagName !== 'BODY' && el.tagName !== 'HTML') {
                    overflowCount++;
                    // Highlight for debug?
                    // el.style.outline = '2px solid red'; 
                }
            }
        });

        if (overflowCount > 0) {
            checks.push({
                id: 'overflow',
                status: 'error',
                msg: `Found ${overflowCount} elements causing horizontal overflow`,
                type: 'visual',
                action: 'autofit'
            });
            score -= 20;
        } else {
            checks.push({ id: 'overflow', status: 'ok', msg: 'No Layout Overflow detected', type: 'visual' });
        }

        // 2. Broken Images
        const images = document.querySelectorAll('img');
        let brokenImages = 0;
        images.forEach(img => {
            if (!img.complete || img.naturalWidth === 0) {
                brokenImages++;
            }
        });

        if (brokenImages > 0) {
            checks.push({
                id: 'broken_images',
                status: 'warn',
                msg: `Found ${brokenImages} broken images`,
                type: 'visual',
                action: 'fix_images'
            });
            score -= 10;
        } else {
            checks.push({ id: 'broken_images', status: 'ok', msg: 'All images loaded correctly', type: 'visual' });
        }

        // 3. Empty Critical Containers (Heuristic)
        // Checks for divs with class "card" or "section" that have no text content
        const potentiallyEmpty = document.querySelectorAll('.card, section, article');
        let emptyCount = 0;
        potentiallyEmpty.forEach(el => {
            if (el.innerText.trim().length === 0 && el.querySelectorAll('img').length === 0) {
                emptyCount++;
            }
        });

        if (emptyCount > 0) {
            checks.push({ id: 'empty_sections', status: 'warn', msg: `Found ${emptyCount} empty layout containers`, type: 'visual' });
        }

        return {
            timestamp: new Date(),
            checks,
            score: Math.max(0, score),
            status: score > 90 ? 'healthy' : 'warning'
        };
    }

    // Auto-Fixes
    fixOverflow() {
        document.body.style.overflowX = 'hidden';
        document.documentElement.style.overflowX = 'hidden';

        // Also try to find offender and set max-width
        const docWidth = document.documentElement.clientWidth;
        document.querySelectorAll('*').forEach(el => {
            if (el.scrollWidth > docWidth) {
                el.style.maxWidth = '100%';
                el.style.overflowX = 'hidden'; // Force clip
            }
        });

        return { msg: 'Applied global overflow protection & constrained offenders', status: 'success' };
    }

    fixBrokenImages() {
        const images = document.querySelectorAll('img');
        let fixed = 0;
        images.forEach(img => {
            if (!img.complete || img.naturalWidth === 0) {
                img.style.display = 'none'; // Hide them for now as a fix
                fixed++;
            }
        });
        return { msg: `Hidden ${fixed} broken images`, status: 'success' };
    }
}
