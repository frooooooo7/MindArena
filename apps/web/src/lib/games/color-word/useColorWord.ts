"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  GameMode,
  RuleMode,
  Difficulty,
  GameState,
  ColorItem,
  Question,
  QuestionTarget,
  ColorWordStats,
} from "./types";
import { gameResultApi } from "@/lib/game-result-api";
import { useAuthStore } from "@/store/auth.store";

export const COLOR_ITEMS: ColorItem[] = [
  { id: "red", namePl: "CZERWONY", hex: "#EF4444", textColorClass: "text-red-500", bgColorClass: "bg-red-500", borderColorClass: "border-red-500" },
  { id: "blue", namePl: "NIEBIESKI", hex: "#3B82F6", textColorClass: "text-blue-500", bgColorClass: "bg-blue-500", borderColorClass: "border-blue-500" },
  { id: "green", namePl: "ZIELONY", hex: "#22C55E", textColorClass: "text-green-500", bgColorClass: "bg-green-500", borderColorClass: "border-green-500" },
  { id: "yellow", namePl: "ŻÓŁTY", hex: "#EAB308", textColorClass: "text-yellow-400", bgColorClass: "bg-yellow-400", borderColorClass: "border-yellow-400" },
  { id: "purple", namePl: "FIOLETOWY", hex: "#A855F7", textColorClass: "text-purple-500", bgColorClass: "bg-purple-500", borderColorClass: "border-purple-500" },
  { id: "orange", namePl: "POMARAŃCZOWY", hex: "#F97316", textColorClass: "text-orange-500", bgColorClass: "bg-orange-500", borderColorClass: "border-orange-500" },
  { id: "pink", namePl: "RÓŻOWY", hex: "#EC4899", textColorClass: "text-pink-500", bgColorClass: "bg-pink-500", borderColorClass: "border-pink-500" },
];

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
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
  ruleMode: RuleMode,
  difficulty: Difficulty,
  gameMode: GameMode
): Question {
  const availableColors =
    difficulty === "easy" ? COLOR_ITEMS.slice(0, 4) : COLOR_ITEMS;

  const textWord = getRandomItem(availableColors);
  let colorInk = getRandomItem(availableColors);

  // 80% chance of mismatch for Stroop effect
  if (Math.random() < 0.8) {
    while (colorInk.id === textWord.id) {
      colorInk = getRandomItem(availableColors);
    }
  }

  // Optional background distraction for Expert mode
  let bgDistraction: ColorItem | undefined = undefined;
  if (difficulty === "expert") {
    bgDistraction = getRandomItem(availableColors);
  }

  // Target rule
  let target: QuestionTarget = "color";
  if (ruleMode === "text") {
    target = "text";
  } else if (ruleMode === "mixed") {
    target = Math.random() < 0.5 ? "color" : "text";
  }

  const correctAnswer = target === "color" ? colorInk : textWord;

  // True/False Mode: Tests if font color matches word text meaning
  if (gameMode === "true_false") {
    const tfIsCorrect = Math.random() < 0.5;
    const textWord = getRandomItem(availableColors);
    let colorInk = textWord;

    if (!tfIsCorrect) {
      const wrongInkPool = availableColors.filter((c) => c.id !== textWord.id);
      colorInk = getRandomItem(wrongInkPool);
    }

    return {
      id: Math.random().toString(36).substring(2, 9),
      textWord,
      colorInk,
      bgDistraction,
      target: "color",
      options: [],
      isTrueFalse: true,
      tfTargetColor: colorInk,
      tfIsCorrect,
    };
  }

  // Standard 4 choices
  const wrongChoices = availableColors.filter((c) => c.id !== correctAnswer.id);
  const selectedWrong = shuffleArray(wrongChoices).slice(0, 3);
  const options = shuffleArray([correctAnswer, ...selectedWrong]);

  return {
    id: Math.random().toString(36).substring(2, 9),
    textWord,
    colorInk,
    bgDistraction,
    target,
    options,
    isTrueFalse: false,
  };
}

