import Link from "next/link";
import { ArrowRight, Layers3 } from "lucide-react";
import homeGames from "./home-games.json";

type GameMotif = "sequence" | "numbers" | "code" | "color" | "grid";
type GameTone = "violet" | "mint" | "pink" | "yellow" | "blue";

interface HomeGame {
  id: string;
  title: string;
  description: string;
  category: string;
  href: string;
  motif: GameMotif;
  tone: GameTone;
  featured: boolean;
}

const TONE_STYLES: Record<GameTone, string> = {
  violet:
    "border-[#8171d9]/45 bg-[radial-gradient(circle_at_78%_22%,rgb(117_92_255_/_0.42),transparent_38%),#17152f]",
  mint:
    "border-[#57bfa0]/35 bg-[radial-gradient(circle_at_88%_12%,rgb(112_245_193_/_0.2),transparent_42%),#102427]",
  pink:
    "border-[#bc527b]/35 bg-[radial-gradient(circle_at_88%_12%,rgb(255_94_148_/_0.2),transparent_42%),#291528]",
  yellow:
    "border-[#ae8739]/40 bg-[radial-gradient(circle_at_88%_12%,rgb(255_213_74_/_0.2),transparent_42%),#2a2114]",
  blue:
    "border-[#427fb4]/40 bg-[radial-gradient(circle_at_88%_12%,rgb(75_168_255_/_0.2),transparent_42%),#11243a]",
};

const TONE_ACCENTS: Record<GameTone, string> = {
  violet: "text-[#aa9cff]",
  mint: "text-portal-mint",
  pink: "text-portal-pink",
  yellow: "text-portal-yellow",
  blue: "text-portal-blue",
};

function GameMotif({ motif, featured }: { motif: GameMotif; featured: boolean }) {
  if (motif === "numbers") {
    return (
      <div className="flex gap-2">
        {[4, 1, 3].map((number) => (
          <span
            key={number}
            className="score-figures grid size-10 place-items-center rounded-xl border border-white/15 bg-white/8 font-mono text-sm font-bold"
          >
            {number}
          </span>
        ))}
      </div>
    );
  }

  if (motif === "code") {
    return (
      <div className="space-y-2 font-mono text-xs font-bold tracking-[0.2em] text-portal-pink">
        <div>1010 0110</div>
        <div className="translate-x-4 text-white/45">0101 1101</div>
      </div>
    );
  }

  if (motif === "color") {
    return (
      <div className="font-display flex items-end gap-2 text-2xl font-black uppercase tracking-[-0.08em] sm:text-3xl">
        <span className="text-portal-pink">Blue</span>
        <span className="text-portal-mint">Red</span>
      </div>
    );
  }

  if (motif === "grid") {
    return (
      <div className="grid w-28 grid-cols-4 gap-1.5">
        {[8, 3, 12, 1, 6, 10, 4, 9].map((number) => (
          <span
            key={number}
            className="score-figures grid aspect-square place-items-center rounded-md bg-white/8 font-mono text-[0.6rem] font-bold text-white/70"
          >
            {number}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-3 gap-2 ${featured ? "w-full max-w-xs" : "w-28"}`}
    >
      {Array.from({ length: featured ? 9 : 6 }, (_, index) => (
        <span
          key={index}
          className={`aspect-square rounded-lg border border-white/10 ${
            index === 4
              ? "bg-portal-mint shadow-[0_0_24px_rgb(112_245_193_/_0.48)]"
              : "bg-white/8"
          }`}
        />
      ))}
    </div>
  );
}

export function FeaturesGrid() {
  const games = homeGames as HomeGame[];

  return (
    <section id="games" className="scroll-mt-20 bg-portal-surface py-20 sm:py-28">
      <div className="portal-section">
        <div className="mb-9 grid gap-5 lg:grid-cols-[1fr_0.72fr] lg:items-end">
          <div>
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.2em] text-portal-mint">
              Pick your discipline
            </p>
            <h2 className="font-display max-w-2xl text-4xl font-bold uppercase leading-[0.94] tracking-[-0.055em] sm:text-6xl">
              A new challenge,
              <span className="block text-white/45">every run.</span>
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7 lg:justify-self-end">
            Explore a growing library of memory, focus, and speed games. Each
            challenge starts in one click and leaves room for a better score.
          </p>
        </div>

        <div className="grid auto-rows-[15.5rem] gap-3 md:grid-cols-2 lg:grid-cols-12">
          {games.map((game) => (
            <Link
              key={game.id}
              href={game.href}
              className={`group relative isolate flex overflow-hidden rounded-[1.4rem] border p-5 transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1 hover:border-white/35 hover:shadow-[0_24px_60px_rgb(0_0_0_/_0.28)] focus-visible:z-10 sm:p-6 ${TONE_STYLES[game.tone]} ${
                game.featured
                  ? "row-span-2 md:col-span-2 lg:col-span-6"
                  : "lg:col-span-3"
              }`}
            >
              <article className="flex min-w-0 flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-4">
                  <span
                    className={`text-[0.65rem] font-black uppercase tracking-[0.19em] ${TONE_ACCENTS[game.tone]}`}
                  >
                    {game.category}
                  </span>
                  <ArrowRight className="size-4 text-white/45 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-white" />
                </div>

                <div
                  aria-hidden="true"
                  className={`${game.featured ? "my-8" : "my-5"}`}
                >
                  <GameMotif motif={game.motif} featured={game.featured} />
                </div>

                <div>
                  <h3
                    className={`font-display font-bold tracking-[-0.035em] ${
                      game.featured ? "text-3xl sm:text-4xl" : "text-xl"
                    }`}
                  >
                    {game.title}
                  </h3>
                  <p
                    className={`mt-2 max-w-sm leading-5 text-white/58 ${
                      game.featured ? "text-sm" : "text-xs"
                    }`}
                  >
                    {game.description}
                  </p>
                  <span className="mt-4 inline-flex min-h-11 items-center text-xs font-extrabold uppercase tracking-[0.12em] text-white">
                    Play now
                  </span>
                </div>
              </article>
            </Link>
          ))}
        </div>

        <div className="mt-5 flex justify-center sm:justify-end">
          <Link
            href="/games"
            className="group inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
          >
            <Layers3 className="size-4 text-portal-mint" />
            Explore all games
            <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
