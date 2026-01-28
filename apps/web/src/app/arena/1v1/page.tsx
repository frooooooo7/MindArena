"use client";

import { useSequenceGame1v1 } from "@/hooks/use-sequence-game-1v1";
import { Navbar } from "@/components/navbar";
import { BackgroundGradients } from "@/components/home";
import { 
    PlayerCard, 
    GameGrid, 
    GameResultModal, 
    WaitingState, 
    CountdownState,
    GameHeader,
    GameStatusMessage
} from "@/components/arena/game";

export default function Arena1v1Page() {
    const {
        // Match info
        match,
        user,
        // Game state
        gameStatus,
        countdown,
        level,
        sequence,
        gridSize,
        opponentProgress,
        isWinner,
        gameResult,
        // Local UI state
        showingSequence,
        activeCell,
        playerIndex,
        // Actions
        handleCellClick,
        handleBackToArena,
    } = useSequenceGame1v1();

    if (!match) return null;

    const isGameActive = gameStatus === "playing" || gameStatus === "finished";

    return (
        <div className="relative min-h-screen bg-background">
            <BackgroundGradients />
            <Navbar />

            <main className="container relative mx-auto px-4 py-8 max-w-5xl">
                <GameHeader gameType={match.gameType} level={level} />

                {gameStatus === "waiting" && (
                    <WaitingState message="Waiting for opponent..." />
                )}

                {gameStatus === "countdown" && (
                    <CountdownState seconds={countdown} />
                )}

                {isGameActive && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <PlayerCard
                            name={user?.name || "You"}
                            avatar={user?.name?.charAt(0).toUpperCase()}
                            progress={playerIndex}
                            total={sequence.length}
                            variant="player"
                        />

                        <div className="flex flex-col items-center">
                            <GameGrid
                                gridSize={gridSize}
                                activeCell={activeCell}
                                disabled={showingSequence || gameStatus !== "playing"}
                                onCellClick={handleCellClick}
                            />

                            <GameStatusMessage 
                                showingSequence={showingSequence} 
                                isPlaying={gameStatus === "playing"} 
                            />
                        </div>

                        <PlayerCard
                            name={match.opponent.name}
                            avatar={match.opponent.avatar}
                            progress={opponentProgress}
                            total={sequence.length}
                            variant="opponent"
                        />
                    </div>
                )}

                {gameStatus === "finished" && gameResult && (
                    <GameResultModal
                        isWinner={isWinner ?? false}
                        gameResult={gameResult}
                        onBackToArena={handleBackToArena}
                    />
                )}
            </main>
        </div>
    );
}
