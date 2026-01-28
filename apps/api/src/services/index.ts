// Services Index - Export all services for easy imports

// Authentication
export * as authService from "./auth.service";

// Arena / Matchmaking
export * as queueService from "./queue.service";
export * as matchmakingService from "./matchmaking.service";
export * as roomService from "./room.service";
export * as rateLimiter from "./rate-limiter.service";

// Game-specific logic
export * from "./games";
