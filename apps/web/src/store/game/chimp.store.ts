import { create } from "zustand";
import {
  GameEndPayload,
  ChimpGameStartPayload,
  ChimpLevelCompletePayload,
  ChimpOpponentProgressPayload,
  ROUND_TIME_LIMIT,
  ArenaMatch,
  ChimpCell,
} from "@mindarena/shared";

interface ChimpGameState {
  // Game Status
  status: "waiting" | "countdown" | "memorize" | "playing" | "levelComplete" | "finished";
  countdown: number;
  timeLeft: number;
  matchCancelled: boolean;

  // Game Data
  match: ArenaMatch | null;
  level: number;
  cells: ChimpCell[];
  numbersCount: number;
  nextNumber: number;
  completedCount: number;

  // Opponent State
  opponentProgress: number;
  opponentLevel: number;

  // Result
  gameResult: GameEndPayload | null;
  isWinner: boolean | null;

  // Actions
  setMatch: (match: ArenaMatch | null) => void;
  setStatus: (status: ChimpGameState["status"]) => void;
  setCountdown: (seconds: number) => void;
  setTimeLeft: (seconds: number) => void;
  setMatchCancelled: (cancelled: boolean) => void;
  
  startGame: (data: ChimpGameStartPayload) => void;
  updateLevel: (data: ChimpLevelCompletePayload) => void;
  updateOpponent: (data: ChimpOpponentProgressPayload) => void;
  endGame: (data: GameEndPayload, currentUserName?: string) => void;
  
  // Game Logic Actions
  handleCorrectMove: (completedNumber: number) => void;
  showNumbers: () => void; // Reset cells to visible
  hideNumbers: () => void; // Hide numbers for playing phase (memorize end)
  
  // Management
  resetGame: () => void;
}

const initialGameState = {
  status: "waiting" as const,
  countdown: 0,
  timeLeft: ROUND_TIME_LIMIT,
  matchCancelled: false,
  match: null,
  level: 1,
  cells: [],
  numbersCount: 4,
  nextNumber: 1,
  completedCount: 0,
  opponentProgress: 0,
  opponentLevel: 1,
  gameResult: null,
  isWinner: null,
};

export const useChimpStore = create<ChimpGameState>((set, get) => ({
  ...initialGameState,

  // Simple Setters
  setMatch: (match) => set({ match }),
  setStatus: (status) => set({ status }),
  setCountdown: (countdown) => set({ countdown }),
  setTimeLeft: (timeLeft) => set({ timeLeft }),
  setMatchCancelled: (matchCancelled) => set({ matchCancelled }),

  // Complex Actions
  startGame: (data) => set({
    status: "memorize",
    level: data.level,
    cells: data.cells,
    numbersCount: data.numbersCount,
    nextNumber: 1,
    completedCount: 0,
    opponentProgress: 0,
    
  }),

  updateLevel: (data) => set({
    status: "memorize",
    level: data.newLevel,
    cells: data.newCells,
    numbersCount: data.newNumbersCount,
    nextNumber: 1,
    completedCount: 0,
    opponentProgress: 0,
    timeLeft: ROUND_TIME_LIMIT,
  }),

  updateOpponent: (data) => set({
    opponentProgress: data.completedCount,
    opponentLevel: data.currentLevel,
  }),

  endGame: (data, currentUserName) => set((state) => {
    const opponentName = state.match?.opponent?.name;
    let isWinner = false;
    
    if (opponentName && data.loserName === opponentName) {
      isWinner = true;
    } else if (currentUserName && data.loserName !== currentUserName) {
      isWinner = true;
    }

    return {
      status: "finished",
      gameResult: data,
      isWinner,
      // Reveal all cells on finish
      cells: state.cells.map(c => ({ ...c, revealed: true })) 
    };
  }),

  // Logic
  handleCorrectMove: (completedNumber) => set((state) => ({
    nextNumber: state.nextNumber + 1,
    completedCount: state.completedCount + 1,
    cells: state.cells.map((cell) =>
      cell.number === completedNumber
        ? { ...cell, completed: true, revealed: true }
        : cell
    ),
  })),

  showNumbers: () => set((state) => ({
      cells: state.cells.map(c => ({ ...c, revealed: true }))
  })),

  hideNumbers: () => set((state) => ({
      status: "playing",
      cells: state.cells.map((cell) => ({
        ...cell,
        revealed: cell.number === null, 
      })),
  })),

  resetGame: () => set(initialGameState),
}));
