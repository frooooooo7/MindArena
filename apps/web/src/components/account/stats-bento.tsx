"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export type StatsMetric = {
  label: string;
  value: string;
  numericValue?: number;
  valuePrefix?: string;
  valueSuffix?: string;
  subtext: string;
  icon: ComponentType<{ className?: string }>;
  tone?: "mint" | "rose";
};

interface StatsMetricGridProps {
  metrics: StatsMetric[];
  className?: string;
}

const useCountUp = (target: number, enabled: boolean, duration = 700) => {
  const reduceMotion = useReducedMotion();
  const shouldAnimate = enabled && !reduceMotion && target > 0;
  const [value, setValue] = useState(shouldAnimate ? 0 : target);
  const frameRef = useRef(0);

  useEffect(() => {
    if (!shouldAnimate) {
      setValue(target);
      return;
    }

    setValue(0);
    const startTime = performance.now();

    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, shouldAnimate, duration]);

  return value;
};

const formatMetricDisplay = (
  metric: StatsMetric,
  animatedNumber: number | null,
) => {
  if (animatedNumber === null || metric.numericValue === undefined) {
    return metric.value;
  }

  return `${metric.valuePrefix ?? ""}${animatedNumber.toLocaleString()}${metric.valueSuffix ?? ""}`;
};

const toneClasses = {
  mint: "text-portal-mint bg-portal-mint/15 border-portal-mint/30",
  rose: "text-rose-400 bg-rose-500/15 border-rose-500/30",
} as const;

const MetricValue = ({
  metric,
  className,
}: {
  metric: StatsMetric;
  className?: string;
}) => {
  const canAnimate = metric.numericValue !== undefined;
  const animated = useCountUp(metric.numericValue ?? 0, Boolean(canAnimate));

  return (
    <span className={className}>
      {formatMetricDisplay(metric, canAnimate ? animated : null)}
    </span>
  );
};

export const StatsMetricGrid = ({
  metrics,
  className,
}: StatsMetricGridProps) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
        className,
      )}
    >
      {metrics.map((metric) => {
        const Icon = metric.icon;
        const tone = metric.tone ?? "mint";

        return (
          <div
            key={metric.label}
            className="group relative overflow-hidden flex flex-col justify-between p-5 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-xl hover:border-portal-mint/40 hover:-translate-y-0.5 transition-all duration-300"
          >
            <div
              aria-hidden
              className={cn(
                "pointer-events-none absolute -right-10 -top-10 size-28 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                tone === "rose" ? "bg-rose-500/20" : "bg-portal-mint/20",
              )}
            />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div
                  className={cn(
                    "p-2.5 rounded-2xl border group-hover:scale-105 transition-transform",
                    toneClasses[tone],
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="text-xs font-semibold text-muted-foreground">
                {metric.label}
              </p>
              <h3 className="font-display text-3xl font-black tracking-tight text-foreground mt-1">
                <MetricValue metric={metric} />
              </h3>
            </div>

            <div className="relative z-10 mt-4 pt-3 border-t border-white/10 text-[11px] text-muted-foreground font-medium">
              {metric.subtext}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const StatsMetricGridSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
    {[0, 1, 2, 3].map((i) => (
      <div
        key={i}
        className="h-36 rounded-3xl border border-white/10 bg-white/[0.02]"
      />
    ))}
  </div>
);
