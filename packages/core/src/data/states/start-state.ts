import { GameState } from "./types.js";
import { GameStateManager } from "./game-state-manager.js";

export abstract class StartState implements GameState {
    enter(gameStateManager: GameStateManager): void {   
        const hudData = gameStateManager.gameData.getHUDData();
        gameStateManager.scene.initHUD(hudData);
        
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