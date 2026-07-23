"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { cn } from "@/lib/utils";

export type AtmosphereVariant = "neural" | "aurora" | "orbs";
export type AtmosphereTone = "violet" | "mint" | "cyan";

const TONE = {
  violet: {
    orbA: "bg-portal-violet/25",
    orbB: "bg-[#755cff]/15",
    orbC: "bg-portal-pink/10",
    line: "stroke-[#aa9cff]/35",
    node: "bg-[#aa9cff]/70",
    ribbon: "from-portal-violet/25 via-transparent to-portal-pink/15",
  },
  mint: {
    orbA: "bg-portal-mint/20",
    orbB: "bg-teal-400/10",
    orbC: "bg-portal-blue/10",
    line: "stroke-portal-mint/30",
    node: "bg-portal-mint/70",
    ribbon: "from-portal-mint/20 via-transparent to-portal-blue/15",
  },
  cyan: {
    orbA: "bg-cyan-400/20",
    orbB: "bg-sky-500/12",
    orbC: "bg-portal-blue/12",
    line: "stroke-cyan-300/30",
    node: "bg-cyan-300/70",
    ribbon: "from-cyan-400/20 via-transparent to-portal-blue/15",
  },
} as const;

const OrbDrift = ({
  tone,
  reduceMotion,
}: {
  tone: AtmosphereTone;
  reduceMotion: boolean;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const ySlow = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? [0, 0] : [40, -60],
  );
  const yFast = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? [0, 0] : [-30, 50],
  );
  const colors = TONE[tone];

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden" aria-hidden>
      <div className="portal-dot-grid absolute inset-0 opacity-45 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]" />
      <motion.div
        style={{ y: ySlow }}
        className={cn(
          "absolute -left-24 top-10 h-72 w-72 rounded-full blur-[100px]",
          colors.orbA,
        )}
      />
      <motion.div
        style={{ y: yFast }}
        className={cn(
          "absolute -right-16 bottom-8 h-80 w-80 rounded-full blur-[110px]",
          colors.orbB,
        )}
      />
      <motion.div
        style={{ y: ySlow }}
        className={cn(
          "absolute left-1/3 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full blur-[90px]",
          colors.orbC,
        )}
      />
    </div>
  );
};

const NEURAL_NODES = [
  { x: 12, y: 22 },
  { x: 28, y: 58 },
  { x: 45, y: 18 },
  { x: 62, y: 48 },
  { x: 78, y: 28 },
  { x: 88, y: 68 },
  { x: 35, y: 78 },
  { x: 55, y: 72 },
];

const NEURAL_LINKS: [number, number][] = [
  [0, 2],
  [0, 1],
  [2, 3],
  [2, 4],
  [3, 5],
  [1, 6],
  [3, 7],
  [4, 5],
  [6, 7],
];

const NeuralField = ({
  tone,
  reduceMotion,
}: {
  tone: AtmosphereTone;
  reduceMotion: boolean;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const drift = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? [0, 0] : [24, -36],
  );
  const colors = TONE[tone];

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.03),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.025),transparent_45%)]" />
      <motion.div style={{ y: drift }} className="absolute inset-0">
        <svg
          className="absolute inset-0 h-full w-full opacity-70"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {NEURAL_LINKS.map(([a, b]) => {
            const from = NEURAL_NODES[a];
            const to = NEURAL_NODES[b];
            return (
              <line
                key={`${a}-${b}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                className={colors.line}
                strokeWidth="0.25"
              />
            );
          })}
        </svg>
        {NEURAL_NODES.map((node, index) => (
          <span
            key={`${node.x}-${node.y}`}
            className={cn(
              "absolute size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_12px_currentColor]",
              colors.node,
              !reduceMotion && "portal-float",
            )}
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
              animationDelay: `${index * 0.35}s`,
            }}
          />
        ))}
      </motion.div>
      <div
        className={cn(
          "absolute -right-10 top-16 h-64 w-64 rounded-full blur-[100px]",
          colors.orbA,
        )}
      />
    </div>
  );
};

const AuroraRibbons = ({
  tone,
  reduceMotion,
}: {
  tone: AtmosphereTone;
  reduceMotion: boolean;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const shift = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? [0, 0] : [-40, 50],
  );
  const shiftAlt = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? [0, 0] : [30, -45],
  );
  const colors = TONE[tone];

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden" aria-hidden>
      <div className="portal-dot-grid absolute inset-0 opacity-25 [mask-image:linear-gradient(to_bottom,transparent,black_30%,black_70%,transparent)]" />
      <motion.div
        style={{ y: shift, rotate: reduceMotion ? 0 : -8 }}
        className={cn(
          "absolute -left-1/4 top-0 h-[140%] w-[70%] rounded-[100%] bg-gradient-to-br opacity-80 blur-3xl",
          colors.ribbon,
        )}
      />
      <motion.div
        style={{ y: shiftAlt, rotate: reduceMotion ? 0 : 12 }}
        className={cn(
          "absolute -right-1/4 bottom-[-20%] h-[120%] w-[65%] rounded-[100%] bg-gradient-to-tl opacity-70 blur-3xl",
          colors.ribbon,
        )}
      />
      {!reduceMotion &&
        Array.from({ length: 14 }).map((_, index) => (
          <span
            key={index}
            className="absolute size-1 rounded-full bg-white/30 portal-float"
            style={{
              left: `${8 + ((index * 17) % 84)}%`,
              top: `${12 + ((index * 23) % 70)}%`,
              animationDelay: `${index * 0.22}s`,
              animationDuration: `${3.5 + (index % 4) * 0.4}s`,
            }}
          />
        ))}
    </div>
  );
};

interface SectionAtmosphereProps {
  variant: AtmosphereVariant;
  tone?: AtmosphereTone;
  className?: string;
}

export const SectionAtmosphere = ({
  variant,
  tone = "violet",
  className,
}: SectionAtmosphereProps) => {
  const reduceMotion = Boolean(useReducedMotion());

  return (
    <div
      className={cn("pointer-events-none absolute inset-0 -z-10", className)}
      aria-hidden
    >
      {variant === "neural" && (
        <NeuralField tone={tone} reduceMotion={reduceMotion} />
      )}
      {variant === "aurora" && (
        <AuroraRibbons tone={tone} reduceMotion={reduceMotion} />
      )}
      {variant === "orbs" && (
        <OrbDrift tone={tone} reduceMotion={reduceMotion} />
      )}
    </div>
  );
};
