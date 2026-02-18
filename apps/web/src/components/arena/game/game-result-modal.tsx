"use client";

import { Trophy, XCircle, TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GameEndPayload, RankUpdatePayload, getRankProgress, getNextRankTier, RankName } from "@mindarena/shared";
import { useEffect, useState, useRef, useCallback } from "react";

interface GameResultModalProps {
    isWinner: boolean;
    gameResult: GameEndPayload;
    rankUpdate?: RankUpdatePayload | null;
    onBackToArena: () => void;
}

/** Animated counter that counts up/down from start to end */
function useAnimatedCounter(target: number, start: number, duration = 1200) {
    const [value, setValue] = useState(start);
    const frameRef = useRef<number>(0);

    useEffect(() => {
        const diff = target - start;
        if (diff === 0) { setValue(target); return; }

        const startTime = performance.now();
        const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(start + diff * eased));
            if (progress < 1) {
                frameRef.current = requestAnimationFrame(animate);
            }
        };
        frameRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frameRef.current);
    }, [target, start, duration]);

    return value;
}

/** Floating particles effect for rank promotion */
function PromotionParticles() {
    const particles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 1.5 + Math.random() * 2,
        size: 4 + Math.random() * 8,
    }));

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((p) => (
                <div
                    key={p.id}
                    className="absolute rounded-full animate-float-up"
                    style={{
                        left: `${p.x}%`,
                        bottom: "-10px",
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        background: `hsl(${260 + Math.random() * 60}, 80%, 65%)`,
                        animationDelay: `${p.delay}s`,
                        animationDuration: `${p.duration}s`,
                        opacity: 0.7,
                    }}
                />
            ))}
        </div>
    );
}

/** Rank progress bar with animated fill */
function RankProgressBar({ rankUpdate }: { rankUpdate: RankUpdatePayload }) {
    const [animatedWidth, setAnimatedWidth] = useState(0);
    const progress = getRankProgress(rankUpdate.currentPoints);
    const nextRank = getNextRankTier(rankUpdate.rankName as RankName);

    useEffect(() => {
        const timer = setTimeout(() => setAnimatedWidth(progress), 300);
        return () => clearTimeout(timer);
    }, [progress]);

    return (
        <div className="w-full mt-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                <span className="font-medium">{rankUpdate.rankName}</span>
                {nextRank && (
                    <span className="font-medium">{nextRank.name}</span>
                )}
            </div>
            <div className="h-2.5 rounded-full bg-white/5 overflow-hidden border border-white/10">
                <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                        width: `${animatedWidth}%`,
                        background: rankUpdate.isPromotion
                            ? "linear-gradient(90deg, #a78bfa, #c084fc, #e879f9)"
                            : "linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa)",
                    }}
                />
            </div>
            <p className="text-xs text-muted-foreground mt-1 text-center">
                {rankUpdate.currentPoints} / {nextRank ? nextRank.minPoints : "MAX"} pts
            </p>
        </div>
    );
}

