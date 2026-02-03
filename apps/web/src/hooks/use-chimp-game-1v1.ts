import { useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { socket } from "@/lib/socket";
import { useArenaStore } from "@/store/arena.store";
import { useChimpStore } from "@/store/game/chimp.store";
import { useAuthStore } from "@/store/auth.store";
import {
  GAME_EVENTS,
  ARENA_EVENTS,
  ChimpCell,
  ChimpGameStartPayload,
  ChimpMoveResultPayload,
  ChimpLevelCompletePayload,
  ChimpOpponentProgressPayload,
  ChimpPlayerCompletePayload,
  RoundTimerPayload,
  GameEndPayload,
} from "@mindarena/shared";
import { useGameProtection } from "./use-game-protection";

const MEMORIZE_TIME = 2000; // ms to show numbers before hiding

/**
 * Hook for 1v1 Chimp Memory game
 * Handles socket communication and local game state
 * State is now in useChimpStore.
 */
export function useChimpGame1v1() {
  const router = useRouter();
  const { match, resetArena } = useArenaStore();

  // Connect store to global match state on mount
  useEffect(() => {
    if (match) {
      useChimpStore.getState().setMatch(match);
    }
    return () => useChimpStore.getState().resetGame();
  }, [match]);

  const roomId = match?.room ?? "";

  // Game Protection
  const status = useChimpStore((s: any) => s.status);
  useGameProtection({
    gameStatus: status,
    gameResult: useChimpStore.getState().gameResult,
    matchCancelled: useChimpStore.getState().matchCancelled,
    activeStatuses: ["playing", "countdown", "memorize"],
  });

  // Refs for cleanup
  const memorizeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Track mounted state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Helpers
  const clearMemorizeTimer = useCallback(() => {
    if (memorizeTimerRef.current) {
      clearTimeout(memorizeTimerRef.current);
      memorizeTimerRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return clearMemorizeTimer;
  }, [clearMemorizeTimer]);

  // Start memorize phase
  const startMemorizePhase = useCallback(
    (cells: ChimpCell[], level: number, numbersCount: number) => {
      clearMemorizeTimer();
      const store = useChimpStore.getState();

      store.setStatus("memorize");
      store.startGame({ cells, level, numbersCount } as ChimpGameStartPayload);

      memorizeTimerRef.current = setTimeout(() => {
        if (!isMountedRef.current) return;
        store.hideNumbers();
      }, MEMORIZE_TIME);
    },
    [clearMemorizeTimer]
  );

  // Socket event handlers
  useEffect(() => {
    if (!roomId) return;
    const store = useChimpStore.getState();

    const handleCountdown = (data: { seconds: number }) => {
      store.setStatus("countdown");
      store.setCountdown(data.seconds);
      clearMemorizeTimer();
    };

    const handleChimpStart = (data: ChimpGameStartPayload) => {
      clearMemorizeTimer();
      startMemorizePhase(data.cells, data.level, data.numbersCount);
    };

    const handleMoveResult = (data: ChimpMoveResultPayload) => {
      if (!data.correct) return;
      store.handleCorrectMove(data.completedNumber);
    };

    const handleOpponentProgress = (data: ChimpOpponentProgressPayload) => {
      store.updateOpponent(data);
    };

    const handleMatchCancelled = () => {
      store.setMatchCancelled(true);
    };

    const handlePlayerComplete = (data: ChimpPlayerCompletePayload) => {
      store.setStatus("levelComplete");
    };

    const handleLevelComplete = (data: ChimpLevelCompletePayload) => {
      clearMemorizeTimer();
      store.updateLevel(data);
      startMemorizePhase(data.newCells, data.newLevel, data.newNumbersCount);
    };

    const handleRoundTimer = (data: RoundTimerPayload) => {
      store.setTimeLeft(data.timeLeft);
    };

    const handleGameEnd = (data: GameEndPayload) => {
      clearMemorizeTimer();
      const currentUserName = useAuthStore.getState().user?.name || "Player";
      store.endGame(data, currentUserName);
    };

    socket.on(GAME_EVENTS.COUNTDOWN, handleCountdown);
    socket.on(GAME_EVENTS.CHIMP_START, handleChimpStart);
    socket.on(GAME_EVENTS.CHIMP_MOVE_RESULT, handleMoveResult);
    socket.on(GAME_EVENTS.CHIMP_OPPONENT_PROGRESS, handleOpponentProgress);
    socket.on(ARENA_EVENTS.MATCH_CANCELLED, handleMatchCancelled);
    socket.on(GAME_EVENTS.CHIMP_PLAYER_COMPLETE, handlePlayerComplete);
    socket.on(GAME_EVENTS.CHIMP_LEVEL_COMPLETE, handleLevelComplete);
    socket.on(GAME_EVENTS.ROUND_TIMER, handleRoundTimer);
    socket.on(GAME_EVENTS.END, handleGameEnd);

    // Auto-Send Ready
    if (store.status === "waiting") {
      setTimeout(() => {
        socket.emit(GAME_EVENTS.READY, { roomId });
      }, 1000);
    }

    return () => {
      clearMemorizeTimer();
      socket.off(GAME_EVENTS.COUNTDOWN, handleCountdown);
      socket.off(GAME_EVENTS.CHIMP_START, handleChimpStart);
      socket.off(GAME_EVENTS.CHIMP_MOVE_RESULT, handleMoveResult);
      socket.off(GAME_EVENTS.CHIMP_OPPONENT_PROGRESS, handleOpponentProgress);
      socket.off(ARENA_EVENTS.MATCH_CANCELLED, handleMatchCancelled);
      socket.off(GAME_EVENTS.CHIMP_PLAYER_COMPLETE, handlePlayerComplete);
      socket.off(GAME_EVENTS.CHIMP_LEVEL_COMPLETE, handleLevelComplete);
      socket.off(GAME_EVENTS.ROUND_TIMER, handleRoundTimer);
      socket.off(GAME_EVENTS.END, handleGameEnd);
    };
  }, [
    roomId,
    match,
    startMemorizePhase,
    clearMemorizeTimer,
  ]);

  // Handle cell click

  const handleCellClick = useCallback(
    (cellId: number) => {
      const store = useChimpStore.getState();
      if (store.status !== "playing") return;

      // Note: O(n) find in store state vs Map. 
      // Ideally cells should be a Map in store or we trust the passed ID.
      // For now finding from current state array.
      const cell = store.cells.find((c: any) => c.id === cellId);

      if (!cell || cell.number === null || cell.completed) return;
      socket.emit(GAME_EVENTS.CHIMP_MOVE, { roomId, cellId });
    },
    [roomId]
  );

  // Actions
  const handleBackToArena = useCallback(() => {
    resetArena();
    router.push("/arena");
  }, [resetArena, router]);

  // Redirect if no match
  useEffect(() => {
    if (!match) {
      router.push("/arena");
    }
  }, [match, router]);

  return {
    handleBackToArena,
    handleCellClick
  };
}
