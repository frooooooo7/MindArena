"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  MathOperation,
  Difficulty,
  GameMode,
  GameState,
  Question,
  FastMathStats,
} from "./types";
import { gameResultApi } from "@/lib/game-result-api";
import { useAuthStore } from "@/store/auth.store";

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function generateQuestion(
  operation: MathOperation,
  difficulty: Difficulty
): Question {
  // Determine operator
  let op: "add" | "subtract" | "multiply" | "divide" = "add";
  if (operation === "mixed") {
    const ops: ("add" | "subtract" | "multiply" | "divide")[] = ["add", "subtract", "multiply", "divide"];
    op = ops[Math.floor(Math.random() * ops.length)];
  } else {
    op = operation;
  }

  let num1 = 1;
  let num2 = 1;
  let answer = 0;
  let symbol = "+";

  if (op === "add") {
    symbol = "+";
    if (difficulty === "easy") {
      num1 = getRandomInt(1, 10);
      num2 = getRandomInt(1, 10);
    } else if (difficulty === "medium") {
      num1 = getRandomInt(10, 100);
      num2 = getRandomInt(10, 100);
    } else {
      num1 = getRandomInt(100, 1000);
      num2 = getRandomInt(100, 1000);
    }
    answer = num1 + num2;
  } else if (op === "subtract") {
    symbol = "-";
    if (difficulty === "easy") {
      num1 = getRandomInt(1, 10);
      num2 = getRandomInt(1, num1);
    } else if (difficulty === "medium") {
      num1 = getRandomInt(10, 100);
      num2 = getRandomInt(1, num1);
    } else {
      num1 = getRandomInt(100, 1000);
      num2 = getRandomInt(10, num1);
    }
    answer = num1 - num2;
  } else if (op === "multiply") {
    symbol = "×";
    if (difficulty === "easy") {
      num1 = getRandomInt(1, 10);
      num2 = getRandomInt(1, 10);
    } else if (difficulty === "medium") {
      num1 = getRandomInt(2, 15);
      num2 = getRandomInt(2, 15);
    } else {
      num1 = getRandomInt(5, 30);
      num2 = getRandomInt(5, 30);
    }
    answer = num1 * num2;
  } else {
    // Division (integer quotient)
    symbol = "÷";
    if (difficulty === "easy") {
      num2 = getRandomInt(1, 10);
      answer = getRandomInt(1, 10);
    } else if (difficulty === "medium") {
      num2 = getRandomInt(2, 12);
      answer = getRandomInt(2, 15);
    } else {
      num2 = getRandomInt(3, 25);
      answer = getRandomInt(5, 40);
    }
    num1 = num2 * answer;
  }

  // Generate 3 unique distractor options close to the answer
  const distractors = new Set<number>();
  const rangeOffset = Math.max(3, Math.floor(Math.abs(answer) * 0.25));

  let attempts = 0;
  while (distractors.size < 3 && attempts < 50) {
    attempts++;
    const delta = getRandomInt(1, rangeOffset);
    const fake = Math.random() < 0.5 ? answer + delta : answer - delta;
    if (fake !== answer && (op !== "subtract" && op !== "divide" ? fake >= 0 : true)) {
      distractors.add(fake);
    }
  }

  let fallbackOffset = 1;
  while (distractors.size < 3) {
    const fake = answer + fallbackOffset;
    if (fake !== answer) distractors.add(fake);
    fallbackOffset++;
  }

  const options = shuffleArray([answer, ...Array.from(distractors)]);

  return {
    id: Math.random().toString(36).substring(2, 9),
    equation: `${num1} ${symbol} ${num2}`,
    operand1: num1,
    operand2: num2,
    operatorSymbol: symbol,
    correctAnswer: answer,
    options,
  };
}

