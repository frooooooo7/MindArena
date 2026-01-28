"use client";

interface GameStatusMessageProps {
    showingSequence: boolean;
    isPlaying: boolean;
}

/**
 * Status message shown below the game grid
 */
export function GameStatusMessage({ showingSequence, isPlaying }: GameStatusMessageProps) {
    if (showingSequence) {
        return (
            <p className="mt-4 text-sm font-semibold text-violet-500 animate-pulse">
                Watch the sequence...
            </p>
        );
    }

    if (isPlaying) {
        return (
            <p className="mt-4 text-sm font-semibold text-muted-foreground">
                Your turn! Repeat the sequence.
            </p>
        );
    }

    return null;
}
