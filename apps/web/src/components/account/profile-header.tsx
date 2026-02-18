"use client";

import { User, getRankForPoints, getRankProgress, getNextRankTier, RankName } from "@mindarena/shared";
import { Calendar, Mail, TrendingUp } from "lucide-react";

interface ProfileHeaderProps {
    user: User;
}

/** Color scheme per rank tier */
function getRankColors(rankName: string) {
    switch (rankName) {
        case "Geniusz":
            return {
                bg: "from-amber-500/15 to-yellow-500/15",
                border: "border-amber-500/30",
                text: "text-amber-400",
                bar: "from-amber-500 to-yellow-500",
                glow: "shadow-amber-500/20",
            };
        case "Kora":
            return {
                bg: "from-cyan-500/15 to-teal-500/15",
                border: "border-cyan-500/30",
                text: "text-cyan-400",
                bar: "from-cyan-500 to-teal-500",
                glow: "shadow-cyan-500/20",
            };
        case "Synapsa":
            return {
                bg: "from-violet-500/15 to-purple-500/15",
                border: "border-violet-500/30",
                text: "text-violet-400",
                bar: "from-violet-500 to-purple-500",
                glow: "shadow-violet-500/20",
            };
        default: // Neuron
            return {
                bg: "from-slate-500/15 to-zinc-500/15",
                border: "border-slate-500/30",
                text: "text-slate-400",
                bar: "from-slate-500 to-zinc-500",
                glow: "shadow-slate-500/20",
            };
    }
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
    const rank = getRankForPoints(user.rankPoints);
    const progress = getRankProgress(user.rankPoints);
    const nextRank = getNextRankTier(rank.name as RankName);
    const colors = getRankColors(rank.name);

    return (
        <div className="relative p-6 md:p-8 rounded-3xl border border-border/40 bg-card/60 overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 h-64 w-64 bg-violet-600/10 rounded-full pointer-events-none" />
            
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 relative">
                {/* Avatar */}
                <div className="relative">
                    <div className="h-24 w-24 md:h-32 md:w-32 rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-600 p-1 shadow-2xl shadow-violet-500/20">
                        <div className="h-full w-full rounded-[20px] bg-card flex items-center justify-center overflow-hidden">
                             <span className="text-4xl md:text-5xl font-black bg-gradient-to-br from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                                {user.name.charAt(0).toUpperCase()}
                             </span>
                        </div>
                    </div>
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left space-y-3 pb-2">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-bold tracking-tight">{user.name}</h2>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                                <Mail className="h-4 w-4" />
                                {user.email}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4" />
                                Joined {new Date(user.createdAt).toLocaleDateString("en-US", { month: 'long', year: 'numeric' })}
                            </div>
                        </div>
                    </div>

                    {/* Rank Badge + Progress */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                        {/* Rank Badge */}
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r ${colors.bg} border ${colors.border} ${colors.glow} shadow-lg`}>
                            <span className="text-xl">{rank.icon}</span>
                            <span className={`font-bold text-sm uppercase tracking-wider ${colors.text}`}>
                                {rank.name}
                            </span>
                            <span className="text-xs text-muted-foreground font-semibold tabular-nums">
                                {user.rankPoints} pts
                            </span>
                        </div>

                        {/* Progress bar to next rank */}
                        {nextRank && (
                            <div className="flex items-center gap-2 flex-1 max-w-[200px]">
                                <div className="flex-1">
                                    <div className="h-2 rounded-full bg-white/5 overflow-hidden border border-white/10">
                                        <div
                                            className={`h-full rounded-full bg-gradient-to-r ${colors.bar} transition-all duration-700`}
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                                    <TrendingUp className="h-3 w-3" />
                                    <span>{nextRank.icon} {nextRank.minPoints}</span>
                                </div>
                            </div>
                        )}

                        {/* Max rank indicator */}
                        {!nextRank && (
                            <span className="text-xs font-semibold text-amber-400/70 uppercase tracking-wider">
                                Max Rank
                            </span>
                        )}
                    </div>
                </div>

                {/* Edit Button Placeholder */}
                <button className="absolute top-0 right-0 md:relative md:top-auto md:right-auto px-4 py-2 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors text-sm font-semibold border border-border/40">
                    Edit Profile
                </button>
            </div>
        </div>
    );
}
