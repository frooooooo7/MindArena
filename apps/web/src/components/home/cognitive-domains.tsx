"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Zap,
  Target,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Activity,
  PlayCircle,
  BarChart2,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface GameReference {
  id: string;
  title: string;
  href: string;
  type: string;
  timeEstimate: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
}

interface CognitiveDomain {
  id: string;
  title: string;
  subtitle: string;
  icon: typeof Brain;
  badgeBorder: string;
  badgeBg: string;
  badgeText: string;
  gradientGlow: string;
  activeBorder: string;
  metric: string;
  metricLabel: string;
  description: string;
  benefits: string[];
  games: GameReference[];
}

const DOMAINS: CognitiveDomain[] = [
  {
    id: "memory",
    title: "Memory & Recall",
    subtitle: "Working Memory Capacity",
    icon: Brain,
    badgeBorder: "border-[#755cff]/40",
    badgeBg: "bg-[#755cff]/10",
    badgeText: "text-[#aa9cff]",
    gradientGlow: "from-[#755cff]/20 via-[#755cff]/5 to-transparent",
    activeBorder: "border-[#755cff]",
    metric: "+42%",
    metricLabel: "Average Recall Index",
    description:
      "Strengthen short-term retention and spatial indexing. Train your brain to store and retrieve complex patterns under increasing mental load.",
    benefits: [
      "Expands working memory capacity",
      "Accelerates visual-spatial indexing",
      "Reduces memory decay under distraction",
    ],
    games: [
      {
        id: "sequence-memory",
        title: "Sequence Memory",
        href: "/games/sequence-memory",
        type: "Pattern Recall",
        timeEstimate: "2 mins",
        difficulty: "Beginner",
      },
      {
        id: "code-memory",
        title: "Code Memory",
        href: "/games/code-memory",
        type: "Binary Recall",
        timeEstimate: "3 mins",
        difficulty: "Intermediate",
      },
    ],
  },
  {
    id: "speed",
    title: "Speed & Reaction",
    subtitle: "Processing Velocity",
    icon: Zap,
    badgeBorder: "border-portal-mint/40",
    badgeBg: "bg-portal-mint/10",
    badgeText: "text-portal-mint",
    gradientGlow: "from-portal-mint/20 via-portal-mint/5 to-transparent",
    activeBorder: "border-portal-mint",
    metric: "< 310ms",
    metricLabel: "Target Response Time",
    description:
      "Sharpen your mental reaction speed and decision throughput. Minimize response latency when processing rapid visual stimuli.",
    benefits: [
      "Shortens neural response latency",
      "Enhances rapid visual ingestion",
      "Boosts decision velocity under pressure",
    ],
    games: [
      {
        id: "chimp-memory",
        title: "Chimp Memory",
        href: "/games/chimp-memory",
        type: "Flash Recall",
        timeEstimate: "1 min",
        difficulty: "Advanced",
      },
      {
        id: "color-word",
        title: "Color Word",
        href: "/games/color-word",
        type: "Stroop Test",
        timeEstimate: "90 secs",
        difficulty: "Intermediate",
      },
    ],
  },
  {
    id: "focus",
    title: "Focus & Attention",
    subtitle: "Cognitive Filtering",
    icon: Target,
    badgeBorder: "border-portal-blue/40",
    badgeBg: "bg-portal-blue/10",
    badgeText: "text-portal-blue",
    gradientGlow: "from-portal-blue/20 via-portal-blue/5 to-transparent",
    activeBorder: "border-portal-blue",
    metric: "98.8%",
    metricLabel: "Focus Accuracy Goal",
    description:
      "Train selective attention and suppress mental interference. Practice maintaining razor-sharp focus amidst distracting visual noise.",
    benefits: [
      "Improves peripheral vision scanning",
      "Filters out cognitive distractions",
      "Sustains prolonged deep focus",
    ],
    games: [
      {
        id: "schulte-table",
        title: "Schulte Table",
        href: "/games/schulte-table",
        type: "Peripheral Scan",
        timeEstimate: "2 mins",
        difficulty: "Beginner",
      },
      {
        id: "color-word",
        title: "Color Word",
        href: "/games/color-word",
        type: "Interference Filter",
        timeEstimate: "90 secs",
        difficulty: "Intermediate",
      },
    ],
  },
  {
    id: "agility",
    title: "Pattern & Agility",
    subtitle: "Mental Flexibility",
    icon: Sparkles,
    badgeBorder: "border-portal-yellow/40",
    badgeBg: "bg-portal-yellow/10",
    badgeText: "text-portal-yellow",
    gradientGlow: "from-portal-yellow/20 via-portal-yellow/5 to-transparent",
    activeBorder: "border-portal-yellow",
    metric: "Level 20+",
    metricLabel: "Max Complexity Tier",
    description:
      "Adapt rapidly to changing rules and complex grid structures. Elevate spatial mapping and cognitive flexibility across shifting patterns.",
    benefits: [
      "Accelerates pattern recognition",
      "Enhances mental task switching",
      "Builds resilience against complex puzzles",
    ],
    games: [
      {
        id: "sequence-memory",
        title: "Sequence Memory",
        href: "/games/sequence-memory",
        type: "Spatial Grid",
        timeEstimate: "2 mins",
        difficulty: "Beginner",
      },
      {
        id: "code-memory",
        title: "Code Memory",
        href: "/games/code-memory",
        type: "Rule Decoding",
        timeEstimate: "3 mins",
        difficulty: "Advanced",
      },
    ],
  },
];

