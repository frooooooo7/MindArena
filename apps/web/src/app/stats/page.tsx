"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { BackgroundGradients, Footer } from "@/components/home";
import { LeaderboardTable } from "@/components/stats/leaderboard-table";
import { RankCard } from "@/components/stats/rank-card";
import { PodiumSpotlight } from "@/components/stats/podium-spotlight";
import { Trophy, Star, Sparkles, Flame, Shield, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

export default function StatsPage() {
  const [activeTab, setActiveTab] = useState<"global" | "friends" | "tier">("global");

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
                  Arena <span className="text-portal-mint">Statistics</span>
                </h1>
                <p className="text-muted-foreground mt-2 text-base sm:text-lg max-w-2xl leading-relaxed">
                  Real-time cognitive performance metrics, global player leaderboards, and MindRank tier progression.
                </p>
              </div>

              {/* View Switcher Controls */}
              <div className="flex items-center gap-1.5 bg-secondary/30 p-1.5 rounded-2xl border border-border/50 backdrop-blur-md w-fit self-start lg:self-auto">
                <button
                  onClick={() => setActiveTab("global")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                    activeTab === "global"
                      ? "bg-gradient-to-r from-portal-violet to-indigo-600 text-white shadow-lg shadow-portal-violet/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                  }`}
                >
                  Global Standings
                </button>
                <button
                  onClick={() => setActiveTab("friends")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                    activeTab === "friends"
                      ? "bg-gradient-to-r from-portal-mint to-teal-600 text-slate-950 shadow-lg shadow-portal-mint/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                  }`}
                >
                  Friends League
                </button>
                <button
                  onClick={() => setActiveTab("tier")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                    activeTab === "tier"
                      ? "bg-gradient-to-r from-portal-yellow to-amber-600 text-slate-950 shadow-lg shadow-portal-yellow/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                  }`}
                >
                  Season Rewards
                </button>
              </div>
            </motion.div>

            {/* Rank Snapshot Cards */}
            <RankCard />

            {/* Top 3 Podium Showcase */}
            <div className="py-2">
              <div className="text-center mb-2">
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-portal-yellow">
                  Hall of Fame
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white mt-1">
                  Top Competitors
                </h2>
              </div>
              <PodiumSpotlight />
            </div>

            {/* Leaderboard Table Section */}
            <div className="space-y-8">
              <LeaderboardTable />

              {/* Season Perks & Rewards Highlight Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                  className="p-8 rounded-3xl border border-portal-yellow/30 bg-gradient-to-br from-[#1a1710] via-[#14120e] to-[#0d1120] flex items-center gap-6 relative overflow-hidden group shadow-xl"
                >
                  <div className="portal-dot-grid absolute inset-0 opacity-20 pointer-events-none" />
                  <div className="h-16 w-16 shrink-0 rounded-2xl bg-portal-yellow/15 flex items-center justify-center border border-portal-yellow/30 text-portal-yellow shadow-inner">
                    <Trophy className="h-8 w-8 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div className="space-y-1 relative z-10">
                    <div className="flex items-center gap-2">
                      <h4 className="font-display text-lg font-bold text-white">Season 4 Rewards</h4>
                      <span className="text-[10px] font-bold text-portal-yellow bg-portal-yellow/15 px-2 py-0.5 rounded-full border border-portal-yellow/30">
                        4 days left
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Finish in the Top 100 players this season to unlock the exclusive &quot;Stellar Mind&quot; animated profile badge &amp; avatar frame.
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="p-8 rounded-3xl border border-portal-violet/30 bg-gradient-to-br from-[#18122a] via-[#120e20] to-[#0d1120] flex items-center gap-6 relative overflow-hidden group shadow-xl"
                >
                  <div className="portal-dot-grid absolute inset-0 opacity-20 pointer-events-none" />
                  <div className="h-16 w-16 shrink-0 rounded-2xl bg-portal-violet/15 flex items-center justify-center border border-portal-violet/30 text-portal-violet shadow-inner">
                    <Star className="h-8 w-8 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div className="space-y-1 relative z-10">
                    <div className="flex items-center gap-2">
                      <h4 className="font-display text-lg font-bold text-white">Elite Masters Club</h4>
                      <span className="text-[10px] font-bold text-portal-mint bg-portal-mint/15 px-2 py-0.5 rounded-full border border-portal-mint/30">
                        Top 10%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      You qualify for the regional qualifier tournament. Reach Geniusz rank to gain instant entry into the Global Champions Cup.
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
