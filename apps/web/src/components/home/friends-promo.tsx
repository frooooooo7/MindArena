import Link from "next/link";
import {
  ArrowRight,
  Swords,
  UserRound,
  Users,
  ShieldCheck,
  Trophy,
  Flame,
  Sparkles,
  Gamepad2,
} from "lucide-react";

const FRIENDS_DUEL_FEATURES = [
  {
    icon: Users,
    title: "1-Click Challenges",
    subtitle: "Instant Duel Invites",
  },
  {
    icon: ShieldCheck,
    title: "Fair Play Seeds",
    subtitle: "Identical Memory Boards",
  },
  {
    icon: Trophy,
    title: "Head-to-Head Stats",
    subtitle: "Track Win/Loss Records",
  },
];

export function FriendsDuelPromo() {
  return (
    <section className="py-20 sm:py-28" aria-labelledby="friends-promo-title">
      <div className="portal-section">
        <div className="relative isolate grid min-h-[24rem] overflow-hidden rounded-[1.75rem] border border-cyan-500/40 bg-[radial-gradient(circle_at_78%_45%,rgb(14_116_144_/_0.5),transparent_35%),linear-gradient(120deg,#0a192f,#0d1117)] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.5)] sm:p-10 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:p-14">
          <div className="portal-dot-grid absolute inset-0 -z-10 opacity-35 [mask-image:linear-gradient(90deg,black,transparent_78%)]" />

          {/* Left Content Column */}
          <div className="max-w-xl">
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.2em] text-cyan-400">
              Social Multiplayer 1v1
            </p>
            <h2
              id="friends-promo-title"
              className="font-display text-4xl font-bold uppercase leading-[0.92] tracking-[-0.05em] sm:text-6xl text-white"
            >
              Play with <span className="text-cyan-400">Friends</span>
            </h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-slate-300 sm:text-base sm:leading-7">
              Challenge your friends to real-time cognitive duels. Choose your game mode, compare head-to-head records, and test your memory against people you know.
            </p>

            {/* Feature Pills */}
            <div className="mt-6 flex flex-wrap gap-2.5">
              {FRIENDS_DUEL_FEATURES.map((feat) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={feat.title}
                    className="flex items-center gap-2.5 rounded-xl border border-cyan-500/20 bg-black/40 px-3 py-1.5 backdrop-blur-sm"
                  >
                    <div className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-300">
                      <Icon className="size-3.5" />
                    </div>
                    <div className="text-left">
                      <span className="block text-[0.7rem] font-bold text-white leading-tight">
                        {feat.title}
                      </span>
                      <span className="block text-[0.6rem] font-medium text-slate-400 leading-tight">
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
                href="/play-with-friends"
                className="group inline-flex min-h-12 items-center gap-2 rounded-full bg-linear-to-r from-cyan-400 to-blue-500 px-6 text-sm font-extrabold text-slate-950 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_25px_rgba(34,211,238,0.5)]"
              >
                <span>Challenge a Friend</span>
                <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
              <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
                </span>
                <span>Online Friends Lobby Ready</span>
              </div>
            </div>
          </div>

          {/* Right Visual Graphic Column */}
          <div
            aria-hidden="true"
            className="mt-12 flex flex-col items-center justify-center lg:mt-0 lg:items-end"
          >
            <div className="flex items-center justify-center">
              {/* Player 1 Card */}
              <div className="-rotate-6 rounded-[2rem] border border-cyan-400/60 bg-[linear-gradient(155deg,#0e7490,#0f172a)] p-4 shadow-[0_26px_55px_rgba(0,0,0,0.5)] sm:p-5 transition-transform duration-300 hover:rotate-0">
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-[0.6rem] font-bold uppercase tracking-wider text-cyan-200">
                    FRIEND
                  </span>
                  <span className="text-[0.65rem] font-black text-emerald-400">
                    ● Online
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center rounded-[1.4rem] bg-black/30 p-4 sm:h-36 sm:w-32">
                  <UserRound className="size-10 text-white/90 sm:size-12" />
                  <span className="mt-2 text-[0.7rem] font-bold text-white">
                    Alex_99
                  </span>
                </div>
                <div className="mt-3 text-center">
                  <span className="block text-[0.6rem] font-bold uppercase tracking-wider text-white/50">
                    RECORD VS YOU
                  </span>
                  <p className="score-figures text-sm font-black text-white sm:text-base">
                    5 W - 3 L
                  </p>
                  <div className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-emerald-500/20 px-2 py-0.5 text-[0.6rem] font-extrabold text-emerald-300">
                    <Flame className="size-3" />
                    <span>🔥 3 Win Streak</span>
                  </div>
                </div>
              </div>

              {/* Center VS Badge */}
              <div className="z-10 -mx-4 grid size-16 place-items-center rounded-full border-[6px] border-[#0f172a] bg-cyan-400 text-slate-950 shadow-[0_0_30px_rgba(34,211,238,0.5)] sm:-mx-5 sm:size-20">
                <Swords className="size-6 sm:size-8" />
              </div>

              {/* Player 2 Card */}
              <div className="rotate-6 rounded-[2rem] border border-blue-400/60 bg-[linear-gradient(155deg,#2563eb,#0f172a)] p-4 shadow-[0_26px_55px_rgba(0,0,0,0.5)] sm:p-5 transition-transform duration-300 hover:rotate-0">
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-[0.6rem] font-bold uppercase tracking-wider text-blue-200">
                    YOU
                  </span>
                  <span className="text-[0.65rem] font-black text-cyan-300">
                    Challenger
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center rounded-[1.4rem] bg-black/30 p-4 sm:h-36 sm:w-32">
                  <UserRound className="size-10 text-white/90 sm:size-12" />
                  <span className="mt-2 text-[0.7rem] font-bold text-white">
                    You
                  </span>
                </div>
                <div className="mt-3 text-center">
                  <span className="block text-[0.6rem] font-bold uppercase tracking-wider text-white/50">
                    BEST LEVEL
                  </span>
                  <p className="score-figures text-sm font-black text-white sm:text-base">
                    Level 14
                  </p>
                  <div className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-cyan-500/20 px-2 py-0.5 text-[0.6rem] font-extrabold text-cyan-300">
                    <Gamepad2 className="size-3" />
                    <span>⚡ Ready</span>
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
