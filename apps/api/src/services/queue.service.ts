import { Server } from "socket.io";
import { ARENA_EVENTS } from "@mindarena/shared";

/**
 * Queue Service
 * Manages matchmaking queues with timeout cleanup
 */

// ==========================================
// TYPES
// ==========================================

export interface QueuedPlayer {
    odId: string;
    name: string;
    socketId: string;
    gameType: string;
    joinedAt: Date;
}

// ==========================================
// CONFIG
// ==========================================

const QUEUE_TIMEOUT_MS = 5 * 60 * 1000;     // 5 minutes
const CLEANUP_INTERVAL_MS = 30 * 1000;       // 30 seconds

// ==========================================
// STATE
// ==========================================

const queues: Map<string, QueuedPlayer[]> = new Map();
let cleanupInterval: NodeJS.Timeout | null = null;

// ==========================================
// QUEUE OPERATIONS
// ==========================================

/**
 * Get or create queue for a game type
 */
export function getQueue(gameType: string): QueuedPlayer[] {
    if (!queues.has(gameType)) {
        queues.set(gameType, []);
    }
    return queues.get(gameType)!;
}

/**
 * Add player to queue
 * @returns false if already in queue
 */
export function addPlayer(player: QueuedPlayer): boolean {
    const queue = getQueue(player.gameType);
    
    // Check if already in queue
    if (queue.some(p => p.odId === player.odId)) {
        return false;
    }
    
    queue.push(player);
    return true;
}

/**
 * Get player's position in queue (1-indexed)
 */
export function getPlayerPosition(gameType: string, odId: string): number {
    const queue = getQueue(gameType);
    const index = queue.findIndex(p => p.odId === odId);
    return index === -1 ? 0 : index + 1;
}

/**
 * Remove player from all queues
 */
export function removePlayer(odId: string): void {
    queues.forEach((queue, gameType) => {
        const index = queue.findIndex(p => p.odId === odId);
        if (index !== -1) {
            queue.splice(index, 1);
            console.log(`[QUEUE] Removed ${odId} from ${gameType}`);
        }
    });
}

/**
 * Take first two players from queue (for matching)
 */
export function takeTwoPlayers(gameType: string): [QueuedPlayer, QueuedPlayer] | null {
    const queue = getQueue(gameType);
    if (queue.length < 2) return null;
    
    const player1 = queue.shift()!;
    const player2 = queue.shift()!;
    
    return [player1, player2];
}

/**
 * Put player back at front of queue (if match failed)
 */
export function returnToFront(player: QueuedPlayer): void {
    const queue = getQueue(player.gameType);
    queue.unshift(player);
}

/**
 * Get queue size for a game type or total
 */
export function getQueueSize(gameType?: string): number {
    if (gameType) {
        return queues.get(gameType)?.length || 0;
    }
    let total = 0;
    queues.forEach(q => total += q.length);
    return total;
}

/**
 * Get stats for all queues
 */
export function getQueueStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    queues.forEach((queue, gameType) => {
        stats[gameType] = queue.length;
    });
    return stats;
}

// ==========================================
// CLEANUP
// ==========================================

/**
 * Start the cleanup timer
 */
export function startCleanup(io: Server): void {
    if (cleanupInterval) return;
    
    cleanupInterval = setInterval(() => {
        cleanupTimedOutPlayers(io);
    }, CLEANUP_INTERVAL_MS);
    
    console.log("[QUEUE] Cleanup timer started");
}

/**
 * Remove players who have been waiting too long
 */
function cleanupTimedOutPlayers(io: Server): void {
    const now = new Date();
    let removedCount = 0;
    
    queues.forEach((queue, gameType) => {
        const initialLength = queue.length;
        
        const validPlayers = queue.filter(player => {
            const waitTime = now.getTime() - player.joinedAt.getTime();
            
            if (waitTime > QUEUE_TIMEOUT_MS) {
                notifyTimeout(io, player.socketId);
                return false;
            }
            return true;
        });
        
        queues.set(gameType, validPlayers);
        removedCount += initialLength - validPlayers.length;
    });
    
    if (removedCount > 0) {
        console.log(`[QUEUE] Cleanup: removed ${removedCount} timed-out players`);
    }
}

/**
 * Notify player about timeout
 */
function notifyTimeout(io: Server, socketId: string): void {
    const socket = io.sockets.sockets.get(socketId);
    if (socket?.connected) {
        socket.emit(ARENA_EVENTS.QUEUE_STATUS, {
            position: 0,
            estimatedWait: "timeout",
            error: "Queue timeout - please try again"
        });
    }
}

/**
 * Stop the cleanup timer (for testing)
 */
export function stopCleanup(): void {
    if (cleanupInterval) {
        clearInterval(cleanupInterval);
        cleanupInterval = null;
    }
}
