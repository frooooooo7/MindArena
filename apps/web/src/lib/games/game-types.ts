"use client";

import { Brain, Grid3X3, Binary, LucideIcon } from "lucide-react";

/**
 * Shared game type definitions used across the application.
 * Used in:
 * - /app/games/page.tsx (Games selection page)
 * - /components/arena/arena-gametype-selector.tsx (Arena game selector modal)
 */

export interface GameTypeDefinition {
    id: string;
    name: string;
    shortName?: string;
    description: string;
    icon: LucideIcon;
    color: string; // Tailwind gradient classes (e.g., "from-violet-500 to-indigo-600")
    shadow?: string; // Optional shadow class for cards
    href?: string; // Optional route for direct game link
    difficulty: "Easy" | "Medium" | "Hard";
    averageTime: string;
}

/**
 * Master list of all available game types.
 * This is the single source of truth for game definitions.
 */
export const GAME_TYPES: GameTypeDefinition[] = [
    {
        id: "sequence",
        name: "Sequence Memory",
        shortName: "Sequence",
        description: "Remember and repeat the sequence of highlighted tiles. The sequence grows longer each level.",
        icon: Grid3X3,
        color: "from-violet-500 to-purple-600",
        shadow: "shadow-violet-500/30",
        href: "/games/sequence-memory",
        difficulty: "Medium",
        averageTime: "3-5 min"
    },
    {
        id: "chimp",
        name: "Chimp Memory",
        shortName: "Chimp",
        description: "Memorize the position of numbers and tap them in order before they disappear.",
        icon: Brain,
        color: "from-emerald-500 to-teal-600",
        shadow: "shadow-emerald-500/30",
        href: "/games/chimp-memory",
        difficulty: "Hard",
        averageTime: "2-4 min"
    },
    {
        id: "code",
        name: "Code Memory",
        shortName: "Code",
        description: "Remember the binary code pattern and reproduce it accurately. Tests pattern recognition.",
        icon: Binary,
        color: "from-cyan-500 to-blue-600",
        shadow: "shadow-cyan-500/30",
        href: "/games/code-memory",
        difficulty: "Medium",
        averageTime: "3-5 min"
    }
] as const;

/**
 * Get a game type by its ID.
 */
export function getGameTypeById(id: string): GameTypeDefinition | undefined {
    return GAME_TYPES.find(game => game.id === id);
}

/**
 * Get the display name for a game type ID.
 */
export function getGameDisplayName(id: string): string {
    const game = getGameTypeById(id);
    return game?.name ?? id;
}

export type GameTypeId = typeof GAME_TYPES[number]["id"];
