"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, type Variants, useReducedMotion } from "framer-motion";
import { ArrowRight, Layers3 } from "lucide-react";

import { cn } from "@/lib/utils";
import { SectionAtmosphere } from "./section-atmosphere";
import homeGames from "./home-games.json";
import { SequenceGameDemo } from "./sequence-game-demo";

type GameMotif = "sequence" | "numbers" | "code" | "color" | "grid";
type GameTone = "violet" | "mint" | "pink" | "yellow" | "blue";
type GameImageFit = "cover" | "contain";

interface HomeGame {
  id: string;
  title: string;
  description: string;
  category: string;
  href: string;
  motif: GameMotif;
  tone: GameTone;
  featured: boolean;
  image?: string;
  imageFit?: GameImageFit;
  imagePosition?: string;
}

const TONE_STYLES: Record<GameTone, string> = {
  violet:
    "border-[#8171d9]/45 bg-[radial-gradient(circle_at_78%_22%,rgb(117_92_255_/_0.42),transparent_38%),#17152f]",
  mint: "border-[#57bfa0]/35 bg-[radial-gradient(circle_at_88%_12%,rgb(112_245_193_/_0.2),transparent_42%),#102427]",
  pink: "border-[#bc527b]/35 bg-[radial-gradient(circle_at_88%_12%,rgb(255_94_148_/_0.2),transparent_42%),#291528]",
  yellow:
    "border-[#ae8739]/40 bg-[radial-gradient(circle_at_88%_12%,rgb(255_213_74_/_0.2),transparent_42%),#2a2114]",
  blue: "border-[#427fb4]/40 bg-[radial-gradient(circle_at_88%_12%,rgb(75_168_255_/_0.2),transparent_42%),#11243a]",
};

const CATEGORY_BADGE_STYLES: Record<GameTone, string> = {
  violet: "border-[#aa9cff]/55 bg-[rgb(18_15_41_/_0.9)] text-[#e2ddff]",
  mint: "border-portal-mint/50 bg-[rgb(8_29_26_/_0.9)] text-[#c9ffec]",
  pink: "border-portal-pink/50 bg-[rgb(38_16_27_/_0.9)] text-[#ffc8da]",
  yellow: "border-portal-yellow/50 bg-[rgb(38_31_12_/_0.9)] text-[#ffeda8]",
  blue: "border-portal-blue/50 bg-[rgb(11_29_49_/_0.9)] text-[#c9e8ff]",
};

const CATEGORY_BADGE_BASE =
  "inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-[0.7rem] font-black uppercase tracking-[0.14em] shadow-[0_6px_18px_rgb(0_0_0_/_0.24)] backdrop-blur-sm";

const CARD_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 0.04,
      duration: 0.32,
      ease: "easeOut",
    },
  }),
  hover: {
    opacity: 1,
    y: -4,
    transition: { duration: 0.2, ease: "easeOut" },
  },
};

const SCREENSHOT_VARIANTS: Variants = {
  hidden: { scale: 1 },
  visible: { scale: 1 },
  hover: {
    scale: 1.03,
    transition: { duration: 0.28, ease: "easeOut" },
  },
};

function GameMotif({ motif }: { motif: GameMotif }) {
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
    <div className="grid w-28 grid-cols-3 gap-2">
      {Array.from({ length: 6 }, (_, index) => (
        <span
          key={index}
          className={cn(
            "aspect-square rounded-lg border border-white/10 bg-white/8",
            index === 4 &&
              "bg-portal-mint shadow-[0_0_24px_rgb(112_245_193_/_0.48)]",
          )}
        />
      ))}
    </div>
  );
}

function SequenceGameCard({
  game,
  index,
  reduceMotion,
}: {
  game: HomeGame;
  index: number;
  reduceMotion: boolean;
}) {
  return (
    <motion.article
      aria-labelledby={`${game.id}-title`}
      custom={index}
      initial={reduceMotion ? false : "hidden"}
      whileInView={reduceMotion ? undefined : "visible"}
      viewport={{ once: true, amount: 0.16 }}
      variants={CARD_VARIANTS}
      className={cn(
        "relative isolate row-span-2 flex min-w-0 flex-col overflow-hidden rounded-[1.4rem] border p-5 sm:p-6 md:col-span-2 lg:col-span-6",
        TONE_STYLES[game.tone],
      )}
    >
      <div className="portal-dot-grid absolute inset-0 -z-10 opacity-25 [mask-image:linear-gradient(150deg,black,transparent_78%)]" />

      <div className="shrink-0">
        <span
          className={cn(CATEGORY_BADGE_BASE, CATEGORY_BADGE_STYLES[game.tone])}
        >
          {game.category}
        </span>
        <h3
          id={`${game.id}-title`}
          className="font-display mt-3 text-3xl font-bold tracking-[-0.035em] sm:text-4xl"
        >
          {game.title}
        </h3>
        <p className="mt-2 max-w-sm text-sm leading-5 text-white/58">
          {game.description}
        </p>
      </div>

      <div className="mt-5 flex min-h-0 flex-1 items-end">
        <div className="w-full max-w-[20rem]">
          <SequenceGameDemo />
        </div>
      </div>
    </motion.article>
  );
}

