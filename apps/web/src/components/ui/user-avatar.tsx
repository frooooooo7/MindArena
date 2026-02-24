/**
 * Reusable avatar placeholder component.
 * Displays first letter of the name in a gradient circle.
 * When `avatarUrl` is provided, it will render an <img> instead.
 *
 * Usage:
 *   <UserAvatar name="John" />
 *   <UserAvatar name="John" avatarUrl="https://..." size="lg" />
 */

interface UserAvatarProps {
  /** User's display name — first letter used as fallback initial */
  name?: string;
  /** URL to the user's profile picture. When provided, renders an <img>. */
  avatarUrl?: string | null;
  /** Size variant */
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
} as const;

export function UserAvatar({ name, avatarUrl, size = "md" }: UserAvatarProps) {
  const initial = name?.charAt(0).toUpperCase() ?? "?";
  const sizeClasses = sizeMap[size];

  if (avatarUrl) {
    return (
      <div className={`${sizeClasses} rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 p-[2px] shadow-lg shadow-violet-500/15 shrink-0`}>
        <img
          src={avatarUrl}
          alt={name ?? "User avatar"}
          className="h-full w-full rounded-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className={`${sizeClasses} rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 p-[2px] shadow-lg shadow-violet-500/15 shrink-0`}>
      <div className="h-full w-full rounded-full bg-card flex items-center justify-center">
        <span className="font-bold bg-gradient-to-br from-violet-400 to-indigo-400 bg-clip-text text-transparent">
          {initial}
        </span>
      </div>
    </div>
  );
}
