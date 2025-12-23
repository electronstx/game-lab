export type ThrowResult = {
    pinsKnockedDown: number;
    totalPins: number;
    isStrike: boolean;
    isSpare: boolean;
};

export type Frame = {
    throw1: number | null;
    throw2: number | null;
    throw3: number | null;
    frameScore: number | null;
    isStrike: boolean;
    isSpare: boolean;
};

export type ScoreboardData = {
    player1Frames: Frame[];
    player2Frames: Frame[];
    currentPlayer: 1 | 2;
    currentFrame: number;
    currentThrow: number;
    player1TotalScore: number;
    player2TotalScore: number;
};
