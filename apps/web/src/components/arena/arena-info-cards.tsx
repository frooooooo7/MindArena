"use client";

import { ShieldAlert, Info } from "lucide-react";

/**
 * Combat Rules Info Box
 */
export function CombatRulesCard() {
    return (
        <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-4">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                <Info className="h-5 w-5" />
            </div>
            <div>
                <h4 className="text-sm font-bold text-amber-500 uppercase tracking-widest mb-1">
                    Arena & Duel Rules
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                    Matches are conducted in real-time. Challenge friends or test your reflexes. 
                    Fair play is monitored by our cognitive anti-cheat system.
                </p>
            </div>
        </div>
    );
}

/**
 * Arena Performance Info Card
 */
export function RankSystemCard() {
    return (
        <div className="p-8 rounded-[2rem] border border-border/40 bg-gradient-to-br from-indigo-600/10 to-violet-600/10 backdrop-blur-md">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-indigo-400" />
                Performance & Duels
            </h3>
            <div className="space-y-3 text-xs text-muted-foreground leading-relaxed">
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                    <p className="font-semibold text-white mb-1">🎯 Personal High Scores</p>
                    <p>Track your peak performance across Sequence, Chimp, and Code Memory challenges.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                    <p className="font-semibold text-white mb-1">⚔️ Friend Duels</p>
                    <p>Invite friends to head-to-head duels and view your personal match statistics.</p>
                </div>
            </div>
        </div>
    );
}

/**
 * Section Header
 */
interface SectionHeaderProps {
    title: string;
    description?: string;
}

export function SectionHeader({ title, description }: SectionHeaderProps) {
    return (
        <div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">{title}</h2>
            {description && (
                <p className="text-muted-foreground text-sm">{description}</p>
            )}
        </div>
    );
}
