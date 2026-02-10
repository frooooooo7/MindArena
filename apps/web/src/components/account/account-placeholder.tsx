"use client";

import { LucideIcon } from "lucide-react";

interface AccountPlaceholderProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

/**
 * Reusable placeholder component for unauthenticated states.
 * Used in account sections when user needs to login.
 */
export function AccountPlaceholder({ icon: Icon, title, description }: AccountPlaceholderProps) {
  return (
    <div className="p-12 text-center rounded-2xl border border-dashed border-border/60 bg-secondary/5">
      <Icon className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md mx-auto">{description}</p>
    </div>
  );
}
