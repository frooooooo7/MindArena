import { Socket, Server } from "socket.io";
import { GAME_EVENTS, scoring } from "@mindarena/shared";
import * as roomService from "../../../services/room.service";
import { clearRoundTimer } from "./timer";
import { gameResultService } from "../../../services/game-result.service";

/**
 * Helper to calculate score based on game type and level
 */
function calculateScore(gameType: string, level: number): number {
  return scoring.calculateScore(gameType, level);
}

/**
 * Helper to save game results for all players in a room
 */
async function saveArenaResults(roomId: string) {
  const room = roomService.getRoom(roomId);
  if (!room) return;

  const duration = Math.floor((Date.now() - room.createdAt.getTime()) / 1000);
  const score = calculateScore(room.gameType, room.level);

  for (const player of room.players) {
    // Only save if player is an authenticated user (not a guest)
    if (player.id && !player.isGuest) {
        try {
            await gameResultService.saveResult({
                userId: player.id,
                gameType: room.gameType.toLowerCase(),
                score: score,
                level: room.level,
                duration: duration,
                mode: "arena"
            });
        } catch (error) {
            console.error(`[GAME] Failed to save arena result for player ${player.id}:`, error);
        }
    }
  }
}

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
export async function handlePlayerFailed(io: Server, roomId: string) {
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

    // Save results to database
    await saveArenaResults(roomId);
  }
}

/**
 * Handle player disconnect during game
 */
export async function handlePlayerDisconnect(
  socket: Socket,
  io: Server,
  userId: string,
  userName?: string,
  reason: "opponent_disconnected" | "opponent_forfeited" = "opponent_disconnected",
) {
  for (const roomId of socket.rooms) {
    if (roomId === socket.id) continue; // Skip default room

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

        // Save results to database
        await saveArenaResults(roomId);
      }
    }
  }
}
