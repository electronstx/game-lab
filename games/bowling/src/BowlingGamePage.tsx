import { SoundService } from '@game-lab/core';
import {
    CreateForm,
    ErrorBoundary,
    FooterPanel,
    GameContainer,
    HeaderPanel,
    SoundSettings,
} from '@game-lab/ui';
import { useEffect, useMemo } from 'react';
import { BowlingGameSettings } from './components/ui/features/BowlingGameSettings/BowlingGameSettings.js';
import { useBowlingGame } from './utils/hooks/useBowlingGame.js';
import { useSoundSettings } from './utils/hooks/useSoundSettings.js';

export const BowlingGamePage = () => {
    const soundService = useMemo(() => new SoundService(), []);
    const { soundSettings, toggleSound, toggleMusic } = useSoundSettings(soundService);
    const { containerRef, startGame, isGameStarted } = useBowlingGame(soundService);

    useEffect(() => {
        return () => {
            soundService.cleanup();
        };
    }, [soundService]);

    return (
        <ErrorBoundary>
            <HeaderPanel title={'Bowling'}>
                <SoundSettings
                    settings={soundSettings}
                    onToggleSound={toggleSound}
                    onToggleMusic={toggleMusic}
                />
            </HeaderPanel>
            {!isGameStarted && (
                <CreateForm>
                    <BowlingGameSettings onStart={startGame} />
                </CreateForm>
            )}
            <GameContainer containerRef={containerRef} />
            <FooterPanel />
        </ErrorBoundary>
    );
};
