export type GridSize = 3 | 4 | 5 | 6;
export type OrderDirection = "asc" | "desc";
export type GameState = "idle" | "countdown" | "playing" | "completed";

export interface Cell {
  id: number;
  number: number;
  completed: boolean;
  wrongFlash?: boolean;
}

export interface SchulteConfig {
  gridSize: GridSize;
  orderDirection: OrderDirection;
}

export interface GameStats {
  elapsedMs: number;
  mistakes: number;
  accuracy: number;
  clicksPerSecond: number;
  isNewRecord: boolean;
}
