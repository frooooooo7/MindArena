import { Socket, Server } from "socket.io";
import { GAME_EVENTS, ChimpMovePayload } from "@mindarena/shared";
import * as roomService from "../../../services/room.service";
import { chimpMemory } from "../../../services/games";
import { clearRoundTimer, startRoundTimer } from "./timer";
import { handlePlayerFailed } from "./common";

/**
 * Handle player move in Chimp Memory
 */
export function handleChimpMove(
  socket: Socket,
  io: Server,
  roomId: string,
  playerId: string,
  cellId: number,
) {
  const room = roomService.getRoom(roomId);
  if (!room || room.status !== "playing") return;

  const result = chimpMemory.processMove(roomId, playerId, cellId);

  // Notify the player of their move result
  socket.emit(GAME_EVENTS.CHIMP_MOVE_RESULT, {
    correct: result.correct,
    completedNumber: result.completedNumber,
    allCompleted: result.allCompleted,
  });

  // Notify opponent of player's progress
  const opponent = roomService.getOpponent(roomId, playerId);
  if (opponent && result.player) {
    const progress = chimpMemory.getPlayerProgress(roomId, playerId);
    io.to(opponent.socketId).emit(GAME_EVENTS.CHIMP_OPPONENT_PROGRESS, {
      playerId,
      completedCount: progress?.completedCount || 0,
      currentLevel: room.level,
    });
  }

  // Handle move outcome
  if (!result.correct) {
    handlePlayerFailed(io, roomId);
    // Clean up chimp room data
    setTimeout(() => chimpMemory.cleanupRoom(roomId), 30000);
  } else if (result.allCompleted) {
    // Player completed their level - notify them
    socket.emit(GAME_EVENTS.CHIMP_PLAYER_COMPLETE, {
      level: room.level,
      waitingForOpponent: true,
    });

    // Check if both players are done
    handleChimpLevelComplete(io, roomId);
  }
}

/**
 * Handle chimp level complete - check if both players are done
 */
function handleChimpLevelComplete(io: Server, roomId: string) {
  if (!chimpMemory.areBothPlayersComplete(roomId)) return;

  // Clear current round timer
  clearRoundTimer(roomId);

  // Both players completed - advance to next level
  const result = chimpMemory.advanceToNextLevel(roomId);
  if (!result) return;

  io.to(roomId).emit(GAME_EVENTS.CHIMP_LEVEL_COMPLETE, {
    newLevel: result.room?.level || 1,
    newCells: result.cells,
    newNumbersCount: result.numbersCount,
  });

  // Start new round timer after memorization phase (2 seconds)
  setTimeout(() => {
    startRoundTimer(io, roomId, "chimp");
  }, 2000);

  console.log(`[GAME] Chimp Room ${roomId} → Level ${result.room?.level}`);
}

/**
 * Start Chimp Memory game
 */
export function startChimpGame(io: Server, roomId: string) {
  const startedRoom = roomService.startGame(roomId);
  if (!startedRoom) return;

  const chimpData = chimpMemory.getChimpRoomData(roomId);
  if (!chimpData) return;

  io.to(roomId).emit(GAME_EVENTS.CHIMP_START, {
    roomId: startedRoom.id,
    cells: chimpData.cells,
    numbersCount: chimpData.numbersCount,
    level: startedRoom.level,
    players: startedRoom.players.map((p) => ({ id: p.id, name: p.name })),
    countdown: 0,
  });

  // Start round timer after memorization phase (2 seconds)
  setTimeout(() => {
    startRoundTimer(io, roomId, "chimp");
  }, 2000);

  console.log(`[GAME] Started Chimp Memory in room ${roomId}`);
}
