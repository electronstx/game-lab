export type Game = {
    init(parent: HTMLDivElement): Promise<Game>;
    destroy(): void;
}

export type RpsGameSettings = {
    bestOf: number;
}

export type RpsMove = 'rock' | 'paper' | 'scissors';