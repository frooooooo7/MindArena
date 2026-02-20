"use client";

import { ShieldAlert, Info } from "lucide-react";
import { RANK_TIERS, RANK_COLORS_MAP } from "@mindarena/shared";

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
export function RankSystemCard() {
    return (
        <div className="p-8 rounded-[2rem] border border-border/40 bg-gradient-to-br from-indigo-600/10 to-violet-600/10 backdrop-blur-md">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-indigo-400" />
                Arena Rank System
            </h3>
            <div className="space-y-3">
                {RANK_TIERS.map((rank, index) => {
                    const nextRank = RANK_TIERS[index + 1];
                    const rangeText = nextRank 
                        ? `${rank.minPoints} - ${nextRank.minPoints - 1} RP`
                        : `${rank.minPoints}+ RP`;
                    
                    const colorClass = RANK_COLORS_MAP[rank.name] || "text-slate-400";

                    return (
                        <div 
                            key={rank.name} 
                            className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-xl group-hover:scale-110 transition-transform cursor-default">
                                    {rank.icon}
                                </span>
                                <span className={`text-xs font-black uppercase tracking-widest ${colorClass}`}>
                                    {rank.name}
                                </span>
                            </div>
                            <span className="text-[10px] font-medium opacity-60 tabular-nums">
                                {rangeText}
                            </span>
                        </div>
                    );
                })}
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
