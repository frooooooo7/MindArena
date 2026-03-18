import { Socket, Server } from "socket.io";
import { JoinQueuePayload, ARENA_EVENTS } from "@mindarena/shared";
import * as queueService from "../../services/queue.service";
import * as rateLimiter from "../../services/rate-limiter.service";
import * as matchmaking from "../../services/matchmaking.service";
import * as roomService from "../../services/room.service";

/**
 * Broadcast current total queue count to all connected clients
 */
function broadcastQueueCount(io: Server): void {
    io.emit(ARENA_EVENTS.QUEUE_COUNT_UPDATE, {
        total: queueService.getQueueSize(),
    });
}


/**
 * Arena Handler
 * Handles socket events for matchmaking queue
 */
export function registerArenaHandlers(socket: Socket, io: Server) {
    const user = socket.data.user;
    const odId = user?.id || socket.id;
    const userName = user?.name || `Player_${socket.id.slice(0, 4)}`;
    
    // Send initial live games state + queue count
    socket.emit(ARENA_EVENTS.LIVE_GAMES_UPDATE, roomService.getLiveGames());
    socket.emit(ARENA_EVENTS.QUEUE_COUNT_UPDATE, {
        total: queueService.getQueueSize(),
    });

    // Handle on-demand live feed requests (e.g. when client navigates back to /arena)
    socket.on(ARENA_EVENTS.REQUEST_LIVE_GAMES, () => {
        socket.emit(ARENA_EVENTS.LIVE_GAMES_UPDATE, roomService.getLiveGames());
    });

    // ==========================================

    // JOIN QUEUE
    // ==========================================
    socket.on(ARENA_EVENTS.JOIN_QUEUE, (data: JoinQueuePayload) => {
        // Rate limiting
        if (!rateLimiter.checkRateLimit(odId)) {
            emitRateLimited(socket);
            return;
        }

        const { gameType } = data;
        console.log(`[ARENA] ${userName} joining ${gameType} queue`);
        
        // Try to add to queue
        const added = queueService.addPlayer({
            odId,
            name: userName,
            socketId: socket.id,
            gameType,
            joinedAt: new Date(),
            isGuest: !user,
        });
        // Check if already in queue, if so, emit queue status
        if (!added) {
            // Already in queue
            const position = queueService.getPlayerPosition(gameType, odId);
            emitQueueStatus(socket, position, "already in queue");
            return;
        }

        // Emit queue status
        const queueSize = queueService.getQueueSize(gameType);
        emitQueueStatus(socket, queueSize, queueSize >= 2 ? "~5s" : "waiting for opponent");

        // Broadcast updated queue count
        broadcastQueueCount(io);

        // Try to match players
        if (matchmaking.attemptMatch(gameType, io)) {
            roomService.broadcastLiveGames(io);
            broadcastQueueCount(io);
        }
    });

    // ==========================================
    // LEAVE QUEUE
    // ==========================================
    socket.on(ARENA_EVENTS.LEAVE_QUEUE, () => {
        if (!rateLimiter.checkRateLimit(odId)) return;
        
        console.log(`[ARENA] ${userName} left queue`);
        handlePlayerLeaving(socket, io, odId);
        broadcastQueueCount(io);
    });

    // ==========================================
    // DISCONNECTING
    // ==========================================
    socket.on("disconnecting", () => {
        console.log(`[ARENA] ${userName} disconnecting from arena`);
        handlePlayerLeaving(socket, io, odId);
        broadcastQueueCount(io);
    });
}


/**
 * Handle player leaving queue or disconnecting
 */
function handlePlayerLeaving(socket: Socket, io: Server, odId: string) {
    // 1. Remove from matchmaking queue
    queueService.removePlayer(odId);

    // 2. Check if player was in a waiting room
    const rooms = Array.from(socket.rooms);
    let roomRemoved = false;
    
    rooms.forEach(roomId => {
        if (roomId.startsWith("game-")) {
            const room = roomService.getRoom(roomId);
            if (room && room.status === "waiting") {
                console.log(`[ARENA] Notifying opponent in room ${roomId} that match was cancelled`);
                io.to(roomId).emit(ARENA_EVENTS.MATCH_CANCELLED, {
                    reason: "opponent_left"
                });
                // Remove the room as it's no longer valid
                roomService.removeRoom(roomId);
                roomRemoved = true;
            }
        }
    });

    if (roomRemoved) {
        roomService.broadcastLiveGames(io);
    }
}


// ==========================================
// HELPER FUNCTIONS
// ==========================================

function emitQueueStatus(socket: Socket, position: number, estimatedWait: string): void {
    socket.emit(ARENA_EVENTS.QUEUE_STATUS, { position, estimatedWait });
}

function emitRateLimited(socket: Socket): void {
    socket.emit(ARENA_EVENTS.QUEUE_STATUS, {
        position: 0,
        estimatedWait: "rate_limited",
        error: "Too many requests. Please wait a moment."
    });
}

// ==========================================
// EXPORTS FOR MONITORING
// ==========================================

export function getQueueSize(gameType?: string): number {
    return queueService.getQueueSize(gameType);
}

export function getQueueStats() {
    return {
        queues: queueService.getQueueStats(),
        totalPlayers: queueService.getQueueSize(),
        rateLimitedUsers: rateLimiter.getRateLimitedCount()
    };
}

