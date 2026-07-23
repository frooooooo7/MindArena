"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { BackgroundGradients, Footer } from "@/components/home";
import { LeaderboardTable } from "@/components/stats/leaderboard-table";
import { RankCard } from "@/components/stats/rank-card";
import { PodiumSpotlight } from "@/components/stats/podium-spotlight";
import { DuelFriendPicker } from "@/components/arena/duel-friend-picker";
import { Trophy, Star, Sparkles, Swords, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function StatsPage() {
  const [activeTab, setActiveTab] = useState<"friends" | "overview" | "rewards">("friends");

  return (
    <div className="min-h-dvh bg-background flex flex-col justify-between">
      <div>
        <BackgroundGradients />
        <Navbar />

        <main className="portal-section py-8 sm:py-12 relative z-10">
          <div className="space-y-10">
            {/* Header Section */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-4 border-b border-border/40"
            >
              <div>
                <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-[-0.04em] text-white">
                  Duel & <span className="text-cyan-400">Friend Stats</span>
                </h1>
                <p className="text-muted-foreground mt-2 text-base sm:text-lg max-w-2xl leading-relaxed">
                  Personal high scores, overall duel performance, and 1v1 friends standings.
                </p>
              </div>

              {/* View Switcher Controls */}
              <div className="flex items-center gap-1.5 bg-secondary/30 p-1.5 rounded-2xl border border-border/50 backdrop-blur-md w-fit self-start lg:self-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab("friends")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
                    activeTab === "friends"
                      ? "bg-linear-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                  }`}
                >
                  <Users className="h-3.5 w-3.5" />
                  Friends Standings
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("overview")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
                    activeTab === "overview"
                      ? "bg-linear-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                  }`}
                >
                  <Trophy className="h-3.5 w-3.5" />
                  High Scores
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("rewards")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
                    activeTab === "rewards"
                      ? "bg-linear-to-r from-amber-500 to-yellow-600 text-slate-950 shadow-lg shadow-amber-500/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Season Perks
                </button>
              </div>
            </motion.div>

            {/* High Scores Overview Cards */}
            {(activeTab === "friends" || activeTab === "overview") && (
              <RankCard />
            )}

            {/* Friends Duel Standings View */}
            {(activeTab === "friends" || activeTab === "rewards") && (
              <>
                <div className="py-2">
                  <div className="text-center mb-2">
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-400">
                      Hall of Champions
                    </span>
                    <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white mt-1">
                      Top Duel Competitors
                    </h2>
                  </div>
                  <PodiumSpotlight />
                </div>

                <div className="space-y-8">
                  <LeaderboardTable />
                </div>
              </>
            )}

            {/* Season Perks & Rewards Highlight Cards */}
            {(activeTab === "rewards" || activeTab === "overview") && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                  className="p-8 rounded-3xl border border-cyan-500/30 bg-card/60 flex items-center gap-6 relative overflow-hidden group shadow-xl"
                >
                  <div className="portal-dot-grid absolute inset-0 opacity-20 pointer-events-none" />
                  <div className="h-16 w-16 shrink-0 rounded-2xl bg-cyan-500/15 flex items-center justify-center border border-cyan-500/30 text-cyan-400 shadow-inner">
                    <Swords className="h-8 w-8 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div className="space-y-1 relative z-10">
                    <div className="flex items-center gap-2">
                      <h4 className="font-display text-lg font-bold text-white">Friends Duel Series</h4>
                      <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/15 px-2 py-0.5 rounded-full border border-cyan-500/30">
                        Active League
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Challenge your friends to 1v1 duels to earn exclusive badges and climb the internal friends duel standings.
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="p-8 rounded-3xl border border-indigo-500/30 bg-card/60 flex items-center gap-6 relative overflow-hidden group shadow-xl"
                >
                  <div className="portal-dot-grid absolute inset-0 opacity-20 pointer-events-none" />
                  <div className="h-16 w-16 shrink-0 rounded-2xl bg-indigo-500/15 flex items-center justify-center border border-indigo-500/30 text-indigo-400 shadow-inner">
                    <Star className="h-8 w-8 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div className="space-y-1 relative z-10">
                    <div className="flex items-center gap-2">
                      <h4 className="font-display text-lg font-bold text-white">Master Minds Club</h4>
                      <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/15 px-2 py-0.5 rounded-full border border-indigo-500/30">
                        Top Performers
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Achieve a 70%+ win rate against your friends to unlock custom board themes and animated profile avatars.
                    </p>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        </main>
      </div>

      <DuelFriendPicker />
      <Footer />
    </div>
  );
}
