import { GameContainer } from "@parity-games/ui";
import { RpsGame } from "./components/game/index.js";
import { useCallback } from "react";

export const RpsGameContainer = () => {
    const createGame = useCallback(() => new RpsGame(), []);

    return (
        <GameContainer 
            createGame={createGame}
            className="rps"
        />
    );
};