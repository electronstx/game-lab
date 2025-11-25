import GameData from "../game-data.js";
import { GameEvent } from "../events.js";
import { GameState, GameStateName } from "./types.js";
import Scene from "../../view/scene.js";

export class GameStateManager {
    gameData: GameData;
    scene: Scene;
    #currentState: GameState | null = null;
    #states: Map<string, GameState> = new Map();

    constructor(scene: Scene, gameData: GameData) {
        this.scene = scene;
        this.gameData = gameData;
    }

    registerState(name: string, state: GameState): void {
        this.#states.set(name, state);
    }

    changeState(stateName: GameStateName): void {
        if (this.#currentState) {
            this.#currentState.exit(this);
        }

        const newState = this.#states.get(stateName);
        if (newState === undefined) {
            console.error(`State ${stateName} not found`);
            return;
        }

        this.#currentState = newState;
        this.#currentState.enter(this);
    }

    getCurrentState(): GameState | null {
        return this.#currentState;
    }

    handleEvent(event: GameEvent['type'], data?: GameEvent['payload']): void {
        if (this.#currentState) {
            this.#currentState.handleEvent(event, data);
        }
    }
}