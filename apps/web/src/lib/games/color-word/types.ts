export type GameMode = "blitz" | "rounds" | "fever" | "true_false";
export type RuleMode = "color" | "text" | "mixed";
export type Difficulty = "easy" | "medium" | "expert";
export type QuestionTarget = "color" | "text"; // "color" = Kolor czcionki, "text" = Treść słowa
export type GameState = "idle" | "countdown" | "playing" | "completed";

export interface ColorItem {
  id: string;
  namePl: string;
  hex: string;
  textColorClass: string;
  bgColorClass: string;
  borderColorClass: string;
}

export interface Question {
  id: string;
  textWord: ColorItem;      // The text content (e.g. "NIEBIESKI")
  colorInk: ColorItem;       // The actual font color (e.g. Red ink)
  bgDistraction?: ColorItem; // Optional background distraction for Expert mode
  target: QuestionTarget;    // "color" or "text"
  options: ColorItem[];      // Answer options (4 choices for standard, or yes/no)
  isTrueFalse?: boolean;
  tfTargetColor?: ColorItem; // Color checked in true/false statement
  tfIsCorrect?: boolean;     // Whether the statement is true
}

export interface ColorWordStats {
  score: number;
  totalAnswered: number;
  correctAnswers: number;
  wrongAnswers: number;
  accuracy: number;
  avgReactionTimeMs: number;
  maxStreak: number;
  isNewRecord: boolean;
}
