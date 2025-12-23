import type { BowlingGameSettings } from '../types';

export function isBowlingGameSettings(value: unknown): value is BowlingGameSettings {
    if (!value || typeof value !== 'object') return false;

    const settings = value as Record<string, unknown>;

    return (
        typeof settings.numberOfFrames === 'number' &&
        Number.isInteger(settings.numberOfFrames) &&
        settings.numberOfFrames > 0
    );
}

export function isGameResult(
    value: unknown,
): value is 'Player 1 wins!' | 'Player 2 wins!' | 'Tie game!' {
    return (
        typeof value === 'string' &&
        (value === 'Player 1 wins!' || value === 'Player 2 wins!' || value === 'Tie game!')
    );
}
