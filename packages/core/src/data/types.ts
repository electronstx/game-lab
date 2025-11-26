export type GameStateName = 'init' | 'start' | 'round' | 'round-result' | 'end';

export const GameStates = {
    INIT: 'init',
    START: 'start',
    ROUND: 'round',
    ROUND_RESULT: 'round-result',
    END: 'end',
} as const;

export type GameState = {
    name: GameStateName;
    previousState?: GameStateName;
    enteredAt?: number;
    metadata?: Record<string, any>;
};