"use client";

interface GameGridProps {
    gridSize: number;
    activeCell: number | null;
    disabled: boolean;
    onCellClick: (cellIndex: number) => void;
}

export function GameGrid({ gridSize, activeCell, disabled, onCellClick }: GameGridProps) {
    const totalCells = gridSize * gridSize;

    return (
        <div 
            className="grid gap-2 p-4 rounded-3xl bg-card/60 border border-border/40"
            style={{ 
                gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                width: "fit-content"
            }}
        >
            {Array.from({ length: totalCells }, (_, i) => (
                <button
                    key={i}
                    onClick={() => onCellClick(i)}
                    disabled={disabled}
                    className={`
                        w-16 h-16 md:w-20 md:h-20 rounded-xl transition-all duration-150
                        ${activeCell === i 
                            ? "bg-violet-500 scale-95" 
                            : "bg-secondary/40 hover:bg-secondary/60"
                        }
                        ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
                        disabled:opacity-50
                    `}
                />
            ))}
        </div>
    );
}
