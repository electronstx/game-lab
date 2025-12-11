import { RoundResultData } from '../data/types';
import { RpsGameSettings, RpsMove } from '../types';

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
        (data.roundWinner === 'player' || data.roundWinner === 'opponent' || data.roundWinner === 'tie') &&
        (typeof data.result === 'string' || data.result === null)
    );
}

export function isGameResult(value: unknown): value is 'Player wins!' | 'Opponent wins!' {
    return typeof value === 'string' && (value === 'Player wins!' || value === 'Opponent wins!');
}

export function isRpsGameSettings(value: unknown): value is RpsGameSettings {
    if (!value || typeof value !== 'object') return false;
    
    const settings = value as Record<string, unknown>;
    
    return (
        typeof settings.bestOf === 'number' &&
        Number.isInteger(settings.bestOf) &&
        settings.bestOf > 0
    );
}

export function isNumber(value: unknown): value is number {
    return typeof value === 'number' && !isNaN(value) && isFinite(value);
}