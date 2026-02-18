/**
 * Infrastructure Guard Agent
 * "The Vitals Monitor"
 * 
 * Responsibilities:
 * 1. Server Health (via deep_diagnostics.php)
 * 2. Client Persistence (LocalStorage, Cookies)
 * 3. Network Latency
 */

export class InfrastructureGuard {
    constructor() {
        this.status = 'idle';
        this.results = null;
    }

    async scan() {
        this.status = 'scanning';
        const checks = [];
        let score = 100;

        // 1. Client-Side: LocalStorage Write Test
        try {
            const key = 'sys_intel_test_' + Date.now();
            localStorage.setItem(key, 'write_test');
            const val = localStorage.getItem(key);
            localStorage.removeItem(key);

            if (val === 'write_test') {
                checks.push({ id: 'local_storage', status: 'ok', msg: 'LocalStorage Writable', type: 'client' });
            } else {
                throw new Error('Read verification failed');
            }
        } catch (e) {
            checks.push({ id: 'local_storage', status: 'error', msg: 'LocalStorage Failed: ' + e.message, type: 'client' });
            score -= 20;
        }

        // 2. Client-Side: Cookie Test
        try {
            document.cookie = "intel_test=1; SameSite=Strict";
            if (document.cookie.indexOf('intel_test=') !== -1) {
                document.cookie = "intel_test=1; expires=Thu, 01 Jan 1970 00:00:00 UTC;"; // Delete
                checks.push({ id: 'cookies', status: 'ok', msg: 'Cookies Persistence OK', type: 'client' });
            } else {
                checks.push({ id: 'cookies', status: 'warn', msg: 'Cookies Blocked/Failed', type: 'client' });
                score -= 10;
            }
        } catch (e) {
            checks.push({ id: 'cookies', status: 'error', msg: 'Cookie Error', type: 'client' });
        }

        // 3. Server-Side Probe
        try {
            const startStr = Date.now();
            const res = await fetch('/api/deep_diagnostics.php');
            const endStr = Date.now();
            const latency = endStr - startStr;

            checks.push({
                id: 'api_latency',
                status: latency > 1000 ? 'warn' : 'ok',
                msg: `API Latency: ${latency}ms`,
                type: 'network'
            });

            if (res.ok) {
                const serverData = await res.json();

                // Map Server Checks to standardized format
                Object.entries(serverData.checks).forEach(([key, check]) => {
                    checks.push({
                        id: 'server_' + key,
                        status: check.status,
                        msg: `${check.label}: ${check.value}`,
                        type: 'server',
                        meta: check.meta
                    });
                    if (check.status === 'error') score -= 15;
                    if (check.status === 'warn') score -= 5;
                });

            } else {
                checks.push({ id: 'server_probe', status: 'error', msg: `Probe Failed (HTTP ${res.status})`, type: 'server' });
                score -= 30;
            }

        } catch (e) {
            checks.push({ id: 'server_probe', status: 'error', msg: 'Probe Network Error: ' + e.message, type: 'network' });
            score -= 50;
        }

        this.results = {
            timestamp: new Date(),
            checks,
            score: Math.max(0, score),
            status: score > 80 ? 'healthy' : (score > 50 ? 'warning' : 'critical')
        };

        return this.results;
    }

    // Auto-Fix Actions
    fixLocalStorage() {
        localStorage.clear();
        return { msg: 'LocalStorage Cleared', status: 'success' };
    }

    fixCookies() {
        // Can't really "fix" browser settings via JS, but can reset known cookies
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i];
            const eqPos = cookie.indexOf("=");
            const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
        return { msg: 'Cookies forcibly cleared', status: 'success' };
    }
}
