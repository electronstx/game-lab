export type Game = {
    init(parent: HTMLDivElement): Promise<Game>;
    destroy(): void;
}

export type GameContainerProps = {
    createGame: () => Game;
    className?: string;
    onError?: (error: Error) => void;
}