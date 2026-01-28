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

// ============================================
// GAME TYPES FOR 1v1 MULTIPLAYER
// ============================================

export interface GamePlayer {
    id: string;
    name: string;
    socketId: string;
    isReady: boolean;
    currentLevel: number;
    currentIndex: number; // position in current sequence
    hasFailed: boolean;
}

export interface GameRoom {
    id: string;
    gameType: string;
    players: GamePlayer[];
    status: "waiting" | "countdown" | "playing" | "finished";
    sequence: number[];
    gridSize: number;
    level: number;
    winnerId: string | null;
    createdAt: Date;
}

export interface GameStartPayload {
    roomId: string;
    sequence: number[];
    gridSize: number;
    level: number;
    players: { id: string; name: string }[];
    countdown: number; // seconds before game starts
}

export interface GameMovePayload {
    cellIndex: number;
}

export interface OpponentProgressPayload {
    playerId: string;
    currentIndex: number;
    currentLevel: number;
}

export interface GameEndPayload {
    winnerId: string;
    loserId: string;
    winnerName: string;
    loserName: string;
    reason: "opponent_failed" | "opponent_disconnected";
    finalLevel: number;
}

export interface LevelCompletePayload {
    newLevel: number;
    newSequence: number[];
    newGridSize: number;
}

// Game Socket Events
export const GAME_EVENTS = {
    READY: "game:ready",
    START: "game:start",
    COUNTDOWN: "game:countdown",
    MOVE: "game:move",
    MOVE_RESULT: "game:move-result",
    OPPONENT_PROGRESS: "game:opponent-progress",
    LEVEL_COMPLETE: "game:level-complete",
    FAIL: "game:fail",
    END: "game:end",
} as const;

export type GameEventName = typeof GAME_EVENTS[keyof typeof GAME_EVENTS];
