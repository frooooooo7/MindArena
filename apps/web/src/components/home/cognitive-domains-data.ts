import {
  Brain,
  Zap,
  Target,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export type DomainDifficulty = "Beginner" | "Intermediate" | "Advanced";

export type DomainGame = {
  id: string;
  title: string;
  href: string;
  type: string;
  timeEstimate: string;
  difficulty: DomainDifficulty;
};

export type CognitiveDomain = {
  id: string;
  title: string;
  shortTitle: string;
  tagline: string;
  icon: LucideIcon;
  badgeBorder: string;
  badgeBg: string;
  badgeText: string;
  gradientGlow: string;
  activeBorder: string;
  accentDot: string;
  games: DomainGame[];
};

export const COGNITIVE_DOMAINS: CognitiveDomain[] = [
  {
    id: "memory",
    title: "Memory & Recall",
    shortTitle: "Memory",
    tagline: "Hold and retrieve patterns under load.",
    icon: Brain,
    badgeBorder: "border-[#755cff]/40",
    badgeBg: "bg-[#755cff]/10",
    badgeText: "text-[#aa9cff]",
    gradientGlow: "from-[#755cff]/20 via-[#755cff]/5 to-transparent",
    activeBorder: "border-[#755cff]",
    accentDot: "bg-[#755cff]",
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
    shortTitle: "Speed",
    tagline: "Cut latency. Decide faster under pressure.",
    icon: Zap,
    badgeBorder: "border-portal-mint/40",
    badgeBg: "bg-portal-mint/10",
    badgeText: "text-portal-mint",
    gradientGlow: "from-portal-mint/20 via-portal-mint/5 to-transparent",
    activeBorder: "border-portal-mint",
    accentDot: "bg-portal-mint",
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
    shortTitle: "Focus",
    tagline: "Filter noise. Stay locked on the signal.",
    icon: Target,
    badgeBorder: "border-portal-blue/40",
    badgeBg: "bg-portal-blue/10",
    badgeText: "text-portal-blue",
    gradientGlow: "from-portal-blue/20 via-portal-blue/5 to-transparent",
    activeBorder: "border-portal-blue",
    accentDot: "bg-portal-blue",
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
    shortTitle: "Agility",
    tagline: "Switch rules. Spot structure in chaos.",
    icon: Sparkles,
    badgeBorder: "border-portal-yellow/40",
    badgeBg: "bg-portal-yellow/10",
    badgeText: "text-portal-yellow",
    gradientGlow: "from-portal-yellow/20 via-portal-yellow/5 to-transparent",
    activeBorder: "border-portal-yellow",
    accentDot: "bg-portal-yellow",
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

export const DIFFICULTY_STYLES: Record<DomainDifficulty, string> = {
  Beginner: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  Intermediate: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  Advanced: "border-rose-500/30 bg-rose-500/10 text-rose-400",
};
