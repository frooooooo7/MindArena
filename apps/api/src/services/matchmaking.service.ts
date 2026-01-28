import { Server } from "socket.io";
import { ARENA_EVENTS } from "@mindarena/shared";
import * as queueService from "./queue.service";
import { sequenceMemory } from "./games";

/**
 * Matchmaking Service
 * Handles matching players and creating game rooms
 */

/**
 * Attempt to match two players from a queue
 */
export function attemptMatch(gameType: string, io: Server): void {
    const players = queueService.takeTwoPlayers(gameType);
    if (!players) return;
    
    const [player1, player2] = players;
    
    // Get actual socket objects and validate connection
    const socket1 = io.sockets.sockets.get(player1.socketId);
    const socket2 = io.sockets.sockets.get(player2.socketId);

    // Validate player 1
    if (!socket1?.connected) {
        console.log(`[MATCH] ${player1.name} disconnected before match`);
        if (socket2?.connected) {
            queueService.returnToFront(player2);
        }
        attemptMatch(gameType, io);
        return;
    }

    // Validate player 2
    if (!socket2?.connected) {
        console.log(`[MATCH] ${player2.name} disconnected before match`);
        queueService.returnToFront(player1);
        attemptMatch(gameType, io);
        return;
    }

    // Create room
    const roomId = generateRoomId();
    
    // Create game room based on game type
    createGameRoom(roomId, gameType, player1, player2);

    // Join both sockets to the room
    socket1.join(roomId);
    socket2.join(roomId);

    console.log(`[MATCH] ${player1.name} vs ${player2.name} in ${roomId}`);

    // Notify both players
    notifyMatchFound(socket1, player2, roomId, gameType);
    notifyMatchFound(socket2, player1, roomId, gameType);
}

/**
 * Generate unique room ID
 */
function generateRoomId(): string {
    return `game-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Create game room based on game type
 */
function createGameRoom(
    roomId: string,
    gameType: string,
    player1: queueService.QueuedPlayer,
    player2: queueService.QueuedPlayer
): void {
    // Currently only Sequence Memory is implemented
    // In the future, switch based on gameType
    switch (gameType) {
        case "Sequence":
        default:
            sequenceMemory.createGameRoom(
                roomId,
                { id: player1.odId, name: player1.name, socketId: player1.socketId },
                { id: player2.odId, name: player2.name, socketId: player2.socketId }
            );
            break;
        // Future game types:
        // case "Chimp":
        //     chimpMemory.createGameRoom(...);
        //     break;
        // case "Code":
        //     codeMemory.createGameRoom(...);
        //     break;
    }
}

/**
 * Notify player that match was found
 */
function notifyMatchFound(
    socket: ReturnType<Server["sockets"]["sockets"]["get"]>,
    opponent: queueService.QueuedPlayer,
    roomId: string,
    gameType: string
): void {
    if (!socket) return;
    
    socket.emit(ARENA_EVENTS.MATCH_FOUND, {
        opponent: {
            id: opponent.odId,
            name: opponent.name,
            rank: 1200, // TODO: Get from database
            avatar: opponent.name.charAt(0).toUpperCase(),
        },
        room: roomId,
        gameType,
    });
}
