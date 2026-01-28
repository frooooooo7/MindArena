import * as roomService from "../room.service";
import { GamePlayer } from "@mindarena/shared";

/**
 * Sequence Memory Game Logic
 * - Generates sequences based on level
 * - Validates player moves
 * - Handles level progression
 */

// ==========================================
// SEQUENCE GENERATION
// ==========================================

/**
 * Get grid size based on level
 * Level 1-3: 3x3, Level 4-6: 4x4, Level 7+: 5x5
 */
export function getGridSizeForLevel(level: number): number {
    if (level <= 3) return 3;
    if (level <= 6) return 4;
    return 5;
}

/**
 * Generate a random sequence for a given level
 */
export function generateSequence(level: number): { sequence: number[]; gridSize: number } {
    const gridSize = getGridSizeForLevel(level);
    const totalCells = gridSize * gridSize;
    const sequenceLength = level;
    
    const sequence: number[] = [];
    for (let i = 0; i < sequenceLength; i++) {
        sequence.push(Math.floor(Math.random() * totalCells));
    }
    
    return { sequence, gridSize };
}

// ==========================================
// ROOM CREATION
// ==========================================

/**
 * Create a new Sequence Memory game room
 */
export function createGameRoom(
    roomId: string,
    player1: { id: string; name: string; socketId: string },
    player2: { id: string; name: string; socketId: string }
) {
    const initialData = generateSequence(1);
    return roomService.createRoom(roomId, "Sequence", player1, player2, initialData);
}

// ==========================================
// MOVE VALIDATION
// ==========================================

export interface MoveResult {
    correct: boolean;
    sequenceComplete: boolean;
    player: GamePlayer | null;
}

/**
 * Process a player's move in Sequence Memory
 */
export function processMove(
    roomId: string, 
    playerId: string, 
    cellIndex: number
): MoveResult {
    const room = roomService.getRoom(roomId);
    if (!room) return { correct: false, sequenceComplete: false, player: null };
    
    const player = roomService.getPlayer(roomId, playerId);
    if (!player) return { correct: false, sequenceComplete: false, player: null };
    
    const expectedCell = room.sequence[player.currentIndex];
    
    if (cellIndex === expectedCell) {
        // Correct move
        const newIndex = player.currentIndex + 1;
        roomService.updatePlayer(roomId, playerId, { currentIndex: newIndex });
        
        // Check if sequence is complete
        const isComplete = newIndex >= room.sequence.length;
        
        return { 
            correct: true, 
            sequenceComplete: isComplete, 
            player: { ...player, currentIndex: newIndex } 
        };
    } else {
        // Wrong move - player failed
        roomService.updatePlayer(roomId, playerId, { hasFailed: true });
        
        return { 
            correct: false, 
            sequenceComplete: false, 
            player: { ...player, hasFailed: true } 
        };
    }
}

// ==========================================
// LEVEL PROGRESSION
// ==========================================

/**
 * Advance to next level in Sequence Memory
 */
export function advanceToNextLevel(roomId: string) {
    const room = roomService.getRoom(roomId);
    if (!room) return undefined;
    
    const newLevel = room.level + 1;
    const { sequence, gridSize } = generateSequence(newLevel);
    
    roomService.updateRoomGameData(roomId, { level: newLevel, sequence, gridSize });
    roomService.resetPlayersProgress(roomId);
    
    return roomService.getRoom(roomId);
}

/**
 * Check if both players completed the current sequence
 */
export function areBothPlayersComplete(roomId: string): boolean {
    const room = roomService.getRoom(roomId);
    if (!room) return false;
    
    return room.players.every(p => p.currentIndex >= room.sequence.length);
}
