"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  COGNITIVE_DOMAINS,
  DIFFICULTY_STYLES,
} from "./cognitive-domains-data";

export function CognitiveDomainsSpotlight() {
  const [activeId, setActiveId] = useState(COGNITIVE_DOMAINS[0].id);
  const reduceMotion = Boolean(useReducedMotion());
  const domain =
    COGNITIVE_DOMAINS.find((item) => item.id === activeId) ??
    COGNITIVE_DOMAINS[0];
  const Icon = domain.icon;

  return (
    <section
      aria-labelledby="domains-spotlight-title"
      className="scroll-mt-20 bg-portal-surface py-20 sm:py-28 border-t border-white/5"
    >
      <div className="portal-section">
        <div className="mb-9 max-w-2xl">
          <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.2em] text-portal-mint">
            Choose a skill
          </p>
          <h2
            id="domains-spotlight-title"
            className="font-display max-w-2xl text-4xl font-bold uppercase leading-[0.94] tracking-[-0.055em] sm:text-6xl"
          >
            Train 4 Core
            <span className="block text-white/45">Cognitive Domains.</span>
          </h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-12 lg:gap-6">
          <div
            className="flex gap-2 overflow-x-auto pb-1 lg:col-span-4 lg:flex-col lg:overflow-visible lg:pb-0"
            role="tablist"
            aria-label="Cognitive domains"
          >
            {COGNITIVE_DOMAINS.map((item) => {
              const isActive = item.id === activeId;
              const TabIcon = item.icon;

              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  tabIndex={0}
                  onClick={() => setActiveId(item.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setActiveId(item.id);
                    }
                  }}
                  className={cn(
                    "relative flex min-w-[9.5rem] flex-1 items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition-all lg:min-w-0",
                    isActive
                      ? `${item.activeBorder} bg-white/[0.05]`
                      : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]",
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId={
                        reduceMotion ? undefined : "domains-spotlight-rail"
                      }
                      className={cn(
                        "absolute left-0 top-2 bottom-2 hidden w-1 rounded-full lg:block",
                        item.accentDot,
                      )}
                      transition={
                        reduceMotion
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 380, damping: 32 }
                      }
                    />
                  )}
                  <div
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-xl border",
                      item.badgeBorder,
                      item.badgeBg,
                      item.badgeText,
                    )}
                  >
                    <TabIcon className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-foreground">
                      {item.shortTitle}
                    </p>
                    <p className="hidden truncate text-[0.7rem] text-muted-foreground sm:block">
                      {item.title}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={domain.id}
              initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={
                reduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.98 }
              }
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { duration: 0.2, ease: "easeOut" }
              }
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-5 sm:p-7 lg:col-span-8"
            >
              <div
                aria-hidden
                className={cn(
                  "pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-gradient-to-br blur-3xl opacity-50",
                  domain.gradientGlow,
                )}
              />

              <div className="relative z-10 mb-6 flex items-center gap-3">
                <div
                  className={cn(
                    "flex size-12 items-center justify-center rounded-2xl border",
                    domain.badgeBorder,
                    domain.badgeBg,
                    domain.badgeText,
                  )}
                >
                  <Icon className="size-6" />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
                    {domain.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {domain.tagline}
                  </p>
                </div>
              </div>

              <div className="relative z-10 space-y-3">
                {domain.games.map((game) => (
                  <div
                    key={`${domain.id}-${game.id}-${game.type}`}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-white/20"
                  >
                    <div className="min-w-0">
                      <p className="font-display text-base font-bold text-foreground">
                        {game.title}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                          {game.type}
                        </span>
                        <span className="text-[0.65rem] text-muted-foreground">
                          · {game.timeEstimate}
                        </span>
                        <span
                          className={cn(
                            "rounded-full border px-2 py-0.5 text-[0.65rem] font-bold",
                            DIFFICULTY_STYLES[game.difficulty],
                          )}
                        >
                          {game.difficulty}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={game.href}
                      aria-label={`Play ${game.title}`}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-bold text-foreground transition-all hover:border-portal-mint hover:bg-portal-mint hover:text-[#07150f]"
                    >
                      Play
                      <PlayCircle className="size-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
