"use client";

import Link from "next/link";
import { UserAvatar } from "@/components/ui/user-avatar";

interface PlayerCardProps {
  name: string;
  avatar?: string | null;
  progress: number;
  total: number;
  variant: "player" | "opponent";
}

export function PlayerCard({
  name,
  avatar,
  progress,
  total,
  variant,
}: PlayerCardProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 text-center">
        <div className="mx-auto mb-2">
          <UserAvatar name={name} avatarUrl={avatar ?? null} size="xl" />
        </div>
        {variant === "opponent" ? (
          <Link
            href={`/account/${encodeURIComponent(name)}`}
            className="font-bold hover:text-violet-400 transition-colors"
          >
            {name}
          </Link>
        ) : (
          <p className="font-bold">{name}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Progress: {progress}/{total}
        </p>
      </div>

      {/* Progress Bar (only for opponent) */}
      {variant === "opponent" && (
        <div className="w-full max-w-[200px] space-y-2">
          <div className="h-2 w-full bg-secondary/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-rose-500 rounded-full transition-all duration-300"
              style={{
                width: `${total > 0 ? (progress / total) * 100 : 0}%`,
              }}
            />
          </div>
          <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest">
            Opponent Progress
          </p>
        </div>
      )}
    </div>
  );
}
