import { describe, expect, it } from "vitest";
import { createSoundService } from "../../../src/services/sound/index.js";
import { SoundService } from "../../../src/index.js";

describe('createSoundService', () => {
    it('should create a new SoundService instance', () => {
        const service = createSoundService();
        expect(service).toBeInstanceOf(SoundService);
    });
});