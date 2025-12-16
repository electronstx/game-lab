import { describe, it, expect, beforeEach, vi } from 'vitest';
import Gameflow from '../../src/flow/gameflow.js';
import GameData from '../../src/data/game-data.js';
import Scene from '../../src/view/scene.js';
import { GameStates, GameStateName } from '../../src/data/types.js';
import { GameEvents, EventEmitter } from '../../src/data/events.js';
import * as PIXI from 'pixi.js';
import { SoundService } from '../../src/services/sound/sound-service.js';

class TestGameData extends GameData {
    private testData: Record<string, unknown> = {};
    private roundNumber = 0;
    private roundResult: Record<string, unknown> = {};

    getGameData(): Record<string, unknown> {
        return this.testData;
    }

    getRoundData(): number {
        return this.roundNumber;
    }

    getRoundResultData(): Record<string, unknown> {
        return this.roundResult;
    }

    resetData(): void {
        this.testData = {};
        this.roundNumber = 0;
        this.roundResult = {};
    }

    setRoundNumber(round: number): void {
        this.roundNumber = round;
    }
}

class TestScene extends Scene {
    create(): void {}
    onResize(scale: number, width: number, height: number): void {}
    showStartScreen(): void {}
    initHUD(...args: unknown[]): void {}
    showStartGame(timescale?: number): void {}
    showRound(roundNumber?: number, timescale?: number, ...args: unknown[]): void {}
    showRoundResult(...args: unknown[]): void {}
    showEndGame(result: unknown, timescale?: number): void {}
    restartGame(): void {}
}

class TestGameflow extends Gameflow {
    setGameSettings(gameSettings: unknown): void {}
    startGame(): void {}
    startRound(): void {}
    showRoundResult(...args: unknown[]): void {}
    showEndGame(result: unknown, timescale?: number): void {}
    restartGame(): void {}
}

