
// Simple Local Storage Analytics
const STORAGE_KEY = 'kadishim_analytics_v1';

export const Analytics = {
    // Increment view count for a path
    trackPage: (path) => {
        try {
            const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"pageViews": {}, "totalVisits": 0, "history": []}');

            // Normalize path
            if (path === '/') path = '/home';

            // Increment Stats
            data.pageViews[path] = (data.pageViews[path] || 0) + 1;
            data.totalVisits += 1;

            // Keep simplified history (last 50)
            data.history.unshift({ path, timestamp: new Date().toISOString() });
            if (data.history.length > 50) data.history.pop();

            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.error("Analytics Error:", e);
        }
    },

    // Get all stats
    getStats: () => {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"pageViews": {}, "totalVisits": 0, "history": []}');
    },

    // Get Top N pages
    getTopPages: (n = 5) => {
        const stats = Analytics.getStats();
        return Object.entries(stats.pageViews)
            .sort(([, a], [, b]) => b - a)
            .slice(0, n)
            .map(([path, views]) => ({ path, views }));
    },

    // Reset Data
    reset: () => {
        localStorage.removeItem(STORAGE_KEY);
    }
};
