import { useEffect, useState, useCallback, useRef } from "react";
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
  GameEndPayload,
  ArenaMatch,
} from "@mindarena/shared";

const MEMORIZE_TIME = 2000; // ms to show numbers before hiding

/**
 * Hook for 1v1 Chimp Memory game
 * Handles socket communication and local game state
 */
export function useChimpGame1v1() {
  const router = useRouter();
  const { match, resetArena } = useArenaStore();
  const { user } = useAuthStore();
  const roomId = match?.room || "";

  // Game state
  const [gameStatus, setGameStatus] = useState<
    "waiting" | "countdown" | "memorize" | "playing" | "finished"
  >("waiting");
  const [countdown, setCountdown] = useState(0);
  const [level, setLevel] = useState(1);
  const [cells, setCells] = useState<ChimpCell[]>([]);
  const [numbersCount, setNumbersCount] = useState(4);
  const [nextNumber, setNextNumber] = useState(1);
  const [completedCount, setCompletedCount] = useState(0);
  const [matchCancelled, setMatchCancelled] = useState(false);

  // Opponent state
  const [opponentProgress, setOpponentProgress] = useState(0);
  const [opponentLevel, setOpponentLevel] = useState(1);

  // Result
  const [gameResult, setGameResult] = useState<GameEndPayload | null>(null);
  const [isWinner, setIsWinner] = useState<boolean | null>(null);

  // Refs
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const memorizeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Redirect if no match
  useEffect(() => {
    if (!match) {
      router.push("/arena");
    }
  }, [match, router]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
      if (memorizeTimerRef.current) {
        clearTimeout(memorizeTimerRef.current);
      }
    };
  }, []);

  // Auto-send ready when page loads
  useEffect(() => {
    if (match && gameStatus === "waiting") {
      const timer = setTimeout(() => {
        socket.emit(GAME_EVENTS.READY, { roomId });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [match, gameStatus, roomId]);

  // Hide numbers after memorize phase
  const startMemorizePhase = useCallback((initialCells: ChimpCell[]) => {
    setGameStatus("memorize");
    setCells(initialCells);

    memorizeTimerRef.current = setTimeout(() => {
      // Hide numbers (but keep cells with numbers visible as hidden)
      setCells((prev) =>
        prev.map((cell) => ({
          ...cell,
          revealed: cell.number === null, // Empty cells stay visible, numbered cells hide
        })),
      );
      setGameStatus("playing");
    }, MEMORIZE_TIME);
  }, []);

  // Socket event handlers
  useEffect(() => {
    if (!roomId) return;

    // Countdown event
    const handleCountdown = (data: { seconds: number }) => {
      console.log("[ChimpGame] Countdown:", data.seconds);
      setGameStatus("countdown");
      setCountdown(data.seconds);

      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }

      let remaining = data.seconds;
      countdownTimerRef.current = setInterval(() => {
        remaining--;
        setCountdown(remaining);
        if (remaining <= 0 && countdownTimerRef.current) {
          clearInterval(countdownTimerRef.current);
          countdownTimerRef.current = null;
        }
      }, 1000);
    };

    // Chimp game start event
    const handleChimpStart = (data: ChimpGameStartPayload) => {
      console.log("[ChimpGame] Game started:", data);

      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }

      setLevel(data.level);
      setNumbersCount(data.numbersCount);
      setNextNumber(1);
      setCompletedCount(0);
      setOpponentProgress(0);

      // Start memorize phase
      startMemorizePhase(data.cells);
    };

    // Move result event
    const handleMoveResult = (data: ChimpMoveResultPayload) => {
      console.log("[ChimpGame] Move result:", data);
      if (data.correct) {
        setNextNumber((prev) => prev + 1);
        setCompletedCount((prev) => prev + 1);

        // Mark the cell as completed
        setCells((prev) =>
          prev.map((cell) =>
            cell.number === data.completedNumber
              ? { ...cell, completed: true, revealed: true }
              : cell,
          ),
        );
      }
    };

    // Opponent progress event
    const handleOpponentProgress = (data: ChimpOpponentProgressPayload) => {
      console.log("[ChimpGame] Opponent progress:", data);
      setOpponentProgress(data.completedCount);
      setOpponentLevel(data.currentLevel);
    };

    // Match cancelled event
    const handleMatchCancelled = (data: { reason: string }) => {
      console.log("[ChimpGame] Match cancelled:", data.reason);
      setMatchCancelled(true);
    };

    // Level complete event
    const handleLevelComplete = (data: ChimpLevelCompletePayload) => {
      console.log("[ChimpGame] Level complete:", data);
      setLevel(data.newLevel);
      setNumbersCount(data.newNumbersCount);
      setNextNumber(1);
      setCompletedCount(0);
      setOpponentProgress(0);

      // Start memorize phase for new level
      startMemorizePhase(data.newCells);
    };

    // Game end event
    const handleGameEnd = (data: GameEndPayload) => {
      console.log("[ChimpGame] Game ended:", data);
      setGameStatus("finished");
      setGameResult(data);

      // Reveal all numbers on game end
      setCells((prev) => prev.map((cell) => ({ ...cell, revealed: true })));

      // Determine if current user is winner
      const opponentName = match?.opponent?.name;
      setIsWinner(data.loserName === opponentName);
    };

    socket.on(GAME_EVENTS.COUNTDOWN, handleCountdown);
    socket.on(GAME_EVENTS.CHIMP_START, handleChimpStart);
    socket.on(GAME_EVENTS.CHIMP_MOVE_RESULT, handleMoveResult);
    socket.on(GAME_EVENTS.CHIMP_OPPONENT_PROGRESS, handleOpponentProgress);
    socket.on(ARENA_EVENTS.MATCH_CANCELLED, handleMatchCancelled);
    socket.on(GAME_EVENTS.CHIMP_LEVEL_COMPLETE, handleLevelComplete);
    socket.on(GAME_EVENTS.END, handleGameEnd);

    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
      if (memorizeTimerRef.current) {
        clearTimeout(memorizeTimerRef.current);
        memorizeTimerRef.current = null;
      }

      socket.off(GAME_EVENTS.COUNTDOWN, handleCountdown);
      socket.off(GAME_EVENTS.CHIMP_START, handleChimpStart);
      socket.off(GAME_EVENTS.CHIMP_MOVE_RESULT, handleMoveResult);
      socket.off(GAME_EVENTS.CHIMP_OPPONENT_PROGRESS, handleOpponentProgress);
      socket.off(ARENA_EVENTS.MATCH_CANCELLED, handleMatchCancelled);
      socket.off(GAME_EVENTS.CHIMP_LEVEL_COMPLETE, handleLevelComplete);
      socket.off(GAME_EVENTS.END, handleGameEnd);
    };
  }, [roomId, match?.opponent?.name, startMemorizePhase]);

  // Handle cell click
  const handleCellClick = useCallback(
    (cellId: number) => {
      if (gameStatus !== "playing") return;

      const cell = cells.find((c) => c.id === cellId);
      if (!cell || cell.number === null || cell.completed) return;

      // Send move to server
      socket.emit(GAME_EVENTS.CHIMP_MOVE, { roomId, cellId });
    },
    [gameStatus, cells, roomId],
  );

  // Send ready signal
  const sendReady = useCallback(() => {
    if (!roomId) return;
    socket.emit(GAME_EVENTS.READY, { roomId });
  }, [roomId]);

  // Handle back to arena
  const handleBackToArena = useCallback(() => {
    resetArena();
    router.push("/arena");
  }, [resetArena, router]);

  return {
    match,
    user,
    gameStatus,
    countdown,
    level,
    cells,
    numbersCount,
    nextNumber,
    completedCount,
    opponentProgress,
    opponentLevel,
    isWinner,
    gameResult,
    matchCancelled,
    handleCellClick,
    handleBackToArena,
    sendReady,
  };
}