export function useColorWord() {
  const [gameMode, setGameMode] = useState<GameMode>("blitz");
  const [ruleMode, setRuleMode] = useState<RuleMode>("color");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [gameState, setGameState] = useState<GameState>("idle");
  const [countdown, setCountdown] = useState<number>(3);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);

  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [wrongCount, setWrongCount] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [roundsLeft, setRoundsLeft] = useState<number>(20);
  const [feverActive, setFeverActive] = useState<boolean>(false);

  const [bestScore, setBestScore] = useState<number | null>(null);
  const [lastStats, setLastStats] = useState<ColorWordStats | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  // Refs for state stability in timer callbacks
  const scoreRef = useRef<number>(0);
  const streakRef = useRef<number>(0);
  const maxStreakRef = useRef<number>(0);
  const correctCountRef = useRef<number>(0);
  const wrongCountRef = useRef<number>(0);
  const timeLeftRef = useRef<number>(30);
  const reactionTimesRef = useRef<number[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const questionStartTimeRef = useRef<number>(Date.now());
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { isAuthenticated } = useAuthStore();

  const storageKey = `color_word_best_${gameMode}_${ruleMode}_${difficulty}`;

  // Sync refs with state
  useEffect(() => {
    scoreRef.current = score;
    streakRef.current = streak;
    maxStreakRef.current = maxStreak;
    correctCountRef.current = correctCount;
    wrongCountRef.current = wrongCount;
    timeLeftRef.current = timeLeft;
  }, [score, streak, maxStreak, correctCount, wrongCount, timeLeft]);

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
    timerRef.current = null;
    countdownRef.current = null;
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

    const stats: ColorWordStats = {
      score: finalScore,
      totalAnswered: total,
      correctAnswers: finalCorrect,
      wrongAnswers: finalWrong,
      accuracy,
      avgReactionTimeMs,
      maxStreak: finalMaxStreak,
      isNewRecord,
    };

    setLastStats(stats);

    if (isAuthenticated) {
      gameResultApi
        .save({
          gameType: "color-word",
          score: finalScore,
          level: finalCorrect,
          duration: Math.round((avgReactionTimeMs * total) / 1000) || 30,
          mode: "local",
        })
        .catch((err) => console.error("Failed to save Color Word result:", err));
    }
  }, [stopTimers, bestScore, storageKey, isAuthenticated]);

  const startGame = useCallback(() => {
    stopTimers();
    setGameState("countdown");
    setCountdown(3);

    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setCorrectCount(0);
    setWrongCount(0);
    setFeverActive(false);

    scoreRef.current = 0;
    streakRef.current = 0;
    maxStreakRef.current = 0;
    correctCountRef.current = 0;
    wrongCountRef.current = 0;
    reactionTimesRef.current = [];

    const initialTime = gameMode === "fever" ? 15 : 30;
    setTimeLeft(initialTime);
    timeLeftRef.current = initialTime;
    setRoundsLeft(20);

    let count = 3;
    countdownRef.current = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
      } else {
        if (countdownRef.current) clearInterval(countdownRef.current);
        setGameState("playing");
        setCurrentQuestion(generateQuestion(ruleMode, difficulty, gameMode));
        questionStartTimeRef.current = Date.now();

        if (gameMode === "blitz" || gameMode === "fever" || gameMode === "true_false") {
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
  }, [stopTimers, gameMode, ruleMode, difficulty, finishGame]);

  const resetGame = useCallback(() => {
    stopTimers();
    setGameState("idle");
    setScore(0);
    setStreak(0);
    setCorrectCount(0);
    setWrongCount(0);
    setFeverActive(false);
    setCurrentQuestion(null);
  }, [stopTimers]);

  const handleAnswer = useCallback(
    (selectedAnswer: string | boolean) => {
      if (gameState !== "playing" || !currentQuestion) return;

      const reactionTime = Date.now() - questionStartTimeRef.current;
      reactionTimesRef.current.push(reactionTime);

      let isCorrect = false;

      if (currentQuestion.isTrueFalse) {
        isCorrect = selectedAnswer === currentQuestion.tfIsCorrect;
      } else {
        const targetColor =
          currentQuestion.target === "color"
            ? currentQuestion.colorInk.id
            : currentQuestion.textWord.id;
        isCorrect = selectedAnswer === targetColor;
      }

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

        // Fever mode time bonus (+2s for every 3 streak)
        if (gameMode === "fever" && newStreak % 3 === 0) {
          const bonusTime = timeLeftRef.current + 2;
          timeLeftRef.current = bonusTime;
          setTimeLeft(bonusTime);
          setFeverActive(true);
        } else if (newStreak >= 5) {
          setFeverActive(true);
        }

        const streakBonus = Math.min(newStreak, 5) * 25;
        const speedBonus = Math.max(0, Math.round((1000 - reactionTime) / 10));
        const feverMultiplier = newStreak >= 5 ? 2 : 1;
        const addedScore = (100 + streakBonus + speedBonus) * feverMultiplier;

        setScore((prev) => {
          const updated = prev + addedScore;
          scoreRef.current = updated;
          return updated;
        });
      } else {
        setFeedback("wrong");
        setStreak(0);
        streakRef.current = 0;
        setFeverActive(false);

        const newWrong = wrongCountRef.current + 1;
        setWrongCount(newWrong);
        wrongCountRef.current = newWrong;

        setScore((prev) => {
          const updated = Math.max(0, prev - 50);
          scoreRef.current = updated;
          return updated;
        });

        if (gameMode === "blitz" || gameMode === "true_false") {
          const penalizedTime = Math.max(0, timeLeftRef.current - 2);
          timeLeftRef.current = penalizedTime;
          setTimeLeft(penalizedTime);

          if (penalizedTime <= 0) {
            finishGame();
            return;
          }
        }

        // Fever Mode ends on 3 mistakes
        if (gameMode === "fever" && newWrong >= 3) {
          finishGame();
          return;
        }
      }

      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
      feedbackTimeoutRef.current = setTimeout(() => {
        setFeedback(null);
      }, 180);

      // Check end condition for rounds mode
      if (gameMode === "rounds") {
        setRoundsLeft((prev) => {
          const nextRounds = prev - 1;
          if (nextRounds <= 0) {
            finishGame();
            return 0;
          }
          return nextRounds;
        });
      }

      // Generate next question
      setCurrentQuestion(generateQuestion(ruleMode, difficulty, gameMode));
      questionStartTimeRef.current = Date.now();
    },
    [gameState, currentQuestion, gameMode, ruleMode, difficulty, finishGame]
  );

  const cleanup = useCallback(() => {
    stopTimers();
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
  }, [stopTimers]);

  return {
    gameMode,
    ruleMode,
    difficulty,
    gameState,
    countdown,
    currentQuestion,
    score,
    streak,
    maxStreak,
    correctCount,
    wrongCount,
    timeLeft,
    roundsLeft,
    feverActive,
    bestScore,
    lastStats,
    feedback,
    setGameMode,
    setRuleMode,
    setDifficulty,
    startGame,
    resetGame,
    handleAnswer,
    cleanup,
  };
}
