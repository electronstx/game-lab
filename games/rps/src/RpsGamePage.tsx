import { CreateForm, FooterPanel, GameContainer, HeaderPanel, SoundSettings } from "@parity-games/ui";
import { RpsGameSettings } from "./components/ui/features/RpsGameSettings/RpsGameSettings.js";
import { useSoundSettings } from "./utils/hooks/useSoundSettings.js";
import { useRpsGame } from "./utils/hooks/useRpsGame.js";

export const RpsGamePage = () => {
    const { soundSettings, toggleSound, toggleMusic } = useSoundSettings();
    const { createGame, startGame, isGameStarted } = useRpsGame();

    return (
        <>
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
            <GameContainer createGame={createGame}/>
            <FooterPanel />
        </>
    );
};