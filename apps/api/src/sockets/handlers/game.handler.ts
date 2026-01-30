import { Socket, Server } from "socket.io";
import {
  GAME_EVENTS,
  GameMovePayload,
  ChimpMovePayload,
} from "@mindarena/shared";
import * as roomService from "../../services/room.service";
import { sequenceMemory, chimpMemory } from "../../services/games";

export function registerGameHandlers(socket: Socket, io: Server) {
  const user = socket.data.user;
  const userId = user?.id || socket.id;

  // Player signals ready to start
  socket.on(GAME_EVENTS.READY, (data: { roomId: string }) => {
    const { roomId } = data;

    // Validate that player belongs to this room
    if (!validatePlayerInRoom(roomId, userId)) {
      console.log(`[GAME] Invalid ready: ${user?.name} not in room ${roomId}`);
      socket.emit(GAME_EVENTS.ERROR, {
        message: "You are not in this game room",
      });
      return;
    }

    console.log(`[GAME] Player ${user?.name} ready in room ${roomId}`);

    const allReady = roomService.setPlayerReady(roomId, userId);

    if (allReady) {
      startGameCountdown(io, roomId);
    } else {
      // Notify opponent that this player is ready
      const opponent = roomService.getOpponent(roomId, userId);
      if (opponent) {
        io.to(opponent.socketId).emit(GAME_EVENTS.ERROR, {
          message: "Opponent is ready! Waiting for you...",
          type: "info",
        });
      }
    }
  });

  // Player makes a move
  socket.on(GAME_EVENTS.MOVE, (data: GameMovePayload & { roomId: string }) => {
    const { roomId, cellIndex } = data;

    // Validate that player belongs to this room
    if (!validatePlayerInRoom(roomId, userId)) {
      console.log(`[GAME] Invalid move: ${user?.name} not in room ${roomId}`);
      return;
    }

    handlePlayerMove(socket, io, roomId, userId, cellIndex);
  });

  // Chimp Memory: Player makes a move
  socket.on(
    GAME_EVENTS.CHIMP_MOVE,
    (data: ChimpMovePayload & { roomId: string }) => {
      const { roomId, cellId } = data;

      if (!validatePlayerInRoom(roomId, userId)) {
        console.log(
          `[GAME] Invalid chimp move: ${user?.name} not in room ${roomId}`,
        );
        return;
      }

      handleChimpMove(socket, io, roomId, userId, cellId);
    },
  );

  // Handle disconnect during game
  socket.on("disconnecting", () => {
    handlePlayerDisconnect(socket, io, userId, user?.name);
  });
}

// ==========================================
// VALIDATION
// ==========================================

function validatePlayerInRoom(roomId: string, playerId: string): boolean {
  const room = roomService.getRoom(roomId);
  if (!room) return false;

  return room.players.some((p) => p.id === playerId);
}

// ==========================================
// GAME FLOW HANDLERS
// ==========================================

function startGameCountdown(io: Server, roomId: string) {
  const room = roomService.getRoom(roomId);
  if (!room) return;

  // Start countdown
  io.to(roomId).emit(GAME_EVENTS.COUNTDOWN, { seconds: 3 });

  // After countdown, start the game based on game type
  setTimeout(() => {
    const startedRoom = roomService.startGame(roomId);
    if (!startedRoom) return;

    // Normalize game type for comparison
    const gameType = startedRoom.gameType.toLowerCase();

    if (gameType === "chimp") {
      // Chimp Memory: Send cells data
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
    } else {
      // Sequence Memory (default)
      io.to(roomId).emit(GAME_EVENTS.START, {
        roomId: startedRoom.id,
        sequence: startedRoom.sequence,
        gridSize: startedRoom.gridSize,
        level: startedRoom.level,
        players: startedRoom.players.map((p) => ({ id: p.id, name: p.name })),
        countdown: 0,
      });
    }

    console.log(`[GAME] Started ${startedRoom.gameType} in room ${roomId}`);
  }, 3000);
}

function handlePlayerMove(
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

function handlePlayerFailed(io: Server, roomId: string) {
  const room = roomService.getRoom(roomId);
  if (!room) return;

  const winner = room.players.find((p) => !p.hasFailed);
  const loser = room.players.find((p) => p.hasFailed);

  if (winner && loser) {
    roomService.endGame(roomId, winner.id);

    io.to(roomId).emit(GAME_EVENTS.END, {
      winnerId: winner.id,
      loserId: loser.id,
      winnerName: winner.name,
      loserName: loser.name,
      reason: "opponent_failed",
      finalLevel: room.level,
    });

    console.log(`[GAME] ${winner.name} wins! (opponent failed)`);

    // Clean up room after delay
    setTimeout(() => roomService.removeRoom(roomId), 30000);
  }
}

function handleSequenceComplete(io: Server, roomId: string) {
  if (!sequenceMemory.areBothPlayersComplete(roomId)) return;

  // Both players completed - advance to next level
  const nextRoom = sequenceMemory.advanceToNextLevel(roomId);
  if (!nextRoom) return;

  io.to(roomId).emit(GAME_EVENTS.LEVEL_COMPLETE, {
    newLevel: nextRoom.level,
    newSequence: nextRoom.sequence,
    newGridSize: nextRoom.gridSize,
  });

  console.log(`[GAME] Room ${roomId} → Level ${nextRoom.level}`);
}

// ==========================================
// CHIMP MEMORY HANDLERS
// ==========================================

function handleChimpMove(
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

function handleChimpLevelComplete(io: Server, roomId: string) {
  if (!chimpMemory.areBothPlayersComplete(roomId)) return;

  // Both players completed - advance to next level
  const result = chimpMemory.advanceToNextLevel(roomId);
  if (!result) return;

  io.to(roomId).emit(GAME_EVENTS.CHIMP_LEVEL_COMPLETE, {
    newLevel: result.room?.level || 1,
    newCells: result.cells,
    newNumbersCount: result.numbersCount,
  });

  console.log(`[GAME] Chimp Room ${roomId} → Level ${result.room?.level}`);
}

function handlePlayerDisconnect(
  socket: Socket,
  io: Server,
  userId: string,
  userName?: string,
) {
  socket.rooms.forEach((roomId) => {
    if (roomId === socket.id) return; // Skip default room

    const room = roomService.getRoom(roomId);
    if (room && room.status === "playing") {
      const opponent = roomService.getOpponent(roomId, userId);
      if (opponent) {
        roomService.endGame(roomId, opponent.id);

        io.to(opponent.socketId).emit(GAME_EVENTS.END, {
          winnerId: opponent.id,
          loserId: userId,
          winnerName: opponent.name,
          loserName: userName || "Unknown",
          reason: "opponent_disconnected",
          finalLevel: room.level,
        });

        console.log(`[GAME] ${opponent.name} wins! (opponent disconnected)`);
      }
    }
  });
}
