/**
 * Sequence Game Handler Tests
 * Integration tests for sequence-specific game events
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { handlePlayerMove, startSequenceGame } from '../../../sockets/handlers/game/sequence.handler';
import * as roomService from '../../../services/room.service';
import { sequenceMemory } from '../../../services/games';
import { createMockServer, createMockSocket, type MockSocket, type MockServer } from '../../test-utils';
import { GAME_EVENTS } from '@mindarena/shared';

// Mock timer functions
vi.mock('../../../sockets/handlers/game/timer', () => ({
    startRoundTimer: vi.fn(),
    clearRoundTimer: vi.fn(),
}));

describe('Sequence Game Handler', () => {
    let mockSocket: MockSocket;
    let mockServer: MockServer;
    const roomId = 'test-room';
    const playerId = 'user-1';

    beforeEach(() => {
        vi.clearAllMocks();
        mockSocket = createMockSocket('s1', playerId, 'Player 1');
        mockServer = createMockServer([mockSocket]);
    });

    // ==========================================
    // START SEQUENCE GAME
    // ==========================================

    describe('startSequenceGame', () => {
        it('should start game and emit START event', () => {
            const mockRoom = {
                id: roomId,
                sequence: [1, 2, 3],
                gridSize: 3,
                level: 1,
                players: [{ id: playerId, name: 'Player 1' }]
            };
            vi.spyOn(roomService, 'startGame').mockReturnValue(mockRoom as any);

            startSequenceGame(mockServer as any, roomId);

            expect(roomService.startGame).toHaveBeenCalledWith(roomId);
            expect(mockServer.to).toHaveBeenCalledWith(roomId);
            expect(mockServer.emit).toHaveBeenCalledWith(GAME_EVENTS.START, expect.objectContaining({
                sequence: [1, 2, 3],
                gridSize: 3
            }));
        });
    });

    // ==========================================
    // HANDLE PLAYER MOVE
    // ==========================================

    describe('handlePlayerMove', () => {
        it('should emit MOVE_RESULT on move', () => {
            const mockRoom = { status: 'playing' };
            vi.spyOn(roomService, 'getRoom').mockReturnValue(mockRoom as any);
            vi.spyOn(sequenceMemory, 'processMove').mockReturnValue({
                correct: true,
                sequenceComplete: false,
                player: { id: playerId, currentIndex: 1 } as any
            });

            handlePlayerMove(mockSocket as any, mockServer as any, roomId, playerId, 5);

            expect(sequenceMemory.processMove).toHaveBeenCalledWith(roomId, playerId, 5);
            expect(mockSocket.emit).toHaveBeenCalledWith(GAME_EVENTS.MOVE_RESULT, {
                correct: true,
                sequenceComplete: false
            });
        });

        it('should notify opponent of progress', () => {
            const mockRoom = { status: 'playing' };
            vi.spyOn(roomService, 'getRoom').mockReturnValue(mockRoom as any);
            vi.spyOn(sequenceMemory, 'processMove').mockReturnValue({
                correct: true,
                sequenceComplete: false,
                player: { id: playerId, currentIndex: 2, currentLevel: 1 } as any
            });
            vi.spyOn(roomService, 'getOpponent').mockReturnValue({ socketId: 's2' } as any);

            handlePlayerMove(mockSocket as any, mockServer as any, roomId, playerId, 5);

            expect(mockServer.to).toHaveBeenCalledWith('s2');
            expect(mockServer.emit).toHaveBeenCalledWith(GAME_EVENTS.OPPONENT_PROGRESS, {
                playerId,
                currentIndex: 2,
                currentLevel: 1
            });
        });

        it('should handle floor level completion', () => {
            const mockRoom = { status: 'playing' };
            vi.spyOn(roomService, 'getRoom').mockReturnValue(mockRoom as any);
            vi.spyOn(sequenceMemory, 'processMove').mockReturnValue({
                correct: true,
                sequenceComplete: true,
                player: { id: playerId } as any
            });
            // Assume both players complete
            vi.spyOn(sequenceMemory, 'areBothPlayersComplete').mockReturnValue(true);
            vi.spyOn(sequenceMemory, 'advanceToNextLevel').mockReturnValue({
                level: 2, sequence: [1, 2], gridSize: 3
            } as any);

            handlePlayerMove(mockSocket as any, mockServer as any, roomId, playerId, 5);

            expect(sequenceMemory.advanceToNextLevel).toHaveBeenCalledWith(roomId);
            expect(mockServer.to).toHaveBeenCalledWith(roomId);
            expect(mockServer.emit).toHaveBeenCalledWith(GAME_EVENTS.LEVEL_COMPLETE, expect.objectContaining({
                newLevel: 2
            }));
        });
    });
});
