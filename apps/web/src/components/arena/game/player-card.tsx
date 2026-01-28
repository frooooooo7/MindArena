"use client";

interface PlayerCardProps {
    name: string;
    avatar?: string;
    progress: number;
    total: number;
    variant: "player" | "opponent";
}

export function PlayerCard({ name, avatar, progress, total, variant }: PlayerCardProps) {
    const isPlayer = variant === "player";
    
    return (
        <div className="flex flex-col items-center">
            <div className="mb-4 text-center">
                <div className={`
                    h-16 w-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white mx-auto mb-2
                    ${isPlayer 
                        ? "bg-gradient-to-br from-violet-600 to-indigo-600" 
                        : "bg-gradient-to-br from-rose-600 to-orange-600"
                    }
                `}>
                    {avatar || name.charAt(0).toUpperCase()}
                </div>
                <p className="font-bold">{name}</p>
                <p className="text-xs text-muted-foreground">
                    Progress: {progress}/{total}
                </p>
            </div>

            {/* Progress Bar (only for opponent) */}
            {!isPlayer && (
                <div className="w-full max-w-[200px] space-y-2">
                    <div className="h-2 w-full bg-secondary/30 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-rose-500 rounded-full transition-all duration-300"
                            style={{ 
                                width: `${total > 0 ? (progress / total) * 100 : 0}%` 
                            }}
                        />
                    </div>
                    <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest">
                        Opponent Progress
                    </p>
                </div>
            )}
        </div>
    );
}
