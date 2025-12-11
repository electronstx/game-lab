import { GameData, GameStateName } from "@parity-games/core";
import { ThrowResult, Frame, ScoreboardData } from "./types.js";
import { isBowlingGameSettings } from "../utils/guards.js";

export default class BowlingGameData extends GameData {
    #player1Score: number = 0;
    #player2Score: number = 0;
    #pinsKnockedDown: number = 0;
    #totalPins: number = 10;
    #player1Frames: Frame[] = [];
    #player2Frames: Frame[] = [];
    #currentPlayer: 1 | 2 = 1;
    #currentFrame: number = 0;
    #currentThrow: number = 1;

    constructor(initialState: GameStateName) {
        super(initialState);
    }

    #getNumberOfFrames(): number {
        if (isBowlingGameSettings(this.gameSettings)) {
            return this.gameSettings.numberOfFrames;
        }
        return 10;
    }

    initializeFrames(): void {
        const numberOfFrames = this.#getNumberOfFrames();
        this.#player1Frames = Array.from({ length: numberOfFrames }, () => ({
            throw1: null,
            throw2: null,
            throw3: null,
            frameScore: null,
            isStrike: false,
            isSpare: false
        }));
        this.#player2Frames = Array.from({ length: numberOfFrames }, () => ({
            throw1: null,
            throw2: null,
            throw3: null,
            frameScore: null,
            isStrike: false,
            isSpare: false
        }));
    }

    override getGameData(): { numberOfFrames: number, playerScore: number, opponentScore: number } {
        return { 
            numberOfFrames: this.#getNumberOfFrames(), 
            playerScore: this.#player1Score, 
            opponentScore: this.#player2Score 
        };
    }

    override getRoundData(): number {
        return this.#currentFrame + 1;
    }

    override getRoundResultData(): ThrowResult {
        const frames = this.#currentPlayer === 1 ? this.#player1Frames : this.#player2Frames;
        const frame = frames[this.#currentFrame];
        
        const isStrike = this.#pinsKnockedDown === 10 && this.#currentThrow === 1;
        
        let isSpare = false;
        if (this.#currentThrow === 2 && frame && frame.throw1 !== null) {
            isSpare = frame.throw1 !== 10 && (frame.throw1 + this.#pinsKnockedDown === 10);
        }
    
        return {
            pinsKnockedDown: this.#pinsKnockedDown,
            totalPins: this.#totalPins,
            isStrike,
            isSpare
        };
    }

    getCurrentPlayer(): 1 | 2 {
        return this.#currentPlayer;
    }

    getScoreboardData(): ScoreboardData {
        return {
            player1Frames: [...this.#player1Frames],
            player2Frames: [...this.#player2Frames],
            currentPlayer: this.#currentPlayer,
            currentFrame: this.#currentFrame,
            currentThrow: this.#currentThrow,
            player1TotalScore: this.#player1Score,
            player2TotalScore: this.#player2Score
        };
    }

    setThrowResult(pinsKnockedDown: number): void {
        this.#pinsKnockedDown = pinsKnockedDown;
        const frames = this.#currentPlayer === 1 ? this.#player1Frames : this.#player2Frames;
        const frame = frames[this.#currentFrame];
        
        if (!frame) return;
    
        if (this.#currentThrow === 1) {
            frame.throw1 = pinsKnockedDown;
            frame.isStrike = pinsKnockedDown === 10;
            
            if (frame.isStrike && !this.#isLastFrame()) {
            } else {
                this.#currentThrow = 2;
            }
        } else if (this.#currentThrow === 2) {
            frame.throw2 = pinsKnockedDown;
            
            if (frame.throw1 !== null && frame.throw1 !== 10 && (frame.throw1 + pinsKnockedDown === 10)) {
                frame.isSpare = true;
            } else {
                frame.isSpare = false;
            }
            
            if (!this.#isLastFrame()) {
            } else {
                const firstThrowWasStrike = frame.throw1 === 10;
                if (firstThrowWasStrike || frame.isSpare) {
                    this.#currentThrow = 3;
                } else {
                    this.#calculateFrameScore(this.#currentFrame, frames);
                }
            }
        } else if (this.#currentThrow === 3) {
            frame.throw3 = pinsKnockedDown;
            this.#calculateFrameScore(this.#currentFrame, frames);
        }
    
        this.#recalculateScores(frames);
    
        const frameCompleted = this.#isFrameCompleted(frame, this.#currentFrame);
        if (frameCompleted) {
            this.#switchPlayer();
        }
    }

    #isLastFrame(): boolean {
        return this.#currentFrame === this.#getNumberOfFrames() - 1;
    }

    #isLastFrameIndex(frameIndex: number): boolean {
        return frameIndex === this.#getNumberOfFrames() - 1;
    }

    #isFrameCompleted(frame: Frame, frameIndex?: number): boolean {
        const numberOfFrames = this.#getNumberOfFrames();
        const isLastFrame = frameIndex !== undefined 
            ? frameIndex === numberOfFrames - 1
            : this.#isLastFrame();
        
        if (!isLastFrame) {
            return frame.isStrike || (frame.throw1 !== null && frame.throw2 !== null);
        } else {
            if (frame.isStrike || frame.isSpare) {
                return frame.throw3 !== null;
            } else {
                return frame.throw1 !== null && frame.throw2 !== null;
            }
        }
    }

    #switchPlayer(): void {
        if (this.#currentPlayer === 1) {
            this.#currentPlayer = 2;
            this.#currentThrow = 1;
        } else {
            this.#currentPlayer = 1;
            this.#currentFrame++;
            this.#currentThrow = 1;
        }
    }

    #calculateFrameScore(frameIndex: number, frames: Frame[]): void {
        const frame = frames[frameIndex];
        if (!frame) return;

        const numberOfFrames = this.#getNumberOfFrames();

        if (this.#isLastFrameIndex(frameIndex)) {
            let score = 0;
            if (frame.throw1 !== null) score += frame.throw1;
            if (frame.throw2 !== null) score += frame.throw2;
            if (frame.throw3 !== null) score += frame.throw3;
            frame.frameScore = score;
            this.#updateTotalScore();
            return;
        }

        const nextFrame = frames[frameIndex + 1];
        if (!nextFrame) {
            frame.frameScore = null;
            return;
        }

        if (frame.isStrike) {
            if (nextFrame.isStrike) {
                const isSecondToLastFrame = frameIndex === numberOfFrames - 2;
                if (!isSecondToLastFrame) {
                    const nextNextFrame = frames[frameIndex + 2];
                    if (nextNextFrame && nextNextFrame.throw1 !== null) {
                        frame.frameScore = 10 + 10 + nextNextFrame.throw1;
                        this.#updateTotalScore();
                    } else {
                        frame.frameScore = null;
                    }
                } else {
                    if (nextFrame.throw1 !== null && nextFrame.throw2 !== null) {
                        frame.frameScore = 10 + nextFrame.throw1 + nextFrame.throw2;
                        this.#updateTotalScore();
                    } else {
                        frame.frameScore = null;
                    }
                }
            } else {
                if (nextFrame.throw1 !== null && nextFrame.throw2 !== null) {
                    frame.frameScore = 10 + nextFrame.throw1 + nextFrame.throw2;
                    this.#updateTotalScore();
                } else {
                    frame.frameScore = null;
                }
            }
        } else if (frame.isSpare) {
            if (nextFrame && nextFrame.throw1 !== null) {
                frame.frameScore = 10 + nextFrame.throw1;
                this.#updateTotalScore();
            } else {
                frame.frameScore = null;
            }
        } else {
            if (frame.throw1 !== null && frame.throw2 !== null) {
                let score = 0;
                if (frame.throw1 !== null) score += frame.throw1;
                if (frame.throw2 !== null) score += frame.throw2;
                frame.frameScore = score;
                this.#updateTotalScore();
            } else {
                frame.frameScore = null;
            }
        }
    }

    #recalculateScores(frames: Frame[]): void {
        for (let i = 0; i < frames.length; i++) {
            const frame = frames[i];

            if (frame && (frame.throw1 !== null || frame.throw2 !== null || frame.throw3 !== null)) {
                this.#calculateFrameScore(i, frames);
            }
        }
    }

    #updateTotalScore(): void {
        this.#player1Score = this.#player1Frames.reduce((sum, frame) => {
            return sum + (frame.frameScore || 0);
        }, 0);
        this.#player2Score = this.#player2Frames.reduce((sum, frame) => {
            return sum + (frame.frameScore || 0);
        }, 0);
    }

    checkEndGame(): string | null {
        const numberOfFrames = this.#getNumberOfFrames();
        const lastFrameIndex = numberOfFrames - 1;
        const player1LastFrame = this.#player1Frames[lastFrameIndex];
        const player2LastFrame = this.#player2Frames[lastFrameIndex];
        
        const player1Completed = this.#isFrameCompleted(player1LastFrame, lastFrameIndex);
        const player2Completed = this.#isFrameCompleted(player2LastFrame, lastFrameIndex);
        
        if (player1Completed && player2Completed) {
            if (this.#player1Score > this.#player2Score) {
                return 'Player 1 wins!';
            } else if (this.#player2Score > this.#player1Score) {
                return 'Player 2 wins!';
            } else {
                return 'Tie game!';
            }
        }
        
        return null;
    }

    shouldResetAllPins(): boolean {
        const frames = this.#currentPlayer === 1 
            ? this.#player1Frames 
            : this.#player2Frames;
        const frame = frames[this.#currentFrame];
    
        if (this.#currentThrow === 1) {
            return true;
        }
        
        if (this.#currentThrow === 2 && this.#isLastFrame() && frame?.throw1 === 10) {
            return true;
        }
        
        if (this.#currentThrow === 3 && this.#isLastFrame()) {
            return true;
        }
        
        return false;
    }

    canProcessThrowResult(): boolean {
        const frames = this.#currentPlayer === 1 
            ? this.#player1Frames 
            : this.#player2Frames;
        const frame = frames[this.#currentFrame];
        
        if (!frame) return false;
        
        const currentThrow = this.#currentThrow;
        return !(
            (currentThrow === 1 && frame.throw1 !== null) ||
            (currentThrow === 2 && frame.throw2 !== null) ||
            (currentThrow === 3 && frame.throw3 !== null)
        );
    }

    resetPins(): void {
        this.#pinsKnockedDown = 0;
        this.#totalPins = 10;
    }

    override resetData(): void {
        this.#player1Score = 0;
        this.#player2Score = 0;
        this.#pinsKnockedDown = 0;
        this.#totalPins = 10;
        this.#currentFrame = 0;
        this.#currentThrow = 1;
        this.#currentPlayer = 1;
    }
}