import { Server } from "socket.io";
import { GameRoom, GamePlayer, LiveGameInfo } from "@mindarena/shared";
import { ARENA_EVENTS } from "@mindarena/shared";

// In-memory storage for active game rooms
const gameRooms: Map<string, GameRoom> = new Map();

// Config for room cleanup
const WAITING_ROOM_TIMEOUT_MS = 15 * 1000; // 15 seconds for confirmation
const CLEANUP_INTERVAL_MS = 10 * 1000; // 10 seconds check
const FINISHED_ROOM_TIMEOUT_MS = 30 * 1000; // 30 seconds for cleanup after finish

// Cleanup timer
let cleanupInterval: NodeJS.Timeout | null = null;

// Throttling for broadcasts
const BROADCAST_THROTTLE_MS = 1000;
let lastBroadcastTimestamp = 0;
let broadcastTimeout: NodeJS.Timeout | null = null;

/**
 * Start cleanup timer for stale rooms
 */
export function startRoomCleanup(io: Server): void {
    if (cleanupInterval) return;
    
    cleanupInterval = setInterval(() => {
        const now = new Date();
        let removed = 0;
        
        gameRooms.forEach((room, roomId) => {
            const age = now.getTime() - room.createdAt.getTime();

            // 1. Remove waiting rooms that weren't confirmed in time
            if (room.status === "waiting" && age > WAITING_ROOM_TIMEOUT_MS) {
                console.log(`[ROOM] Match confirmation timed out for ${roomId}`);
                
                // Notify any connected players
                io.to(roomId).emit(ARENA_EVENTS.MATCH_CANCELLED, {
                    reason: "confirmation_timeout"
                });
                
                gameRooms.delete(roomId);
                removed++;
            }
            
            // 2. Remove finished rooms after timeout (measured from when game ended)
            if (room.status === "finished") {
                const finishedAge = now.getTime() - room.updatedAt.getTime();
                if (finishedAge > FINISHED_ROOM_TIMEOUT_MS) {
                    gameRooms.delete(roomId);
                    removed++;
                }
            }
        });
        
        if (removed > 0) {
            console.log(`[ROOM] Cleanup: removed ${removed} stale rooms, ${gameRooms.size} remaining`);
            broadcastLiveGames(io);
        }
    }, CLEANUP_INTERVAL_MS);
    
    console.log("[ROOM] Cleanup timer started with 10s interval");
}


/**
 * Create a new game room for two matched players
 */
