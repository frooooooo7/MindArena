export type GameState = "idle" | "showing" | "playing" | "success" | "gameover";

export interface Cell {
  id: number;
  row: number;
  col: number;
}

export interface GameConfig {
  gridSize: number;
  sequenceLength: number;
  displayDelay: number;
}

export const LEVEL_CONFIG: Record<number, Partial<GameConfig>> = {
  1: { gridSize: 3 },
  4: { gridSize: 4 },
  7: { gridSize: 5 },
  10: { gridSize: 6 },
};

export const getGridSizeForLevel = (level: number): number => {
  let gridSize = 3;
  for (const [lvl, config] of Object.entries(LEVEL_CONFIG)) {
    if (level >= Number(lvl) && config.gridSize) {
      gridSize = config.gridSize;
    }
  }
  return gridSize;
};
