import { useRef } from 'react';
import { Game } from "./components/game";

function GameContainer() {
    const gameRef = useRef<Game | null>(null);

    return (
        <div className="game-container">
            <h1>Rock Paper Scissors</h1>
            <div 
                ref={(element) => {
                    if (element && !gameRef.current) {
                        gameRef.current = new Game();
                        gameRef.current.init(element).catch((error) => {
                            console.error('Failed to initialize game:', error);
                        });
                    } else if (!element && gameRef.current) {
                        gameRef.current.destroy();
                        gameRef.current = null;
                    }
                }}
                className="game-wrapper"
            />
        </div>
    );
}
  
export default GameContainer;