import { Timer, Zap } from "lucide-react";

const ACTIVE_TILES = new Set([2, 9, 15]);

export function GamePortalPreview() {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto mt-14 h-[20rem] w-full max-w-4xl sm:h-[24rem] lg:mt-16"
    >
      <div className="portal-float absolute left-0 top-16 z-20 hidden -rotate-6 rounded-2xl bg-portal-yellow px-4 py-3 text-left text-[#171306] shadow-[0_18px_40px_rgb(0_0_0_/_0.45)] sm:block [--float-rotate:-6deg]">
        <span className="block text-[0.6rem] font-black uppercase tracking-[0.18em] opacity-60">
          Combo
        </span>
        <strong className="score-figures font-display text-2xl leading-none">
          x8
        </strong>
      </div>

      <div className="portal-float absolute right-1 top-24 z-20 hidden rotate-6 rounded-2xl bg-portal-pink px-4 py-3 text-left text-white shadow-[0_18px_40px_rgb(0_0_0_/_0.45)] sm:block [--float-rotate:6deg]">
        <span className="block text-[0.6rem] font-black uppercase tracking-[0.18em] opacity-70">
          New best
        </span>
        <strong className="score-figures font-display text-2xl leading-none">
          2,480
        </strong>
      </div>

      <div className="absolute inset-x-0 top-0 mx-auto h-[27rem] max-w-[46rem] origin-top rounded-[1.75rem] border border-[#7784b3]/50 bg-[linear-gradient(145deg,#252c4d,#12172c)] p-4 shadow-[0_35px_100px_rgb(0_0_0_/_0.72),inset_0_0_70px_rgb(117_92_255_/_0.1)] [transform:perspective(950px)_rotateX(7deg)] sm:p-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 text-[0.65rem] font-extrabold uppercase tracking-[0.16em] text-[#cbd1e2] sm:text-xs">
          <span className="flex items-center gap-2">
            <Zap className="size-3.5 fill-portal-mint text-portal-mint" />
            Sequence Memory
          </span>
          <span className="score-figures flex items-center gap-2 text-[#9ca7c8]">
            <Timer className="size-3.5" />
            Level 08 · 00:14
          </span>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2.5 sm:mt-6 sm:grid-cols-6 sm:gap-3">
          {Array.from({ length: 24 }, (_, index) => {
            const isActive = ACTIVE_TILES.has(index);

            return (
              <span
                key={index}
                className={
                  isActive
                    ? "portal-tile-pulse aspect-square rounded-xl border border-white/35 bg-[linear-gradient(145deg,var(--portal-mint),#34bdcb)] shadow-[0_0_26px_rgb(112_245_193_/_0.5)]"
                    : "aspect-square rounded-xl border border-[#66719f]/45 bg-[#31395f]/80 shadow-[inset_0_1px_0_rgb(255_255_255_/_0.06)]"
                }
              />
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[#838eae] sm:mt-5 sm:text-[0.7rem]">
          <span>Watch the pattern</span>
          <span className="score-figures text-portal-mint">Run 04 / 10</span>
        </div>
      </div>
    </div>
  );
}
