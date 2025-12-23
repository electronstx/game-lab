import { CreateForm, ErrorBoundary, FooterPanel, GameContainer, HeaderPanel, SoundSettings } from "@game-lab/ui";
import { RpsGameSettings } from "./components/ui/features/RpsGameSettings/RpsGameSettings.js";
import { useSoundSettings } from "./utils/hooks/useSoundSettings.js";
import { useRpsGame } from "./utils/hooks/useRpsGame.js";
import { SoundService } from "@game-lab/core";
import { useEffect, useMemo } from "react";

export const RpsGamePage = () => {
    const soundService = useMemo(() => new SoundService(), []);
    const { soundSettings, toggleSound, toggleMusic } = useSoundSettings(soundService);
    const { containerRef, startGame, isGameStarted } = useRpsGame(soundService);

    useEffect(() => {
        return () => {
            soundService.cleanup();
        };
    }, [soundService]);

    return (
        <ErrorBoundary>
            <HeaderPanel title={'Rock Paper Scissors'}>
                <SoundSettings
                    settings={soundSettings}
                    onToggleSound={toggleSound}
                    onToggleMusic={toggleMusic}
                />
            </HeaderPanel>
            {!isGameStarted && (
                <CreateForm>
                    <RpsGameSettings onStart={startGame} />
                </CreateForm>
            )}
            <GameContainer containerRef={containerRef} />
            <FooterPanel />
        </ErrorBoundary>
    );
};