"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { GameState, generateCode, MEMORIZE_TIME } from "./types";
import { gameResultApi } from "@/lib/game-result-api";
import { useAuthStore } from "@/store/auth.store";

export function useCodeMemory() {
  const [level, setLevel] = useState(1);
  const [code, setCode] = useState("");
  const [userInput, setUserInput] = useState("");
  const [gameState, setGameState] = useState<GameState>("idle");
  const [score, setScore] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const { isAuthenticated } = useAuthStore();

  const codeLength = 3 + level;

  const startGame = useCallback(() => {
    const newCode = generateCode(4);
    setLevel(1);
    setScore(0);
    setCode(newCode);
    setUserInput("");
    setGameState("memorize");
    startTimeRef.current = Date.now();

    timeoutRef.current = setTimeout(() => {
      setGameState("input");
    }, MEMORIZE_TIME);
  }, []);

  const nextLevel = useCallback(() => {
    const newLevel = level + 1;
    const newLength = 3 + newLevel;
    const newCode = generateCode(newLength);

    setLevel(newLevel);
    setScore((prev) => prev + level * 10 + code.length * 5);
    setCode(newCode);
    setUserInput("");
    setGameState("memorize");

    timeoutRef.current = setTimeout(() => {
      setGameState("input");
    }, MEMORIZE_TIME);
  }, [level, code.length]);

  // Save game result when game ends
  useEffect(() => {
    if (gameState === "gameover" && isAuthenticated && startTimeRef.current) {
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      gameResultApi.save({
        gameType: "code",
        score,
        level,
        duration,
        mode: "local",
      }).catch((err) => console.error("Failed to save game result:", err));
    }
  }, [gameState, isAuthenticated, score, level]);

  const handleSubmit = useCallback(() => {
    if (gameState !== "input") return;

    if (userInput.toUpperCase() === code) {
      setGameState("success");
      setTimeout(() => {
        nextLevel();
      }, 800);
    } else {
      setGameState("gameover");
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  }, [gameState, userInput, code, nextLevel]);

  const handleInputChange = useCallback((value: string) => {
    const filtered = value.toUpperCase().replace(/[^0-9A-Z]/g, "");
    setUserInput(filtered);
  }, []);

  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return {
    level,
    code,
    codeLength,
    userInput,
    gameState,
    score,
    startGame,
    handleSubmit,
    handleInputChange,
    cleanup,
  };
}
