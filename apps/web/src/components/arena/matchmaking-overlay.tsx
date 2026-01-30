"use client";

import { useArena } from "@/hooks/use-arena";
import { X, Swords, Shield, Target, Clock } from "lucide-react";
import { useEffect, useState, memo, useCallback } from "react";
import { useRouter } from "next/navigation";

interface MatchmakingOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  gameType?: string;
}

const MATCH_CONFIRM_TIMEOUT = 10; // seconds to confirm match

export function MatchmakingOverlay({
  isOpen,
  onClose,
  gameType = "Sequence",
}: MatchmakingOverlayProps) {
  const { isSearching, match, matchCancelled, joinQueue } = useArena();
  const [seconds, setSeconds] = useState(0);
  const [confirmCountdown, setConfirmCountdown] = useState(
    MATCH_CONFIRM_TIMEOUT,
  );
  const router = useRouter();

  // Search timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSearching && !match) {
      interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else if (!isSearching) {
      setSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isSearching, match]);

  // Match confirmation countdown
  useEffect(() => {
    if (!match || matchCancelled) {
      setConfirmCountdown(MATCH_CONFIRM_TIMEOUT);
      return;
    }

    const interval = setInterval(() => {
      setConfirmCountdown((prev) => {
        if (prev <= 1) {
          // Time's up - leave queue
          clearInterval(interval);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [match, matchCancelled, onClose]);

  const handleEnterCombat = useCallback(() => {
    // Route to the correct game page based on game type
    const gameRoute = match?.gameType?.toLowerCase() || gameType.toLowerCase();

    switch (gameRoute) {
      case "chimp":
        router.push("/arena/1v1/chimp");
        break;
      case "sequence":
      default:
        router.push("/arena/1v1");
        break;
    }
  }, [router, match?.gameType, gameType]);

  const handleRequeue = useCallback(() => {
    joinQueue(gameType);
  }, [joinQueue, gameType]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80">
      <div className="relative w-full max-w-lg p-8 rounded-3xl border border-violet-500/20 bg-zinc-900/95 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 text-zinc-400 transition-colors z-10"
        >
          <X className="h-5 w-5" />
        </button>

        {matchCancelled ? (
          <MatchCancelledState onRequeue={handleRequeue} />
        ) : !match ? (
          <SearchingState gameType={gameType} seconds={seconds} />
        ) : (
          <MatchFoundState
            match={match}
            onEnterCombat={handleEnterCombat}
            countdown={confirmCountdown}
          />
        )}
      </div>
    </div>
  );
}

// ==========================================
// MATCH CANCELLED STATE
// ==========================================

const MatchCancelledState = memo(function MatchCancelledState({
  onRequeue,
}: {
  onRequeue: () => void;
}) {
  return (
    <div className="relative flex flex-col items-center py-8 text-center">
      <div className="h-20 w-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
        <X className="h-10 w-10 text-red-500" />
      </div>

      <h2 className="text-2xl font-bold mb-2">Match Cancelled</h2>
      <p className="text-zinc-400 mb-8 max-w-[280px]">
        Your opponent failed to join the match or has disconnected.
      </p>

      <button
        onClick={onRequeue}
        className="w-full py-3.5 rounded-xl bg-violet-600 text-white font-bold uppercase tracking-wider hover:bg-violet-700 transition-colors active:scale-[0.98]"
      >
        Find New Match
      </button>
    </div>
  );
});

// ==========================================
// SEARCHING STATE
// ==========================================

const SearchingState = memo(function SearchingState({
  gameType,
  seconds,
}: {
  gameType: string;
  seconds: number;
}) {
  return (
    <div className="relative flex flex-col items-center py-8">
      {/* Simple Radar Animation */}
      <div className="relative h-40 w-40 mb-8">
        <div className="absolute inset-0 rounded-full border border-violet-500/30" />
        <div className="absolute inset-6 rounded-full border border-violet-500/20" />
        <div className="absolute inset-12 rounded-full border border-violet-500/10" />

        {/* Scanning line */}
        <div
          className="absolute inset-0 rounded-full overflow-hidden"
          style={{ transform: "translateZ(0)" }}
        >
          <div
            className="absolute inset-0 bg-gradient-conic from-violet-500/30 via-transparent to-transparent animate-spin"
            style={{ animationDuration: "3s" }}
          />
        </div>

        {/* Central icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Swords className="h-8 w-8 text-violet-400" />
        </div>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold">Searching for Opponent</h2>
        <p className="text-sm text-zinc-500 uppercase tracking-widest font-medium">
          {gameType} Arena • {Math.floor(seconds / 60)}:
          {(seconds % 60).toString().padStart(2, "0")}
        </p>
        <div className="flex items-center justify-center gap-4 pt-3">
          <span className="flex items-center gap-1.5 text-xs font-medium text-violet-400 bg-violet-500/10 px-3 py-1.5 rounded-full">
            <Target className="h-3 w-3" />
            Finding Match...
          </span>
        </div>
      </div>
    </div>
  );
});

// ==========================================
// MATCH FOUND STATE
// ==========================================

interface MatchFoundStateProps {
  match: {
    opponent: {
      name: string;
      avatar?: string;
      rank: number;
    };
  };
  onEnterCombat: () => void;
  countdown: number;
}

const MatchFoundState = memo(function MatchFoundState({
  match,
  onEnterCombat,
  countdown,
}: MatchFoundStateProps) {
  const isUrgent = countdown <= 3;

  return (
    <div className="relative py-6">
      {/* Header with countdown */}
      <div className="text-center mb-6">
        <div className="inline-flex p-3 rounded-xl bg-emerald-500/15 text-emerald-400 mb-3">
          <Shield className="h-7 w-7" />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tight">
          Match Found!
        </h2>

        {/* Countdown Timer */}
        <div
          className={`mt-3 flex items-center justify-center gap-2 text-sm font-bold ${
            isUrgent ? "text-red-400" : "text-zinc-400"
          }`}
        >
          <Clock className={`h-4 w-4 ${isUrgent ? "animate-pulse" : ""}`} />
          <span>Accept in {countdown}s</span>
        </div>

        {/* Progress bar */}
        <div className="mt-2 mx-auto w-48 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ease-linear rounded-full ${
              isUrgent ? "bg-red-500" : "bg-violet-500"
            }`}
            style={{ width: `${(countdown / MATCH_CONFIRM_TIMEOUT) * 100}%` }}
          />
        </div>
      </div>

      {/* Players Grid */}
      <div className="grid grid-cols-3 items-center gap-3 mb-6 px-2">
        {/* You */}
        <div className="flex flex-col items-center gap-2">
          <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
            <span className="text-xl font-black text-white">YOU</span>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold">You</p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
              Ready
            </p>
          </div>
        </div>

        {/* VS Divider */}
        <div className="flex flex-col items-center justify-center">
          <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center">
            <Swords className="h-4 w-4 text-violet-400" />
          </div>
          <span className="text-[10px] font-bold text-zinc-600 mt-1 uppercase">
            VS
          </span>
        </div>

        {/* Opponent */}
        <div className="flex flex-col items-center gap-2">
          <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center border border-indigo-500/30">
            <span className="text-xl font-black text-indigo-400">
              {match.opponent.avatar || match.opponent.name[0].toUpperCase()}
            </span>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-indigo-400">
              {match.opponent.name}
            </p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
              Rank #{match.opponent.rank}
            </p>
          </div>
        </div>
      </div>

      {/* Enter Combat Button */}
      <button
        onClick={onEnterCombat}
        className={`w-full py-3.5 rounded-xl text-white font-bold uppercase tracking-wider transition-all duration-150 active:scale-[0.98] ${
          isUrgent
            ? "bg-gradient-to-r from-red-600 to-orange-600 hover:brightness-110"
            : "bg-gradient-to-r from-violet-600 to-indigo-600 hover:brightness-110"
        }`}
      >
        Enter Combat
      </button>
    </div>
  );
});
