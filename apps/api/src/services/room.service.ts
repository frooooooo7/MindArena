import { GameRoom, GamePlayer } from "@mindarena/shared";

// In-memory storage for active game rooms
const gameRooms: Map<string, GameRoom> = new Map();

// Config for room cleanup
const WAITING_ROOM_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes
const CLEANUP_INTERVAL_MS = 30 * 1000; // 30 seconds

// Cleanup timer
let cleanupInterval: NodeJS.Timeout | null = null;

/**
 * Start cleanup timer for stale rooms
 */
export function startRoomCleanup(): void {
    if (cleanupInterval) return;
    
    cleanupInterval = setInterval(() => {
        const now = new Date();
        let removed = 0;
        
        gameRooms.forEach((room, roomId) => {
            // Remove waiting rooms that have been waiting too long
            if (room.status === "waiting") {
                const waitTime = now.getTime() - room.createdAt.getTime();
                if (waitTime > WAITING_ROOM_TIMEOUT_MS) {
                    gameRooms.delete(roomId);
                    removed++;
                    console.log(`[ROOM] Cleanup: removed stale waiting room ${roomId}`);
                }
            }
            
            // Remove finished rooms after 5 minutes
            if (room.status === "finished") {
                const waitTime = now.getTime() - room.createdAt.getTime();
                if (waitTime > 5 * 60 * 1000) {
                    gameRooms.delete(roomId);
                    removed++;
                }
            }
        });
        
        if (removed > 0) {
            console.log(`[ROOM] Cleanup: removed ${removed} stale rooms, ${gameRooms.size} remaining`);
        }
    }, CLEANUP_INTERVAL_MS);
    
    console.log("[ROOM] Cleanup timer started");
}

/**
 * Create a new game room for two matched players
 */
export function createRoom(
    roomId: string, 
    gameType: string,
    player1: { id: string; name: string; socketId: string },
    player2: { id: string; name: string; socketId: string },
    initialGameData: { sequence: number[]; gridSize: number }
): GameRoom {
    // Start cleanup if not already running
    startRoomCleanup();
    
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
    };
    
    gameRooms.set(roomId, room);
    console.log(`[ROOM] Created ${roomId}: ${player1.name} vs ${player2.name}`);
    
    return room;
}

function createPlayer(data: { id: string; name: string; socketId: string }): GamePlayer {
    return {
        id: data.id,
        name: data.name,
        socketId: data.socketId,
        isReady: false,
        currentLevel: 1,
        currentIndex: 0,
        hasFailed: false,
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

