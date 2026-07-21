import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { GamePortalPreview } from "./game-portal-preview";

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden border-b border-white/8 pt-20 sm:pt-24 lg:pt-28">
      <div className="portal-dot-grid absolute inset-0 -z-20 opacity-70 [mask-image:linear-gradient(to_bottom,transparent_0%,black_24%,black_78%,transparent_100%)]" />
      <div className="absolute left-1/2 top-52 -z-10 h-[32rem] w-[48rem] -translate-x-1/2 rounded-full bg-portal-violet/20 blur-[120px]" />

      <div className="portal-section text-center">
        <div className="mb-5 inline-flex items-center gap-2 text-[0.68rem] font-extrabold uppercase tracking-[0.22em] text-portal-mint sm:text-xs">
          <span className="size-1.5 rounded-full bg-portal-mint shadow-[0_0_14px_var(--portal-mint)]" />
          Growing game library · instant score
        </div>

        <h1 className="font-display mx-auto max-w-5xl text-balance text-[clamp(3.25rem,10vw,7.5rem)] font-bold uppercase leading-[0.84] tracking-[-0.075em]">
          Enter. Play.
          <span className="mt-2 block text-portal-mint">Beat your score.</span>
        </h1>

        <p className="mx-auto mt-7 max-w-xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
          Fast memory and focus games built for one more run. Pick a
          challenge, learn the pattern, and chase a better result.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/games"
            className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-portal-violet px-6 text-sm font-extrabold text-white shadow-[0_14px_40px_rgb(117_92_255_/_0.38)] transition-[transform,box-shadow,background-color] duration-200 hover:-translate-y-0.5 hover:bg-[#836dff] hover:shadow-[0_18px_48px_rgb(117_92_255_/_0.48)]"
          >
            Choose your first game
            <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
          <Link
            href="#games"
            className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
          >
            Explore challenges
            <ArrowDown className="size-4 transition-transform duration-200 group-hover:translate-y-1" />
          </Link>
        </div>

        <GamePortalPreview />
      </div>
    </section>
  );
}
