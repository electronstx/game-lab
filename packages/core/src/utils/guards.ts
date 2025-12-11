import { GameEndEvent, RoundCompletedEvent } from "../data/events";

export function isRoundCompletedEvent(data: unknown): data is RoundCompletedEvent {
    if (typeof data !== 'object' || data === null) {
        return false;
    }
    
    if (!('type' in data) || data.type !== 'ROUND_COMPLETED') {
        return false;
    }
    
    if (!('payload' in data)) {
        return false;
    }
    
    const payload = (data as { payload: unknown }).payload;
    if (typeof payload !== 'object' || payload === null) {
        return false;
    }
    
    return 'roundNumber' in payload && typeof (payload as { roundNumber: unknown }).roundNumber === 'number';
}

export function isGameEndEvent(data: unknown): data is GameEndEvent {
    if (typeof data !== 'object' || data === null) {
        return false;
    }
    
    if (!('type' in data) || data.type !== 'GAME_END') {
        return false;
    }
    
    if ('payload' in data) {
        const payload = (data as { payload: unknown }).payload;
        return payload === undefined || (typeof payload === 'object' && payload !== null);
    }
    
    return true;
}