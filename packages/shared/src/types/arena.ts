// Arena Types

export interface ArenaOpponent {
    id?: string;
    name: string;
    rank: number;
    avatar?: string;
}

export interface ArenaMatch {
    opponent: ArenaOpponent;
    room: string;
    gameType: string;
}

export interface JoinQueuePayload {
    gameType: string;
}

export interface LeaveQueuePayload {
    reason?: "user_cancelled" | "timeout" | "disconnected";
}

// Socket Event Names (for type safety)
export const ARENA_EVENTS = {
    JOIN_QUEUE: "arena:join-queue",
    LEAVE_QUEUE: "arena:leave-queue",
    MATCH_FOUND: "arena:match-found",
    QUEUE_STATUS: "arena:queue-status",
} as const;

export type ArenaEventName = typeof ARENA_EVENTS[keyof typeof ARENA_EVENTS];
