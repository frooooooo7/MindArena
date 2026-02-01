import { Socket, Server } from "socket.io";
import {
  GAME_EVENTS,
  GameMovePayload,
  ChimpMovePayload,
} from "@mindarena/shared";
import * as roomService from "../../../services/room.service";
import { validatePlayerInRoom, handlePlayerDisconnect } from "./common";
import { handlePlayerMove, startSequenceGame } from "./sequence.handler";
import { handleChimpMove, startChimpGame } from "./chimp.handler";

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

  // Player makes a move (Sequence Memory)
  socket.on(GAME_EVENTS.MOVE, (data: GameMovePayload & { roomId: string }) => {
    const { roomId, cellIndex } = data;

    if (!validatePlayerInRoom(roomId, userId)) {
      console.log(`[GAME] Invalid move: ${user?.name} not in room ${roomId}`);
      return;
    }

    handlePlayerMove(socket, io, roomId, userId, cellIndex);
  });

  // Player makes a move (Chimp Memory)
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

  // Player explicitly leaves the game (forfeit)
  socket.on(GAME_EVENTS.LEAVE, () => {
    console.log(`[GAME] Player ${user?.name} forfeiting game`);
    handlePlayerDisconnect(
      socket,
      io,
      userId,
      user?.name,
      "opponent_forfeited",
    );
  });

  // Handle disconnect during game
  socket.on("disconnecting", () => {
    handlePlayerDisconnect(socket, io, userId, user?.name);
  });
}

/**
 * Start game countdown and then the appropriate game
 */
function startGameCountdown(io: Server, roomId: string) {
  const room = roomService.getRoom(roomId);
  if (!room) return;

  // Start countdown
  io.to(roomId).emit(GAME_EVENTS.COUNTDOWN, { seconds: 3 });

  // After countdown, start the game based on game type
  setTimeout(() => {
    const gameType = room.gameType.toLowerCase();

    if (gameType === "chimp") {
      startChimpGame(io, roomId);
    } else {
      startSequenceGame(io, roomId);
    }
  }, 3000);
}

// Re-export for external use
export { clearRoundTimer } from "./timer";
