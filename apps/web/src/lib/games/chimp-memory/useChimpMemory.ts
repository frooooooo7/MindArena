"use client";

import { useState, useCallback, useRef } from "react";
import { GameState, Cell, TOTAL_CELLS, MEMORIZE_TIME } from "./types";

export function useChimpMemory() {
  const [level, setLevel] = useState(1);
  const [cells, setCells] = useState<Cell[]>([]);
  const [nextNumber, setNextNumber] = useState(1);
  const [gameState, setGameState] = useState<GameState>("idle");
  const [numbersCount, setNumbersCount] = useState(4); // Start with 4 numbers
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const generateLevel = useCallback((count: number): Cell[] => {
    // Create empty cells
    const newCells: Cell[] = Array.from({ length: TOTAL_CELLS }, (_, i) => ({
      id: i,
      number: null,
      revealed: true,
      completed: false,
    }));

    // Pick random positions for numbers
    const positions: number[] = [];
    while (positions.length < count) {
      const pos = Math.floor(Math.random() * TOTAL_CELLS);
      if (!positions.includes(pos)) {
        positions.push(pos);
      }
    }

    // Assign numbers 1 to count at random positions
    positions.forEach((pos, index) => {
      newCells[pos].number = index + 1;
    });

    return newCells;
  }, []);

  const startGame = useCallback(() => {
    const count = 4; // Reset to 4 numbers
    const newCells = generateLevel(count);
    
    setLevel(1);
    setNumbersCount(count);
    setCells(newCells);
    setNextNumber(1);
    setGameState("memorize");

    // Hide numbers after memorize time
    timeoutRef.current = setTimeout(() => {
      setCells((prev) =>
        prev.map((cell) => ({
          ...cell,
          revealed: cell.number === null, // Keep empty cells revealed, hide numbers
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

  const handleCellClick = useCallback((cellId: number) => {
    if (gameState !== "playing") return;

    const cell = cells.find((c) => c.id === cellId);
    if (!cell || cell.number === null || cell.completed) return;

    if (cell.number === nextNumber) {
      // Correct!
      setCells((prev) =>
        prev.map((c) =>
          c.id === cellId ? { ...c, completed: true, revealed: true } : c
        )
      );

      if (nextNumber === numbersCount) {
        // Completed all numbers!
        setGameState("success");
        setTimeout(() => {
          nextLevel();
        }, 800);
      } else {
        setNextNumber((prev) => prev + 1);
      }
    } else {
      // Wrong!
      setGameState("gameover");
      // Reveal all numbers on game over
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
