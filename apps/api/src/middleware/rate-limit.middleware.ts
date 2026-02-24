import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";

/**
 * Simple in-memory rate limiter middleware for REST endpoints.
 * Tracks requests per authenticated user within a sliding window.
 *
 * @param maxRequests - Maximum requests allowed within the window
 * @param windowMs - Time window in milliseconds
 */
export function rateLimitMiddleware(maxRequests: number, windowMs: number) {
  const requests = new Map<string, { count: number; resetAt: number }>();

  // Periodic cleanup every 60s to prevent memory leaks
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of requests) {
      if (now > entry.resetAt) {
        requests.delete(key);
      }
    }
  }, 60_000);

  // Allow GC to clean up the interval if the module is unloaded
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const key = req.userId || req.ip || "anonymous";
    const now = Date.now();
    const entry = requests.get(key);

    if (!entry || now > entry.resetAt) {
      // Start a new window
      requests.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (entry.count >= maxRequests) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      res.set("Retry-After", String(retryAfter));
      return res.status(429).json({ 
        error: "Too many requests, please try again later.",
        retryAfter,
      });
    }

    entry.count++;
    return next();
  };
}
