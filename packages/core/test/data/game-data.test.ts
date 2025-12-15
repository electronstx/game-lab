import { describe, it, expect, beforeEach, vi } from 'vitest';
import GameData from '../../src/data/game-data.js';
import { GameStates, GameStateName } from '../../src/data/types.js';

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

    setTestData(data: Record<string, unknown>): void {
        this.testData = data;
    }

    setRoundNumber(round: number): void {
        this.roundNumber = round;
    }

    setRoundResult(result: Record<string, unknown>): void {
        this.roundResult = result;
    }
}

describe('GameData', () => {
    let gameData: TestGameData;

    beforeEach(() => {
        gameData = new TestGameData();
    });

    describe('constructor', () => {
        it('should initialize with default INIT state', () => {
            const data = new TestGameData();
            expect(data.getCurrentState()).toBe(GameStates.INIT);
            expect(data.getStateHistory()).toHaveLength(1);
            expect(data.getStateHistory()[0].name).toBe(GameStates.INIT);
            expect(data.getStateHistory()[0].enteredAt).toBeDefined();
        });

        it('should initialize with custom initial state', () => {
            const data = new TestGameData(GameStates.START);
            expect(data.getCurrentState()).toBe(GameStates.START);
            expect(data.getStateHistory()[0].name).toBe(GameStates.START);
        });

        it('should initialize with empty game settings', () => {
            expect(gameData.getGameData()).toEqual({});
        });
    });

    describe('setGameSettings', () => {
        it('should set valid game settings', () => {
            const settings = { difficulty: 'hard', players: 2 };
            gameData.setGameSettings(settings);
        });

        it('should not set settings if null', () => {
            gameData.setGameSettings(null as unknown as Record<string, unknown>);
        });

        it('should not set settings if array', () => {
            gameData.setGameSettings([] as unknown as Record<string, unknown>);
        });

        it('should not set settings if not an object', () => {
            gameData.setGameSettings('invalid' as unknown as Record<string, unknown>);
        });
    });

    describe('getCurrentState', () => {
        it('should return current state', () => {
            expect(gameData.getCurrentState()).toBe(GameStates.INIT);
        });
    });

    describe('changeState', () => {
        it('should change state to valid new state', () => {
            gameData.changeState(GameStates.START);
            expect(gameData.getCurrentState()).toBe(GameStates.START);
            expect(gameData.getStateHistory()).toHaveLength(2);
        });

        it('should store previous state in history', () => {
            gameData.changeState(GameStates.START);
            gameData.changeState(GameStates.ROUND);

            const history = gameData.getStateHistory();
            expect(history[2].name).toBe(GameStates.ROUND);
            expect(history[2].previousState).toBe(GameStates.START);
        });

        it('should store metadata in history', () => {
            const metadata = { score: 100, level: 5 };
            gameData.changeState(GameStates.ROUND, metadata);

            const history = gameData.getStateHistory();

            expect(history[1].metadata).toEqual(metadata);
        });

        it('should not change state if invalid state name', () => {
            const initialState = gameData.getCurrentState();
            gameData.changeState('invalid' as GameStateName);
            expect(gameData.getCurrentState()).toBe(initialState);
        });

        it('should limit history size to 100', () => {
            for (let i = 0; i < 150; i++) {
                gameData.changeState(GameStates.ROUND);
                gameData.changeState(GameStates.ROUND_RESULT);
            }

            expect(gameData.getStateHistory().length).toBeLessThanOrEqual(100);
        });

        it('should store enteredAt timestamp', () => {
            const beforeTime = Date.now();
            gameData.changeState(GameStates.START);
            const afterTime = Date.now();

            const history = gameData.getStateHistory();
            const enteredAt = history[1].enteredAt;
            expect(enteredAt).toBeDefined();
            expect(enteredAt).toBeGreaterThanOrEqual(beforeTime);
            expect(enteredAt).toBeLessThanOrEqual(afterTime);
        });
    });

    describe('getStateHistory', () => {
        it('should return readonly history array', () => {
            const history = gameData.getStateHistory();
            expect(Array.isArray(history)).toBe(true);
            expect(history.length).toBe(1);
        });

        it('should return all state transitions', () => {
            gameData.changeState(GameStates.START);
            gameData.changeState(GameStates.ROUND);
            gameData.changeState(GameStates.ROUND_RESULT);

            const history = gameData.getStateHistory();
            expect(history.length).toBe(4);
            expect(history.map(s => s.name)).toEqual([
                GameStates.INIT,
                GameStates.START,
                GameStates.ROUND,
                GameStates.ROUND_RESULT
            ]);
        });
    });

    describe('getPreviousState', () => {
        it('should return undefined for initial state', () => {
            expect(gameData.getPreviousState()).toBeUndefined();
        });

        it('should return previous state after state change', () => {
            gameData.changeState(GameStates.START);
            expect(gameData.getPreviousState()).toBe(GameStates.INIT);

            gameData.changeState(GameStates.ROUND);
            expect(gameData.getPreviousState()).toBe(GameStates.START);
        });
    });

    describe('clearStateHistory', () => {
        it('should clear history but keep current state', () => {
            gameData.changeState(GameStates.START);
            gameData.changeState(GameStates.ROUND);
            gameData.changeState(GameStates.ROUND_RESULT);

            const currentState = gameData.getCurrentState();
            gameData.clearStateHistory();

            const history = gameData.getStateHistory();
            expect(history.length).toBe(1);
            expect(history[0].name).toBe(currentState);
            expect(gameData.getCurrentState()).toBe(currentState);
        });

        it('should handle empty history', () => {
            const data = new TestGameData();
            data.clearStateHistory();
            expect(data.getStateHistory().length).toBe(1);
        });
    });

    describe('reset', () => {
        it('should reset to initial state', () => {
            gameData.changeState(GameStates.START);
            gameData.changeState(GameStates.ROUND);
            gameData.setTestData({ score: 100 });
            gameData.setRoundNumber(5);

            gameData.reset();

            expect(gameData.getCurrentState()).toBe(GameStates.INIT);
            expect(gameData.getStateHistory().length).toBe(1);
            expect(gameData.getStateHistory()[0].name).toBe(GameStates.INIT);
        });

        it('should call resetData', () => {
            gameData.setTestData({ score: 100 });
            gameData.setRoundNumber(5);
            gameData.setRoundResult({ winner: 'player1' });

            gameData.reset();

            expect(gameData.getGameData()).toEqual({});
            expect(gameData.getRoundData()).toBe(0);
            expect(gameData.getRoundResultData()).toEqual({});
        });
    });

    describe('destroy', () => {
        it('should clear all data and reset to INIT', () => {
            gameData.changeState(GameStates.START);
            gameData.changeState(GameStates.ROUND);
            gameData.setTestData({ score: 100 });

            gameData.destroy();

            expect(gameData.getCurrentState()).toBe(GameStates.INIT);
            expect(gameData.getStateHistory().length).toBe(0);
        });

        it('should call resetData', () => {
            gameData.setTestData({ score: 100 });
            gameData.setRoundNumber(5);

            gameData.destroy();

            expect(gameData.getGameData()).toEqual({});
            expect(gameData.getRoundData()).toBe(0);
        });
    });

    describe('abstract methods', () => {
        it('should implement getGameData', () => {
            const data = { score: 100 };
            gameData.setTestData(data);
            expect(gameData.getGameData()).toEqual(data);
        });

        it('should implement getRoundData', () => {
            gameData.setRoundNumber(3);
            expect(gameData.getRoundData()).toBe(3);
        });

        it('should implement getRoundResultData', () => {
            const result = { winner: 'player1', score: 10 };
            gameData.setRoundResult(result);
            expect(gameData.getRoundResultData()).toEqual(result);
        });
    });
});