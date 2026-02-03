/**
 * Game Handler Tests
 * Integration tests for game flow socket events
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as roomService from '../../services/room.service';
import { createMockServer, createMockSocket, type MockSocket, type MockServer } from '../test-utils';
import { GAME_EVENTS } from '@mindarena/shared';

// Mock the timer module to avoid interval issues
vi.mock('../../sockets/handlers/game/timer', () => ({
    startRoundTimer: vi.fn(),
    clearRoundTimer: vi.fn(),
}));

// Mock sequence and chimp handlers
vi.mock('../../sockets/handlers/game/sequence.handler', () => ({
    handlePlayerMove: vi.fn(),
    startSequenceGame: vi.fn(),
}));

vi.mock('../../sockets/handlers/game/chimp.handler', () => ({
    handleChimpMove: vi.fn(),
    startChimpGame: vi.fn(),
}));

describe('Game Handler', () => {
    let mockSocket1: MockSocket;
    let mockSocket2: MockSocket;
    let mockServer: MockServer;
    let eventHandlers1: Map<string, Function>;
    let eventHandlers2: Map<string, Function>;
    const testRoomId = 'test-room-1';

    const player1Data = { id: 'user-1', name: 'Player 1', socketId: 'socket-1' };
    const player2Data = { id: 'user-2', name: 'Player 2', socketId: 'socket-2' };
    const initialGameData = { sequence: [0, 4, 8], gridSize: 3 };

    beforeEach(async () => {
        // Clean up
        roomService.removeRoom(testRoomId);

        // Create mock sockets with event capturing
        mockSocket1 = createMockSocket('socket-1', 'user-1', 'Player 1');
        eventHandlers1 = new Map();
        mockSocket1.on = vi.fn((event: string, handler: Function) => {
            eventHandlers1.set(event, handler);
        });

        mockSocket2 = createMockSocket('socket-2', 'user-2', 'Player 2');
        eventHandlers2 = new Map();
        mockSocket2.on = vi.fn((event: string, handler: Function) => {
            eventHandlers2.set(event, handler);
        });

        mockServer = createMockServer([mockSocket1, mockSocket2]);

        // Dynamic import to ensure mocks are in place
        const { registerGameHandlers } = await import('../../sockets/handlers/game/index');

        // Register handlers for both sockets
        registerGameHandlers(
            mockSocket1 as unknown as import('socket.io').Socket,
            mockServer as unknown as import('socket.io').Server
        );
        registerGameHandlers(
            mockSocket2 as unknown as import('socket.io').Socket,
            mockServer as unknown as import('socket.io').Server
        );
    });

    afterEach(() => {
        roomService.removeRoom(testRoomId);
        vi.clearAllMocks();
    });

    // ==========================================
    // READY EVENT
    // ==========================================

    describe('READY event', () => {
        it('should register READY handler', () => {
            expect(eventHandlers1.has(GAME_EVENTS.READY)).toBe(true);
        });

        it('should mark player as ready', () => {
            roomService.createRoom(testRoomId, 'sequence', player1Data, player2Data, initialGameData);

            const readyHandler = eventHandlers1.get(GAME_EVENTS.READY)!;
            readyHandler({ roomId: testRoomId });

            const player = roomService.getPlayer(testRoomId, 'user-1');
            expect(player!.isReady).toBe(true);
        });

        it('should emit error for player not in room', async () => {
            roomService.createRoom(testRoomId, 'sequence', player1Data, player2Data, initialGameData);

            // Create a third socket not in the room
            const mockSocket3 = createMockSocket('socket-3', 'user-3', 'Player 3');
            const eventHandlers3 = new Map<string, Function>();
            mockSocket3.on = vi.fn((event: string, handler: Function) => {
                eventHandlers3.set(event, handler);
            });

            const { registerGameHandlers } = await import('../../sockets/handlers/game/index');
            registerGameHandlers(
                mockSocket3 as unknown as import('socket.io').Socket,
                mockServer as unknown as import('socket.io').Server
            );

            const readyHandler = eventHandlers3.get(GAME_EVENTS.READY)!;
            readyHandler({ roomId: testRoomId });

            expect(mockSocket3.emit).toHaveBeenCalledWith(
                GAME_EVENTS.ERROR,
                expect.objectContaining({ message: 'You are not in this game room' })
            );
        });

        it('should start countdown when both players ready', () => {
            vi.useFakeTimers();

            roomService.createRoom(testRoomId, 'sequence', player1Data, player2Data, initialGameData);

            // Player 1 ready
            const readyHandler1 = eventHandlers1.get(GAME_EVENTS.READY)!;
            readyHandler1({ roomId: testRoomId });

            // Player 2 ready
            const readyHandler2 = eventHandlers2.get(GAME_EVENTS.READY)!;
            readyHandler2({ roomId: testRoomId });

            // Countdown should be emitted via io.to(roomId).emit
            expect(mockServer.to).toHaveBeenCalledWith(testRoomId);

            vi.useRealTimers();
        });
    });

    // ==========================================
    // MOVE EVENT (Sequence Memory)
    // ==========================================

    describe('MOVE event', () => {
        it('should register MOVE handler', () => {
            expect(eventHandlers1.has(GAME_EVENTS.MOVE)).toBe(true);
        });

        it('should reject move from player not in room', async () => {
            roomService.createRoom(testRoomId, 'sequence', player1Data, player2Data, initialGameData);

            // Create socket not in room
            const mockSocket3 = createMockSocket('socket-3', 'user-3', 'Player 3');
            const eventHandlers3 = new Map<string, Function>();
            mockSocket3.on = vi.fn((event: string, handler: Function) => {
                eventHandlers3.set(event, handler);
            });

            const { registerGameHandlers } = await import('../../sockets/handlers/game/index');
            registerGameHandlers(
                mockSocket3 as unknown as import('socket.io').Socket,
                mockServer as unknown as import('socket.io').Server
            );

            const moveHandler = eventHandlers3.get(GAME_EVENTS.MOVE)!;

            // Should not throw, just ignore
            expect(() => moveHandler({ roomId: testRoomId, cellIndex: 0 })).not.toThrow();
        });
    });

    // ==========================================
    // CHIMP MOVE EVENT
    // ==========================================

    describe('CHIMP_MOVE event', () => {
        it('should register CHIMP_MOVE handler', () => {
            expect(eventHandlers1.has(GAME_EVENTS.CHIMP_MOVE)).toBe(true);
        });
    });

    // ==========================================
    // LEAVE EVENT (Forfeit)
    // ==========================================

    describe('LEAVE event (forfeit)', () => {
        it('should register LEAVE handler', () => {
            expect(eventHandlers1.has(GAME_EVENTS.LEAVE)).toBe(true);
        });

        it('should handle player forfeiting game', () => {
            roomService.createRoom(testRoomId, 'sequence', player1Data, player2Data, initialGameData);
            roomService.startGame(testRoomId);

            // Add socket to room
            mockSocket1.rooms.add(testRoomId);

            const leaveHandler = eventHandlers1.get(GAME_EVENTS.LEAVE)!;

            // Should not throw
            expect(() => leaveHandler()).not.toThrow();
        });
    });

    // ==========================================
    // DISCONNECTING EVENT
    // ==========================================

    describe('disconnecting event', () => {
        it('should register disconnecting handler', () => {
            expect(eventHandlers1.has('disconnecting')).toBe(true);
        });

        it('should handle player disconnecting during game', () => {
            roomService.createRoom(testRoomId, 'sequence', player1Data, player2Data, initialGameData);
            roomService.startGame(testRoomId);

            // Add socket to room
            mockSocket1.rooms.add(testRoomId);

            const disconnectingHandler = eventHandlers1.get('disconnecting')!;

            // Should not throw
            expect(() => disconnectingHandler()).not.toThrow();
        });
    });
});

// ==========================================
// SEQUENCE GAME FLOW TESTS
// ==========================================

describe('Sequence Game Flow', () => {
    const testRoomId = 'sequence-test-room';
    const player1Data = { id: 'user-1', name: 'Player 1', socketId: 'socket-1' };
    const player2Data = { id: 'user-2', name: 'Player 2', socketId: 'socket-2' };

    beforeEach(() => {
        roomService.removeRoom(testRoomId);
    });

    afterEach(() => {
        roomService.removeRoom(testRoomId);
    });

    it('should create valid sequence game room', () => {
        const room = roomService.createRoom(
            testRoomId,
            'sequence',
            player1Data,
            player2Data,
            { sequence: [0, 1, 2], gridSize: 3 }
        );

        expect(room.gameType).toBe('sequence');
        expect(room.sequence).toHaveLength(3);
        expect(room.gridSize).toBe(3);
    });

    it('should track player progress correctly', () => {
        roomService.createRoom(
            testRoomId,
            'sequence',
            player1Data,
            player2Data,
            { sequence: [0, 1, 2], gridSize: 3 }
        );

        // Update player progress
        roomService.updatePlayer(testRoomId, 'user-1', { currentIndex: 2 });

        const player = roomService.getPlayer(testRoomId, 'user-1');
        expect(player!.currentIndex).toBe(2);
    });

    it('should track player failure', () => {
        roomService.createRoom(
            testRoomId,
            'sequence',
            player1Data,
            player2Data,
            { sequence: [0, 1, 2], gridSize: 3 }
        );

        roomService.updatePlayer(testRoomId, 'user-1', { hasFailed: true });

        const player = roomService.getPlayer(testRoomId, 'user-1');
        expect(player!.hasFailed).toBe(true);
    });

    it('should end game with winner', () => {
        roomService.createRoom(
            testRoomId,
            'sequence',
            player1Data,
            player2Data,
            { sequence: [0, 1, 2], gridSize: 3 }
        );
        roomService.startGame(testRoomId);

        // Player 1 fails
        roomService.updatePlayer(testRoomId, 'user-1', { hasFailed: true });

        // End game with player 2 as winner
        const room = roomService.endGame(testRoomId, 'user-2');

        expect(room!.status).toBe('finished');
        expect(room!.winnerId).toBe('user-2');
    });
});

// ==========================================
// CHIMP GAME FLOW TESTS
// ==========================================

describe('Chimp Game Flow', () => {
    const testRoomId = 'chimp-test-room';
    const player1Data = { id: 'user-1', name: 'Player 1', socketId: 'socket-1' };
    const player2Data = { id: 'user-2', name: 'Player 2', socketId: 'socket-2' };

    beforeEach(() => {
        roomService.removeRoom(testRoomId);
    });

    afterEach(() => {
        roomService.removeRoom(testRoomId);
    });

    it('should create valid chimp game room', () => {
        const room = roomService.createRoom(
            testRoomId,
            'chimp',
            player1Data,
            player2Data,
            { sequence: [], gridSize: 5 }
        );

        expect(room.gameType).toBe('chimp');
    });

    it('should progress through levels', () => {
        roomService.createRoom(
            testRoomId,
            'chimp',
            player1Data,
            player2Data,
            { sequence: [], gridSize: 5 }
        );

        // Level up
        roomService.updateRoomGameData(testRoomId, { level: 2 });
        roomService.resetPlayersProgress(testRoomId);

        const room = roomService.getRoom(testRoomId);
        expect(room!.level).toBe(2);
        expect(room!.players[0].currentLevel).toBe(2);
    });
});
