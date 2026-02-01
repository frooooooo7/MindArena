import { Socket, Server } from "socket.io";
import { GAME_EVENTS } from "@mindarena/shared";
import * as roomService from "../../../services/room.service";
import { clearRoundTimer } from "./timer";

/**
 * Validate that a player belongs to a room
 */
export function validatePlayerInRoom(
  roomId: string,
  playerId: string,
): boolean {
  const room = roomService.getRoom(roomId);
  if (!room) return false;

  return room.players.some((p) => p.id === playerId);
}

/**
 * Handle player failed (wrong move)
 */
export function handlePlayerFailed(io: Server, roomId: string) {
  const room = roomService.getRoom(roomId);
  if (!room) return;

  // Clear round timer
  clearRoundTimer(roomId);

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

/**
 * Handle player disconnect during game
 */
export function handlePlayerDisconnect(
  socket: Socket,
  io: Server,
  userId: string,
  userName?: string,
  reason: "opponent_disconnected" | "opponent_forfeited" = "opponent_disconnected",
) {
  socket.rooms.forEach((roomId) => {
    if (roomId === socket.id) return; // Skip default room

    const room = roomService.getRoom(roomId);
    if (room && room.status === "playing") {
      // Clear round timer
      clearRoundTimer(roomId);

      const opponent = roomService.getOpponent(roomId, userId);
      if (opponent) {
        roomService.endGame(roomId, opponent.id);

        io.to(opponent.socketId).emit(GAME_EVENTS.END, {
          winnerId: opponent.id,
          loserId: userId,
          winnerName: opponent.name,
          loserName: userName || "Unknown",
          reason: reason,
          finalLevel: room.level,
        });

        console.log(`[GAME] ${opponent.name} wins! (opponent disconnected)`);
      }
    }
  });
}
