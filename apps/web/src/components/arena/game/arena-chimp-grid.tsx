"use client";

import { ChimpCell } from "@mindarena/shared";
import { ChimpGrid } from "@/components/games/chimp-memory";
import type { Cell } from "@/lib/games/chimp-memory";

interface ArenaChimpGridProps {
  cells: ChimpCell[];
  disabled: boolean;
  onCellClick: (cellId: number) => void;
}

/**
 * Arena Chimp Memory Grid
 * Wrapper around solo ChimpGrid for arena mode
 * Converts shared ChimpCell type to local Cell type
 */
export function ArenaChimpGrid({
  cells,
  disabled,
  onCellClick,
}: ArenaChimpGridProps) {
  // Convert ChimpCell (shared) to Cell (local) - types are compatible
  const localCells: Cell[] = cells.map((cell) => ({
    id: cell.id,
    number: cell.number,
    revealed: cell.revealed,
    completed: cell.completed,
  }));

  return (
    <ChimpGrid
      cells={localCells}
      disabled={disabled}
      onCellClick={onCellClick}
    />
  );
}
