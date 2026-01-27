"use client";

import { Brain, Swords, Zap, Activity } from "lucide-react";

const stats = [
    {
        label: "Total Score",
        value: "24,500",
        change: "+12% this week",
        icon: Brain,
        color: "text-violet-500",
        bg: "bg-violet-500/10"
    },
    {
        label: "Games Played",
        value: "158",
        change: "+5 today",
        icon: Gamepad2,
        color: "text-blue-500",
        bg: "bg-blue-500/10"
    },
    {
        label: "Win Rate",
        value: "68%",
        change: "+2% from avg",
        icon: Activity,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10"
    },
    {
        label: "Peak Performance",
        value: "Top 5%",
        change: "Global Ranking",
        icon: Zap,
        color: "text-amber-500",
        bg: "bg-amber-500/10"
    },
];

import { Gamepad2 } from "lucide-react";

export function StatsCards() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
            <div key={i} className="p-6 rounded-2xl border border-border/40 bg-card/60 hover:border-border transition-colors duration-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
                            <stat.icon className="h-5 w-5" />
                        </div>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                            Realtime
                        </span>
                    </div>
                    <div className="space-y-1">
                        <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                        <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-border/20">
                        <span className={`text-[10px] font-bold ${stat.color} bg-current/10 px-2 py-0.5 rounded`}>
                            {stat.change}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}
