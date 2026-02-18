import { Analytics } from '../analytics';

/**
 * Success Oracle Agent
 * "The Brain"
 * 
 * Responsibilities:
 * 1. Engagement Analysis (Top Pages, Zero Views)
 * 2. Conversion Tracking (Mock for now, e.g. Requests vs Visits)
 * 3. Trend Analysis
 */

export class SuccessOracle {
    constructor(dataContext) {
        this.data = dataContext; // memorials, pages
    }

    scan() {
        const checks = [];
        let score = 100;

        const stats = Analytics.getStats();
        const totalVisits = stats.totalVisits || 0;

        // 1. General Engagement
        if (totalVisits === 0) {
            checks.push({
                id: 'no_traffic',
                status: 'warn',
                msg: 'No site traffic detected yet.',
                type: 'success'
            });
            score -= 10; // Not a critical failure, just sad
        } else {
            checks.push({
                id: 'traffic_ok',
                status: 'ok',
                msg: `Site active with ${totalVisits} total visits`,
                type: 'success'
            });
        }

        // 2. Dead Pages (Content with 0 views)
        // We compare known pages/memorials vs stats
        const deadPages = [];
        this.data.pages.forEach(p => {
            const path = `/page/${p.slug}`;
            if (!stats.pageViews[path]) deadPages.push(p.title);
        });

        if (deadPages.length > 0) {
            const sample = deadPages.slice(0, 3).join(', ');
            checks.push({
                id: 'dead_content',
                status: 'info',
                msg: `${deadPages.length} pages have 0 views (e.g. ${sample})`,
                type: 'success',
                action: 'promote_content'
            });
            score -= 5;
        } else {
            checks.push({ id: 'content_active', status: 'ok', msg: 'All content pages have at least 1 view', type: 'success' });
        }

        // 3. Top Performer
        const top = Analytics.getTopPages(1)[0];
        if (top) {
            checks.push({
                id: 'top_page',
                status: 'ok',
                msg: `Top Content: ${top.path} (${top.views} views)`,
                type: 'success'
            });
        }

        return {
            timestamp: new Date(),
            checks,
            score: Math.max(0, score),
            status: score > 90 ? 'healthy' : 'warning'
        };
    }

    // Auto-Fixes
    promoteContent() {
        // In a real app, this might add to a "Featured" list
        return { msg: 'Added top 5 stagnant pages to "Suggested" queue (Simulation)', status: 'success' };
    }
}
