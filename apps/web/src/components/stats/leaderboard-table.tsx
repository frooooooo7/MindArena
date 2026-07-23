"use client";

import { useEffect, useState } from "react";
import { Trophy, Medal, Crown, Search, Swords, Sparkles, Filter, ChevronRight } from "lucide-react";
import { statsApi } from "@/lib/stats-api";
import { LeaderboardPlayer, RANK_COLORS_MAP, RANK_TIERS } from "@mindarena/shared";
import { motion, AnimatePresence } from "framer-motion";

export function LeaderboardTable() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTier, setSelectedTier] = useState<string>("ALL");

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        const data = await statsApi.getLeaderboard(100);
        setLeaderboardData(data);
      } catch (error) {
        console.error("Failed to load leaderboard:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadLeaderboard();
  }, []);

  const getInitials = (name: string) => name.slice(0, 2).toUpperCase();

  const filteredPlayers = leaderboardData.filter((player) => {
    const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = selectedTier === "ALL" || player.rankName.toUpperCase() === selectedTier.toUpperCase();
    return matchesSearch && matchesTier;
  });

  return (
    <div className="w-full rounded-3xl border border-border/40 bg-card/60 shadow-2xl overflow-hidden relative backdrop-blur-xl">
      <div className="portal-dot-grid absolute inset-0 opacity-20 pointer-events-none" />

      {/* Header & Controls Bar */}
      <div className="relative z-10 p-5 sm:p-6 border-b border-border/40 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-secondary/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-portal-yellow/15 border border-portal-yellow/30 text-portal-yellow">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Global Leaderboard
              <span className="text-[10px] font-black uppercase tracking-widest bg-portal-violet/15 text-portal-violet px-2.5 py-0.5 rounded-full border border-portal-violet/30">
                Top 100
              </span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Rankings updated live from Arena competitive matches
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search player..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-secondary/30 border border-border/60 rounded-xl pl-9 pr-4 py-2 text-xs font-medium focus:outline-none focus:border-portal-mint transition-colors placeholder:text-muted-foreground/60"
            />
          </div>

          {/* Tier Filter Select */}
          <div className="flex items-center gap-1.5 bg-secondary/20 p-1 rounded-xl border border-border/40">
            <button
              onClick={() => setSelectedTier("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedTier === "ALL"
                  ? "bg-portal-mint text-slate-950 shadow-md"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
              }`}
            >
              All Tiers
            </button>
            {RANK_TIERS.map((tier) => (
              <button
                key={tier.name}
                onClick={() => setSelectedTier(tier.name)}
                className={`hidden sm:inline-flex px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedTier === tier.name
                    ? "bg-portal-mint text-slate-950 shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                }`}
              >
                {tier.icon}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="relative z-10 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border/30 bg-secondary/20 text-muted-foreground">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Rank</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Player</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Division</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right">Rating Points</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right">Matches</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20">
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <tr key={`loading-${i}`} className="bg-transparent">
                  <td className="px-6 py-4"><div className="h-5 w-6 bg-secondary/40 rounded animate-pulse" /></td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-secondary/40 animate-pulse" />
                      <div className="space-y-1">
                        <div className="h-4 w-28 bg-secondary/40 rounded animate-pulse" />
                        <div className="h-3 w-16 bg-secondary/40 rounded animate-pulse" />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4"><div className="h-5 w-20 bg-secondary/40 rounded-full animate-pulse" /></td>
                  <td className="px-6 py-4 text-right"><div className="h-5 w-16 bg-secondary/40 rounded animate-pulse inline-block" /></td>
                  <td className="px-6 py-4 text-right"><div className="h-4 w-12 bg-secondary/40 rounded animate-pulse inline-block" /></td>
                </tr>
              ))
            ) : filteredPlayers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Swords className="h-8 w-8 text-muted-foreground/40 mb-1" />
                    <p className="font-bold text-sm">No matching players found</p>
                    <p className="text-xs">Try adjusting your search criteria or tier filter.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredPlayers.map((player, index) => {
                const rank = index + 1;
                const isTop3 = rank <= 3;
                return (
                  <tr
                    key={player.id}
                    className={`group transition-colors duration-200 cursor-pointer ${
                      rank === 1
                        ? "bg-amber-500/5 hover:bg-amber-500/10"
                        : rank === 2
                        ? "bg-slate-400/5 hover:bg-slate-400/10"
                        : rank === 3
                        ? "bg-amber-700/5 hover:bg-amber-700/10"
                        : "hover:bg-secondary/20"
                    }`}
                  >
                    {/* Rank column */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center h-8 w-8 rounded-xl font-display font-bold text-sm">
                        {rank === 1 ? (
                          <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            <Crown className="h-4 w-4" />
                          </span>
                        ) : rank === 2 ? (
                          <span className="p-1.5 rounded-lg bg-slate-400/20 text-slate-300 border border-slate-400/30">
                            <Medal className="h-4 w-4" />
                          </span>
                        ) : rank === 3 ? (
                          <span className="p-1.5 rounded-lg bg-amber-700/20 text-amber-500 border border-amber-700/30">
                            <Medal className="h-4 w-4" />
                          </span>
                        ) : (
                          <span className="text-muted-foreground font-mono text-xs">#{rank}</span>
                        )}
                      </div>
                    </td>

                    {/* Player Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-9 w-9 rounded-xl flex items-center justify-center font-black text-xs border shadow-sm ${
                            isTop3
                              ? "bg-gradient-to-br from-portal-violet/30 to-portal-mint/20 border-portal-mint/40 text-portal-mint"
                              : "bg-secondary/40 border-border/40 text-foreground"
                          }`}
                        >
                          {getInitials(player.name)}
                        </div>
                        <div className="flex flex-col">
                          <p className="font-display text-sm font-bold text-foreground group-hover:text-portal-mint transition-colors">
                            {player.name}
                          </p>
                          <span className="text-[10px] text-muted-foreground font-medium sm:hidden">
                            {player.rankName}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Division */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border bg-secondary/30 ${
                          RANK_COLORS_MAP[player.rankName as keyof typeof RANK_COLORS_MAP] || "text-muted-foreground"
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {player.rankName}
                      </span>
                    </td>

                    {/* Rating Points */}
                    <td className="px-6 py-4 text-right">
                      <span className="font-display font-black text-sm text-white score-figures">
                        {player.rankPoints.toLocaleString()}
                      </span>
                      <span className="text-[10px] font-bold text-portal-violet ml-1">PTS</span>
                    </td>

                    {/* Matches */}
                    <td className="px-6 py-4 text-right">
                      <span className="text-xs font-semibold text-muted-foreground font-mono">
                        {player.totalGames} games
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer bar */}
      <div className="relative z-10 p-4 border-t border-border/30 bg-secondary/10 flex items-center justify-between text-xs text-muted-foreground">
        <span>Showing {filteredPlayers.length} of {leaderboardData.length} players</span>
        <button
          onClick={() => {
            setSearchQuery("");
            setSelectedTier("ALL");
          }}
          className="font-bold text-portal-mint hover:underline flex items-center gap-1 uppercase tracking-wider text-[11px]"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}
