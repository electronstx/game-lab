import { CreateForm, FooterPanel, GameContainer, HeaderPanel, SoundSettings } from "@parity-games/ui";
import { useSoundSettings } from "./utils/hooks/useSoundSettings.js";
import { useBowlingGame } from "./utils/hooks/useBowlingGame.js";
import { BowlingGameSettings } from "./components/ui/features/BowlingGameSettings/BowlingGameSettings.js";
import { SoundService } from "@parity-games/core";
import { useEffect, useMemo } from "react";

export const BowlingGamePage = () => {
    const soundService = useMemo(() => new SoundService(), []);
    const { soundSettings, toggleSound, toggleMusic } = useSoundSettings(soundService);
    const { createGame, startGame, isGameStarted } = useBowlingGame(soundService);

    useEffect(() => {
        return () => {
            soundService.cleanup();
        };
    }, [soundService]);

    return (
        <>
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
            <GameContainer createGame={createGame}/>
            <FooterPanel />
        </>
    );
};