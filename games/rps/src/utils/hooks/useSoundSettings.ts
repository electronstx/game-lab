import { useEffect, useState } from 'react';
import { SoundService, SoundSettingsState } from '@parity-games/core';

export const useSoundSettings = (soundService: SoundService) => {
    const [soundSettings, setSoundSettings] = useState<SoundSettingsState>(
        soundService.getSettings()
    );
    
    useEffect(() => {
        const unsubscribe = soundService.subscribe((settings) => {
            setSoundSettings(settings);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const toggleSound = () => soundService.toggleSound();
    const toggleMusic = () => soundService.toggleMusic();

    return {
        soundSettings,
        toggleSound,
        toggleMusic,
    };
};