export function createRoom(
    roomId: string, 
    gameType: string,
    player1: { id: string; name: string; socketId: string; isGuest?: boolean },
    player2: { id: string; name: string; socketId: string; isGuest?: boolean },
    initialGameData: { sequence: number[]; gridSize: number }
): GameRoom {
    const room: GameRoom = {

        id: roomId,
        gameType,
        players: [
            createPlayer(player1),
            createPlayer(player2),
        ],
        status: "waiting",
        sequence: initialGameData.sequence,
        gridSize: initialGameData.gridSize,
        level: 1,
        winnerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    
    gameRooms.set(roomId, room);
    console.log(`[ROOM] Created ${roomId}: ${player1.name} vs ${player2.name}`);
    
    return room;
}

function createPlayer(data: { id: string; name: string; socketId: string; isGuest?: boolean }): GamePlayer {
    return {
        id: data.id,
        name: data.name,
        socketId: data.socketId,
        isReady: false,
        currentLevel: 1,
        currentIndex: 0,
        hasFailed: false,
        isGuest: !!data.isGuest,
    };
}

/**
 * Get a game room by ID
 */
export function getRoom(roomId: string): GameRoom | undefined {
    return gameRooms.get(roomId);
}

/**
 * Mark player as ready, returns true if all players are ready
 */
export function setPlayerReady(roomId: string, playerId: string): boolean {
    const room = gameRooms.get(roomId);
    if (!room) return false;
    
    const player = room.players.find(p => p.id === playerId);
    if (player) {
        player.isReady = true;
    }
    
    return room.players.every(p => p.isReady);
}

/**
 * Start the game (set status to playing)
 */
export function startGame(roomId: string): GameRoom | undefined {
    const room = gameRooms.get(roomId);
    if (!room) return undefined;
    
    room.status = "playing";
    room.updatedAt = new Date();
    return room;
}

/**
 * End the game with a winner
 */
export function endGame(roomId: string, winnerId: string): GameRoom | undefined {
    const room = gameRooms.get(roomId);
    if (!room) return undefined;
    
    room.status = "finished";
    room.winnerId = winnerId;
    room.updatedAt = new Date();
    
    return room;
}

/**
 * Get opponent of a player in a room
 */
export function getOpponent(roomId: string, playerId: string): GamePlayer | undefined {
    const room = gameRooms.get(roomId);
    if (!room) return undefined;
    
    return room.players.find(p => p.id !== playerId);
}

/**
 * Get player by their ID
 */
export function getPlayer(roomId: string, playerId: string): GamePlayer | undefined {
    const room = gameRooms.get(roomId);
    if (!room) return undefined;
    
    return room.players.find(p => p.id === playerId);
}

/**
 * Remove a game room
 */
export function removeRoom(roomId: string): void {
    gameRooms.delete(roomId);
    console.log(`[ROOM] Removed ${roomId}`);
}

/**
 * Update room data (sequence, gridSize, level)
 */
export function updateRoomGameData(
    roomId: string, 
    data: { sequence?: number[]; gridSize?: number; level?: number }
): GameRoom | undefined {
    const room = gameRooms.get(roomId);
    if (!room) return undefined;
    
    if (data.sequence !== undefined) room.sequence = data.sequence;
    if (data.gridSize !== undefined) room.gridSize = data.gridSize;
    if (data.level !== undefined) room.level = data.level;
    
    return room;
}

/**
 * Reset player progress (for new level)
 */
export function resetPlayersProgress(roomId: string): void {
    const room = gameRooms.get(roomId);
    if (!room) return;
    
    room.players.forEach(p => {
        p.currentIndex = 0;
        p.currentLevel = room.level;
    });
}

/**
 * Update player state
 */
export function updatePlayer(
    roomId: string, 
    playerId: string, 
    data: Partial<Pick<GamePlayer, 'currentIndex' | 'hasFailed' | 'currentLevel'>>
): GamePlayer | undefined {
    const room = gameRooms.get(roomId);
    if (!room) return undefined;
    
    const player = room.players.find(p => p.id === playerId);
    if (!player) return undefined;
    
    Object.assign(player, data);
    return player;
}

/**
 * Get room stats for monitoring
 */
export function getRoomStats() {
    const stats = {
        total: gameRooms.size,
        waiting: 0,
        countdown: 0,
        playing: 0,
        finished: 0,
    };
    
    gameRooms.forEach(room => {
        if (room.status in stats) {
            stats[room.status as keyof typeof stats]++;
        }
    });
    
    return stats;
}

/**
 * Get simplified info for live feed (active and recently finished games)
 */
export function getLiveGames(): LiveGameInfo[] {
    try {
        const MAX_GAMES = 20; // Internal limit to prevent massive payload
        
        return Array.from(gameRooms.values())
            .filter(room => room && (room.status === "waiting" || room.status === "playing" || room.status === "finished"))
            .map(room => ({
                id: room.id,
                p1Name: room.players[0]?.name || "Unknown",
                p2Name: room.players[1]?.name || "Unknown",
                gameType: (room.gameType || "unknown").charAt(0).toUpperCase() + room.gameType.slice(1).toLowerCase(),
                status: (room.status || "waiting") as "waiting" | "playing" | "finished",
                winnerName: room.winnerId ? room.players.find(p => p.id === room.winnerId)?.name : undefined,
                createdAt: room.createdAt.toISOString(),
                updatedAt: room.updatedAt.toISOString(),
            }))
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .slice(0, MAX_GAMES);
    } catch (error) {
        console.error("[ROOM] Error getting live games:", error);
        return [];
    }
}

/**
 * Broadcast live games update to all connected clients (Throttled)
 */
export function broadcastLiveGames(io: Server) {
    const now = Date.now();
    
    // Clear any pending broadcast
    if (broadcastTimeout) {
        clearTimeout(broadcastTimeout);
        broadcastTimeout = null;
    }

    const performBroadcast = () => {
        try {
            const games = getLiveGames();
            io.emit(ARENA_EVENTS.LIVE_GAMES_UPDATE, games);
            lastBroadcastTimestamp = Date.now();
            broadcastTimeout = null;
        } catch (error) {
            console.error("[ROOM] Broadcast failed:", error);
        }
    };

    if (now - lastBroadcastTimestamp > BROADCAST_THROTTLE_MS) {
        // Enough time passed, broadcast immediately
        performBroadcast();
    } else {
        // Too soon, schedule a broadcast at the end of the throttle window
        const delay = BROADCAST_THROTTLE_MS - (now - lastBroadcastTimestamp);
        broadcastTimeout = setTimeout(performBroadcast, delay);
    }
}
