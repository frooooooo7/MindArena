import { Socket } from "socket.io";
import { JoinQueuePayload, ARENA_EVENTS } from "@mindarena/shared";

// Simple in-memory queue for now (replace with Redis in production)
const matchmakingQueue: Map<string, { socketId: string; gameType: string; joinedAt: Date }> = new Map();

export function registerArenaHandlers(socket: Socket) {
    const userId = socket.data.user?.id || socket.id;

    socket.on(ARENA_EVENTS.JOIN_QUEUE, (data: JoinQueuePayload) => {
        console.log(`[ARENA] User ${userId} joined queue for: ${data.gameType}`);
        
        // Add to queue
        matchmakingQueue.set(userId, {
            socketId: socket.id,
            gameType: data.gameType,
            joinedAt: new Date()
        });

        // Emit queue status
        socket.emit(ARENA_EVENTS.QUEUE_STATUS, {
            position: matchmakingQueue.size,
            estimatedWait: "~30s"
        });

        // Simulate matchmaking (3 seconds delay)
        // In production, this would be a proper matchmaking algorithm
        setTimeout(() => {
            // Check if user is still in queue
            if (!matchmakingQueue.has(userId)) {
                console.log(`[ARENA] User ${userId} left queue before match was found`);
                return;
            }

            socket.emit(ARENA_EVENTS.MATCH_FOUND, {
                opponent: { 
                    name: "ShadowPlayer", 
                    rank: 1200,
                    avatar: "S"
                },
                room: `room-${socket.id}-${Date.now()}`,
                gameType: data.gameType
            });

            // Remove from queue after match found
            matchmakingQueue.delete(userId);
        }, 3000);
    });

    socket.on(ARENA_EVENTS.LEAVE_QUEUE, () => {
        console.log(`[ARENA] User ${userId} left the queue`);
        matchmakingQueue.delete(userId);
    });

    // Cleanup on disconnect
    socket.on("disconnect", () => {
        console.log(`[ARENA] User ${userId} disconnected, removing from queue`);
        matchmakingQueue.delete(userId);
    });
}

// Export for potential use in other parts of the app
export function getQueueSize(): number {
    return matchmakingQueue.size;
}

export function isUserInQueue(userId: string): boolean {
    return matchmakingQueue.has(userId);
}