export function GameResultModal({ isWinner, gameResult, rankUpdate, onBackToArena }: GameResultModalProps) {
    const [showRank, setShowRank] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Show rank update with a delay for dramatic effect
    useEffect(() => {
        if (rankUpdate) {
            const timer = setTimeout(() => setShowRank(true), 600);
            return () => clearTimeout(timer);
        }
    }, [rankUpdate]);

    // Play promotion sound effect
    const playPromotionSound = useCallback(() => {
        try {
            // Use Web Audio API for a simple synth chime
            const ctx = new AudioContext();
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            const lastNoteEnd = notes.length * 0.15 + 0.5;

            notes.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.frequency.value = freq;
                osc.type = "sine";
                gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.15);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.5);
                osc.start(ctx.currentTime + i * 0.15);
                osc.stop(ctx.currentTime + i * 0.15 + 0.5);
            });

            // Close the AudioContext after all notes finish to prevent resource leak
            setTimeout(() => ctx.close().catch(() => {}), lastNoteEnd * 1000 + 100);
        } catch {
            // Audio not supported, silently fail
        }
    }, []);

    useEffect(() => {
        if (rankUpdate?.isPromotion && showRank) {
            playPromotionSound();
        }
    }, [rankUpdate?.isPromotion, showRank, playPromotionSound]);

    const animatedPoints = useAnimatedCounter(
        rankUpdate?.currentPoints ?? 0,
        rankUpdate?.oldPoints ?? 0,
        1400,
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm">
            {/* Promotion particles */}
            {rankUpdate?.isPromotion && showRank && <PromotionParticles />}

            <div className="relative p-8 rounded-3xl bg-card border border-border/40 shadow-2xl max-w-md w-full mx-4 text-center animate-in zoom-in-95 duration-300 overflow-hidden">
                {/* Glow effect for winner */}
                {isWinner && (
                    <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent pointer-events-none" />
                )}

                {/* Victory / Defeat header */}
                <div className="relative">
                    {isWinner ? (
                        <>
                            <Trophy className="h-20 w-20 text-amber-500 mx-auto mb-4 animate-in zoom-in-50 duration-500" />
                            <h2 className="text-3xl font-black text-amber-500 mb-2 uppercase tracking-tight">
                                Victory!
                            </h2>
                            <p className="text-muted-foreground mb-2">
                                You defeated {gameResult.loserName}!
                            </p>
                        </>
                    ) : (
                        <>
                            <XCircle className="h-20 w-20 text-rose-500 mx-auto mb-4 animate-in zoom-in-50 duration-500" />
                            <h2 className="text-3xl font-black text-rose-500 mb-2 uppercase tracking-tight">
                                Defeat
                            </h2>
                            <p className="text-muted-foreground mb-2">
                                {gameResult.winnerName} wins!
                            </p>
                        </>
                    )}

                    <p className="text-sm text-muted-foreground">
                        Final Level: {gameResult.finalLevel}
                    </p>
                </div>

                {/* Rank Update Section */}
                {rankUpdate && showRank && (
                    <div className="mt-6 pt-6 border-t border-border/30 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Promotion banner */}
                        {rankUpdate.isPromotion && (
                            <div className="mb-4 p-3 rounded-2xl bg-gradient-to-r from-violet-500/15 via-purple-500/15 to-fuchsia-500/15 border border-purple-500/20">
                                <div className="flex items-center justify-center gap-2">
                                    <Sparkles className="h-5 w-5 text-purple-400 animate-pulse" />
                                    <span className="font-bold text-purple-300 uppercase tracking-wider text-sm">
                                        Rank Up!
                                    </span>
                                    <Sparkles className="h-5 w-5 text-purple-400 animate-pulse" />
                                </div>
                            </div>
                        )}

                        {/* Points counter */}
                        <div className="flex items-center justify-center gap-3 mb-1">
                            <span className="text-4xl font-black tabular-nums tracking-tight">
                                {animatedPoints}
                            </span>
                            <span className="text-2xl">{rankUpdate.rankIcon}</span>
                        </div>

                        {/* Points delta */}
                        <div className="flex items-center justify-center gap-1.5 mb-2">
                            {rankUpdate.pointsDelta >= 0 ? (
                                <TrendingUp className="h-4 w-4 text-emerald-400" />
                            ) : (
                                <TrendingDown className="h-4 w-4 text-rose-400" />
                            )}
                            <span
                                className={`text-sm font-bold ${
                                    rankUpdate.pointsDelta >= 0
                                        ? "text-emerald-400"
                                        : "text-rose-400"
                                }`}
                            >
                                {rankUpdate.pointsDelta >= 0 ? "+" : ""}
                                {rankUpdate.pointsDelta} pts
                            </span>
                        </div>

                        {/* Progress bar */}
                        <RankProgressBar rankUpdate={rankUpdate} />
                    </div>
                )}

                {/* Back button */}
                <Button
                    onClick={onBackToArena}
                    className="w-full mt-6 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 transition-all"
                >
                    Back to Arena
                </Button>
            </div>
        </div>
    );
}
