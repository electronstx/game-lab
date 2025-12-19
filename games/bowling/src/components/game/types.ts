export type Game = {
    init(parent: HTMLDivElement): Promise<Game>;
    destroy(): void;
}

export type BowlingGameSettings = {
    numberOfFrames: number;
}