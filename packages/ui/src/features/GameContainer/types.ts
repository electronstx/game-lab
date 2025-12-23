import { GameError } from "@game-lab/errors";

export type GameContainerProps = {
    containerRef: React.RefObject<HTMLDivElement>;
    onError?: (error: GameError) => void;
}