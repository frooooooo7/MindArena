"use client";

import Image from "next/image";

interface UserAvatarProps {
  /** User's display name — first letter used as fallback initial */
  name?: string;
  /** URL to the user's profile picture. When provided, renders an <Image>. */
  avatarUrl?: string | null;
  /** Size variant */
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
}

const sizeMap = {
  sm: { classes: "h-8 w-8 text-xs", px: 32 },
  md: { classes: "h-10 w-10 text-sm", px: 40 },
  lg: { classes: "h-14 w-14 text-lg", px: 56 },
  xl: { classes: "h-16 w-16 text-2xl", px: 64 },
  "2xl": { classes: "h-20 w-20 text-3xl", px: 80 },
  "3xl": { classes: "h-28 w-28 text-4xl", px: 112 },
} as const;

export function UserAvatar({ name, avatarUrl, size = "md" }: UserAvatarProps) {
  const initial = name?.charAt(0).toUpperCase() ?? "?";
  const { classes, px } = sizeMap[size];
  const isValidUrl = avatarUrl?.startsWith("http");

  if (avatarUrl && isValidUrl) {
    return (
      <div
        className={`${classes} rounded-full bg-gradient-to-br from-portal-mint via-teal-400 to-cyan-500 p-[2px] shadow-[0_0_15px_rgba(112,245,193,0.25)] shrink-0`}
      >
        <Image
          src={avatarUrl}
          alt={name ?? "User avatar"}
          width={px}
          height={px}
          className="h-full w-full rounded-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`${classes} rounded-full bg-gradient-to-br from-portal-mint via-teal-400 to-cyan-500 p-[2px] shadow-[0_0_15px_rgba(112,245,193,0.25)] shrink-0`}
    >
      <div className="h-full w-full rounded-full bg-slate-950 flex items-center justify-center">
        <span className="font-display font-extrabold text-portal-mint">
          {initial}
        </span>
      </div>
    </div>
  );
}
