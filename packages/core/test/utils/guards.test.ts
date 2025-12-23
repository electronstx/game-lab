import { describe, expect, it } from 'vitest';
import { isGameEndEvent, isRoundCompletedEvent } from '../../src/utils/guards.js';

describe('guards', () => {
    describe('isRoundCompletedEvent', () => {
        it('should return true for valid RoundCompletedEvent', () => {
            const event = {
                type: 'ROUND_COMPLETED',
                payload: { roundNumber: 1 },
            };

            expect(isRoundCompletedEvent(event)).toBe(true);
        });

        it('should return false for invalid data', () => {
            expect(isRoundCompletedEvent(null)).toBe(false);
            expect(isRoundCompletedEvent({})).toBe(false);
            expect(isRoundCompletedEvent({ type: 'WRONG' })).toBe(false);
        });
    });

    describe('isGameEndEvent', () => {
        it('should return true for valid GameEndEvent', () => {
            const event = { type: 'GAME_END' };

            expect(isGameEndEvent(event)).toBe(true);
        });

        it('should return false for invalid data', () => {
            expect(isGameEndEvent(null)).toBe(false);
            expect(isGameEndEvent({})).toBe(false);
        });
    });
});
