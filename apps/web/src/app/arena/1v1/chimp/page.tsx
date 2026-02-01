"use client";

import { useChimpGame1v1 } from "@/hooks/use-chimp-game-1v1";
import { Navbar } from "@/components/navbar";
import { BackgroundGradients } from "@/components/home";
import {
  PlayerCard,
  ArenaChimpGrid,
  GameResultModal,
  WaitingState,
  CountdownState,
  GameHeader,
  LevelCompleteOverlay,
  RoundTimer,
} from "@/components/arena/game";
import { X, Eye, MousePointerClick } from "lucide-react";
import { useChimpStore } from "@/store/game/chimp.store";
import { useAuthStore } from "@/store/auth.store";

// Separate components to minimize re-renders
const GameTimer = () => {
    const timeLeft = useChimpStore((state) => state.timeLeft);
    const gameStatus = useChimpStore((state) => state.status);
    const isGameActive =
        gameStatus === "memorize" ||
        gameStatus === "playing" ||
        gameStatus === "levelComplete";

    if (!isGameActive || gameStatus === "levelComplete") return null;

    return <RoundTimer timeLeft={timeLeft} />;
};

const PlayerProgress = () => {
    const user = useAuthStore((state) => state.user);
    const progress = useChimpStore((state) => state.completedCount);
    const total = useChimpStore((state) => state.numbersCount);
    
    return (
        <PlayerCard
            name={user?.name || "You"}
            avatar={user?.name?.charAt(0).toUpperCase()}
            progress={progress}
            total={total}
            variant="player"
        />
    );
};

const OpponentProgress = () => {
    const match = useChimpStore((state) => state.match);
    const progress = useChimpStore((state) => state.opponentProgress);
    const total = useChimpStore((state) => state.numbersCount);

    if (!match) return null;

    return (
        <PlayerCard
            name={match.opponent.name}
            avatar={match.opponent.avatar}
            progress={progress}
            total={total}
            variant="opponent"
        />
    );
};

const GameStatusIndicator = () => {
    const gameStatus = useChimpStore((state) => state.status);
    const isMemorizing = gameStatus === "memorize";
    const isPlaying = gameStatus === "playing";
    const isWaiting = gameStatus === "levelComplete";

    if (isMemorizing) {
        return (
            <p className="text-sm font-semibold text-amber-500 animate-pulse flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Memorize the numbers!
            </p>
        );
    }

    if (isPlaying && !isWaiting) {
         return (
             <p className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                 <MousePointerClick className="h-4 w-4" />
                 Click in order: 1, 2, 3...
             </p>
         );
    }
    return null;
}

const GameArea = ({ handleCellClick, handleBackToArena }: { handleCellClick: (id: number) => void, handleBackToArena: () => void }) => {
    const gameStatus = useChimpStore((state) => state.status);
    const matchCancelled = useChimpStore((state) => state.matchCancelled);
    const match = useChimpStore((state) => state.match);
    const countdown = useChimpStore((state) => state.countdown);
    const level = useChimpStore((state) => state.level);
    
    // Grid state
    const cells = useChimpStore((state) => state.cells);
    const numbersCount = useChimpStore((state) => state.numbersCount);
    const opponentProgress = useChimpStore((state) => state.opponentProgress);
    
    // Result state
    const gameResult = useChimpStore((state) => state.gameResult);
    const isWinner = useChimpStore((state) => state.isWinner);

    const isGameActive =
        gameStatus === "memorize" ||
        gameStatus === "playing" ||
        gameStatus === "levelComplete" ||
        gameStatus === "finished";

    const waitingForOpponent = gameStatus === "levelComplete";
    const isPlaying = gameStatus === "playing";

    if (!match) return null;

    return (
      <main className="container relative mx-auto px-4 py-8 max-w-6xl">
        <GameHeader gameType="Chimp" level={level} />

        {matchCancelled ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] animate-in fade-in zoom-in-95 duration-500">
            <div className="p-12 rounded-[2.5rem] border border-red-500/20 bg-card/50 backdrop-blur-xl text-center max-w-md w-full shadow-2xl">
              <div className="h-20 w-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                <X className="h-10 w-10 text-red-500" />
              </div>
              <h2 className="text-3xl font-black uppercase mb-4 tracking-tighter">
                Match Cancelled
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Your opponent failed to join the arena or has disconnected.
              </p>
              <button
                onClick={handleBackToArena}
                className="w-full py-4 rounded-2xl bg-violet-600 text-white font-bold uppercase tracking-widest hover:bg-violet-700 transition-all active:scale-[0.98] shadow-lg shadow-violet-500/20"
              >
                Back to Arena
              </button>
            </div>
          </div>
        ) : (
          <>
            {gameStatus === "waiting" && (
              <WaitingState message="Waiting for opponent..." />
            )}

            {gameStatus === "countdown" && (
              <CountdownState seconds={countdown} />
            )}
          </>
        )}

        {isGameActive && !matchCancelled && (
          <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr_200px] gap-8 items-start">
            <PlayerProgress />

            <div className="flex flex-col items-center">
              <ArenaChimpGrid
                cells={cells}
                disabled={!isPlaying}
                onCellClick={handleCellClick}
              />

              {/* Status message for chimp memory */}
              <div className="mt-4 flex items-center gap-2">
                 <GameStatusIndicator />
              </div>

              {/* Waiting for opponent overlay */}
              {waitingForOpponent && (
                <LevelCompleteOverlay
                  level={level}
                  opponentName={match.opponent.name}
                  opponentProgress={opponentProgress}
                  total={numbersCount}
                />
              )}

              {/* Numbers indicator */}
              <div className="mt-2 text-xs text-muted-foreground">
                {numbersCount} numbers to find
              </div>
            </div>

            <OpponentProgress />
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
    );
}

export default function ArenaChimpPage() {
  const { handleCellClick, handleBackToArena } = useChimpGame1v1();
  const match = useChimpStore((state) => state.match);

  if (!match) return null;

  return (
    <div className="relative min-h-screen bg-background">
      <BackgroundGradients />
      <Navbar />
      <GameArea handleCellClick={handleCellClick} handleBackToArena={handleBackToArena} />
      <GameTimer />
    </div>
  );
}
