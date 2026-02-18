import { InfrastructureGuard } from './InfrastructureGuard';
import { VisualSentinel } from './VisualSentinel';
import { ContentGuardian } from './ContentGuardian';
import { SuccessOracle } from './SuccessOracle';

export class SystemEngine {
    constructor(dataContext) {
        this.agents = {
            infrastructure: new InfrastructureGuard(),
            visual: new VisualSentinel(),
            content: new ContentGuardian(dataContext),
            success: new SuccessOracle(dataContext)
        };
    }

    async runFullScan(onLog) {
        const results = {
            infrastructure: null,
            visual: null,
            content: null,
            success: null,
            timestamp: new Date(),
            totalScore: 0
        };

        // 1. Run Infrastructure
        if (onLog) onLog("Initializing Infrastructure Guard...", "info");
        results.infrastructure = await this.agents.infrastructure.scan();
        if (onLog) onLog(`Infrastructure Scan Complete. Score: ${results.infrastructure.score}`, "success");

        // 2. Run Visual
        if (onLog) onLog("Visual Sentinel scanning DOM...", "info");
        results.visual = this.agents.visual.scan();
        if (onLog) onLog(`Visual Scan Complete. Score: ${results.visual.score}`, "success");

        // 3. Run Content
        if (onLog) onLog("Content Guardian analyzing records...", "info");
        results.content = this.agents.content.scan();
        if (onLog) onLog(`Content Analysis Complete. Score: ${results.content.score}`, "success");

        // 4. Run Success
        if (onLog) onLog("Success Oracle computing metrics...", "info");
        results.success = this.agents.success.scan();
        if (onLog) onLog(`Success Metrics Analyzed. Score: ${results.success.score}`, "success");

        // Calculate Average Score
        results.totalScore = Math.round(
            (results.infrastructure.score + results.visual.score + results.content.score + results.success.score) / 4
        );

        return results;
    }

    // Fix Router
    async executeFix(type, actionId) {
        switch (type) {
            case 'visual':
                if (actionId === 'autofit') return this.agents.visual.fixOverflow();
                if (actionId === 'fix_images') return this.agents.visual.fixBrokenImages();
                break;
            case 'infrastructure':
                if (actionId === 'fix_storage') return this.agents.infrastructure.fixLocalStorage();
                if (actionId === 'fix_cookies') return this.agents.infrastructure.fixCookies();
                break;
        }
        return { msg: 'Action not implemented yet', status: 'error' };
    }
}
