import { describe, expect, it } from 'vitest';
import { SoundService } from '../../../src/index.js';
import { createSoundService } from '../../../src/services/sound/index.js';

describe('createSoundService', () => {
    it('should create a new SoundService instance', () => {
        const service = createSoundService();
        expect(service).toBeInstanceOf(SoundService);
    });
});
