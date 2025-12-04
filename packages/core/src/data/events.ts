export type GameInitEvent = {
    type: 'GAME_INIT';
    payload?: undefined;
}

export type GameStartedEvent = {
    type: 'GAME_STARTED';
    payload?: undefined;
}

export type RoundStartedEvent = {
    type: 'ROUND_STARTED';
    payload: {
        roundNumber: number;
    };
}

export type RoundCompletedEvent = {
    type: 'ROUND_COMPLETED';
    payload: {
        roundNumber: number;
        [key: string]: any;
    };
}

export type GameEndEvent = {
    type: 'GAME_END';
    payload?: {
        result?: any;
        [key: string]: any;
    };
}

export type GameRestartedEvent = {
    type: 'GAME_RESTARTED';
    payload?: undefined;
}

export type GameEvent =
    | GameStartedEvent
    | RoundStartedEvent
    | RoundCompletedEvent
    | GameEndEvent
    | GameRestartedEvent;

export const GameEvents = {
    GAME_INIT: 'GAME_INIT',
    GAME_STARTED: 'GAME_STARTED',
    ROUND_STARTED: 'ROUND_STARTED',
    ROUND_COMPLETED: 'ROUND_COMPLETED',
    GAME_END: 'GAME_END',
    GAME_RESTARTED: 'GAME_RESTARTED'
} as const;

export type GameEventType = typeof GameEvents[keyof typeof GameEvents];