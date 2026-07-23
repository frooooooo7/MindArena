"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Crown, Medal, Flame, Swords } from "lucide-react";
import { LeaderboardPlayer, RANK_COLORS_MAP } from "@mindarena/shared";
import { statsApi } from "@/lib/stats-api";

interface PodiumSpotlightProps {
  topPlayers?: LeaderboardPlayer[];
}

export function PodiumSpotlight({ topPlayers: initialPlayers }: PodiumSpotlightProps) {
  const [players, setPlayers] = useState<LeaderboardPlayer[]>(initialPlayers || []);
  const [isLoading, setIsLoading] = useState(!initialPlayers || initialPlayers.length < 3);

  useEffect(() => {
    if (initialPlayers && initialPlayers.length >= 3) {
      setPlayers(initialPlayers);
      setIsLoading(false);
      return;
    }

    async function loadTop3() {
      try {
        const data = await statsApi.getLeaderboard(3);
        setPlayers(data);
      } catch (error) {
        console.error("Failed to load top 3 players:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadTop3();
  }, [initialPlayers]);

  if (isLoading) {
    return (
      <div className="py-6 max-w-4xl mx-auto px-2 flex items-end justify-center gap-3 sm:gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex-1 max-w-[260px] h-64 bg-secondary/20 rounded-3xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!players || players.length < 3) return null;

  const first = players[0];
  const second = players[1];
  const third = players[2];

  const getInitials = (name: string) => name.slice(0, 2).toUpperCase();

  const podiumItems = [
    {
      player: second,
      rank: 2,
      height: "h-64 sm:h-72",
      order: "order-1 sm:order-1",
      bgColor: "bg-slate-900/60 border-slate-400/30",
      glowColor: "shadow-slate-500/10",
      badgeBg: "bg-slate-400/10 text-slate-300 border-slate-400/30",
      icon: <Medal className="h-6 w-6 text-slate-300" />,
      delay: 0.1,
    },
    {
      player: first,
      rank: 1,
      height: "h-72 sm:h-84",
      order: "order-1 sm:order-2",
      bgColor: "bg-amber-950/40 border-amber-500/50",
      glowColor: "shadow-amber-500/25",
      badgeBg: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      icon: <Crown className="h-8 w-8 text-amber-400 animate-pulse" />,
      delay: 0,
      isWinner: true,
    },
    {
      player: third,
      rank: 3,
      height: "h-60 sm:h-68",
      order: "order-3 sm:order-3",
      bgColor: "bg-amber-950/20 border-amber-700/30",
      glowColor: "shadow-amber-800/10",
      badgeBg: "bg-amber-700/10 text-amber-400 border-amber-700/30",
      icon: <Medal className="h-6 w-6 text-amber-600" />,
      delay: 0.2,
    },
  ];

  return (
    <div className="relative py-6">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-48 bg-gradient-to-r from-violet-600/15 via-amber-500/15 to-emerald-600/15 blur-3xl rounded-full pointer-events-none" />

      <div className="relative flex items-end justify-center gap-3 sm:gap-6 max-w-4xl mx-auto px-2">
        {podiumItems.map(({ player, rank, height, order, bgColor, glowColor, badgeBg, icon, delay, isWinner }) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className={`relative flex-1 max-w-[260px] ${order} flex flex-col items-center`}
          >
            {/* Crown/Medal Header Floating Above Card */}
            <div className="mb-3 flex flex-col items-center">
              <div className={`p-2.5 rounded-2xl border backdrop-blur-md ${badgeBg} shadow-lg flex items-center justify-center`}>
                {icon}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest mt-1 text-muted-foreground">
                Rank #{rank}
              </span>
            </div>

            {/* Podium Card */}
            <div
              className={`w-full ${height} ${bgColor} border rounded-3xl p-4 sm:p-6 flex flex-col items-center justify-between shadow-2xl ${glowColor} backdrop-blur-xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-300`}
            >
              {/* Card dot grid overlay */}
              <div className="portal-dot-grid absolute inset-0 opacity-20 pointer-events-none" />
              {isWinner && (
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500" />
              )}

              {/* Avatar & Player Info */}
              <div className="relative flex flex-col items-center text-center z-10 w-full">
                <div className="relative mb-3">
                  <div
                    className={`h-16 w-16 sm:h-20 sm:w-20 rounded-2xl flex items-center justify-center text-lg sm:text-xl font-black ${
                      isWinner
                        ? "bg-gradient-to-br from-amber-400 to-yellow-600 text-slate-950 ring-4 ring-amber-400/30"
                        : "bg-secondary/60 text-foreground border border-white/10"
                    } shadow-inner`}
                  >
                    {getInitials(player.name)}
                  </div>
                  <div className="absolute -bottom-2 -right-1 px-2 py-0.5 rounded-full bg-background border border-border text-[10px] font-black text-portal-mint shadow-md">
                    #{rank}
                  </div>
                </div>

                <h3 className="font-display text-base sm:text-lg font-bold tracking-tight truncate w-full group-hover:text-portal-mint transition-colors">
                  {player.name}
                </h3>
                <span
                  className={`text-[10px] uppercase font-black tracking-widest mt-0.5 ${
                    RANK_COLORS_MAP[player.rankName as keyof typeof RANK_COLORS_MAP] || "text-muted-foreground"
                  }`}
                >
                  {player.rankName}
                </span>
              </div>

              {/* Score & Metrics */}
              <div className="relative z-10 w-full pt-3 border-t border-white/10 flex flex-col items-center gap-1 text-center">
                <div className="flex items-center gap-1.5 text-amber-400">
                  <Flame className="h-4 w-4" />
                  <span className="font-display font-bold text-lg sm:text-xl score-figures tracking-tight">
                    {player.rankPoints.toLocaleString()}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">PTS</span>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground font-medium">
                  <Swords className="h-3.5 w-3.5 text-portal-blue" />
                  <span>{player.totalGames} games</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
