"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { GameState, Cell, TOTAL_CELLS, MEMORIZE_TIME } from "./types";
import { gameResultApi } from "@/lib/game-result-api";
import { useAuthStore } from "@/store/auth.store";

export function useChimpMemory() {
  const [level, setLevel] = useState(1);
  const [cells, setCells] = useState<Cell[]>([]);
  const [nextNumber, setNextNumber] = useState(1);
  const [gameState, setGameState] = useState<GameState>("idle");
  const [numbersCount, setNumbersCount] = useState(4);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const { isAuthenticated } = useAuthStore();

  const generateLevel = useCallback((count: number): Cell[] => {
    const newCells: Cell[] = Array.from({ length: TOTAL_CELLS }, (_, i) => ({
      id: i,
      number: null,
      revealed: true,
      completed: false,
    }));

    const positions: number[] = [];
    while (positions.length < count) {
      const pos = Math.floor(Math.random() * TOTAL_CELLS);
      if (!positions.includes(pos)) {
        positions.push(pos);
      }
    }

    positions.forEach((pos, index) => {
      newCells[pos].number = index + 1;
    });

    return newCells;
  }, []);

  const startGame = useCallback(() => {
    const count = 4;
    const newCells = generateLevel(count);
    
    setLevel(1);
    setNumbersCount(count);
    setCells(newCells);
    setNextNumber(1);
    setGameState("memorize");
    startTimeRef.current = Date.now();

    timeoutRef.current = setTimeout(() => {
      setCells((prev) =>
        prev.map((cell) => ({
          ...cell,
          revealed: cell.number === null,
        }))
      );
      setGameState("playing");
    }, MEMORIZE_TIME);
  }, [generateLevel]);

  const nextLevel = useCallback(() => {
    const newLevel = level + 1;
    const newCount = numbersCount + 1;
    const newCells = generateLevel(newCount);

    setLevel(newLevel);
    setNumbersCount(newCount);
    setCells(newCells);
    setNextNumber(1);
    setGameState("memorize");

    timeoutRef.current = setTimeout(() => {
      setCells((prev) =>
        prev.map((cell) => ({
          ...cell,
          revealed: cell.number === null,
        }))
      );
      setGameState("playing");
    }, MEMORIZE_TIME);
  }, [level, numbersCount, generateLevel]);

  // Save game result when game ends
  useEffect(() => {
    if (gameState === "gameover" && isAuthenticated && startTimeRef.current) {
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const score = (level - 1) * 100 + (numbersCount - 4) * 50;
      gameResultApi.save({
        gameType: "chimp",
        score,
        level,
        duration,
        mode: "local",
      }).catch((err) => console.error("Failed to save game result:", err));
    }
  }, [gameState, isAuthenticated, level, numbersCount]);

  const handleCellClick = useCallback((cellId: number) => {
    if (gameState !== "playing") return;

    const cell = cells.find((c) => c.id === cellId);
    if (!cell || cell.number === null || cell.completed) return;

    if (cell.number === nextNumber) {
      setCells((prev) =>
        prev.map((c) =>
          c.id === cellId ? { ...c, completed: true, revealed: true } : c
        )
      );

      if (nextNumber === numbersCount) {
        setGameState("success");
        setTimeout(() => {
          nextLevel();
        }, 800);
      } else {
        setNextNumber((prev) => prev + 1);
      }
    } else {
      setGameState("gameover");
      setCells((prev) =>
        prev.map((c) => ({ ...c, revealed: true }))
      );
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  }, [gameState, cells, nextNumber, numbersCount, nextLevel]);

  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return {
    level,
    cells,
    nextNumber,
    numbersCount,
    gameState,
    startGame,
    handleCellClick,
    cleanup,
  };
}
