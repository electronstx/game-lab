import type { SoundService, SoundSettingsState } from '@game-lab/core';
import { useEffect, useState } from 'react';

export const useSoundSettings = (soundService: SoundService) => {
    const [soundSettings, setSoundSettings] = useState<SoundSettingsState>(
        soundService.getSettings(),
    );

    useEffect(() => {
        const unsubscribe = soundService.subscribe((settings) => {
            setSoundSettings(settings);
        });

        return () => {
            unsubscribe();
        };
    }, [soundService]);

    const toggleSound = () => soundService.toggleSound();
    const toggleMusic = () => soundService.toggleMusic();

    return {
        soundSettings,
        toggleSound,
        toggleMusic,
    };
};