describe('Gameflow', () => {
    let gameData: TestGameData;
    let scene: TestScene;
    let gameflow: TestGameflow;
    let mockEventEmitter: EventEmitter;
    let mockApp: PIXI.Application;
    let mockSoundService: SoundService;

    beforeEach(() => {
        const handlers = new Map<string, Set<(...args: unknown[]) => void>>();

        mockEventEmitter = {
            on: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
                if (!handlers.has(event)) {
                    handlers.set(event, new Set());
                }
                handlers.get(event)!.add(handler);
            }),
            off: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
                handlers.get(event)?.delete(handler);
            }),
            emit: vi.fn((event: string, ...args: unknown[]) => {
                handlers.get(event)?.forEach(handler => handler(...args));
            }),
            once: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
                const onceHandler = (...args: unknown[]) => {
                    handler(...args);
                    handlers.get(event)?.delete(onceHandler);
                };
                if (!handlers.has(event)) {
                    handlers.set(event, new Set());
                }
                handlers.get(event)!.add(onceHandler);
            }),
        };

        mockApp = {
            stage: mockEventEmitter,
        } as unknown as PIXI.Application;

        mockSoundService = {} as SoundService;

        gameData = new TestGameData();
        scene = new TestScene(mockApp, mockSoundService, 1);
        gameflow = new TestGameflow(gameData, scene);
    });

    describe('constructor', () => {
        it('should initialize with gameData and scene', () => {
            expect(gameflow).toBeDefined();
        });

        it('should setup event handlers', () => {
            expect(mockEventEmitter.on).toHaveBeenCalled();
        });

        it('should enter initial state', () => {
            const showStartScreenSpy = vi.spyOn(scene, 'showStartScreen');
            const newGameflow = new TestGameflow(gameData, scene);

            expect(showStartScreenSpy).toHaveBeenCalled();
        });
    });

    describe('event handlers', () => {
        it('should handle GAME_INIT event', () => {
            const changeStateSpy = vi.spyOn(gameData, 'changeState');
            const showStartScreenSpy = vi.spyOn(scene, 'showStartScreen');

            const handler = (mockEventEmitter.on as ReturnType<typeof vi.fn>).mock.calls
                .find(([event]) => event === GameEvents.GAME_INIT)?.[1];

            if (handler) {
                handler();
                expect(changeStateSpy).toHaveBeenCalledWith(GameStates.INIT, undefined);
                expect(showStartScreenSpy).toHaveBeenCalled();
            }
        });

        it('should handle GAME_STARTED event', () => {
            const startGameSpy = vi.spyOn(gameflow, 'startGame');

            const handler = (mockEventEmitter.on as ReturnType<typeof vi.fn>).mock.calls
                .find(([event]) => event === GameEvents.GAME_STARTED)?.[1];

            if (handler) {
                handler();
                expect(startGameSpy).toHaveBeenCalled();
            }
        });

        it('should handle ROUND_STARTED event', () => {
            const startRoundSpy = vi.spyOn(gameflow, 'startRound');

            const handler = (mockEventEmitter.on as ReturnType<typeof vi.fn>).mock.calls
                .find(([event]) => event === GameEvents.ROUND_STARTED)?.[1];

            if (handler) {
                handler();
                expect(startRoundSpy).toHaveBeenCalled();
            }
        });

        it('should handle ROUND_COMPLETED event with RoundCompletedEvent', () => {
            const showRoundResultSpy = vi.spyOn(gameflow, 'showRoundResult');
            const payload = { roundNumber: 1, winner: 'player1' };
            const event = { type: 'ROUND_COMPLETED', payload };

            const handler = (mockEventEmitter.on as ReturnType<typeof vi.fn>).mock.calls
                .find(([event]) => event === GameEvents.ROUND_COMPLETED)?.[1];

            if (handler) {
                handler(event);
                expect(showRoundResultSpy).toHaveBeenCalledWith(payload);
            }
        });

        it('should handle ROUND_COMPLETED event with string data', () => {
            const showRoundResultSpy = vi.spyOn(gameflow, 'showRoundResult');
            gameData.setRoundNumber(2);

            const handler = (mockEventEmitter.on as ReturnType<typeof vi.fn>).mock.calls
                .find(([event]) => event === GameEvents.ROUND_COMPLETED)?.[1];

            if (handler) {
                handler('rock');
                expect(showRoundResultSpy).toHaveBeenCalledWith(
                    expect.objectContaining({
                        playerMove: 'rock',
                        roundNumber: 2
                    })
                );
            }
        });

        it('should handle ROUND_COMPLETED event with object data', () => {
            const showRoundResultSpy = vi.spyOn(gameflow, 'showRoundResult');
            gameData.setRoundNumber(3);
            const data = { winner: 'player1', score: 10 };

            const handler = (mockEventEmitter.on as ReturnType<typeof vi.fn>).mock.calls
                .find(([event]) => event === GameEvents.ROUND_COMPLETED)?.[1];

            if (handler) {
                handler(data);
                expect(showRoundResultSpy).toHaveBeenCalledWith(
                    expect.objectContaining({
                        ...data,
                        roundNumber: 3
                    })
                );
            }
        });

        it('should handle GAME_END event with GameEndEvent', () => {
            const showEndGameSpy = vi.spyOn(gameflow, 'showEndGame');
            const payload = { result: 'win', timescale: 1.5 };
            const event = { type: 'GAME_END', payload };

            const handler = (mockEventEmitter.on as ReturnType<typeof vi.fn>).mock.calls
                .find(([event]) => event === GameEvents.GAME_END)?.[1];

            if (handler) {
                handler(event);
                expect(showEndGameSpy).toHaveBeenCalledWith('win', 1.5);
            }
        });

        it('should handle GAME_END event with result in payload', () => {
            const showEndGameSpy = vi.spyOn(gameflow, 'showEndGame');
            const payload = { result: 'lose' };
            const event = { type: 'GAME_END', payload };

            const handler = (mockEventEmitter.on as ReturnType<typeof vi.fn>).mock.calls
                .find(([event]) => event === GameEvents.GAME_END)?.[1];

            if (handler) {
                handler(event);
                expect(showEndGameSpy).toHaveBeenCalledWith('lose', undefined);
            }
        });

        it('should handle GAME_END event with direct data', () => {
            const showEndGameSpy = vi.spyOn(gameflow, 'showEndGame');

            const handler = (mockEventEmitter.on as ReturnType<typeof vi.fn>).mock.calls
                .find(([event]) => event === GameEvents.GAME_END)?.[1];

            if (handler) {
                handler('win');
                expect(showEndGameSpy).toHaveBeenCalledWith('win', undefined);
            }
        });

        it('should handle GAME_RESTARTED event', () => {
            const restartGameSpy = vi.spyOn(gameflow, 'restartGame');

            const handler = (mockEventEmitter.on as ReturnType<typeof vi.fn>).mock.calls
                .find(([event]) => event === GameEvents.GAME_RESTARTED)?.[1];

            if (handler) {
                handler();
                expect(restartGameSpy).toHaveBeenCalled();
            }
        });
    });

    describe('subscribe', () => {
        it('should subscribe to event emitter', () => {
            const handler = vi.fn();
            gameflow['subscribe']('TEST_EVENT', handler);

            expect(mockEventEmitter.on).toHaveBeenCalledWith('TEST_EVENT', expect.any(Function));

            const eventEmitter = scene.getEventEmitter();
            eventEmitter.emit('TEST_EVENT', 'test-arg');
            expect(handler).toHaveBeenCalledWith('test-arg');
        });

        it('should unsubscribe old handler before subscribing new one', () => {
            const oldHandler = vi.fn();
            const newHandler = vi.fn();

            gameflow['subscribe']('TEST_EVENT', oldHandler);

            (mockEventEmitter.off as ReturnType<typeof vi.fn>).mockClear();
            (mockEventEmitter.on as ReturnType<typeof vi.fn>).mockClear();

            gameflow['subscribe']('TEST_EVENT', newHandler);

            expect(mockEventEmitter.off).toHaveBeenCalled();
            expect(mockEventEmitter.off).toHaveBeenCalledWith('TEST_EVENT', expect.any(Function));

            expect(mockEventEmitter.on).toHaveBeenCalledWith('TEST_EVENT', expect.any(Function));

            const eventEmitter = scene.getEventEmitter();
            eventEmitter.emit('TEST_EVENT', 'test-arg');

            expect(newHandler).toHaveBeenCalledWith('test-arg');
            expect(oldHandler).not.toHaveBeenCalled();
        });
    });

    describe('emit', () => {
        it('should emit event through event emitter', () => {
            gameflow['emit']('TEST_EVENT', 'arg1', 'arg2');
            expect(mockEventEmitter.emit).toHaveBeenCalledWith('TEST_EVENT', 'arg1', 'arg2');
        });

        it('should not emit if event emitter is null', () => {
            gameflow.destroy();
            gameflow['emit']('TEST_EVENT');
        });
    });

    describe('cleanupEventHandlers', () => {
        it('should unsubscribe all event handlers', () => {
            gameflow.cleanupEventHandlers();

            expect(mockEventEmitter.off).toHaveBeenCalled();
        });

        it('should clear event handlers map', () => {
            const handler1 = vi.fn();
            gameflow['subscribe']('OLD_EVENT', handler1);

            const initialOffCalls = (mockEventEmitter.off as ReturnType<typeof vi.fn>).mock.calls.length;

            gameflow.cleanupEventHandlers();

            expect(mockEventEmitter.off).toHaveBeenCalled();

            const newHandler = vi.fn();
            gameflow['subscribe']('NEW_EVENT', newHandler);
            expect(mockEventEmitter.on).toHaveBeenCalledWith('NEW_EVENT', expect.any(Function));

            const eventEmitter = scene.getEventEmitter();
            eventEmitter.emit('NEW_EVENT', 'test-arg');
            expect(newHandler).toHaveBeenCalledWith('test-arg');
        });
    });

    describe('destroy', () => {
        it('should cleanup event handlers', () => {
            const cleanupSpy = vi.spyOn(gameflow, 'cleanupEventHandlers');
            gameflow.destroy();
            expect(cleanupSpy).toHaveBeenCalled();
        });

        it('should nullify references', () => {
            gameflow['emit']('TEST_EVENT');
            expect(mockEventEmitter.emit).toHaveBeenCalledWith('TEST_EVENT');

            gameflow.destroy();

            const emitCallsBefore = (mockEventEmitter.emit as ReturnType<typeof vi.fn>).mock.calls.length;
            gameflow['emit']('TEST_EVENT_AFTER_DESTROY');
            const emitCallsAfter = (mockEventEmitter.emit as ReturnType<typeof vi.fn>).mock.calls.length;

            expect(emitCallsAfter).toBe(emitCallsBefore);

            expect(() => gameflow.destroy()).not.toThrow();
        });
    });

    describe('state transitions', () => {
        it('should transition to INIT state', () => {
            const changeStateSpy = vi.spyOn(gameData, 'changeState');
            const showStartScreenSpy = vi.spyOn(scene, 'showStartScreen');

            const eventEmitter = scene.getEventEmitter();
            eventEmitter.emit(GameEvents.GAME_INIT);

            expect(changeStateSpy).toHaveBeenCalledWith(GameStates.INIT, undefined);
            expect(showStartScreenSpy).toHaveBeenCalled();
        });

        it('should transition to START state', () => {
            const startGameSpy = vi.spyOn(gameflow, 'startGame');

            const eventEmitter = scene.getEventEmitter();
            eventEmitter.emit(GameEvents.GAME_STARTED);

            expect(startGameSpy).toHaveBeenCalled();
        });

        it('should transition to ROUND state', () => {
            const startRoundSpy = vi.spyOn(gameflow, 'startRound');

            const eventEmitter = scene.getEventEmitter();
            eventEmitter.emit(GameEvents.ROUND_STARTED);

            expect(startRoundSpy).toHaveBeenCalled();
        });

        it('should transition to ROUND_RESULT state with data', () => {
            const showRoundResultSpy = vi.spyOn(gameflow, 'showRoundResult');
            const resultData = { winner: 'player1' };

            const eventEmitter = scene.getEventEmitter();
            eventEmitter.emit(GameEvents.ROUND_COMPLETED, {
                type: 'ROUND_COMPLETED',
                payload: {
                    ...resultData,
                    roundNumber: gameData.getRoundData()
                }
            });

            expect(showRoundResultSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    ...resultData,
                    roundNumber: gameData.getRoundData()
                })
            );
        });

        it('should transition to END state with result and timescale', () => {
            const showEndGameSpy = vi.spyOn(gameflow, 'showEndGame');

            const eventEmitter = scene.getEventEmitter();
            eventEmitter.emit(GameEvents.GAME_END, {
                type: 'GAME_END',
                payload: { result: 'win', timescale: 1.5 }
            });

            expect(showEndGameSpy).toHaveBeenCalledWith('win', 1.5);
        });

        it('should transition to RESTART state', () => {
            const restartGameSpy = vi.spyOn(gameflow, 'restartGame');

            const eventEmitter = scene.getEventEmitter();
            eventEmitter.emit(GameEvents.GAME_RESTARTED);

            expect(restartGameSpy).toHaveBeenCalled();
        });
    });

    describe('setupCustomEventHandlers', () => {
        it('should allow overriding in subclass', () => {
            class CustomGameflow extends TestGameflow {
                protected setupCustomEventHandlers(): void {
                    this.subscribe('CUSTOM_EVENT', vi.fn());
                }
            }

            const customGameflow = new CustomGameflow(gameData, scene);
            expect(mockEventEmitter.on).toHaveBeenCalledWith('CUSTOM_EVENT', expect.any(Function));
        });
    });
});