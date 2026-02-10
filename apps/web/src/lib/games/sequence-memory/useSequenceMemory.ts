"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { GameState, getGridSizeForLevel } from "./types";
import { gameResultApi } from "@/lib/game-result-api";
import { useAuthStore } from "@/store/auth.store";

export function useSequenceMemory() {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [gameState, setGameState] = useState<GameState>("idle");
  const [activeCell, setActiveCell] = useState<number | null>(null);
  const [clickedCell, setClickedCell] = useState<number | null>(null);
  
  const gridSize = getGridSizeForLevel(level);
  const totalCells = gridSize * gridSize;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const { isAuthenticated } = useAuthStore();

  const generateSequence = useCallback((length: number, maxCell: number): number[] => {
    const seq: number[] = [];
    for (let i = 0; i < length; i++) {
      seq.push(Math.floor(Math.random() * maxCell));
    }
    return seq;
  }, []);

  const showSequence = useCallback(async (seq: number[]) => {
    setGameState("showing");
    
    for (let i = 0; i < seq.length; i++) {
      await new Promise((resolve) => {
        timeoutRef.current = setTimeout(resolve, 600);
      });
      setActiveCell(seq[i]);
      await new Promise((resolve) => {
        timeoutRef.current = setTimeout(resolve, 400);
      });
      setActiveCell(null);
    }
    
    await new Promise((resolve) => {
      timeoutRef.current = setTimeout(resolve, 300);
    });
    
    setGameState("playing");
  }, []);

  const startGame = useCallback(() => {
    const newSequence = generateSequence(1, 9); // Start with 1 item on 3x3
    setLevel(1);
    setScore(0);
    setSequence(newSequence);
    setPlayerIndex(0);
    startTimeRef.current = Date.now();
    showSequence(newSequence);
  }, [generateSequence, showSequence]);

  const nextLevel = useCallback(() => {
    const newLevel = level + 1;
    const newGridSize = getGridSizeForLevel(newLevel);
    const newTotalCells = newGridSize * newGridSize;
    const newSequence = generateSequence(newLevel, newTotalCells);
    
    setLevel(newLevel);
    setScore((prev) => prev + level * 10);
    setSequence(newSequence);
    setPlayerIndex(0);
    
    setTimeout(() => {
      showSequence(newSequence);
    }, 500);
  }, [level, generateSequence, showSequence]);

  // Save game result when game ends
  useEffect(() => {
    if (gameState === "gameover" && isAuthenticated && startTimeRef.current) {
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      gameResultApi.save({
        gameType: "sequence",
        score,
        level,
        duration,
        mode: "local",
      }).catch((err) => console.error("Failed to save game result:", err));
    }
  }, [gameState, isAuthenticated, score, level]);

  const handleCellClick = useCallback((cellIndex: number) => {
    if (gameState !== "playing") return;

    setClickedCell(cellIndex);
    setTimeout(() => setClickedCell(null), 150);

    if (sequence[playerIndex] === cellIndex) {
      // Correct!
      if (playerIndex === sequence.length - 1) {
        // Completed sequence
        setGameState("success");
        setTimeout(() => {
          nextLevel();
        }, 800);
      } else {
        setPlayerIndex((prev) => prev + 1);
      }
    } else {
      // Wrong!
      setGameState("gameover");
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  }, [gameState, sequence, playerIndex, nextLevel]);

  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return {
    level,
    score,
    gridSize,
    totalCells,
    gameState,
    activeCell,
    clickedCell,
    playerIndex,
    sequenceLength: sequence.length,
    startGame,
    handleCellClick,
    cleanup,
  };
}
