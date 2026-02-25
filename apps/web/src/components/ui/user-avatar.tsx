/**
 * Reusable avatar placeholder component.
 * Displays first letter of the name in a gradient circle.
 * When `avatarUrl` is provided, it will render an optimized <Image> instead.
 *
 * Usage:
 *   <UserAvatar name="John" />
 *   <UserAvatar name="John" avatarUrl="https://..." size="lg" />
 */

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

  if (avatarUrl) {
    return (
      <div className={`${classes} rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 p-[2px] shadow-lg shadow-violet-500/15 shrink-0`}>
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
    <div className={`${classes} rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 p-[2px] shadow-lg shadow-violet-500/15 shrink-0`}>
      <div className="h-full w-full rounded-full bg-card flex items-center justify-center">
        <span className="font-bold bg-gradient-to-br from-violet-400 to-indigo-400 bg-clip-text text-transparent">
          {initial}
        </span>
      </div>
    </div>
  );
}
