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
                    Combat Rules
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                    Matches are real-time. Leaving a ranked match early will result in a{" "}
                    <span className="text-amber-500 font-bold">-50 RP</span> penalty. 
                    Fair play is monitored by our cognitive anti-cheat system.
                </p>
            </div>
        </div>
    );
}

/**
 * Arena Rank System Card
 */
const RANKS = [
    { tier: "Cyber", color: "text-cyan-400", range: "0 - 1500 RP" },
    { tier: "Quantum", color: "text-violet-400", range: "1501 - 3000 RP" },
    { tier: "Nova", color: "text-amber-400", range: "3001+ RP" },
];

export function RankSystemCard() {
    return (
        <div className="p-8 rounded-[2rem] border border-border/40 bg-gradient-to-br from-indigo-600/10 to-violet-600/10 backdrop-blur-md">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-indigo-400" />
                Arena Rank System
            </h3>
            <div className="space-y-4">
                {RANKS.map((rank) => (
                    <div 
                        key={rank.tier} 
                        className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5"
                    >
                        <span className={`text-xs font-black uppercase tracking-widest ${rank.color}`}>
                            {rank.tier}
                        </span>
                        <span className="text-[10px] font-medium opacity-60 italic">
                            {rank.range}
                        </span>
                    </div>
                ))}
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
