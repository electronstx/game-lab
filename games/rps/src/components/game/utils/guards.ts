import { RoundResultData } from '../data/types';
import { RpsMove } from '../types';

export function isRpsMove(value: unknown): value is RpsMove {
    return typeof value === 'string' && (value === 'rock' || value === 'paper' || value === 'scissors');
}

export function isRoundResultData(value: unknown): value is RoundResultData {
    if (!value || typeof value !== 'object') return false;
    
    const data = value as Record<string, unknown>;
    
    return (
        isRpsMove(data.playerMove) &&
        isRpsMove(data.opponentMove) &&
        typeof data.playerScore === 'number' &&
        typeof data.opponentScore === 'number' &&
        Number.isInteger(data.playerScore) &&
        Number.isInteger(data.opponentScore) &&
        data.playerScore >= 0 &&
        data.opponentScore >= 0 &&
        (typeof data.result === 'string' || data.result === null)
    );
}