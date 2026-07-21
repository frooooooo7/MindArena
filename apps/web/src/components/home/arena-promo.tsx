import Link from "next/link";
import { ArrowRight, Swords, UserRound } from "lucide-react";

export function ArenaPromo() {
  return (
    <section className="py-20 sm:py-28" aria-labelledby="arena-title">
      <div className="portal-section">
        <div className="relative isolate grid min-h-[22rem] overflow-hidden rounded-[1.75rem] border border-[#72458d]/60 bg-[radial-gradient(circle_at_78%_45%,rgb(128_65_151_/_0.75),transparent_35%),linear-gradient(120deg,#251536,#111529)] p-6 shadow-[0_30px_80px_rgb(0_0_0_/_0.25)] sm:p-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:p-14">
          <div className="portal-dot-grid absolute inset-0 -z-10 opacity-35 [mask-image:linear-gradient(90deg,black,transparent_78%)]" />

          <div className="max-w-xl">
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.2em] text-portal-yellow">
              When solo is not enough
            </p>
            <h2
              id="arena-title"
              className="font-display text-5xl font-bold uppercase leading-[0.88] tracking-[-0.06em] sm:text-6xl"
            >
              Take it to
              <span className="block text-white/48">the Arena.</span>
            </h2>
            <p className="mt-5 max-w-md text-sm leading-6 text-[#c4b8ce] sm:text-base sm:leading-7">
              Face another player live. Same challenge, same board, one better
              result.
            </p>
            <Link
              href="/arena"
              className="group mt-7 inline-flex min-h-12 items-center gap-2 rounded-full bg-portal-yellow px-5 text-sm font-extrabold text-[#191307] transition-transform duration-200 hover:-translate-y-0.5"
            >
              Explore Arena modes
              <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>

          <div
            aria-hidden="true"
            className="mt-12 flex items-center justify-center lg:mt-0 lg:justify-end"
          >
            <div className="-rotate-6 rounded-[2rem] border border-[#9d8eff]/75 bg-[linear-gradient(155deg,#725aff,#29204f)] p-4 shadow-[0_26px_55px_rgb(0_0_0_/_0.5)] sm:p-5">
              <div className="grid h-36 w-24 place-items-center rounded-[1.4rem] bg-black/15 sm:h-44 sm:w-32">
                <UserRound className="size-12 text-white/85 sm:size-16" />
              </div>
              <p className="score-figures mt-3 text-center text-xs font-black uppercase tracking-[0.14em]">
                Player 01
              </p>
            </div>

            <div className="z-10 -mx-3 grid size-16 place-items-center rounded-full border-[6px] border-[#281a35] bg-portal-yellow text-[#211706] shadow-xl sm:-mx-4 sm:size-20">
              <Swords className="size-6 sm:size-8" />
            </div>

            <div className="rotate-6 rounded-[2rem] border border-[#ff91b7]/75 bg-[linear-gradient(155deg,#ff6096,#54213b)] p-4 shadow-[0_26px_55px_rgb(0_0_0_/_0.5)] sm:p-5">
              <div className="grid h-36 w-24 place-items-center rounded-[1.4rem] bg-black/15 sm:h-44 sm:w-32">
                <UserRound className="size-12 text-white/85 sm:size-16" />
              </div>
              <p className="score-figures mt-3 text-center text-xs font-black uppercase tracking-[0.14em]">
                Player 02
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
