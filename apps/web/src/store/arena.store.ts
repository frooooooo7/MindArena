import { create } from "zustand";
import { ArenaMatch, LiveGameInfo } from "@mindarena/shared";

interface ArenaState {
    isSearching: boolean;
    match: ArenaMatch | null;
    gameType: string | null;
    queuePosition: number | null;
    liveGames: LiveGameInfo[];
    setSearching: (isSearching: boolean, gameType?: string) => void;
    setMatch: (match: ArenaMatch) => void;
    setQueuePosition: (position: number) => void;
    setLiveGames: (games: LiveGameInfo[]) => void;
    resetArena: () => void;
}

export const useArenaStore = create<ArenaState>((set) => ({
    isSearching: false,
    match: null,
    gameType: null,
    queuePosition: null,
    liveGames: [],
    setSearching: (isSearching, gameType) => set({ 
        isSearching, 
        gameType: gameType || null,
        match: null,
        queuePosition: null
    }),
    setMatch: (match) => set({ match, isSearching: false }),
    setQueuePosition: (position) => set({ queuePosition: position }),
    setLiveGames: (games) => set({ liveGames: games }),
    resetArena: () => set({ 
        isSearching: false, 
        match: null, 
        gameType: null,
        queuePosition: null,
        liveGames: [],
    }),
}));
