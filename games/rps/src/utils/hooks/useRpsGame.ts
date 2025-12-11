import { useCallback, useRef, useState, useEffect } from 'react';
import { RpsGame } from '../../components/game/index.js';
import { RpsGameSettings as RpsGameSettingsType } from '../../components/game/types.js';
import { GameEvents, SoundService } from '@parity-games/core';

export const useRpsGame = (soundService: SoundService) => {
    const gameRef = useRef<RpsGame | null>(null);
    const cleanupRef = useRef<(() => void) | null>(null);
    const [isGameStarted, setIsGameStarted] = useState(false);
    
    const createGame = useCallback(() => {
        if (!gameRef.current) {
            gameRef.current = new RpsGame(soundService);
        }
        return gameRef.current;
    }, [soundService]);

    const startGame = useCallback(async (settings: RpsGameSettingsType) => {
        const game = gameRef.current;
        if (!game) return;

        if (cleanupRef.current) {
            cleanupRef.current();
            cleanupRef.current = null;
        }    

        const handleGameInit = () => {
            setIsGameStarted(false);
        };

        const handleGameStarted = () => {
            setIsGameStarted(true);
        };

        game.on(GameEvents.GAME_INIT, handleGameInit);
        game.on(GameEvents.GAME_STARTED, handleGameStarted);

        cleanupRef.current = () => {
            game.off(GameEvents.GAME_INIT, handleGameStarted);
            game.off(GameEvents.GAME_STARTED, handleGameStarted);
        };

        await game.setGameSettings(settings);
        await game.startGame();
    }, []);

    useEffect(() => {
        return () => {
            if (cleanupRef.current) {
                cleanupRef.current();
            }
        };
    }, []);

    return {
        createGame,
        startGame,
        isGameStarted
    };
};