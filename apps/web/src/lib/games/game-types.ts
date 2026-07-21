"use client";

import { Brain, Grid3X3, Binary, LayoutGrid, Palette, Calculator, LucideIcon } from "lucide-react";

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
    category: "Memory" | "Speed & Reaction" | "Focus & Attention";
    skills?: string[];
    playsCount?: string;
    image?: string;
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
        description: "Remember and repeat an ever-growing sequence of highlighted grid tiles. Test your visual-spatial recall and pattern indexing.",
        icon: Grid3X3,
        color: "from-violet-500 to-purple-600",
        shadow: "shadow-violet-500/30",
        href: "/games/sequence-memory",
        difficulty: "Medium",
        averageTime: "3-5 min",
        category: "Memory",
        skills: ["Spatial Indexing", "Pattern Recall", "Working Memory"],
        playsCount: "24.8k",
    },
    {
        id: "chimp",
        name: "Chimp Memory",
        shortName: "Chimp",
        description: "Memorize the position of numbered tiles in a flash and click them in order after they are hidden. Inspired by primate memory experiments.",
        icon: Brain,
        color: "from-emerald-500 to-teal-600",
        shadow: "shadow-emerald-500/30",
        href: "/games/chimp-memory",
        difficulty: "Hard",
        averageTime: "2-4 min",
        category: "Speed & Reaction",
        skills: ["Photographic Recall", "Flash Ingestion", "Spatial Mapping"],
        playsCount: "18.2k",
        image: "/game_photos/chimp.png",
    },
    {
        id: "code",
        name: "Code Memory",
        shortName: "Code",
        description: "Observe binary grid patterns, hold the layout in mind, and reconstruct the exact code matrix. Pushes working memory capacity to its limits.",
        icon: Binary,
        color: "from-cyan-500 to-blue-600",
        shadow: "shadow-cyan-500/30",
        href: "/games/code-memory",
        difficulty: "Medium",
        averageTime: "3-5 min",
        category: "Memory",
        skills: ["Binary Decoding", "Matrix Recall", "Pattern Recognition"],
        playsCount: "14.1k",
        image: "/game_photos/code_memory.png",
    },
    {
        id: "schulte",
        name: "Schulte Table",
        shortName: "Schulte",
        description: "Scan the randomized numerical grid and click numbers in ascending order as fast as possible. Enhances peripheral vision and focus scanning.",
        icon: LayoutGrid,
        color: "from-amber-500 to-orange-600",
        shadow: "shadow-amber-500/30",
        href: "/games/schulte-table",
        difficulty: "Medium",
        averageTime: "1-3 min",
        category: "Focus & Attention",
        skills: ["Peripheral Scanning", "Visual Ingestion", "Attention Speed"],
        playsCount: "21.5k",
        image: "/game_photos/schulte.png",
    },
    {
        id: "color-word",
        name: "Color Word Challenge",
        shortName: "Color Word",
        description: "Identify the font color of the word while overriding what the word text spells out. Classic Stroop test measuring mental interference filter.",
        icon: Palette,
        color: "from-rose-500 via-purple-500 to-indigo-600",
        shadow: "shadow-rose-500/30",
        href: "/games/color-word",
        difficulty: "Hard",
        averageTime: "1-2 min",
        category: "Speed & Reaction",
        skills: ["Stroop Interference", "Reaction Velocity", "Cognitive Control"],
        playsCount: "16.9k",
        image: "/game_photos/colours.png",
    },
    {
        id: "fast-math",
        name: "Fast Math Challenge",
        shortName: "Fast Math",
        description: "Solve rapid mental arithmetic equations under customizable time limits and range levels. Sharpen calculation speed and numerical focus.",
        icon: Calculator,
        color: "from-emerald-400 via-cyan-500 to-blue-600",
        shadow: "shadow-cyan-500/30",
        href: "/games/fast-math",
        difficulty: "Medium",
        averageTime: "1-3 min",
        category: "Speed & Reaction",
        skills: ["Mental Arithmetic", "Calculation Velocity", "Numerical Focus"],
        playsCount: "12.4k",
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
