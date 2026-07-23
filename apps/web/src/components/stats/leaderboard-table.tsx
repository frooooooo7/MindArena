"use client";

import { useState, useMemo } from "react";
import {
  Users,
  Swords,
  Search,
  Trophy,
  Circle,
  RefreshCw,
  UserPlus,
  Flame,
  Award,
} from "lucide-react";
import { useFriends } from "@/hooks/use-friends";
import { useDuel } from "@/hooks/use-duel";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

export function LeaderboardTable() {
  const { friends, loading: friendsLoading, loadFriends } = useFriends();
  const { isFriendOnline, setPickerOpen } = useDuel();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterOnlineOnly, setFilterOnlineOnly] = useState(false);

  // Filter accepted friends
  const acceptedFriends = useMemo(() => {
    return (friends ?? []).filter((f) => f.status === "ACCEPTED");
  }, [friends]);

  // Compute mock / realistic standing metrics for friends
  const standingsData = useMemo(() => {
    return acceptedFriends.map((friendship, index) => {
      const friend = friendship.friend;
      const isOnline = friend ? isFriendOnline(friend.id) : false;

      // Deterministic / realistic mock values based on friend id for demo consistency
      const hash = (friend?.id || "0")
        .split("")
        .reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const duelsPlayed = 3 + (hash % 15);
      const wins = Math.round(duelsPlayed * (0.3 + (hash % 50) / 100));
      const losses = Math.max(0, duelsPlayed - wins);
      const winRate =
        duelsPlayed > 0 ? Math.round((wins / duelsPlayed) * 100) : 0;

      return {
        id: friendship.id,
        friendId: friend?.id || "",
        name: friend?.name || "Player",
        avatarUrl: friend?.avatarUrl,
        rankName: friend?.rankName || "Competitor",
        isOnline,
        duelsPlayed,
        wins,
        losses,
        winRate,
      };
    });
  }, [acceptedFriends, isFriendOnline]);

  // Filtered & sorted standings (sorted by Win Rate % descending)
  const filteredStandings = useMemo(() => {
    return standingsData
      .filter((item) => {
        const matchesQuery = item.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const matchesOnline = filterOnlineOnly ? item.isOnline : true;
        return matchesQuery && matchesOnline;
      })
      .sort((a, b) => b.winRate - a.winRate || b.duelsPlayed - a.duelsPlayed);
  }, [standingsData, searchQuery, filterOnlineOnly]);

  return (
    <div className="w-full rounded-3xl border border-border/40 bg-card/60 shadow-2xl overflow-hidden relative backdrop-blur-xl">
      <div className="portal-dot-grid absolute inset-0 opacity-20 pointer-events-none" />

      {/* Header & Controls Bar */}
      <div className="relative z-10 p-5 sm:p-6 border-b border-border/40 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-secondary/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
            <Swords className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Friends Duel Standings
              <span className="text-[10px] font-black uppercase tracking-widest bg-cyan-500/15 text-cyan-400 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                1v1 Head-to-Head
              </span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Friendly duel stats, win/loss breakdown, and head-to-head win rates
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
              placeholder="Search friend..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-secondary/30 border border-border/60 rounded-xl pl-9 pr-4 py-2 text-xs font-medium focus:outline-none focus:border-cyan-400 transition-colors placeholder:text-muted-foreground/60 text-white"
            />
          </div>

          {/* Online Toggle */}
          <button
            onClick={() => setFilterOnlineOnly(!filterOnlineOnly)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 ${
              filterOnlineOnly
                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-md"
                : "bg-secondary/20 border-border/40 text-muted-foreground hover:bg-secondary/40 hover:text-white"
            }`}
          >
            <Circle
              className={`h-2 w-2 fill-current ${
                filterOnlineOnly ? "text-emerald-400" : "text-zinc-500"
              }`}
            />
            <span>Online Only</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="relative z-10 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border/30 bg-secondary/20 text-muted-foreground">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">
                Rank
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">
                Friend
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center">
                Duels Played
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center">
                Wins
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center">
                Losses
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right">
                Win Rate %
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20">
            {friendsLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={`loading-${i}`} className="bg-transparent">
                  <td className="px-6 py-4">
                    <div className="h-5 w-6 bg-secondary/40 rounded animate-pulse" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-secondary/40 animate-pulse" />
                      <div className="space-y-1">
                        <div className="h-4 w-28 bg-secondary/40 rounded animate-pulse" />
                        <div className="h-3 w-16 bg-secondary/40 rounded animate-pulse" />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="h-5 w-12 bg-secondary/40 rounded animate-pulse inline-block" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="h-5 w-10 bg-secondary/40 rounded animate-pulse inline-block" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="h-5 w-10 bg-secondary/40 rounded animate-pulse inline-block" />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="h-5 w-16 bg-secondary/40 rounded animate-pulse inline-block" />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="h-8 w-24 bg-secondary/40 rounded-xl animate-pulse inline-block" />
                  </td>
                </tr>
              ))
            ) : filteredStandings.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-12 text-center text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center gap-3 max-w-md mx-auto">
                    <Users className="h-10 w-10 text-muted-foreground/30" />
                    <p className="font-bold text-white text-base">
                      No friends found in standings
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {searchQuery || filterOnlineOnly
                        ? "Try clearing your search query or online filter."
                        : "You don't have any friends in your list yet. Add friends to compete in 1v1 duels!"}
                    </p>
                    <Link
                      href="/play-with-friends"
                      className="mt-2 inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/25 transition-colors"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      Go to Play with Friends
                    </Link>
                  </div>
                </td>
              </tr>
            ) : (
              filteredStandings.map((row, index) => {
                const rank = index + 1;
                return (
                  <tr
                    key={row.id}
                    className="group transition-colors duration-200 hover:bg-secondary/20"
                  >
                    {/* Rank */}
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-bold text-muted-foreground">
                        #{rank}
                      </span>
                    </td>

                    {/* Friend Avatar & Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <UserAvatar
                            name={row.name}
                            avatarUrl={row.avatarUrl}
                            size="md"
                          />
                          <Circle
                            className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 fill-current ring-2 ring-background rounded-full ${
                              row.isOnline
                                ? "text-emerald-400"
                                : "text-zinc-600"
                            }`}
                          />
                        </div>
                        <div className="flex flex-col">
                          <p className="font-display text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                            {row.name}
                          </p>
                          <span className="text-[10px] text-muted-foreground font-medium">
                            {row.isOnline ? (
                              <span className="text-emerald-400 font-semibold">
                                Online
                              </span>
                            ) : (
                              "Offline"
                            )}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Duels Played */}
                    <td className="px-6 py-4 text-center">
                      <span className="font-mono text-xs font-bold text-white">
                        {row.duelsPlayed}
                      </span>
                    </td>

                    {/* Wins */}
                    <td className="px-6 py-4 text-center">
                      <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        {row.wins}
                      </span>
                    </td>

                    {/* Losses */}
                    <td className="px-6 py-4 text-center">
                      <span className="font-mono text-xs font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/20">
                        {row.losses}
                      </span>
                    </td>

                    {/* Win Rate % */}
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <span className="font-display font-extrabold text-sm text-cyan-300">
                          {row.winRate}%
                        </span>
                        <div className="h-1.5 w-12 bg-secondary/60 rounded-full overflow-hidden hidden sm:block">
                          <div
                            className="h-full bg-cyan-400 rounded-full"
                            style={{ width: `${row.winRate}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Challenge Action */}
                    <td className="px-6 py-4 text-right">
                      <Button
                        size="sm"
                        disabled={!row.isOnline}
                        onClick={() => setPickerOpen(true, row.friendId)}
                        className="h-8 px-3 text-xs font-bold rounded-lg bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white disabled:opacity-40"
                      >
                        <Swords className="h-3 w-3 mr-1" />
                        Challenge
                      </Button>
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
        <span>
          Showing {filteredStandings.length} of {acceptedFriends.length} friends
        </span>
        <button
          onClick={() => {
            setSearchQuery("");
            setFilterOnlineOnly(false);
          }}
          className="font-bold text-cyan-400 hover:underline flex items-center gap-1 uppercase tracking-wider text-[11px]"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}
