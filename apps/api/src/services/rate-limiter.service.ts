/**
 * Rate Limiter Service
 * Prevents spam/abuse of socket events
 */

interface RateLimitEntry {
    count: number;
    resetAt: Date;
}

// Config
const RATE_LIMIT_MAX = 10;           // Max actions per window
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute window

// State
const rateLimits: Map<string, RateLimitEntry> = new Map();

/**
 * Check if user has exceeded rate limit
 * @returns true if allowed, false if rate limited
 */
export function checkRateLimit(userId: string): boolean {
    const now = new Date();
    const entry = rateLimits.get(userId);
    
    if (!entry || now > entry.resetAt) {
        // New window
        rateLimits.set(userId, {
            count: 1,
            resetAt: new Date(now.getTime() + RATE_LIMIT_WINDOW_MS)
        });
        return true;
    }
    
    if (entry.count >= RATE_LIMIT_MAX) {
        console.log(`[RATE_LIMIT] Exceeded for user ${userId}`);
        return false;
    }
    
    entry.count++;
    return true;
}

/**
 * Cleanup expired rate limit entries
 */
export function cleanupRateLimits(): number {
    const now = new Date();
    let removed = 0;
    
    rateLimits.forEach((entry, userId) => {
        if (now > entry.resetAt) {
            rateLimits.delete(userId);
            removed++;
        }
    });
    
    return removed;
}

/**
 * Get number of rate-limited users
 */
export function getRateLimitedCount(): number {
    return rateLimits.size;
}
