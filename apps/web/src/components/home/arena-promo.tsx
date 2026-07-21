import Link from "next/link";
import {
  ArrowRight,
  Swords,
  UserRound,
  Zap,
  ShieldCheck,
  Trophy,
  Flame,
} from "lucide-react";

const ARENA_FEATURES = [
  {
    icon: Zap,
    title: "~5s Matchmaking",
    subtitle: "Instant Queue",
  },
  {
    icon: ShieldCheck,
    title: "Fair Play Sync",
    subtitle: "Identical Board Seeds",
  },
  {
    icon: Trophy,
    title: "Ranked ELO",
    subtitle: "Global Division Points",
  },
];

export function ArenaPromo() {
  return (
    <section className="py-20 sm:py-28" aria-labelledby="arena-title">
      <div className="portal-section">
        <div className="relative isolate grid min-h-[24rem] overflow-hidden rounded-[1.75rem] border border-[#72458d]/60 bg-[radial-gradient(circle_at_78%_45%,rgb(128_65_151_/_0.75),transparent_35%),linear-gradient(120deg,#251536,#111529)] p-6 shadow-[0_30px_80px_rgb(0_0_0_/_0.25)] sm:p-10 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:p-14">
          <div className="portal-dot-grid absolute inset-0 -z-10 opacity-35 [mask-image:linear-gradient(90deg,black,transparent_78%)]" />

          {/* Left Content Column */}
          <div className="max-w-xl">
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.2em] text-portal-yellow">
              When solo is not enough
            </p>
            <h2
              id="arena-title"
              className="font-display text-4xl font-bold uppercase leading-[0.92] tracking-[-0.05em] sm:text-6xl"
            >
              Take it to
              <span className="block text-white/48">the Arena.</span>
            </h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-[#c4b8ce] sm:text-base sm:leading-7">
              Face another player live. Same challenge, identical board seeds, one winner. Earn ELO rating points and climb the global division ladder.
            </p>

            {/* Feature Pills */}
            <div className="mt-6 flex flex-wrap gap-2.5">
              {ARENA_FEATURES.map((feat) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={feat.title}
                    className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-black/25 px-3 py-1.5 backdrop-blur-sm"
                  >
                    <div className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-portal-yellow/15 text-portal-yellow">
                      <Icon className="size-3.5" />
                    </div>
                    <div className="text-left">
                      <span className="block text-[0.7rem] font-bold text-white leading-tight">
                        {feat.title}
                      </span>
                      <span className="block text-[0.6rem] font-medium text-white/50 leading-tight">
                        {feat.subtitle}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Button & Live Status */}
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <Link
                href="/arena"
                className="group inline-flex min-h-12 items-center gap-2 rounded-full bg-portal-yellow px-6 text-sm font-extrabold text-[#191307] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_25px_rgba(255,213,74,0.4)]"
              >
                <span>Explore Arena Modes</span>
                <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
              <div className="flex items-center gap-2 text-xs font-semibold text-portal-yellow/90">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
                </span>
                <span>Live Multiplayer Queue Active</span>
              </div>
            </div>
          </div>

          {/* Right Visual Graphic Column: Enhanced Player Clash */}
          <div
            aria-hidden="true"
            className="mt-12 flex flex-col items-center justify-center lg:mt-0 lg:items-end"
          >
            {/* Live Match Badge */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-portal-yellow/30 bg-black/40 px-3.5 py-1 text-[0.68rem] font-black uppercase tracking-widest text-portal-yellow shadow-lg backdrop-blur-md">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
              </span>
              <span>LIVE MATCH · ROUND 4 / 5</span>
            </div>

            <div className="flex items-center justify-center">
              {/* Player 1 Card */}
              <div className="-rotate-6 rounded-[2rem] border border-[#9d8eff]/75 bg-[linear-gradient(155deg,#725aff,#29204f)] p-4 shadow-[0_26px_55px_rgb(0_0_0_/_0.5)] sm:p-5 transition-transform duration-300 hover:rotate-0">
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-[0.6rem] font-bold uppercase tracking-wider text-[#d3cbff]">
                    GOLD II
                  </span>
                  <span className="text-[0.65rem] font-black text-portal-mint">
                    1,480 ELO
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center rounded-[1.4rem] bg-black/20 p-4 sm:h-36 sm:w-32">
                  <UserRound className="size-10 text-white/90 sm:size-12" />
                  <span className="mt-2 text-[0.7rem] font-bold text-white">
                    Alex_99
                  </span>
                </div>
                <div className="mt-3 text-center">
                  <span className="block text-[0.6rem] font-bold uppercase tracking-wider text-white/50">
                    CURRENT SCORE
                  </span>
                  <p className="score-figures text-sm font-black text-white sm:text-base">
                    1,840 PTS
                  </p>
                  <div className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-emerald-500/20 px-2 py-0.5 text-[0.6rem] font-extrabold text-emerald-300">
                    <Flame className="size-3" />
                    <span>🔥 4 Streak</span>
                  </div>
                </div>
              </div>

              {/* Center VS Swords Badge */}
              <div className="z-10 -mx-4 grid size-16 place-items-center rounded-full border-[6px] border-[#281a35] bg-portal-yellow text-[#211706] shadow-[0_0_30px_rgba(255,213,74,0.4)] sm:-mx-5 sm:size-20">
                <Swords className="size-6 sm:size-8" />
              </div>

              {/* Player 2 Card */}
              <div className="rotate-6 rounded-[2rem] border border-[#ff91b7]/75 bg-[linear-gradient(155deg,#ff6096,#54213b)] p-4 shadow-[0_26px_55px_rgb(0_0_0_/_0.5)] sm:p-5 transition-transform duration-300 hover:rotate-0">
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-[0.6rem] font-bold uppercase tracking-wider text-[#ffd3e2]">
                    GOLD I
                  </span>
                  <span className="text-[0.65rem] font-black text-portal-yellow">
                    1,520 ELO
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center rounded-[1.4rem] bg-black/20 p-4 sm:h-36 sm:w-32">
                  <UserRound className="size-10 text-white/90 sm:size-12" />
                  <span className="mt-2 text-[0.7rem] font-bold text-white">
                    CyberMind
                  </span>
                </div>
                <div className="mt-3 text-center">
                  <span className="block text-[0.6rem] font-bold uppercase tracking-wider text-white/50">
                    CURRENT SCORE
                  </span>
                  <p className="score-figures text-sm font-black text-white sm:text-base">
                    1,910 PTS
                  </p>
                  <div className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-amber-500/20 px-2 py-0.5 text-[0.6rem] font-extrabold text-amber-300">
                    <Trophy className="size-3" />
                    <span>⚡ 98.2% Acc</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

