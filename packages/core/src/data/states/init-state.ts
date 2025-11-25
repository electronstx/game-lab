import { GameState } from "./types.js";
import { GameStateManager } from "./game-state-manager.js";

export abstract class InitState implements GameState {
    enter(gameStateManager: GameStateManager): void {
        gameStateManager.scene.showStartScreen();

        this.onEnter(gameStateManager);
    }

    exit(gameStateManager: GameStateManager): void {
        this.onExit(gameStateManager);
    }

    handleEvent(event: string, data?: any): void {
        this.onHandleEvent(event, data);
    }

    protected abstract onEnter(gameStateManager: GameStateManager): void;
    protected abstract onExit(gameStateManager: GameStateManager): void;
    protected abstract onHandleEvent(event: string, data?: any): void;
}