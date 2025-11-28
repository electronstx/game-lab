import { GameData, GameStateName } from "@parity-games/core";
import { RoundResultData } from "./types";

export default class RpsGameData extends GameData {
    #playerScore: number = 0;
    #opponentScore: number = 0;
    #roundNumber: number = 1;
    #playerMove?: string;

    constructor(gameSettings: any, initialState: GameStateName) {
        super(gameSettings, initialState);
    }

    setPlayerMove(playerMove: string): void {
        this.#playerMove = playerMove;
    }

    override getGameSettingsData(): { playerScore: number, opponentScore: number } {
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

        this.checkRoundResult(this.#playerMove, opponentMove);

        return {
            playerMove: this.#playerMove, 
            opponentMove: opponentMove, 
            playerScore: this.#playerScore, 
            opponentScore: this.#opponentScore, 
            result: this.checkEndGame() 
        };
    }
    
    override resetData(): void {
        this.#playerScore = 0;
        this.#opponentScore = 0;
        this.#roundNumber = 1;
    }

    checkRoundResult(playerMove: string, opponentMove: string): void {
        if (playerMove === opponentMove) return;

        if ((playerMove === 'rock' && opponentMove === 'scissors')
            || (playerMove === 'scissors' && opponentMove === 'paper')
            || (playerMove === 'paper' && opponentMove === 'rock')) {
            this.#playerScore++;
        } else {
            this.#opponentScore++;
        }

        this.#roundNumber++;
    }

    checkEndGame(): string | null {
        const winsNeeded = Math.ceil(this.gameSettings.bestOf / 2);

        return this.#playerScore === winsNeeded ? 'Player wins!'
            : this.#opponentScore === winsNeeded ? 'Opponent wins!'
            : null;
    }
}