import { useEffect, useCallback, useState, useRef } from "react";
import { socket } from "@/lib/socket";
import { useArenaStore } from "@/store/arena.store";
import { 
    GAME_EVENTS, 
    ARENA_EVENTS,
    GameStartPayload, 
    GameEndPayload, 
    LevelCompletePayload,
    OpponentProgressPayload 
} from "@mindarena/shared";


interface UseArenaGameReturn {
    // Game state
    gameStatus: "waiting" | "countdown" | "playing" | "finished";
    countdown: number;
    level: number;
    sequence: number[];
    gridSize: number;
    currentIndex: number;
    
    // Opponent state
    opponentProgress: number;
    opponentLevel: number;
    
    // Result
    isWinner: boolean | null;
    gameResult: GameEndPayload | null;
    matchCancelled: boolean;
    
    // Actions
    sendReady: () => void;
    sendMove: (cellIndex: number) => void;
}

export function useArenaGame(): UseArenaGameReturn {
    const { match } = useArenaStore();
    const roomId = match?.room || "";
    
    // Game state
    const [gameStatus, setGameStatus] = useState<"waiting" | "countdown" | "playing" | "finished">("waiting");
    const [countdown, setCountdown] = useState(0);
    const [level, setLevel] = useState(1);
    const [sequence, setSequence] = useState<number[]>([]);
    const [gridSize, setGridSize] = useState(3);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [matchCancelled, setMatchCancelled] = useState(false);

    
    // Opponent state
    const [opponentProgress, setOpponentProgress] = useState(0);
    const [opponentLevel, setOpponentLevel] = useState(1);
    
    // Result
    const [gameResult, setGameResult] = useState<GameEndPayload | null>(null);
    const [isWinner, setIsWinner] = useState<boolean | null>(null);

    // Ref for countdown timer cleanup
    const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Cleanup countdown timer on unmount
    useEffect(() => {
        return () => {
            if (countdownTimerRef.current) {
                clearInterval(countdownTimerRef.current);
                countdownTimerRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!roomId) return;

        // Countdown event
        const handleCountdown = (data: { seconds: number }) => {
            console.log("[ArenaGame] Countdown:", data.seconds);
            setGameStatus("countdown");
            setCountdown(data.seconds);
            
            // Clear any existing timer
            if (countdownTimerRef.current) {
                clearInterval(countdownTimerRef.current);
            }
            
            // Countdown logic with proper cleanup
            let remaining = data.seconds;
            countdownTimerRef.current = setInterval(() => {
                remaining--;
                setCountdown(remaining);
                if (remaining <= 0) {
                    if (countdownTimerRef.current) {
                        clearInterval(countdownTimerRef.current);
                        countdownTimerRef.current = null;
                    }
                }
            }, 1000);
        };

        // Game start event
        const handleGameStart = (data: GameStartPayload) => {
            console.log("[ArenaGame] Game started:", data);
            // Clear countdown timer if still running
            if (countdownTimerRef.current) {
                clearInterval(countdownTimerRef.current);
                countdownTimerRef.current = null;
            }
            setGameStatus("playing");
            setLevel(data.level);
            setSequence(data.sequence);
            setGridSize(data.gridSize);
            setCurrentIndex(0);
        };

        // Move result event
        const handleMoveResult = (data: { correct: boolean; sequenceComplete: boolean }) => {
            console.log("[ArenaGame] Move result:", data);
            if (data.correct) {
                setCurrentIndex(prev => prev + 1);
            }
        };

        // Opponent progress event
        const handleOpponentProgress = (data: OpponentProgressPayload) => {
            console.log("[ArenaGame] Opponent progress:", data);
            setOpponentProgress(data.currentIndex);
            setOpponentLevel(data.currentLevel);
        };

        // Match cancelled event
        const handleMatchCancelled = (data: { reason: string }) => {
            console.log("[ArenaGame] Match cancelled:", data.reason);
            setMatchCancelled(true);
        };

        // Level complete event
        const handleLevelComplete = (data: LevelCompletePayload) => {
            console.log("[ArenaGame] Level complete:", data);
            setLevel(data.newLevel);
            setSequence(data.newSequence);
            setGridSize(data.newGridSize);
            setCurrentIndex(0);
            setOpponentProgress(0);
        };

        // Game end event
        const handleGameEnd = (data: GameEndPayload) => {
            console.log("[ArenaGame] Game ended:", data);
            setGameStatus("finished");
            setGameResult(data);
            
            // Determine if current user is winner
            const opponentName = match?.opponent?.name;
            setIsWinner(data.loserName === opponentName);
        };

        socket.on(GAME_EVENTS.COUNTDOWN, handleCountdown);
        socket.on(GAME_EVENTS.START, handleGameStart);
        socket.on(GAME_EVENTS.MOVE_RESULT, handleMoveResult);
        socket.on(GAME_EVENTS.OPPONENT_PROGRESS, handleOpponentProgress);
        socket.on(ARENA_EVENTS.MATCH_CANCELLED, handleMatchCancelled);
        socket.on(GAME_EVENTS.LEVEL_COMPLETE, handleLevelComplete);
        socket.on(GAME_EVENTS.END, handleGameEnd);

        return () => {
            // Cleanup countdown timer
            if (countdownTimerRef.current) {
                clearInterval(countdownTimerRef.current);
                countdownTimerRef.current = null;
            }
            
            socket.off(GAME_EVENTS.COUNTDOWN, handleCountdown);
            socket.off(GAME_EVENTS.START, handleGameStart);
            socket.off(GAME_EVENTS.MOVE_RESULT, handleMoveResult);
            socket.off(GAME_EVENTS.OPPONENT_PROGRESS, handleOpponentProgress);
            socket.off(ARENA_EVENTS.MATCH_CANCELLED, handleMatchCancelled);
            socket.off(GAME_EVENTS.LEVEL_COMPLETE, handleLevelComplete);
            socket.off(GAME_EVENTS.END, handleGameEnd);
        };
    }, [roomId, match?.opponent?.name]);

    const sendReady = useCallback(() => {
        if (!roomId) return;
        console.log("[ArenaGame] Sending ready for room:", roomId);
        socket.emit(GAME_EVENTS.READY, { roomId });
    }, [roomId]);

    const sendMove = useCallback((cellIndex: number) => {
        if (!roomId || gameStatus !== "playing") return;
        console.log("[ArenaGame] Sending move:", cellIndex);
        socket.emit(GAME_EVENTS.MOVE, { roomId, cellIndex });
    }, [roomId, gameStatus]);

    return {
        gameStatus,
        countdown,
        level,
        sequence,
        gridSize,
        currentIndex,
        opponentProgress,
        opponentLevel,
        isWinner,
        gameResult,
        matchCancelled,
        sendReady,
        sendMove,
    };
}

