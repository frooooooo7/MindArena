"use client";

import { Navbar } from "@/components/navbar";
import { BackgroundGradients } from "@/components/home";
import { LeaderboardTable } from "@/components/stats/leaderboard-table";
import { StatsCharts } from "@/components/stats/stats-charts";
import { RankCard } from "@/components/stats/rank-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Users, BarChart3, Star } from "lucide-react";

export default function StatsPage() {
  return (
    <div className="relative min-h-screen bg-background">
      <BackgroundGradients />
      <Navbar />

      <main className="container relative mx-auto px-4 py-8 md:px-8 max-w-6xl">
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Arena Statistics</h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Performance metrics, global rankings, and cognitive analysis.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-secondary/20 p-1 rounded-xl border border-border/40 w-fit">
              <button className="px-4 py-1.5 rounded-lg bg-background text-xs font-bold shadow-sm">Global</button>
              <button className="px-4 py-1.5 rounded-lg text-xs font-bold text-muted-foreground hover:bg-secondary/40">Friends</button>
              <button className="px-4 py-1.5 rounded-lg text-xs font-bold text-muted-foreground hover:bg-secondary/40">Local</button>
            </div>
          </div>

          <RankCard />

          <Tabs defaultValue="leaderboard" className="w-full">
            <TabsList className="bg-secondary/20 p-1 border border-border/40 mb-6">
              <TabsTrigger value="leaderboard" className="gap-2">
                <Users className="h-4 w-4" />
                <span>Global Rankings</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                <span>Personal Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="halloffame" className="gap-2">
                <Star className="h-4 w-4" />
                <span className="hidden sm:inline">Hall of Fame</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="leaderboard" className="space-y-8">
               <LeaderboardTable />
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-8 rounded-3xl border border-border/40 bg-card/60 flex items-center gap-6">
                    <div className="h-16 w-16 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                      <Trophy className="h-8 w-8 text-amber-500" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold">Season Rewards</h4>
                      <p className="text-sm text-muted-foreground">Current season ends in 4 days. Top 100 players unlock the "Stellar" badge.</p>
                    </div>
                  </div>
                  <div className="p-8 rounded-3xl border border-border/40 bg-card/60 flex items-center gap-6">
                    <div className="h-16 w-16 rounded-2xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
                      <Star className="h-8 w-8 text-violet-500" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold">Elite Club</h4>
                      <p className="text-sm text-muted-foreground">You are in the top 10% of players globally. Keep it up to reach Diamond tier.</p>
                    </div>
                  </div>
               </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-8">
              <StatsCharts />
            </TabsContent>

            <TabsContent value="halloffame">
               <div className="p-20 text-center rounded-3xl border border-dashed border-border/60 bg-secondary/5">
                  <Star className="h-16 w-16 text-amber-500 mx-auto mb-6" />
                  <h3 className="text-2xl font-black italic tracking-tight mb-3 uppercase">Legendary Status Only</h3>
                  <p className="text-muted-foreground max-w-lg mx-auto">
                    The Hall of Fame is reserved for players who have achieved perfection across all memory disciplines. Your journey continues.
                  </p>
               </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
