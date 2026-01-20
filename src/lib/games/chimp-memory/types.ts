export type GameState = "idle" | "memorize" | "playing" | "success" | "gameover";

export interface Cell {
  id: number;
  number: number | null;
  revealed: boolean;
  completed: boolean;
}

export const GRID_COLS = 8;
export const GRID_ROWS = 5;
export const TOTAL_CELLS = GRID_COLS * GRID_ROWS;
export const MEMORIZE_TIME = 2000; // ms to show numbers before hiding
