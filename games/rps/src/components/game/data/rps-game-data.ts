import { GameData, GameStateName } from "@parity-games/core";
import { RoundResultData } from "./types";
import { isNumber } from "../utils/guards";

export default class RpsGameData extends GameData {
    #playerScore: number = 0;
    #opponentScore: number = 0;
    #roundNumber: number = 1;
    #playerMove?: string;

    constructor(initialState: GameStateName) {
        super(initialState);
    }

    setPlayerMove(playerMove: string): void {
        this.#playerMove = playerMove;
    }

    override getGameData(): { playerScore: number, opponentScore: number } {
        return { playerScore: this.#playerScore, opponentScore: this.#opponentScore };
    }

    override getRoundData(): number {
        return this.#roundNumber;
    }

    override getRoundResultData(): RoundResultData {
        if (!this.#playerMove) {
            throw new Error('Player move must be set before getting round result');
        }

        const moves = ['rock', 'paper', 'scissors'];
        const opponentMove = moves[Math.floor(Math.random() * moves.length)];

        const roundWinner = this.checkRoundResult(this.#playerMove, opponentMove);

        return {
            playerMove: this.#playerMove, 
            opponentMove: opponentMove, 
            playerScore: this.#playerScore, 
            opponentScore: this.#opponentScore, 
            roundWinner: roundWinner,
            result: this.checkEndGame() 
        };
    }
    
    override resetData(): void {
        this.#playerScore = 0;
        this.#opponentScore = 0;
        this.#roundNumber = 1;
    }

    checkRoundResult(playerMove: string, opponentMove: string): 'player' | 'opponent' | 'tie' {
        if (playerMove === opponentMove) {
            return 'tie';
        }
    
        if ((playerMove === 'rock' && opponentMove === 'scissors')
            || (playerMove === 'scissors' && opponentMove === 'paper')
            || (playerMove === 'paper' && opponentMove === 'rock')) {
            this.#playerScore++;
            this.#roundNumber++;
            return 'player';
        } else {
            this.#opponentScore++;
            this.#roundNumber++;
            return 'opponent';
        }
    }

    checkEndGame(): string | null {
        const bestOf = this.gameSettings.bestOf;

        if (!isNumber(bestOf)) return null;

        const winsNeeded = Math.ceil(bestOf / 2);

        return this.#playerScore === winsNeeded ? 'Player wins!'
            : this.#opponentScore === winsNeeded ? 'Opponent wins!'
            : null;
    }
}