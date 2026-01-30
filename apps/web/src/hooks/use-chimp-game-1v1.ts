import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { socket } from "@/lib/socket";
import { useArenaStore } from "@/store/arena.store";
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
  GameEndPayload,
} from "@mindarena/shared";

const MEMORIZE_TIME = 2000; // ms to show numbers before hiding

type GameStatus =
  | "waiting"
  | "countdown"
  | "memorize"
  | "playing"
  | "levelComplete"
  | "finished";

interface GameState {
  status: GameStatus;
  countdown: number;
  level: number;
  cells: ChimpCell[];
  numbersCount: number;
  nextNumber: number;
  completedCount: number;
}

interface OpponentState {
  progress: number;
  level: number;
}

const initialGameState: GameState = {
  status: "waiting",
  countdown: 0,
  level: 1,
  cells: [],
  numbersCount: 4,
  nextNumber: 1,
  completedCount: 0,
};

/**
 * Hook for 1v1 Chimp Memory game
 * Handles socket communication and local game state
 */
export function useChimpGame1v1() {
  const router = useRouter();
  const { match, resetArena } = useArenaStore();
  const { user } = useAuthStore();
  const roomId = match?.room ?? "";

  // Consolidated game state (reduces re-renders)
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [opponent, setOpponent] = useState<OpponentState>({
    progress: 0,
    level: 1,
  });
  const [matchCancelled, setMatchCancelled] = useState(false);
  const [gameResult, setGameResult] = useState<GameEndPayload | null>(null);
  const [isWinner, setIsWinner] = useState<boolean | null>(null);

  // Refs for cleanup and mounted state tracking
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const memorizeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Track mounted state to prevent state updates after unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Cells lookup map for O(1) access instead of O(n) find
  const cellsMap = useMemo(
    () => new Map(gameState.cells.map((cell) => [cell.id, cell])),
    [gameState.cells],
  );

  // Cleanup all timers helper
  const clearAllTimers = useCallback(() => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    if (memorizeTimerRef.current) {
      clearTimeout(memorizeTimerRef.current);
      memorizeTimerRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return clearAllTimers;
  }, [clearAllTimers]);

  // Redirect if no match
  useEffect(() => {
    if (!match) {
      router.push("/arena");
    }
  }, [match, router]);

  // Auto-send ready when page loads
  useEffect(() => {
    if (match && gameState.status === "waiting") {
      const timer = setTimeout(() => {
        socket.emit(GAME_EVENTS.READY, { roomId });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [match, gameState.status, roomId]);

  // Start memorize phase with proper timer cleanup
  const startMemorizePhase = useCallback(
    (cells: ChimpCell[], level: number, numbersCount: number) => {
      // Clear previous memorize timer first to prevent memory leak
      if (memorizeTimerRef.current) {
        clearTimeout(memorizeTimerRef.current);
      }

      setGameState((prev) => ({
        ...prev,
        status: "memorize",
        cells,
        level,
        numbersCount,
        nextNumber: 1,
        completedCount: 0,
      }));

      memorizeTimerRef.current = setTimeout(() => {
        // Check if component is still mounted
        if (!isMountedRef.current) return;

        setGameState((prev) => ({
          ...prev,
          status: "playing",
          cells: prev.cells.map((cell) => ({
            ...cell,
            revealed: cell.number === null, // Empty cells stay visible, numbered cells hide
          })),
        }));
      }, MEMORIZE_TIME);
    },
    [],
  );

  // Socket event handlers
  useEffect(() => {
    if (!roomId) return;

    // Countdown event
    const handleCountdown = (data: { seconds: number }) => {
      console.log("[ChimpGame] Countdown:", data.seconds);
      clearAllTimers();

      setGameState((prev) => ({
        ...prev,
        status: "countdown",
        countdown: data.seconds,
      }));

      let remaining = data.seconds;
      countdownTimerRef.current = setInterval(() => {
        remaining--;
        if (!isMountedRef.current) {
          clearAllTimers();
          return;
        }
        setGameState((prev) => ({ ...prev, countdown: remaining }));
        if (remaining <= 0) {
          clearAllTimers();
        }
      }, 1000);
    };

    // Chimp game start event
    const handleChimpStart = (data: ChimpGameStartPayload) => {
      console.log("[ChimpGame] Game started:", data);
      clearAllTimers();
      setOpponent({ progress: 0, level: data.level });
      startMemorizePhase(data.cells, data.level, data.numbersCount);
    };

    // Move result event
    const handleMoveResult = (data: ChimpMoveResultPayload) => {
      console.log("[ChimpGame] Move result:", data);
      if (!data.correct) return;

      setGameState((prev) => ({
        ...prev,
        nextNumber: prev.nextNumber + 1,
        completedCount: prev.completedCount + 1,
        cells: prev.cells.map((cell) =>
          cell.number === data.completedNumber
            ? { ...cell, completed: true, revealed: true }
            : cell,
        ),
      }));
    };

    // Opponent progress event
    const handleOpponentProgress = (data: ChimpOpponentProgressPayload) => {
      console.log("[ChimpGame] Opponent progress:", data);
      setOpponent({
        progress: data.completedCount,
        level: data.currentLevel,
      });
    };

    // Match cancelled event
    const handleMatchCancelled = () => {
      console.log("[ChimpGame] Match cancelled");
      setMatchCancelled(true);
    };

    // Player completed level - waiting for opponent (from server)
    const handlePlayerComplete = (data: ChimpPlayerCompletePayload) => {
      console.log("[ChimpGame] Player complete, waiting for opponent:", data);
      setGameState((prev) => ({
        ...prev,
        status: "levelComplete",
      }));
    };

    // Level complete event
    const handleLevelComplete = (data: ChimpLevelCompletePayload) => {
      console.log("[ChimpGame] Level complete:", data);
      setOpponent((prev) => ({ ...prev, progress: 0 }));
      startMemorizePhase(data.newCells, data.newLevel, data.newNumbersCount);
    };

    // Game end event
    const handleGameEnd = (data: GameEndPayload) => {
      console.log("[ChimpGame] Game ended:", data);
      clearAllTimers();

      setGameState((prev) => ({
        ...prev,
        status: "finished",
        cells: prev.cells.map((cell) => ({ ...cell, revealed: true })),
      }));

      setGameResult(data);

      // Safe winner check with fallback
      const opponentName = match?.opponent?.name;
      if (opponentName && data.loserName) {
        setIsWinner(data.loserName === opponentName);
      } else if (user?.name && data.loserName) {
        setIsWinner(data.loserName !== user.name);
      }
    };

    socket.on(GAME_EVENTS.COUNTDOWN, handleCountdown);
    socket.on(GAME_EVENTS.CHIMP_START, handleChimpStart);
    socket.on(GAME_EVENTS.CHIMP_MOVE_RESULT, handleMoveResult);
    socket.on(GAME_EVENTS.CHIMP_OPPONENT_PROGRESS, handleOpponentProgress);
    socket.on(ARENA_EVENTS.MATCH_CANCELLED, handleMatchCancelled);
    socket.on(GAME_EVENTS.CHIMP_PLAYER_COMPLETE, handlePlayerComplete);
    socket.on(GAME_EVENTS.CHIMP_LEVEL_COMPLETE, handleLevelComplete);
    socket.on(GAME_EVENTS.END, handleGameEnd);

    return () => {
      clearAllTimers();
      socket.off(GAME_EVENTS.COUNTDOWN, handleCountdown);
      socket.off(GAME_EVENTS.CHIMP_START, handleChimpStart);
      socket.off(GAME_EVENTS.CHIMP_MOVE_RESULT, handleMoveResult);
      socket.off(GAME_EVENTS.CHIMP_OPPONENT_PROGRESS, handleOpponentProgress);
      socket.off(ARENA_EVENTS.MATCH_CANCELLED, handleMatchCancelled);
      socket.off(GAME_EVENTS.CHIMP_PLAYER_COMPLETE, handlePlayerComplete);
      socket.off(GAME_EVENTS.CHIMP_LEVEL_COMPLETE, handleLevelComplete);
      socket.off(GAME_EVENTS.END, handleGameEnd);
    };
  }, [
    roomId,
    match?.opponent?.name,
    user?.name,
    startMemorizePhase,
    clearAllTimers,
  ]);

  // Handle cell click with O(1) lookup
  const handleCellClick = useCallback(
    (cellId: number) => {
      if (gameState.status !== "playing") return;

      const cell = cellsMap.get(cellId);
      if (!cell || cell.number === null || cell.completed) return;

      // Always send move to server - server handles win/lose logic
      // Even incorrect clicks must be sent so server can end the game
      socket.emit(GAME_EVENTS.CHIMP_MOVE, { roomId, cellId });
    },
    [gameState.status, cellsMap, roomId],
  );

  // Send ready signal
  const sendReady = useCallback(() => {
    if (roomId) {
      socket.emit(GAME_EVENTS.READY, { roomId });
    }
  }, [roomId]);

  // Handle back to arena
  const handleBackToArena = useCallback(() => {
    resetArena();
    router.push("/arena");
  }, [resetArena, router]);

  return {
    match,
    user,
    gameStatus: gameState.status,
    countdown: gameState.countdown,
    level: gameState.level,
    cells: gameState.cells,
    numbersCount: gameState.numbersCount,
    nextNumber: gameState.nextNumber,
    completedCount: gameState.completedCount,
    opponentProgress: opponent.progress,
    opponentLevel: opponent.level,
    waitingForOpponent: gameState.status === "levelComplete",
    isWinner,
    gameResult,
    matchCancelled,
    handleCellClick,
    handleBackToArena,
    sendReady,
  };
}
