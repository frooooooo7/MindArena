"use client";

import { useState, useCallback, useRef } from "react";
import { GameState, generateCode, MEMORIZE_TIME } from "./types";

export function useCodeMemory() {
  const [level, setLevel] = useState(1);
  const [code, setCode] = useState("");
  const [userInput, setUserInput] = useState("");
  const [gameState, setGameState] = useState<GameState>("idle");
  const [score, setScore] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const codeLength = 3 + level; // Start with 4 chars at level 1

  const startGame = useCallback(() => {
    const newCode = generateCode(4); // Start with 4 chars
    setLevel(1);
    setScore(0);
    setCode(newCode);
    setUserInput("");
    setGameState("memorize");

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

  const handleSubmit = useCallback(() => {
    if (gameState !== "input") return;

    if (userInput.toUpperCase() === code) {
      // Correct!
      setGameState("success");
      setTimeout(() => {
        nextLevel();
      }, 800);
    } else {
      // Wrong!
      setGameState("gameover");
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  }, [gameState, userInput, code, nextLevel]);

  const handleInputChange = useCallback((value: string) => {
    // Only allow alphanumeric characters
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
