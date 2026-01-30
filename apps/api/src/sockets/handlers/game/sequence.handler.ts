import { Socket, Server } from "socket.io";
import { GAME_EVENTS, GameMovePayload } from "@mindarena/shared";
import * as roomService from "../../../services/room.service";
import { sequenceMemory } from "../../../services/games";
import { clearRoundTimer, startRoundTimer } from "./timer";
import { handlePlayerFailed } from "./common";

/**
 * Handle player move in Sequence Memory
 */
export function handlePlayerMove(
  socket: Socket,
  io: Server,
  roomId: string,
  playerId: string,
  cellIndex: number,
) {
  const room = roomService.getRoom(roomId);
  if (!room || room.status !== "playing") return;

  // Process move using game-specific logic
  const result = sequenceMemory.processMove(roomId, playerId, cellIndex);

  // Notify the player of their move result
  socket.emit(GAME_EVENTS.MOVE_RESULT, {
    correct: result.correct,
    sequenceComplete: result.sequenceComplete,
  });

  // Notify opponent of player's progress
  const opponent = roomService.getOpponent(roomId, playerId);
  if (opponent && result.player) {
    io.to(opponent.socketId).emit(GAME_EVENTS.OPPONENT_PROGRESS, {
      playerId,
      currentIndex: result.player.currentIndex,
      currentLevel: result.player.currentLevel,
    });
  }

  // Handle move outcome
  if (!result.correct) {
    handlePlayerFailed(io, roomId);
  } else if (result.sequenceComplete) {
    handleSequenceComplete(io, roomId);
  }
}

/**
 * Handle sequence complete - check if both players are done
 */
function handleSequenceComplete(io: Server, roomId: string) {
  if (!sequenceMemory.areBothPlayersComplete(roomId)) return;

  // Clear current round timer
  clearRoundTimer(roomId);

  // Both players completed - advance to next level
  const nextRoom = sequenceMemory.advanceToNextLevel(roomId);
  if (!nextRoom) return;

  io.to(roomId).emit(GAME_EVENTS.LEVEL_COMPLETE, {
    newLevel: nextRoom.level,
    newSequence: nextRoom.sequence,
    newGridSize: nextRoom.gridSize,
  });

  // Start new round timer after sequence animation
  const animationTime = nextRoom.sequence.length * 1000 + 500;
  setTimeout(() => {
    startRoundTimer(io, roomId, "sequence");
  }, animationTime);

  console.log(`[GAME] Room ${roomId} → Level ${nextRoom.level}`);
}

/**
 * Start Sequence Memory game
 */
export function startSequenceGame(io: Server, roomId: string) {
  const startedRoom = roomService.startGame(roomId);
  if (!startedRoom) return;

  io.to(roomId).emit(GAME_EVENTS.START, {
    roomId: startedRoom.id,
    sequence: startedRoom.sequence,
    gridSize: startedRoom.gridSize,
    level: startedRoom.level,
    players: startedRoom.players.map((p) => ({ id: p.id, name: p.name })),
    countdown: 0,
  });

  // Start round timer after sequence animation
  const animationTime = startedRoom.sequence.length * 1000 + 500;
  setTimeout(() => {
    startRoundTimer(io, roomId, "sequence");
  }, animationTime);

  console.log(`[GAME] Started Sequence Memory in room ${roomId}`);
}