export function useFastMath() {
  const [operation, setOperation] = useState<MathOperation>("mixed");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [gameMode, setGameMode] = useState<GameMode>("blitz");

  // Custom durations & counts
  const [timePreset, setTimePreset] = useState<number>(30); // 30, 60, 120, 200, or custom
  const [equationPreset, setEquationPreset] = useState<number>(20); // 10, 20, 50, 100, or custom

  const [gameState, setGameState] = useState<GameState>("idle");
  const [countdown, setCountdown] = useState<number>(3);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);

  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [wrongCount, setWrongCount] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [equationsLeft, setEquationsLeft] = useState<number>(20);

  const [bestScore, setBestScore] = useState<number | null>(null);
  const [lastStats, setLastStats] = useState<FastMathStats | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  // Refs for timer callbacks
  const scoreRef = useRef<number>(0);
  const streakRef = useRef<number>(0);
  const maxStreakRef = useRef<number>(0);
  const correctCountRef = useRef<number>(0);
  const wrongCountRef = useRef<number>(0);
  const livesRef = useRef<number>(3);
  const timeLeftRef = useRef<number>(30);
  const reactionTimesRef = useRef<number[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const questionStartTimeRef = useRef<number>(Date.now());
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { isAuthenticated } = useAuthStore();

  const storageKey = `fast_math_best_${gameMode}_${operation}_${difficulty}_${timePreset}_${equationPreset}`;

  // Sync refs
  useEffect(() => {
    scoreRef.current = score;
    streakRef.current = streak;
    maxStreakRef.current = maxStreak;
    correctCountRef.current = correctCount;
    wrongCountRef.current = wrongCount;
    livesRef.current = lives;
    timeLeftRef.current = timeLeft;
  }, [score, streak, maxStreak, correctCount, wrongCount, lives, timeLeft]);

  // Load best score from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setBestScore(parseInt(saved, 10));
      } else {
        setBestScore(null);
      }
    }
  }, [storageKey]);

  const stopTimers = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    timerRef.current = null;
    countdownRef.current = null;
    feedbackTimeoutRef.current = null;
  }, []);

  const finishGame = useCallback(() => {
    stopTimers();
    setGameState("completed");

    const finalScore = scoreRef.current;
    const finalCorrect = correctCountRef.current;
    const finalWrong = wrongCountRef.current;
    const finalMaxStreak = maxStreakRef.current;

    const total = finalCorrect + finalWrong;
    const accuracy = total > 0 ? Math.round((finalCorrect / total) * 100) : 0;
    const avgReactionTimeMs =
      reactionTimesRef.current.length > 0
        ? Math.round(
            reactionTimesRef.current.reduce((a, b) => a + b, 0) /
              reactionTimesRef.current.length
          )
        : 0;

    let isNewRecord = false;
    const currentBest = bestScore;
    if (!currentBest || finalScore > currentBest) {
      isNewRecord = true;
      setBestScore(finalScore);
      if (typeof window !== "undefined") {
        localStorage.setItem(storageKey, finalScore.toString());
      }
    }

    const stats: FastMathStats = {
      score: finalScore,
      totalAnswered: total,
      correctAnswers: finalCorrect,
      wrongAnswers: finalWrong,
      accuracy,
      avgReactionTimeMs,
      maxStreak: finalMaxStreak,
      isNewRecord,
      gameMode,
      operation,
      difficulty,
    };

    setLastStats(stats);

    if (isAuthenticated) {
      gameResultApi
        .save({
          gameType: "fast-math",
          score: finalScore,
          level: finalCorrect,
          duration: Math.round((avgReactionTimeMs * total) / 1000) || timePreset,
          mode: "local",
        })
        .catch((err) => console.error("Failed to save Fast Math result:", err));
    }
  }, [stopTimers, bestScore, storageKey, isAuthenticated, gameMode, operation, difficulty, timePreset]);

  const startGame = useCallback(() => {
    stopTimers();
    setGameState("countdown");
    setCountdown(3);

    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setCorrectCount(0);
    setWrongCount(0);
    setLives(3);

    scoreRef.current = 0;
    streakRef.current = 0;
    maxStreakRef.current = 0;
    correctCountRef.current = 0;
    wrongCountRef.current = 0;
    livesRef.current = 3;
    reactionTimesRef.current = [];

    const activeTime = timePreset;
    setTimeLeft(activeTime);
    timeLeftRef.current = activeTime;

    setEquationsLeft(equationPreset);

    let count = 3;
    countdownRef.current = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
      } else {
        if (countdownRef.current) clearInterval(countdownRef.current);
        setGameState("playing");
        setCurrentQuestion(generateQuestion(operation, difficulty));
        questionStartTimeRef.current = Date.now();

        if (gameMode === "blitz") {
          timerRef.current = setInterval(() => {
            const nextTime = timeLeftRef.current - 1;
            timeLeftRef.current = nextTime;
            setTimeLeft(nextTime);

            if (nextTime <= 0) {
              if (timerRef.current) clearInterval(timerRef.current);
              finishGame();
            }
          }, 1000);
        }
      }
    }, 800);
  }, [stopTimers, gameMode, operation, difficulty, timePreset, equationPreset, finishGame]);

  const resetGame = useCallback(() => {
    stopTimers();
    setGameState("idle");
    setScore(0);
    setStreak(0);
    setCorrectCount(0);
    setWrongCount(0);
    setLives(3);
    setCurrentQuestion(null);
  }, [stopTimers]);

  const handleAnswer = useCallback(
    (selectedOption: number) => {
      if (gameState !== "playing" || !currentQuestion) return;

      const reactionTime = Date.now() - questionStartTimeRef.current;
      reactionTimesRef.current.push(reactionTime);

      const isCorrect = selectedOption === currentQuestion.correctAnswer;

      if (isCorrect) {
        setFeedback("correct");
        const newStreak = streakRef.current + 1;
        setStreak(newStreak);
        streakRef.current = newStreak;

        const newMaxStreak = Math.max(maxStreakRef.current, newStreak);
        setMaxStreak(newMaxStreak);
        maxStreakRef.current = newMaxStreak;

        const newCorrect = correctCountRef.current + 1;
        setCorrectCount(newCorrect);
        correctCountRef.current = newCorrect;

        const streakBonus = Math.min(newStreak, 5) * 20;
        const speedBonus = Math.max(0, Math.round((1200 - reactionTime) / 10));
        const addedScore = 100 + streakBonus + speedBonus;

        setScore((prev) => {
          const updated = prev + addedScore;
          scoreRef.current = updated;
          return updated;
        });
      } else {
        setFeedback("wrong");
        setStreak(0);
        streakRef.current = 0;

        const newWrong = wrongCountRef.current + 1;
        setWrongCount(newWrong);
        wrongCountRef.current = newWrong;

        setScore((prev) => {
          const updated = Math.max(0, prev - 40);
          scoreRef.current = updated;
          return updated;
        });

        // Survival mode life deduction
        if (gameMode === "survival") {
          const newLives = livesRef.current - 1;
          livesRef.current = newLives;
          setLives(newLives);

          if (newLives <= 0) {
            finishGame();
            return;
          }
        }
      }

      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
      feedbackTimeoutRef.current = setTimeout(() => {
        setFeedback(null);
      }, 180);

      // Check equations mode target
      if (gameMode === "equations") {
        const nextCount = equationsLeft - 1;
        setEquationsLeft(nextCount);
        if (nextCount <= 0) {
          finishGame();
          return;
        }
      }

      // Next question
      setCurrentQuestion(generateQuestion(operation, difficulty));
      questionStartTimeRef.current = Date.now();
    },
    [gameState, currentQuestion, gameMode, operation, difficulty, finishGame]
  );

  const cleanup = useCallback(() => {
    stopTimers();
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
  }, [stopTimers]);

  return {
    operation,
    difficulty,
    gameMode,
    timePreset,
    equationPreset,
    gameState,
    countdown,
    currentQuestion,
    score,
    streak,
    maxStreak,
    correctCount,
    wrongCount,
    lives,
    timeLeft,
    equationsLeft,
    bestScore,
    lastStats,
    feedback,
    setOperation,
    setDifficulty,
    setGameMode,
    setTimePreset,
    setEquationPreset,
    startGame,
    resetGame,
    handleAnswer,
    cleanup,
  };
}