function PhotoGameCard({
  game,
  index,
  reduceMotion,
}: {
  game: HomeGame;
  index: number;
  reduceMotion: boolean;
}) {
  return (
    <motion.article
      custom={index}
      initial={reduceMotion ? false : "hidden"}
      whileInView={reduceMotion ? undefined : "visible"}
      whileHover={reduceMotion ? undefined : "hover"}
      viewport={{ once: true, amount: 0.16 }}
      variants={CARD_VARIANTS}
      className={cn(
        "group relative isolate min-w-0 overflow-hidden rounded-[1.4rem] border transition-[border-color,box-shadow] duration-200 hover:border-white/35 hover:shadow-[0_24px_60px_rgb(0_0_0_/_0.28)] focus-within:z-10 focus-within:border-white/40 lg:col-span-3",
        TONE_STYLES[game.tone],
      )}
    >
      <Link
        href={game.href}
        aria-label={`Play ${game.title}`}
        className="relative flex h-full min-h-11 min-w-0 flex-col justify-between overflow-hidden rounded-[inherit] p-5 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-white sm:p-6"
      >
        {game.image ? (
          <>
            {game.imageFit === "contain" && (
              <div className="absolute inset-0 bg-[#080b14]" />
            )}
            <motion.div
              aria-hidden="true"
              variants={SCREENSHOT_VARIANTS}
              className="absolute inset-0"
            >
              <Image
                src={game.image}
                alt=""
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                className={cn(game.imageFit === "contain" && "p-5 sm:p-7")}
                style={{
                  objectFit: game.imageFit ?? "cover",
                  objectPosition: game.imagePosition ?? "center",
                }}
              />
            </motion.div>
          </>
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0 grid place-items-center opacity-85"
          >
            <GameMotif motif={game.motif} />
          </div>
        )}

        <div className="absolute inset-0 z-[1] bg-[linear-gradient(180deg,rgb(4_7_15_/_0.38)_0%,rgb(4_7_15_/_0.52)_38%,rgb(4_7_15_/_0.96)_100%)]" />

        <div className="relative z-10 flex items-start justify-between gap-4">
          <span
            className={cn(
              CATEGORY_BADGE_BASE,
              CATEGORY_BADGE_STYLES[game.tone],
            )}
          >
            {game.category}
          </span>
          <ArrowRight
            aria-hidden="true"
            className={cn(
              "size-4 shrink-0 text-white/70 group-hover:text-white",
              !reduceMotion && "transition-transform group-hover:translate-x-1",
            )}
          />
        </div>

        <div className="relative z-10">
          <h3 className="font-display text-xl font-bold tracking-[-0.035em]">
            {game.title}
          </h3>
          <p className="mt-2 max-w-sm text-xs leading-5 text-white/75">
            {game.description}
          </p>
          <span className="mt-3 inline-flex min-h-11 items-center text-xs font-extrabold uppercase tracking-[0.12em] text-white">
            Play now
          </span>
        </div>
      </Link>
    </motion.article>
  );
}

export function FeaturesGrid() {
  const games = homeGames as HomeGame[];
  const reduceMotion = Boolean(useReducedMotion());

  return (
    <section
      id="games"
      className="relative isolate overflow-hidden scroll-mt-20 border-t border-white/5 bg-background py-20 sm:py-28"
    >
      <SectionAtmosphere variant="aurora" tone="violet" />
      <div className="portal-section relative z-10">
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

        <div className="grid auto-rows-[20rem] gap-3 md:grid-cols-2 lg:grid-cols-12">
          {games.map((game, index) =>
            game.featured ? (
              <SequenceGameCard
                key={game.id}
                game={game}
                index={index}
                reduceMotion={reduceMotion}
              />
            ) : (
              <PhotoGameCard
                key={game.id}
                game={game}
                index={index}
                reduceMotion={reduceMotion}
              />
            ),
          )}
        </div>

        <div className="mt-5 flex justify-center sm:justify-end">
          <Link
            href="/games"
            className="group inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
          >
            <Layers3 className="size-4 text-portal-mint" aria-hidden="true" />
            Explore all games
            <ArrowRight
              aria-hidden="true"
              className={cn(
                "size-4",
                !reduceMotion &&
                  "transition-transform group-hover:translate-x-1",
              )}
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
