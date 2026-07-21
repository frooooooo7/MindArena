"use client";

import Link from "next/link";
import { ArrowRight, RotateCcw } from "lucide-react";
import { useAuthenticatedQuery } from "@/hooks/use-authenticated-query";
import { gameResultApi } from "@/lib/game-result-api";
import { useAuthStore } from "@/store/auth.store";

const GUEST_BENEFITS = [
  { label: "Built for", value: "Quick rounds" },
  { label: "Track", value: "Personal bests" },
  { label: "Climb", value: "MindRank" },
];

function ProgressSkeleton() {
  return (
    <div className="grid gap-3 md:grid-cols-3" aria-label="Loading player progress">
      {Array.from({ length: 3 }, (_, index) => (
        <div
          key={index}
          className="h-28 animate-pulse rounded-2xl border border-white/8 bg-white/5"
        />
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

  return (
    <section
      aria-labelledby="progress-title"
      className="bg-portal-surface pb-20 sm:pb-28"
    >
      <div className="portal-section">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[0.65rem] font-black uppercase tracking-[0.19em] text-portal-mint">
              Keep the momentum
            </p>
            <h2 id="progress-title" className="font-display mt-1 text-xl font-bold">
              {isAuthenticated ? "Your current form" : "Every run counts"}
            </h2>
          </div>
          {!isAuthenticated && isHydrated && (
            <Link
              href="/auth"
              className="group inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-bold text-portal-mint"
            >
              Sign in to track progress
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </div>

        {showLoading ? (
          <ProgressSkeleton />
        ) : isAuthenticated && data && !error ? (
          <div className="grid gap-3 md:grid-cols-3">
            {[
              { label: "Total score", value: data.totalScore.toLocaleString() },
              { label: "Games played", value: data.totalGames.toLocaleString() },
              { label: "MindRank", value: user?.rankName ?? "Unranked" },
            ].map((metric, index) => (
              <div
                key={metric.label}
                className={`rounded-2xl border p-5 ${
                  index === 0
                    ? "border-portal-mint bg-portal-mint text-[#07150f]"
                    : "border-white/10 bg-[#131827]"
                }`}
              >
                <span
                  className={`text-[0.65rem] font-black uppercase tracking-[0.16em] ${
                    index === 0 ? "text-[#20513f]" : "text-muted-foreground"
                  }`}
                >
                  {metric.label}
                </span>
                <strong className="score-figures font-display mt-2 block text-2xl font-bold sm:text-3xl">
                  {metric.value}
                </strong>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-3">
            {GUEST_BENEFITS.map((benefit, index) => (
              <div
                key={benefit.label}
                className={`rounded-2xl border p-5 ${
                  index === 0
                    ? "border-portal-mint bg-portal-mint text-[#07150f]"
                    : "border-white/10 bg-[#131827]"
                }`}
              >
                <span
                  className={`text-[0.65rem] font-black uppercase tracking-[0.16em] ${
                    index === 0 ? "text-[#20513f]" : "text-muted-foreground"
                  }`}
                >
                  {benefit.label}
                </span>
                <strong className="font-display mt-2 block text-2xl font-bold">
                  {benefit.value}
                </strong>
              </div>
            ))}
            {isAuthenticated && error && (
              <button
                type="button"
                onClick={refetch}
                className="col-span-full inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
              >
                <RotateCcw className="size-4" />
                Retry loading your stats
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
