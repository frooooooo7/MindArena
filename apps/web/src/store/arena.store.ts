import { create } from "zustand";
import { ArenaMatch } from "@mindarena/shared";

interface ArenaState {
    isSearching: boolean;
    match: ArenaMatch | null;
    gameType: string | null;
    queuePosition: number | null;
    setSearching: (isSearching: boolean, gameType?: string) => void;
    setMatch: (match: ArenaMatch) => void;
    setQueuePosition: (position: number) => void;
    resetArena: () => void;
}

export const useArenaStore = create<ArenaState>((set) => ({
    isSearching: false,
    match: null,
    gameType: null,
    queuePosition: null,
    setSearching: (isSearching, gameType) => set({ 
        isSearching, 
        gameType: gameType || null,
        match: null,
        queuePosition: null
    }),
    setMatch: (match) => set({ match, isSearching: false }),
    setQueuePosition: (position) => set({ queuePosition: position }),
    resetArena: () => set({ 
        isSearching: false, 
        match: null, 
        gameType: null,
        queuePosition: null 
    }),
}));
