import { GameState, GameStateName, GameStates } from "./types";

export default abstract class GameData {
    protected gameSettings: any;
    protected currentState: GameStateName;
    protected stateHistory: GameState[] = [];

    constructor(gameSettings: any, initialState: GameStateName = GameStates.INIT) {
        this.gameSettings = gameSettings;
        this.currentState = initialState;
        this.stateHistory.push({
            name: initialState,
            enteredAt: Date.now(),
        });
    }

    getCurrentState(): GameStateName {
        return this.currentState;
    }

    changeState(newState: GameStateName, metadata?: Record<string, any>): void {
        const previousState = this.currentState;
        this.currentState = newState;
        
        this.stateHistory.push({
            name: newState,
            previousState,
            enteredAt: Date.now(),
            metadata,
        });
    }

    getStateHistory(): readonly GameState[] {
        return this.stateHistory;
    }

    getPreviousState(): GameStateName | undefined {
        const lastState = this.stateHistory[this.stateHistory.length - 1];
        return lastState?.previousState;
    }

    public abstract getGameSettingsData(): any;
    public abstract getRoundData(): any;
    public abstract getRoundResultData(): any;   
    public abstract resetData(): void;
}