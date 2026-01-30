import * as roomService from "../room.service";
import { GamePlayer, ChimpCell } from "@mindarena/shared";

/**
 * Chimp Memory Game Logic
 * - Generates cells with numbers at random positions
 * - Players must click numbers in order (1, 2, 3...)
 * - Numbers hide after memorization phase
 * - First player to fail loses
 */

// ==========================================
// CONSTANTS
// ==========================================

const GRID_COLS = 8;
const GRID_ROWS = 5;
const TOTAL_CELLS = GRID_COLS * GRID_ROWS;
const STARTING_NUMBERS = 4; // Start with 4 numbers

// Store chimp-specific game data (cells) per room
const chimpRoomData: Map<
  string,
  {
    cells: ChimpCell[];
    numbersCount: number;
    playerProgress: Map<string, { nextNumber: number; completedCount: number }>;
  }
> = new Map();

// ==========================================
// CELL GENERATION
// ==========================================

/**
 * Generate cells with numbers at random positions
 */
export function generateCells(numbersCount: number): ChimpCell[] {
  // Create empty cells
  const cells: ChimpCell[] = Array.from({ length: TOTAL_CELLS }, (_, i) => ({
    id: i,
    number: null,
    revealed: true,
    completed: false,
  }));

  // Pick random positions for numbers
  const positions: number[] = [];
  while (positions.length < numbersCount) {
    const pos = Math.floor(Math.random() * TOTAL_CELLS);
    if (!positions.includes(pos)) {
      positions.push(pos);
    }
  }

  // Assign numbers 1 to numbersCount at random positions
  positions.forEach((pos, index) => {
    cells[pos].number = index + 1;
  });

  return cells;
}

/**
 * Get numbers count based on level
 */
export function getNumbersCountForLevel(level: number): number {
  // Level 1 = 4 numbers, each level adds 1
  return STARTING_NUMBERS + (level - 1);
}

// ==========================================
// ROOM CREATION
// ==========================================

/**
 * Create a new Chimp Memory game room
 */
export function createGameRoom(
  roomId: string,
  player1: { id: string; name: string; socketId: string },
  player2: { id: string; name: string; socketId: string },
) {
  const numbersCount = getNumbersCountForLevel(1);
  const cells = generateCells(numbersCount);

  // Create room with sequence/gridSize for compatibility (unused for chimp)
  const room = roomService.createRoom(roomId, "Chimp", player1, player2, {
    sequence: [],
    gridSize: 0,
  });

  // Store chimp-specific data
  chimpRoomData.set(roomId, {
    cells,
    numbersCount,
    playerProgress: new Map([
      [player1.id, { nextNumber: 1, completedCount: 0 }],
      [player2.id, { nextNumber: 1, completedCount: 0 }],
    ]),
  });

  return { room, cells, numbersCount };
}

/**
 * Get chimp room data
 */
export function getChimpRoomData(roomId: string) {
  return chimpRoomData.get(roomId);
}

/**
 * Get cells for a room
 */
export function getCells(roomId: string): ChimpCell[] {
  return chimpRoomData.get(roomId)?.cells || [];
}

// ==========================================
// MOVE VALIDATION
// ==========================================

export interface ChimpMoveResult {
  correct: boolean;
  completedNumber: number;
  allCompleted: boolean;
  player: GamePlayer | null;
}

/**
 * Process a player's move in Chimp Memory
 */
export function processMove(
  roomId: string,
  playerId: string,
  cellId: number,
): ChimpMoveResult {
  const room = roomService.getRoom(roomId);
  const chimpData = chimpRoomData.get(roomId);

  if (!room || !chimpData) {
    return {
      correct: false,
      completedNumber: 0,
      allCompleted: false,
      player: null,
    };
  }

  const player = roomService.getPlayer(roomId, playerId);
  const progress = chimpData.playerProgress.get(playerId);

  if (!player || !progress) {
    return {
      correct: false,
      completedNumber: 0,
      allCompleted: false,
      player: null,
    };
  }

  const cell = chimpData.cells.find((c) => c.id === cellId);
  if (!cell || cell.number === null) {
    return { correct: false, completedNumber: 0, allCompleted: false, player };
  }

  // Check if player clicked the correct number
  if (cell.number === progress.nextNumber) {
    // Correct! Update progress
    progress.nextNumber++;
    progress.completedCount++;

    // Update player currentIndex for tracking
    roomService.updatePlayer(roomId, playerId, {
      currentIndex: progress.completedCount,
    });

    const allCompleted = progress.completedCount >= chimpData.numbersCount;

    return {
      correct: true,
      completedNumber: cell.number,
      allCompleted,
      player: { ...player, currentIndex: progress.completedCount },
    };
  } else {
    // Wrong number - player failed
    roomService.updatePlayer(roomId, playerId, { hasFailed: true });

    return {
      correct: false,
      completedNumber: 0,
      allCompleted: false,
      player: { ...player, hasFailed: true },
    };
  }
}

// ==========================================
// LEVEL PROGRESSION
// ==========================================

/**
 * Check if both players completed the current level
 */
export function areBothPlayersComplete(roomId: string): boolean {
  const room = roomService.getRoom(roomId);
  const chimpData = chimpRoomData.get(roomId);

  if (!room || !chimpData) return false;

  for (const [, progress] of chimpData.playerProgress) {
    if (progress.completedCount < chimpData.numbersCount) {
      return false;
    }
  }

  return true;
}

/**
 * Advance to next level in Chimp Memory
 */
export function advanceToNextLevel(roomId: string) {
  const room = roomService.getRoom(roomId);
  const chimpData = chimpRoomData.get(roomId);

  if (!room || !chimpData) return undefined;

  const newLevel = room.level + 1;
  const newNumbersCount = getNumbersCountForLevel(newLevel);
  const newCells = generateCells(newNumbersCount);

  // Update room level
  roomService.updateRoomGameData(roomId, { level: newLevel });
  roomService.resetPlayersProgress(roomId);

  // Update chimp-specific data
  chimpData.cells = newCells;
  chimpData.numbersCount = newNumbersCount;

  // Reset player progress
  for (const [playerId] of chimpData.playerProgress) {
    chimpData.playerProgress.set(playerId, {
      nextNumber: 1,
      completedCount: 0,
    });
  }

  return {
    room: roomService.getRoom(roomId),
    cells: newCells,
    numbersCount: newNumbersCount,
  };
}

/**
 * Clean up chimp room data
 */
export function cleanupRoom(roomId: string): void {
  chimpRoomData.delete(roomId);
}

/**
 * Get player progress for opponent display
 */
export function getPlayerProgress(roomId: string, playerId: string) {
  const chimpData = chimpRoomData.get(roomId);
  if (!chimpData) return null;

  return chimpData.playerProgress.get(playerId) || null;
}
