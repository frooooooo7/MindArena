"use client";

import { Loader2 } from "lucide-react";

interface WaitingStateProps {
    message: string;
}

export function WaitingState({ message }: WaitingStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 text-violet-500 animate-spin mb-4" />
            <p className="text-xl font-semibold">{message}</p>
        </div>
    );
}

interface CountdownStateProps {
    seconds: number;
}

export function CountdownState({ seconds }: CountdownStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-20">
            <div className="text-8xl font-black text-violet-500 animate-pulse">
                {seconds}
            </div>
            <p className="text-xl font-semibold text-muted-foreground mt-4">
                Get ready!
            </p>
        </div>
    );
}
