"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ArrowRight,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Swords,
  Layers,
  Flame,
  Zap,
} from "lucide-react";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/home/footer";
import { GAME_TYPES } from "@/lib/games/game-types";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  "All",
  "Memory",
  "Speed & Reaction",
  "Focus & Attention",
] as const;

type CategoryFilter = (typeof CATEGORIES)[number];

export default function GamesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Filter games based on search and category
  const filteredGames = useMemo(() => {
    return GAME_TYPES.filter((game) => {
      const matchesSearch =
        game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.skills?.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === "All" || game.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  // Reset to page 1 on filter change
  const totalPages = Math.max(1, Math.ceil(filteredGames.length / pageSize));
  const activePage = Math.min(currentPage, totalPages);

  const paginatedGames = useMemo(() => {
    const start = (activePage - 1) * pageSize;
    return filteredGames.slice(start, start + pageSize);
  }, [filteredGames, activePage, pageSize]);

  const handleCategorySelect = (category: CategoryFilter) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1 pb-20 sm:pb-28">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-white/10 bg-portal-surface py-16 sm:py-20">
          {/* Ambient Background Glow */}
          <div className="pointer-events-none absolute -left-32 -top-32 size-96 rounded-full bg-portal-violet/15 blur-3xl" />
          <div className="pointer-events-none absolute -right-32 -bottom-32 size-96 rounded-full bg-portal-mint/10 blur-3xl" />

          <div className="portal-section relative z-10">
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-portal-mint/30 bg-portal-mint/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-portal-mint">
                <Sparkles className="size-3.5" />
                <span>Cognitive Library</span>
              </div>

              <h1 className="font-display mt-4 text-4xl font-extrabold uppercase tracking-tight text-foreground sm:text-6xl">
                Explore <span className="text-portal-mint">Brain Games</span>
              </h1>

              <p className="mt-3 text-base leading-relaxed text-muted-foreground sm:text-lg">
                Challenge your memory retention, reaction speed, and focus agility. Track your personal high scores and climb the global MindRank leaderboards.
              </p>

              {/* Stats Ticker Bar */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-6 border-t border-white/10 pt-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Layers className="size-4 text-portal-mint" />
                  <span className="font-semibold text-foreground">6 Core Games</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="size-4 text-portal-yellow" />
                  <span className="font-semibold text-foreground">Adaptive Speed</span>
                </div>
                <div className="flex items-center gap-2">
                  <Swords className="size-4 text-portal-pink" />
                  <span className="font-semibold text-foreground">1v1 Arena Ready</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Controls Section: Search & Category Filters */}
        <section className="portal-section pt-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search games or skills..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] pl-10 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-portal-mint/50 focus:bg-white/[0.05] focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategorySelect(cat)}
                  className={cn(
                    "rounded-xl border px-3.5 py-2 text-xs font-bold transition-all duration-200",
                    selectedCategory === cat
                      ? "border-portal-mint bg-portal-mint text-[#07150f] shadow-[0_0_15px_rgba(112,245,193,0.3)]"
                      : "border-white/10 bg-white/[0.03] text-muted-foreground hover:border-white/20 hover:text-foreground",
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Results Summary & Page Size Row */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-6 text-xs">
            <span className="text-muted-foreground">
              Showing <strong className="text-foreground">{filteredGames.length}</strong> games
            </span>

            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">Per page:</span>
              {[3, 6].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => {
                    setPageSize(size);
                    setCurrentPage(1);
                  }}
                  className={cn(
                    "rounded px-2 py-0.5 font-bold transition-colors",
                    pageSize === size
                      ? "bg-portal-mint/20 text-portal-mint"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Games Cards Grid */}
          <div className="mt-8">
            {paginatedGames.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/[0.02] p-12 text-center">
                <p className="text-lg font-bold text-foreground">No games found</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Try adjusting your search criteria or category filters.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-portal-mint hover:bg-white/10"
                >
                  <RotateCcw className="size-3.5" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {paginatedGames.map((game, index) => {
                    const Icon = game.icon;
                    return (
                      <motion.div
                        key={game.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.25, delay: index * 0.05 }}
                        className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.04] hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)]"
                      >
                        {/* Subtle Glow Backdrop */}
                        <div
                          className={cn(
                            "pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-gradient-to-br opacity-40 blur-2xl transition-opacity group-hover:opacity-80",
                            game.color.includes("violet") && "from-violet-500/30 to-transparent",
                            game.color.includes("emerald") && "from-emerald-500/30 to-transparent",
                            game.color.includes("cyan") && "from-cyan-500/30 to-transparent",
                            game.color.includes("amber") && "from-amber-500/30 to-transparent",
                            game.color.includes("rose") && "from-rose-500/30 to-transparent",
                          )}
                        />

                        <div className="relative z-10 space-y-4">
                          {/* Card Top Row */}
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                              {game.category}
                            </span>
                            {game.playsCount && (
                              <span className="inline-flex items-center gap-1 text-[0.65rem] font-bold text-portal-yellow">
                                <Flame className="size-3" />
                                <span>{game.playsCount} Plays</span>
                              </span>
                            )}
                          </div>

                          {/* Game Header */}
                          <div className="flex items-start gap-4">
                            <div
                              className={cn(
                                "flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br p-3.5 text-white shadow-lg transition-transform duration-300 group-hover:scale-105",
                                game.color,
                                game.shadow,
                              )}
                            >
                              <Icon className="size-full" />
                            </div>
                            <div>
                              <h3 className="font-display text-xl font-bold tracking-tight text-foreground">
                                {game.name}
                              </h3>
                              <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Clock className="size-3.5" />
                                <span>{game.averageTime} per round</span>
                              </div>
                            </div>
                          </div>

                          {/* Full Description (No clipping!) */}
                          <p className="text-xs leading-relaxed text-muted-foreground">
                            {game.description}
                          </p>

                          {/* Skills Trained Pills */}
                          {game.skills && game.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {game.skills.map((skill) => (
                                <span
                                  key={skill}
                                  className="inline-flex items-center rounded-md border border-white/5 bg-white/5 px-2 py-0.5 text-[0.68rem] font-medium text-foreground/80"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Card Bottom Actions */}
                        <div className="relative z-10 mt-6 flex items-center gap-2 pt-2">
                          <Link
                            href={game.href ?? `/games/${game.id}`}
                            className="group/btn inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-portal-mint px-4 py-2.5 text-xs font-bold text-[#07150f] transition-all duration-200 hover:bg-portal-mint/90 hover:shadow-[0_0_18px_rgba(112,245,193,0.3)]"
                          >
                            <span>Play Challenge</span>
                            <ArrowRight className="size-3.5 transition-transform group-hover/btn:translate-x-1" />
                          </Link>
                          <Link
                            href="/arena"
                            aria-label={`1v1 Arena mode for ${game.name}`}
                            className="inline-flex size-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-muted-foreground transition-colors hover:border-portal-yellow/40 hover:bg-portal-yellow/10 hover:text-portal-yellow"
                            title="1v1 Arena Clash"
                          >
                            <Swords className="size-4" />
                          </Link>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
              <span className="text-xs text-muted-foreground">
                Page <strong className="text-foreground">{activePage}</strong> of{" "}
                <strong className="text-foreground">{totalPages}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={activePage === 1}
                  className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-foreground transition-colors hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="size-4" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={cn(
                        "size-8 rounded-lg text-xs font-bold transition-all",
                        activePage === page
                          ? "bg-portal-mint text-[#07150f] shadow-[0_0_12px_rgba(112,245,193,0.3)]"
                          : "border border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground",
                      )}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={activePage === totalPages}
                  className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-foreground transition-colors hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span>Next</span>
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
