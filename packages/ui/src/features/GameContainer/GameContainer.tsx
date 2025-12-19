import type { GameContainerProps } from './types.js';
import './GameContainer.css';

export const GameContainer = ({ containerRef }: GameContainerProps) => {
    return (
        <div className="game-container">
            <div
                ref={containerRef}
                className="game-canvas"
            />
        </div>
    );
};