import { GameState } from "./types.js";
import { GameStateManager } from "./game-state-manager.js";

export abstract class RoundState implements GameState {
    #roundNumber: number = 1;

    enter(gameStateManager: GameStateManager): void {
        const roundData = gameStateManager.gameData.getRoundData();
        gameStateManager.scene.showRound(this.#roundNumber, undefined, roundData);
        
        this.onEnter(gameStateManager);
    }

    exit(gameStateManager: GameStateManager): void {
        this.onExit(gameStateManager);
    }

    handleEvent(event: string, data?: any): void {
        this.onHandleEvent(event, data);
    }

    protected getRoundNumber(): number {
        return this.#roundNumber;
    }

    protected setRoundNumber(roundNumber: number): void {
        this.#roundNumber = roundNumber;
    }

    protected abstract onEnter(gameStateManager: GameStateManager): void;
    protected abstract onExit(gameStateManager: GameStateManager): void;
    protected abstract onHandleEvent(event: string, data?: any): void;
}