export type RoundResultData = {
    playerMove: string;
    opponentMove: string;
    playerScore: number;
    opponentScore: number;
    roundWinner: 'player' | 'opponent' | 'tie';
    result: string | null;
};
