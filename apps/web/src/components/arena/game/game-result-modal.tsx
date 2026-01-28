"use client";

import { Trophy, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GameEndPayload } from "@mindarena/shared";

interface GameResultModalProps {
    isWinner: boolean;
    gameResult: GameEndPayload;
    onBackToArena: () => void;
}

export function GameResultModal({ isWinner, gameResult, onBackToArena }: GameResultModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm">
            <div className="p-8 rounded-3xl bg-card border border-border/40 shadow-2xl max-w-md w-full mx-4 text-center animate-in zoom-in-95 duration-300">
                {isWinner ? (
                    <>
                        <Trophy className="h-20 w-20 text-amber-500 mx-auto mb-4" />
                        <h2 className="text-3xl font-black text-amber-500 mb-2">
                            VICTORY!
                        </h2>
                        <p className="text-muted-foreground mb-2">
                            You defeated {gameResult.loserName}!
                        </p>
                    </>
                ) : (
                    <>
                        <XCircle className="h-20 w-20 text-rose-500 mx-auto mb-4" />
                        <h2 className="text-3xl font-black text-rose-500 mb-2">
                            DEFEAT
                        </h2>
                        <p className="text-muted-foreground mb-2">
                            {gameResult.winnerName} wins!
                        </p>
                    </>
                )}

                <p className="text-sm text-muted-foreground mb-6">
                    Final Level: {gameResult.finalLevel}
                </p>

                <Button 
                    onClick={onBackToArena}
                    className="w-full bg-gradient-to-r from-violet-600 to-indigo-600"
                >
                    Back to Arena
                </Button>
            </div>
        </div>
    );
}
