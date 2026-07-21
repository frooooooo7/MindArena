export type MathOperation = "add" | "subtract" | "multiply" | "divide" | "mixed";
export type Difficulty = "easy" | "medium" | "hard";
export type GameMode = "blitz" | "equations" | "survival";
export type GameState = "idle" | "countdown" | "playing" | "completed";

export interface Question {
  id: string;
  equation: string;        // e.g. "24 + 38 ="
  operand1: number;
  operand2: number;
  operatorSymbol: string;   // "+", "-", "×", "÷"
  correctAnswer: number;
  options: number[];        // 4 choice numbers (including correct answer)
}

export interface FastMathStats {
  score: number;
  totalAnswered: number;
  correctAnswers: number;
  wrongAnswers: number;
  accuracy: number;
  avgReactionTimeMs: number;
  maxStreak: number;
  isNewRecord: boolean;
  gameMode: GameMode;
  operation: MathOperation;
  difficulty: Difficulty;
}
