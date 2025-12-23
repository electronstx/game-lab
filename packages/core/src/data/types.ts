export type GameStateName = 'init' | 'start' | 'round' | 'round-result' | 'end' | 'restart';

export const GameStates = {
    INIT: 'init',
    START: 'start',
    ROUND: 'round',
    ROUND_RESULT: 'round-result',
    END: 'end',
    RESTART: 'restart',
} as const;

export type GameState = {
    name: GameStateName;
    previousState?: GameStateName;
    enteredAt?: number;
    metadata?: Record<string, any>;
};

export type StateEnterData = {
    roundNumber?: number;
    resultData?: unknown;
    result?: unknown;
    timescale?: number;
};
