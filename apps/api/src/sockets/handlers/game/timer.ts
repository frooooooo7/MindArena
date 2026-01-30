import { Server } from "socket.io";
import { GAME_EVENTS, ROUND_TIME_LIMIT } from "@mindarena/shared";
import * as roomService from "../../../services/room.service";
import { chimpMemory } from "../../../services/games";

// Store round timers per room
const roundTimers: Map<
  string,
  {
    interval: NodeJS.Timeout;
    timeout: NodeJS.Timeout;
    timeLeft: number;
  }
> = new Map();

/**
 * Clear round timer for a room
 */
export function clearRoundTimer(roomId: string) {
  const timer = roundTimers.get(roomId);
  if (timer) {
    clearInterval(timer.interval);
    clearTimeout(timer.timeout);
    roundTimers.delete(roomId);
    console.log(`[TIMER] Cleared timer for room ${roomId}`);
  }
}

/**
 * Start round timer for a room
 */
export function startRoundTimer(io: Server, roomId: string, gameType: string) {
  // Clear any existing timer
  clearRoundTimer(roomId);

  let timeLeft = ROUND_TIME_LIMIT;

  // Send initial timer
  io.to(roomId).emit(GAME_EVENTS.ROUND_TIMER, {
    timeLeft,
    totalTime: ROUND_TIME_LIMIT,
  });

  // Countdown interval - emit every second
  const interval = setInterval(() => {
    timeLeft--;
    io.to(roomId).emit(GAME_EVENTS.ROUND_TIMER, {
      timeLeft,
      totalTime: ROUND_TIME_LIMIT,
    });

    if (timeLeft <= 0) {
      clearInterval(interval);
    }
  }, 1000);

  // Timeout - end game when time runs out
  const timeout = setTimeout(() => {
    clearRoundTimer(roomId);
    handleRoundTimeout(io, roomId, gameType);
  }, ROUND_TIME_LIMIT * 1000);

  roundTimers.set(roomId, { interval, timeout, timeLeft });
  console.log(`[TIMER] Started ${ROUND_TIME_LIMIT}s timer for room ${roomId}`);
}

/**
 * Handle timeout - player(s) who didn't complete lose
 */
function handleRoundTimeout(io: Server, roomId: string, gameType: string) {
  const room = roomService.getRoom(roomId);
  if (!room || room.status !== "playing") return;

  console.log(`[TIMER] Timeout in room ${roomId}`);

  // Determine who completed and who didn't
  let player1Complete = false;
  let player2Complete = false;

  if (gameType === "chimp") {
    const chimpData = chimpMemory.getChimpRoomData(roomId);
    if (chimpData) {
      const progress1 = chimpData.playerProgress.get(room.players[0].id);
      const progress2 = chimpData.playerProgress.get(room.players[1].id);
      player1Complete =
        (progress1?.completedCount || 0) >= chimpData.numbersCount;
      player2Complete =
        (progress2?.completedCount || 0) >= chimpData.numbersCount;
    }
  } else {
    // Sequence Memory
    player1Complete = room.players[0].currentIndex >= room.sequence.length;
    player2Complete = room.players[1].currentIndex >= room.sequence.length;
  }

  // Determine winner and loser
  const { winnerId, loserId } = determineWinnerOnTimeout(
    room,
    player1Complete,
    player2Complete,
    gameType,
  );

  // If both completed, shouldn't happen - advance to next level
  if (!winnerId || !loserId) return;

  const winner = room.players.find((p) => p.id === winnerId);
  const loser = room.players.find((p) => p.id === loserId);

  if (winner && loser) {
    roomService.endGame(roomId, winnerId);

    io.to(roomId).emit(GAME_EVENTS.TIMEOUT, { loserId });
    io.to(roomId).emit(GAME_EVENTS.END, {
      winnerId: winner.id,
      loserId: loser.id,
      winnerName: winner.name,
      loserName: loser.name,
      reason: "timeout",
      finalLevel: room.level,
    });

    console.log(`[TIMER] ${winner.name} wins! (${loser.name} timed out)`);

    // Cleanup
    if (gameType === "chimp") {
      setTimeout(() => chimpMemory.cleanupRoom(roomId), 30000);
    }
    setTimeout(() => roomService.removeRoom(roomId), 30000);
  }
}

/**
 * Determine winner and loser based on completion status
 */
function determineWinnerOnTimeout(
  room: ReturnType<typeof roomService.getRoom>,
  player1Complete: boolean,
  player2Complete: boolean,
  gameType: string,
): { winnerId: string | null; loserId: string | null } {
  if (!room) return { winnerId: null, loserId: null };

  if (player1Complete && !player2Complete) {
    return { winnerId: room.players[0].id, loserId: room.players[1].id };
  }

  if (!player1Complete && player2Complete) {
    return { winnerId: room.players[1].id, loserId: room.players[0].id };
  }

  if (!player1Complete && !player2Complete) {
    // Neither completed - loser is whoever has less progress
    const p1Progress =
      gameType === "chimp"
        ? chimpMemory.getPlayerProgress(room.id, room.players[0].id)
            ?.completedCount || 0
        : room.players[0].currentIndex;
    const p2Progress =
      gameType === "chimp"
        ? chimpMemory.getPlayerProgress(room.id, room.players[1].id)
            ?.completedCount || 0
        : room.players[1].currentIndex;

    if (p1Progress < p2Progress) {
      return { winnerId: room.players[1].id, loserId: room.players[0].id };
    }
    return { winnerId: room.players[0].id, loserId: room.players[1].id };
  }

  // Both completed - shouldn't happen
  return { winnerId: null, loserId: null };
}
