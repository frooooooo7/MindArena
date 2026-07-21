"use client";

import Link from "next/link";
import {
  ArrowRight,
  RotateCcw,
  Zap,
  TrendingUp,
  Trophy,
  Flame,
  Target,
  Award,
  Sparkles,
  BarChart3,
  ShieldCheck,
} from "lucide-react";
import { useAuthenticatedQuery } from "@/hooks/use-authenticated-query";
import { gameResultApi } from "@/lib/game-result-api";
import { useAuthStore } from "@/store/auth.store";

const GUEST_CARDS = [
  {
    category: "Speed & Focus",
    title: "Quick Rounds",
    description:
      "Fast 60-second to 2-minute memory challenges designed for quick daily cognitive warmups.",
    icon: Zap,
    colorClass: "text-portal-mint bg-portal-mint/10 border-portal-mint/20",
    glowClass: "from-portal-mint/20 via-portal-mint/5 to-transparent",
    borderHover: "hover:border-portal-mint/40",
    pills: ["~2 Min Sessions", "Instant Feedback", "Adaptive Speed"],
  },
  {
    category: "Analytics & Metrics",
    title: "Personal Bests",
    description:
      "Detailed tracking of your accuracy trends, reaction speed (ms), and high score progression.",
    icon: TrendingUp,
    colorClass: "text-portal-violet bg-portal-violet/10 border-portal-violet/20",
    glowClass: "from-portal-violet/20 via-portal-violet/5 to-transparent",
    borderHover: "hover:border-portal-violet/40",
    pills: ["Precision Rate %", "Reaction Speed", "Streak Rewards"],
  },
  {
    category: "Global Competition",
    title: "MindRank Division",
    description:
      "Climb through competitive skill tiers from Initiate to Grandmaster on global leaderboards.",
    icon: Trophy,
    colorClass: "text-portal-yellow bg-portal-yellow/10 border-portal-yellow/20",
    glowClass: "from-portal-yellow/20 via-portal-yellow/5 to-transparent",
    borderHover: "hover:border-portal-yellow/40",
    pills: ["Global Ladder", "6 Rank Tiers", "Seasonal Leagues"],
  },
];

function ProgressSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-3" aria-label="Loading player progress">
      {Array.from({ length: 3 }, (_, index) => (
        <div
          key={index}
          className="flex h-52 animate-pulse flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-6"
        >
          <div className="flex items-center justify-between">
            <div className="h-3 w-24 rounded bg-white/10" />
            <div className="size-10 rounded-xl bg-white/10" />
          </div>
          <div className="space-y-2">
            <div className="h-6 w-36 rounded bg-white/10" />
            <div className="h-3 w-full rounded bg-white/10" />
            <div className="h-3 w-4/5 rounded bg-white/10" />
          </div>
          <div className="flex gap-2">
            <div className="h-5 w-20 rounded-md bg-white/10" />
            <div className="h-5 w-24 rounded-md bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PlayerProgress() {
  const { isAuthenticated, isHydrated, user } = useAuthStore();
  const { data, isLoading, error, refetch } = useAuthenticatedQuery(
    () => gameResultApi.getStats("local"),
    isAuthenticated,
    [],
    { enabled: isHydrated },
  );

  const showLoading = !isHydrated || (isAuthenticated && isLoading);

  const authCards = data
    ? [
        {
          category: "Lifetime Performance",
          label: "Total Score",
          value: data.totalScore.toLocaleString(),
          description: "Accumulated score earned across all finished memory games.",
          icon: Flame,
          colorClass: "text-portal-mint bg-portal-mint/10 border-portal-mint/20",
          glowClass: "from-portal-mint/20 via-portal-mint/5 to-transparent",
          borderHover: "hover:border-portal-mint/40",
          pill: "⚡ Score Accumulator",
        },
        {
          category: "Session History",
          label: "Games Played",
          value: data.totalGames.toLocaleString(),
          description: "Completed cognitive training rounds recorded on your profile.",
          icon: Target,
          colorClass: "text-portal-violet bg-portal-violet/10 border-portal-violet/20",
          glowClass: "from-portal-violet/20 via-portal-violet/5 to-transparent",
          borderHover: "hover:border-portal-violet/40",
          pill: "🎯 Active Streak",
        },
        {
          category: "Competitive Division",
          label: "MindRank Standing",
          value: user?.rankName ?? "Unranked",
          description: "Your official skill division based on competitive rankings.",
          icon: Award,
          colorClass: "text-portal-yellow bg-portal-yellow/10 border-portal-yellow/20",
          glowClass: "from-portal-yellow/20 via-portal-yellow/5 to-transparent",
          borderHover: "hover:border-portal-yellow/40",
          pill: "🏆 Rank Division",
        },
      ]
    : [];

  return (
    <section
      aria-labelledby="progress-title"
      className="bg-portal-surface pb-20 sm:pb-28"
    >
      <div className="portal-section">
        {/* Section Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-portal-mint/30 bg-portal-mint/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-portal-mint">
              <Sparkles className="size-3.5" />
              <span>{isAuthenticated ? "Personal Dashboard" : "Performance Engine"}</span>
            </div>
            <h2 id="progress-title" className="font-display mt-2 text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
              {isAuthenticated ? "Your current form" : "Every run counts"}
            </h2>
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
              {isAuthenticated
                ? "Track your cognitive metrics, total score accumulators, and global MindRank standing in real-time."
                : "Train your memory, benchmark your cognitive agility, and unlock your true brain potential with instant feedback."}
            </p>
          </div>
          {!isAuthenticated && isHydrated && (
            <Link
              href="/auth"
              className="group inline-flex shrink-0 items-center gap-2 rounded-xl border border-portal-mint/30 bg-portal-mint/10 px-4.5 py-2.5 text-sm font-semibold text-portal-mint transition-all duration-300 hover:bg-portal-mint hover:text-[#07150f] hover:shadow-[0_0_20px_rgba(112,245,193,0.3)]"
            >
              <span>Sign in to track progress</span>
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </div>

        {/* Loading Skeleton */}
        {showLoading ? (
          <ProgressSkeleton />
        ) : isAuthenticated && data && !error ? (
          /* Authenticated Player Stats Grid */
          <div className="grid gap-4 md:grid-cols-3">
            {authCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.04] ${card.borderHover}`}
                >
                  <div
                    className={`pointer-events-none absolute -right-12 -top-12 size-36 rounded-full bg-gradient-to-br ${card.glowClass} blur-xl opacity-60 transition-opacity group-hover:opacity-100`}
                  />

                  <div className="relative z-10 flex h-full flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-muted-foreground">
                          {card.category}
                        </span>
                        <div
                          className={`flex size-10 items-center justify-center rounded-xl border ${card.colorClass} transition-transform duration-300 group-hover:scale-110`}
                        >
                          <Icon className="size-5" />
                        </div>
                      </div>

                      <span className="mt-3 block text-xs font-semibold text-muted-foreground">
                        {card.label}
                      </span>

                      <strong className="score-figures font-display mt-1 block text-3xl font-extrabold text-foreground sm:text-4xl">
                        {card.value}
                      </strong>

                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                        {card.description}
                      </p>
                    </div>

                    <div className="pt-2">
                      <span className="inline-flex items-center rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[0.7rem] font-medium text-foreground/80">
                        {card.pill}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Guest Features Grid & CTA */
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              {GUEST_CARDS.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.title}
                    className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.04] ${card.borderHover}`}
                  >
                    <div
                      className={`pointer-events-none absolute -right-12 -top-12 size-36 rounded-full bg-gradient-to-br ${card.glowClass} blur-xl opacity-60 transition-opacity group-hover:opacity-100`}
                    />

                    <div className="relative z-10 flex h-full flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-muted-foreground">
                            {card.category}
                          </span>
                          <div
                            className={`flex size-10 items-center justify-center rounded-xl border ${card.colorClass} transition-transform duration-300 group-hover:scale-110`}
                          >
                            <Icon className="size-5" />
                          </div>
                        </div>

                        <h3 className="font-display mt-3 text-xl font-bold text-foreground">
                          {card.title}
                        </h3>

                        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                          {card.description}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {card.pills.map((pill) => (
                          <span
                            key={pill}
                            className="inline-flex items-center rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[0.7rem] font-medium text-foreground/80"
                          >
                            {pill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {isAuthenticated && error && (
              <button
                type="button"
                onClick={refetch}
                className="w-full inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground hover:bg-white/10"
              >
                <RotateCcw className="size-4" />
                Retry loading your stats
              </button>
            )}

            {!isAuthenticated && isHydrated && (
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-white/[0.02] via-portal-mint/[0.05] to-white/[0.02] p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3.5">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-portal-mint/30 bg-portal-mint/10 text-portal-mint">
                      <BarChart3 className="size-5" />
                    </div>
                    <div>
                      <h4 className="font-display text-sm font-bold text-foreground">
                        Unlock Full Performance Analytics & Global Leaderboards
                      </h4>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Sign up for free to save your memory records, earn rank titles, and track long-term cognitive improvement.
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <Link
                      href="/auth"
                      className="inline-flex items-center gap-2 rounded-xl bg-portal-mint px-4 py-2.5 text-xs font-extrabold text-[#07150f] transition-all hover:bg-portal-mint/90 hover:shadow-[0_0_18px_rgba(112,245,193,0.4)]"
                    >
                      <ShieldCheck className="size-4" />
                      <span>Create Free Account</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

