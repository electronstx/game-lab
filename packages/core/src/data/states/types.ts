import { GameEvent } from "../events.js";
import { GameStateManager } from "./game-state-manager.js";

export const GameStates = {
    INIT: 'init',
    START: 'start',
    ROUND: 'round',
    ROUND_RESULT: 'round-result',
    END: 'end',
} as const;

export type GameStateName = typeof GameStates[keyof typeof GameStates];

export type GameState = {
    enter(gameStateManager: GameStateManager): void;
    exit(gameStateManager: GameStateManager): void;
    handleEvent(event: GameEvent['type'], data?: GameEvent['payload']): void;
}