const DIFFICULTY_STYLES = {
  Beginner: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  Intermediate: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  Advanced: "border-rose-500/30 bg-rose-500/10 text-rose-400",
};

export function CognitiveDomains() {
  const [activeTab, setActiveTab] = useState<string>("memory");

  const currentDomain =
    DOMAINS.find((domain) => domain.id === activeTab) ?? DOMAINS[0];

  const Icon = currentDomain.icon;

  return (
    <section
      aria-labelledby="domains-title"
      className="scroll-mt-20 bg-portal-surface py-20 sm:py-28 border-t border-white/5"
    >
      <div className="portal-section">
        {/* Section Header */}
        <div className="mb-10 text-center sm:text-left">
          <h2
            id="domains-title"
            className="font-display text-3xl font-bold uppercase tracking-tight text-foreground sm:text-5xl"
          >
            Train 4 Core <span className="text-portal-mint">Cognitive Domains</span>
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Target specific brain functions with scientifically structured micro-challenges. Choose a discipline below to explore tailored training games.
          </p>
        </div>

        {/* Tab Navigation Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-8">
          {DOMAINS.map((domain) => {
            const DomainIcon = domain.icon;
            const isActive = domain.id === activeTab;

            return (
              <button
                key={domain.id}
                type="button"
                onClick={() => setActiveTab(domain.id)}
                className={cn(
                  "group relative flex flex-col items-center justify-between rounded-2xl border p-4 text-center transition-all duration-300 sm:items-start sm:text-left",
                  isActive
                    ? `${domain.activeBorder} bg-white/[0.05] shadow-[0_0_25px_rgba(255,255,255,0.05)]`
                    : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]",
                )}
              >
                <div
                  className={cn(
                    "flex size-10 items-center justify-center rounded-xl border transition-transform duration-300 group-hover:scale-105",
                    domain.badgeBorder,
                    domain.badgeBg,
                    domain.badgeText,
                  )}
                >
                  <DomainIcon className="size-5" />
                </div>
                <div className="mt-3">
                  <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                    {domain.subtitle}
                  </span>
                  <h3 className="font-display mt-0.5 text-sm font-bold text-foreground sm:text-base">
                    {domain.title}
                  </h3>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Domain Panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentDomain.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={cn(
              "relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8",
            )}
          >
            {/* Background Radial Glow */}
            <div
              className={cn(
                "pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-gradient-to-br blur-3xl opacity-50",
                currentDomain.gradientGlow,
              )}
            />

            <div className="relative z-10 grid gap-8 lg:grid-cols-12 lg:items-center">
              {/* Left Column: Domain Info & Metrics */}
              <div className="space-y-6 lg:col-span-7">
                <div className="flex flex-wrap items-center gap-3">
                  <div
                    className={cn(
                      "flex size-12 items-center justify-center rounded-2xl border",
                      currentDomain.badgeBorder,
                      currentDomain.badgeBg,
                      currentDomain.badgeText,
                    )}
                  >
                    <Icon className="size-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      {currentDomain.subtitle}
                    </span>
                    <h3 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
                      {currentDomain.title}
                    </h3>
                  </div>
                </div>

                <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {currentDomain.description}
                </p>

                {/* Key Benefits Checklist */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground/90">
                    Targeted Cognitive Benefits:
                  </h4>
                  <ul className="grid gap-2 sm:grid-cols-1">
                    {currentDomain.benefits.map((benefit) => (
                      <li
                        key={benefit}
                        className="flex items-center gap-2.5 text-xs text-foreground/80 sm:text-sm"
                      >
                        <CheckCircle2 className={cn("size-4 shrink-0", currentDomain.badgeText)} />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Metric Badge */}
                <div className="inline-flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div>
                    <span className="font-display text-2xl font-black text-foreground sm:text-3xl">
                      {currentDomain.metric}
                    </span>
                    <span className="ml-2.5 text-xs font-semibold text-muted-foreground">
                      {currentDomain.metricLabel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Tailored Games Showcase */}
              <div className="space-y-4 lg:col-span-5">
                <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground/90">
                  <BarChart2 className="size-4 text-portal-mint" />
                  <span>Recommended Challenges:</span>
                </h4>

                <div className="space-y-3">
                  {currentDomain.games.map((game) => (
                    <div
                      key={game.id}
                      className="group relative flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.06]"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[0.65rem] font-extrabold uppercase tracking-wider text-muted-foreground">
                            {game.type}
                          </span>
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full border px-2 py-0.5 text-[0.65rem] font-bold",
                              DIFFICULTY_STYLES[game.difficulty],
                            )}
                          >
                            {game.difficulty}
                          </span>
                        </div>
                        <h5 className="font-display text-base font-bold text-foreground">
                          {game.title}
                        </h5>
                        <p className="text-xs text-muted-foreground">
                          Est. Duration: {game.timeEstimate}
                        </p>
                      </div>

                      <Link
                        href={game.href}
                        className="group/btn inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-bold text-foreground transition-all hover:bg-portal-mint hover:text-[#07150f] hover:border-portal-mint hover:shadow-[0_0_15px_rgba(112,245,193,0.3)]"
                      >
                        <span>Play</span>
                        <PlayCircle className="size-3.5 transition-transform group-hover/btn:scale-110" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
