import { Request, Response, NextFunction } from 'express';

const CHAOS_CONFIG = {
    ENABLED: true,
    FAILURE_RATE: 0.02,
    FAILURE_DURATION_MS: 5000, // 5 seconds
};

let failureEndTime: number | null = null;

export const chaosMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (!CHAOS_CONFIG.ENABLED) return next();

    const now = Date.now();

    // Check if we're currently in failure mode
    if (failureEndTime && now < failureEndTime) {
        console.error(`[CHAOS] In failure mode for ${req.url} (${((failureEndTime - now) / 1000).toFixed(1)}s remaining)`);
        return res.status(500).json({ 
            error: "Internal Server Error", 
            message: "Service is in failure mode" 
        });
    }

    // Clear failure mode if expired
    if (failureEndTime && now >= failureEndTime) {
        console.log('[CHAOS] Failure mode ended, returning to normal');
        failureEndTime = null;
    }

    const random = Math.random();

    // Trigger new failure mode
    if (random < CHAOS_CONFIG.FAILURE_RATE) {
        // Random duration between 1s and 10s
        const randomDuration = 1000 + Math.random() * 9000;
        failureEndTime = now + randomDuration;
        console.error(`[CHAOS] Entering failure mode for ${(randomDuration / 1000).toFixed(2)}s`);
        return res.status(500).json({ 
            error: "Internal Server Error", 
            message: "Simulated chaos failure - entering failure mode" 
        });
    }
    
    next();
}