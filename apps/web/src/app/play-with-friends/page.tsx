"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Navbar } from "@/components/navbar";
import { BackgroundGradients, Footer } from "@/components/home";
import { DuelFriendPicker } from "@/components/arena/duel-friend-picker";
import { useDuel } from "@/hooks/use-duel";
import { useDuelStore } from "@/store/duel.store";
import { useFriends } from "@/hooks/use-friends";
import { useAuthStore } from "@/store/auth.store";
import { gameResultApi, GameResult } from "@/lib/game-result-api";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Swords,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Trophy,
  Search,
  UserPlus,
  Flame,
  Sparkles,
  RefreshCw,
  Gamepad2,
  Circle,
} from "lucide-react";
import Link from "next/link";
import { GAME_TYPES } from "@/lib/games/game-types";

export default function PlayWithFriendsPage() {
  const { isAuthenticated } = useAuthStore();
  const {
    pendingInvitations,
    sentInvitation,
    acceptInvite,
    declineInvite,
    isFriendOnline,
    setPickerOpen,
  } = useDuel();
  const { friends, loadFriends, loading: friendsLoading } = useFriends();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterOnlineOnly, setFilterOnlineOnly] = useState(false);
  const [history, setHistory] = useState<GameResult[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  // Timer for invitation expirations
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch recent duel history
  const fetchHistory = useCallback(async () => {
    if (!isAuthenticated) {
      setHistoryLoading(false);
      return;
    }
    try {
      setHistoryLoading(true);
      const res = await gameResultApi.getHistory({ mode: "arena", limit: 20 });
      setHistory(res.results ?? []);
    } catch (err) {
      console.error("Failed to load duel history:", err);
    } finally {
      setHistoryLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadFriends();
    fetchHistory();
  }, [loadFriends, fetchHistory]);

  // Filter accepted friends
  const acceptedFriends = useMemo(() => {
    return (friends ?? []).filter((f) => f.status === "ACCEPTED");
  }, [friends]);

  // Filtered & sorted friends list
  const filteredFriends = useMemo(() => {
    return acceptedFriends
      .filter((f) => {
        const friend = f.friend;
        if (!friend) return false;
        const matchesQuery = friend.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const isOnline = isFriendOnline(friend.id);
        const matchesOnlineFilter = filterOnlineOnly ? isOnline : true;
        return matchesQuery && matchesOnlineFilter;
      })
      .sort((a, b) => {
        const aOnline = isFriendOnline(a.friend?.id || "") ? 1 : 0;
        const bOnline = isFriendOnline(b.friend?.id || "") ? 1 : 0;
        return bOnline - aOnline;
      });
  }, [acceptedFriends, searchQuery, filterOnlineOnly, isFriendOnline]);

  // Head to head stats from history
  const totalDuels = history.length;
  const wins = useMemo(() => {
    return history.filter((game) => game.score > 0).length;
  }, [history]);
  const losses = Math.max(0, totalDuels - wins);
  const winRate = totalDuels > 0 ? Math.round((wins / totalDuels) * 100) : 0;

  const getGameName = (typeId: string) => {
    const found = GAME_TYPES.find((g) => g.id === typeId);
    return found ? found.name : typeId;
  };

  return (
    <div className="min-h-dvh bg-background flex flex-col justify-between relative overflow-hidden">
      <BackgroundGradients />
      <Navbar />

      <main className="container relative z-10 mx-auto px-4 py-8 md:px-8 max-w-7xl flex-1">
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Header & Main Challenge Banner */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-border/40">
            <div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-tight text-white">
                Play with <span className="text-cyan-400">Friends</span>
              </h1>
              <p className="text-muted-foreground mt-2 text-base sm:text-lg max-w-2xl leading-relaxed">
                Challenge your friends to real-time memory duels, manage active invites, and track your head-to-head standings.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                onClick={() => setPickerOpen(true)}
                size="lg"
                className="h-12 px-6 rounded-2xl font-bold bg-linear-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 transition-all duration-200 hover:-translate-y-0.5"
              >
                <Swords className="h-5 w-5 mr-2" />
                Challenge a Friend
              </Button>
            </div>
          </div>

          {/* Pending Invitations Section (Incoming & Outgoing) */}
          {(pendingInvitations.length > 0 || sentInvitation) && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-400" />
                <h2 className="text-xl font-bold tracking-tight text-white">
                  Active Challenges
                </h2>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {pendingInvitations.length + (sentInvitation ? 1 : 0)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Outgoing Invitation Card */}
                {sentInvitation && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-2xl border border-cyan-500/40 bg-linear-to-br from-cyan-950/40 via-secondary/30 to-background backdrop-blur-xl relative overflow-hidden flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                          <Swords className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                            Outgoing Challenge
                          </p>
                          <h3 className="font-bold text-white text-lg">
                            Waiting for Opponent
                          </h3>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                        1v1 Duel
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm py-2 px-3 rounded-xl bg-secondary/40 border border-border/40 my-2">
                      <span className="text-muted-foreground">Game Mode:</span>
                      <span className="font-bold text-white">
                        {getGameName(sentInvitation.gameType)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-3 border-t border-border/40">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5 text-cyan-400 animate-spin" />
                        <span>Awaiting response...</span>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          useDuelStore.getState().setSentInvitation(null)
                        }
                        className="h-8 px-3 text-xs text-muted-foreground hover:text-white"
                      >
                        Cancel
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Incoming Invitation Cards */}
                {pendingInvitations.map((invite) => {
                  const remainingSecs = invite.expiresAt
                    ? Math.max(
                        0,
                        Math.ceil(
                          (new Date(invite.expiresAt).getTime() - currentTime) /
                            1000,
                        ),
                      )
                    : null;

                  return (
                    <motion.div
                      key={invite.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-5 rounded-2xl border border-emerald-500/40 bg-linear-to-br from-emerald-950/30 via-secondary/30 to-background backdrop-blur-xl flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between gap-4 mb-3">
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            name={invite.inviterName}
                            avatarUrl={invite.inviterAvatar}
                            size="md"
                          />
                          <div>
                            <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                              Incoming Challenge
                            </p>
                            <h3 className="font-bold text-white text-base">
                              {invite.inviterName}
                            </h3>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          1v1 Duel
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-secondary/40 border border-border/40 my-2">
                        <span className="text-muted-foreground">Game:</span>
                        <span className="font-bold text-white">
                          {getGameName(invite.gameType)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/40">
                        {remainingSecs !== null && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Expires in {remainingSecs}s
                          </span>
                        )}
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => declineInvite(invite.id)}
                            className="h-8 px-3 text-xs border-red-500/30 text-red-400 hover:bg-red-500/10"
                          >
                            <XCircle className="h-3.5 w-3.5 mr-1" />
                            Decline
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => acceptInvite(invite.id)}
                            className="h-8 px-4 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                            Accept
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Main Grid: Left Friends List | Right Stats & History */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Friends Directory (2 Columns) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="p-6 rounded-3xl border border-border/40 bg-card/60 backdrop-blur-xl shadow-xl space-y-6">
                {/* Section Title & Search Filter */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                      <Users className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        Friends Directory
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary/80 text-muted-foreground">
                          {acceptedFriends.length}
                        </span>
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Select a friend to initiate a 1v1 duel instantly.
                      </p>
                    </div>
                  </div>

                  {/* Filter controls */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFilterOnlineOnly(!filterOnlineOnly)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        filterOnlineOnly
                          ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                          : "bg-secondary/30 border-border/40 text-muted-foreground hover:bg-secondary/50"
                      }`}
                    >
                      <Circle
                        className={`h-2 w-2 inline-block mr-1.5 fill-current ${
                          filterOnlineOnly ? "text-emerald-400" : "text-zinc-500"
                        }`}
                      />
                      Online Only
                    </button>
                  </div>
                </div>

                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    aria-label="Search friends by name"
                    placeholder="Search friends by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-secondary/30 border border-border/50 rounded-xl pl-10 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500/50 transition-colors"
                  />
                </div>

                {/* Friends List */}
                <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                  {friendsLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground space-y-2">
                      <RefreshCw className="h-6 w-6 animate-spin text-cyan-400" />
                      <p className="text-xs">Loading friends list...</p>
                    </div>
                  ) : filteredFriends.length === 0 ? (
                    <div className="py-12 px-4 text-center rounded-2xl border border-dashed border-border/60 bg-secondary/10">
                      <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                      <h4 className="font-bold text-white text-base">
                        No friends found
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                        {searchQuery || filterOnlineOnly
                          ? "No friends match your current filter criteria."
                          : "You haven't added any friends yet. Add friends to challenge them to 1v1 duels!"}
                      </p>
                      <Link
                        href="/account?tab=social"
                        className="mt-4 inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/25 transition-colors"
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        Find & Add Friends
                      </Link>
                    </div>
                  ) : (
                    filteredFriends.map((friendship) => {
                      const friend = friendship.friend;
                      if (!friend) return null;
                      const isOnline = isFriendOnline(friend.id);

                      return (
                        <div
                          key={friendship.id}
                          className="flex items-center justify-between p-3.5 rounded-2xl border border-border/40 bg-secondary/15 hover:bg-secondary/30 transition-all duration-200 group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <UserAvatar
                                name={friend.name}
                                avatarUrl={friend.avatarUrl}
                                size="md"
                              />
                              <Circle
                                className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 fill-current ring-2 ring-background rounded-full ${
                                  isOnline
                                    ? "text-emerald-400"
                                    : "text-zinc-600"
                                }`}
                              />
                            </div>
                            <div>
                              <p className="font-bold text-white text-sm group-hover:text-cyan-400 transition-colors">
                                {friend.name}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[11px] text-muted-foreground">
                                  {isOnline ? (
                                    <span className="text-emerald-400 font-semibold">
                                      Online Now
                                    </span>
                                  ) : (
                                    "Offline"
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>

                          <Button
                            type="button"
                            size="sm"
                            onClick={() => setPickerOpen(true, friend.id)}
                            disabled={!isOnline}
                            className="h-9 px-4 text-xs font-bold rounded-xl bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white disabled:opacity-40 shadow-sm"
                          >
                            <Swords className="h-3.5 w-3.5 mr-1.5" />
                            Challenge
                          </Button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Head-to-Head Stats & Duel History */}
            <div className="space-y-6">
              {/* Head-to-Head Performance Summary */}
              <div className="p-6 rounded-3xl border border-border/40 bg-card/60 backdrop-blur-xl shadow-xl space-y-4">
                <div className="flex items-center gap-2 border-b border-border/40 pb-3">
                  <Trophy className="h-5 w-5 text-amber-400" />
                  <h3 className="font-bold text-white text-base">
                    Head-to-Head Record
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-secondary/20 border border-border/40">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                      Total Duels
                    </p>
                    <p className="text-2xl font-black text-white mt-1">
                      {totalDuels}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">
                      Win Rate
                    </p>
                    <p className="text-2xl font-black text-emerald-300 mt-1">
                      {winRate}%
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400">
                      Wins
                    </p>
                    <p className="text-2xl font-black text-cyan-300 mt-1">
                      {wins}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-red-400">
                      Losses
                    </p>
                    <p className="text-2xl font-black text-red-300 mt-1">
                      {losses}
                    </p>
                  </div>
                </div>
              </div>

              {/* Recent Duel History */}
              <div className="p-6 rounded-3xl border border-border/40 bg-card/60 backdrop-blur-xl shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <div className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-cyan-400" />
                    <h3 className="font-bold text-white text-base">
                      Recent Duels
                    </h3>
                  </div>
                  <button
                    type="button"
                    aria-label="Refresh duel history"
                    onClick={fetchHistory}
                    className="text-xs text-muted-foreground hover:text-white transition-colors"
                  >
                    <RefreshCw
                      className={`h-3.5 w-3.5 ${
                        historyLoading ? "animate-spin" : ""
                      }`}
                    />
                  </button>
                </div>

                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {historyLoading ? (
                    <div className="py-8 text-center text-xs text-muted-foreground">
                      Loading recent matches...
                    </div>
                  ) : history.length === 0 ? (
                    <div className="py-8 text-center text-xs text-muted-foreground">
                      No duel history yet. Play your first match!
                    </div>
                  ) : (
                    history.slice(0, 5).map((match) => (
                      <div
                        key={match.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 border border-border/30 text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-lg bg-cyan-500/15 text-cyan-400">
                            <Gamepad2 className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <p className="font-bold text-white">
                              {getGameName(match.gameType)}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              Level {match.level} · {match.score} pts
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {new Date(match.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Duel Friend Picker Modal */}
      <DuelFriendPicker />

      <Footer />
    </div>
  );
}
