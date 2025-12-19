import { GameError } from "@parity-games/errors";

export type GameContainerProps = {
    containerRef: React.RefObject<HTMLDivElement>;
    onError?: (error: GameError) => void;
}