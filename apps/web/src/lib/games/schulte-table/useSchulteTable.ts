"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { GridSize, OrderDirection, GameState, Cell, GameStats } from "./types";
import { gameResultApi } from "@/lib/game-result-api";
import { useAuthStore } from "@/store/auth.store";

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function useSchulteTable() {
  const [gridSize, setGridSize] = useState<GridSize>(5);
  const [orderDirection, setOrderDirection] = useState<OrderDirection>("asc");
  const [gameState, setGameState] = useState<GameState>("idle");
  const [countdown, setCountdown] = useState<number>(3);
  const [cells, setCells] = useState<Cell[]>([]);
  const [currentNumber, setCurrentNumber] = useState<number>(1);
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [mistakes, setMistakes] = useState<number>(0);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [lastStats, setLastStats] = useState<GameStats | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const flashTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { isAuthenticated } = useAuthStore();

  const totalNumbers = gridSize * gridSize;
  const startNumber = orderDirection === "asc" ? 1 : totalNumbers;
  const targetEndNumber = orderDirection === "asc" ? totalNumbers : 1;

  // Load best time from localStorage for current config
  useEffect(() => {
    if (typeof window !== "undefined") {
      const key = `schulte_best_${gridSize}_${orderDirection}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        setBestTime(parseFloat(saved));
      } else {
        setBestTime(null);
      }
    }
  }, [gridSize, orderDirection]);

  // Generate shuffled grid
  const generateGrid = useCallback(() => {
    const numbers = Array.from({ length: totalNumbers }, (_, i) => i + 1);
    const shuffledNumbers = shuffleArray(numbers);

    const newCells: Cell[] = shuffledNumbers.map((num, idx) => ({
      id: idx,
      number: num,
      completed: false,
    }));

    setCells(newCells);
    setCurrentNumber(startNumber);
    setElapsedMs(0);
    setMistakes(0);
  }, [totalNumbers, startNumber]);

  // Handle countdown -> start game
  const startGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);

    generateGrid();
    setGameState("countdown");
    setCountdown(3);

    let count = 3;
    countdownRef.current = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
      } else {
        if (countdownRef.current) clearInterval(countdownRef.current);
        setGameState("playing");
        startTimeRef.current = Date.now();

        timerRef.current = setInterval(() => {
          if (startTimeRef.current) {
            setElapsedMs(Date.now() - startTimeRef.current);
          }
        }, 30);
      }
    }, 800);
  }, [generateGrid]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, []);

  const resetGame = useCallback(() => {
    stopTimer();
    setGameState("idle");
    setElapsedMs(0);
    setMistakes(0);
    generateGrid();
  }, [stopTimer, generateGrid]);

  const handleCellClick = useCallback(
    (cellId: number) => {
      if (gameState !== "playing") return;

      const cellIndex = cells.findIndex((c) => c.id === cellId);
      if (cellIndex === -1) return;

      const cell = cells[cellIndex];
      if (cell.completed) return;

      if (cell.number === currentNumber) {
        // Correct click!
        const updatedCells = [...cells];
        updatedCells[cellIndex] = { ...cell, completed: true };
        setCells(updatedCells);

        const isLastNumber = cell.number === targetEndNumber;

        if (isLastNumber) {
          // Game Completed!
          stopTimer();
          const finalTimeMs = startTimeRef.current
            ? Date.now() - startTimeRef.current
            : elapsedMs;
          const finalTimeSec = finalTimeMs / 1000;

          const totalClicks = totalNumbers + mistakes;
          const accuracy = Math.round((totalNumbers / totalClicks) * 100);
          const cps = parseFloat((totalNumbers / Math.max(finalTimeSec, 0.1)).toFixed(2));

          let isNewRecord = false;
          const currentBest = bestTime;
          if (!currentBest || finalTimeMs < currentBest) {
            isNewRecord = true;
            setBestTime(finalTimeMs);
            if (typeof window !== "undefined") {
              localStorage.setItem(
                `schulte_best_${gridSize}_${orderDirection}`,
                finalTimeMs.toString()
              );
            }
          }

          const stats: GameStats = {
            elapsedMs: finalTimeMs,
            mistakes,
            accuracy,
            clicksPerSecond: cps,
            isNewRecord,
          };

          setLastStats(stats);
          setGameState("completed");

          // Save game result API if logged in
          if (isAuthenticated) {
            const score = Math.max(100, Math.round((10000 / (finalTimeMs / 1000)) * (gridSize / 5)));
            gameResultApi
              .save({
                gameType: "schulte",
                score,
                level: gridSize,
                duration: Math.round(finalTimeSec),
                mode: "local",
              })
              .catch((err) => console.error("Failed to save Schulte Table result:", err));
          }
        } else {
          // Next target
          const nextTarget = orderDirection === "asc" ? currentNumber + 1 : currentNumber - 1;
          setCurrentNumber(nextTarget);
        }
      } else {
        // Wrong click!
        setMistakes((prev) => prev + 1);

        // Flash red on target cell
        setCells((prev) =>
          prev.map((c) => (c.id === cellId ? { ...c, wrongFlash: true } : c))
        );

        if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
        flashTimeoutRef.current = setTimeout(() => {
          setCells((prev) =>
            prev.map((c) => (c.wrongFlash ? { ...c, wrongFlash: false } : c))
          );
        }, 300);
      }
    },
    [
      gameState,
      cells,
      currentNumber,
      targetEndNumber,
      orderDirection,
      totalNumbers,
      mistakes,
      elapsedMs,
      bestTime,
      gridSize,
      isAuthenticated,
      stopTimer,
    ]
  );

  const changeGridSize = useCallback(
    (newSize: GridSize) => {
      setGridSize(newSize);
      resetGame();
    },
    [resetGame]
  );

  const changeOrderDirection = useCallback(
    (newDir: OrderDirection) => {
      setOrderDirection(newDir);
      resetGame();
    },
    [resetGame]
  );

  const cleanup = useCallback(() => {
    stopTimer();
    if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
  }, [stopTimer]);

  useEffect(() => {
    generateGrid();
  }, [generateGrid]);

  return {
    gridSize,
    orderDirection,
    gameState,
    countdown,
    cells,
    currentNumber,
    elapsedMs,
    mistakes,
    bestTime,
    lastStats,
    startGame,
    resetGame,
    handleCellClick,
    changeGridSize,
    changeOrderDirection,
    cleanup,
  };
}
