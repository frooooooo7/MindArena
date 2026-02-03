import { create } from "zustand";
import {
  GameEndPayload,
  GameStartPayload,
  LevelCompletePayload,
  OpponentProgressPayload,
  ROUND_TIME_LIMIT,
  ArenaMatch,
} from "@mindarena/shared";

interface SequenceGameState {
  // Game Status
  status: "waiting" | "countdown" | "playing" | "finished" | "level-complete";
  countdown: number;
  timeLeft: number;
  matchCancelled: boolean;

  // Game Data
  match: ArenaMatch | null;
  level: number;
  sequence: number[];
  gridSize: number;
  
  // Player State
  currentIndex: number;
  activeCell: number | null;
  clickedCell: number | null;
  showingSequence: boolean;

  // Opponent State
  opponentProgress: number;
  opponentLevel: number;

  // Result
  gameResult: GameEndPayload | null;
  isWinner: boolean | null;

  // Actions
  setMatch: (match: ArenaMatch | null) => void;
  setStatus: (status: SequenceGameState["status"]) => void;
  setCountdown: (seconds: number) => void;
  setTimeLeft: (seconds: number) => void;
  setMatchCancelled: (cancelled: boolean) => void;
  
  startGame: (data: GameStartPayload) => void;
  updateLevel: (data: LevelCompletePayload) => void;
  updateOpponent: (data: OpponentProgressPayload) => void;
  endGame: (data: GameEndPayload, currentUserName?: string) => void;
  
  // Interaction Actions
  setActiveCell: (cell: number | null) => void; // For showing sequence
  setClickedCell: (cell: number | null) => void; // For user clicks
  setShowingSequence: (showing: boolean) => void;
  incrementIndex: () => void;
  
  // Management
  resetGame: () => void;
}

export const useSequenceStore = create<SequenceGameState>((set) => ({
  // Initial State
  status: "waiting",
  countdown: 0,
  timeLeft: ROUND_TIME_LIMIT,
  matchCancelled: false,
  match: null,
  level: 1,
  sequence: [],
  gridSize: 3,
  currentIndex: 0,
  activeCell: null,
  clickedCell: null,
  showingSequence: false,
  opponentProgress: 0,
  opponentLevel: 1,
  gameResult: null,
  isWinner: null,

  // Simple Setters
  setMatch: (match) => set({ match }),
  setStatus: (status) => set({ status }),
  setCountdown: (countdown) => set({ countdown }),
  setTimeLeft: (timeLeft) => set({ timeLeft }),
  setMatchCancelled: (matchCancelled) => set({ matchCancelled }),
  setActiveCell: (activeCell) => set({ activeCell }),
  setClickedCell: (clickedCell) => set({ clickedCell }),
  setShowingSequence: (showingSequence) => set({ showingSequence }),
  incrementIndex: () => set((state) => ({ currentIndex: state.currentIndex + 1 })),

  // Complex Actions
  startGame: (data) => set({
    status: "playing",
    level: data.level,
    sequence: data.sequence,
    gridSize: data.gridSize,
    currentIndex: 0,
    showingSequence: true, // Auto-start sequence show logic should trigger
  }),

  updateLevel: (data) => set({
    level: data.newLevel,
    sequence: data.newSequence,
    gridSize: data.newGridSize,
    currentIndex: 0,
    opponentProgress: 0,
    timeLeft: ROUND_TIME_LIMIT,
    showingSequence: true,
    status: "playing", // Ensure we are back to playing if we were in level-complete
  }),

  updateOpponent: (data) => set({
    opponentProgress: data.currentIndex,
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
    };
  }),

  resetGame: () => set({
    status: "waiting",
    countdown: 0,
    timeLeft: ROUND_TIME_LIMIT,
    matchCancelled: false,
    level: 1,
    sequence: [],
    gridSize: 3,
    currentIndex: 0,
    activeCell: null,
    clickedCell: null,
    showingSequence: false,
    opponentProgress: 0,
    opponentLevel: 1,
    gameResult: null,
    isWinner: null,
  }),
}));
