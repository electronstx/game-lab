import { handleErrorSilently, StateError, ValidationError } from '@game-lab/errors';
import { type GameState, type GameStateName, GameStates } from './types';

export default abstract class GameData {
    protected gameSettings: Record<string, unknown>;
    protected currentState: GameStateName;
    protected stateHistory: GameState[] = [];

    constructor(initialState: GameStateName = GameStates.INIT) {
        this.gameSettings = {};
        this.currentState = initialState;
        this.stateHistory.push({
            name: initialState,
            enteredAt: Date.now(),
        });
    }

    setGameSettings(settings: Record<string, unknown>): void {
        if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
            const validationError = new ValidationError('Invalid game settings provided', {
                component: 'GameData',
                method: 'setGameSettings',
            });
            handleErrorSilently(validationError);
            return;
        }
        this.gameSettings = settings;
    }

    getCurrentState(): GameStateName {
        return this.currentState;
    }

    changeState(newState: GameStateName, metadata?: Record<string, unknown>): void {
        if (!Object.values(GameStates).includes(newState)) {
            const stateError = new StateError(`Invalid state "${newState}"`, newState, {
                component: 'GameData',
                method: 'changeState',
            });
            handleErrorSilently(stateError);
            return;
        }

        const previousState = this.currentState;
        this.currentState = newState;

        this.stateHistory.push({
            name: newState,
            previousState,
            enteredAt: Date.now(),
            metadata,
        });

        const MAX_HISTORY_SIZE = 100;
        if (this.stateHistory.length > MAX_HISTORY_SIZE) {
            this.stateHistory = this.stateHistory.slice(-MAX_HISTORY_SIZE);
        }
    }

    getStateHistory(): readonly GameState[] {
        return this.stateHistory;
    }

    getPreviousState(): GameStateName | undefined {
        const lastState = this.stateHistory[this.stateHistory.length - 1];
        return lastState?.previousState;
    }

    clearStateHistory(): void {
        const current = this.stateHistory[this.stateHistory.length - 1];
        this.stateHistory = current ? [current] : [];
    }

    reset(): void {
        this.gameSettings = {};
        const initialState = GameStates.INIT;
        this.currentState = initialState;
        this.stateHistory = [
            {
                name: initialState,
                enteredAt: Date.now(),
            },
        ];
        this.resetData();
    }

    destroy(): void {
        this.gameSettings = {};
        this.stateHistory = [];
        this.currentState = GameStates.INIT;
        this.resetData();
    }

    abstract getGameData(): Record<string, unknown>;
    abstract getRoundData(): number;
    abstract getRoundResultData(): Record<string, unknown>;
    abstract resetData(): void;
}
