import { HUDComponent } from "@game-lab/core";
import BowlingScene from "../bowling-scene.js";
import * as PIXI from 'pixi.js';
import { ScoreboardData } from "../../data/types.js";

export class Scoreboard implements HUDComponent {
    #scene: BowlingScene;
    #container?: PIXI.Container;
    #numberOfFrames: number = 10;
    #player1FrameContainers: PIXI.Container[] = [];
    #player2FrameContainers: PIXI.Container[] = [];
    #player1FrameTexts: { 
        throw1: PIXI.Text;
        throw2: PIXI.Text;
        throw3: PIXI.Text | null;
        score: PIXI.Text;
    }[] = [];
    #player2FrameTexts: { 
        throw1: PIXI.Text;
        throw2: PIXI.Text;
        throw3: PIXI.Text | null;
        score: PIXI.Text;
    }[] = [];
    #player1Label?: PIXI.Text;
    #player2Label?: PIXI.Text;
    #player1TotalScore?: PIXI.Text;
    #player2TotalScore?: PIXI.Text;

    constructor(scene: BowlingScene) {
        this.#scene = scene;
    }

    create(scale: number, numberOfFrames: number): void {
        this.#container = new PIXI.Container();
        this.#numberOfFrames = numberOfFrames;
        
        const width = this.#scene.app.renderer.width;
        const height = 200 * scale;
        const y = 20 * scale;
        
        const background = new PIXI.Graphics();
        background.rect(0, 0, width, height)
            .fill({ color: 0x1a1a1a, alpha: 0.9 });
        background.roundRect(0, 0, width, height, 10 * scale);
        this.#container.addChild(background);

        const frameNumberStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 14 * scale,
            fill: '#ffffff',
            align: 'center',
            fontWeight: 'bold'
        });

        const throwStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 18 * scale,
            fill: '#ffffff',
            align: 'center',
            fontWeight: 'bold'
        });

        const scoreStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 16 * scale,
            fill: '#ffff00',
            align: 'center',
            fontWeight: 'bold'
        });

        const totalScoreStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 20 * scale,
            fill: '#00ff00',
            align: 'center',
            fontWeight: 'bold'
        });

        const frameWidth = width / 12;
        const headerHeight = 30 * scale;
        const playerRowHeight = (height - headerHeight) / 2;
        const cellHeight = playerRowHeight / 2;

        const headerText = new PIXI.Text({ 
            text: 'FRAME', 
            style: frameNumberStyle 
        });
        headerText.anchor.set(0.5);
        headerText.position.set(frameWidth / 2, headerHeight / 2);
        this.#container.addChild(headerText);

        this.#player1Label = new PIXI.Text({ 
            text: 'Player 1', 
            style: new PIXI.TextStyle({
                fontFamily: 'Arial',
                fontSize: 16 * scale,
                fill: '#ffffff',
                align: 'center',
                fontWeight: 'bold'
            })
        });
        this.#player1Label.anchor.set(0.5);
        this.#player1Label.position.set(frameWidth / 2, headerHeight + playerRowHeight / 2);
        this.#container.addChild(this.#player1Label);

        this.#player2Label = new PIXI.Text({ 
            text: 'Player 2', 
            style: new PIXI.TextStyle({
                fontFamily: 'Arial',
                fontSize: 16 * scale,
                fill: '#ffffff',
                align: 'center',
                fontWeight: 'bold'
            })
        });
        this.#player2Label.anchor.set(0.5);
        this.#player2Label.position.set(frameWidth / 2, headerHeight + playerRowHeight + playerRowHeight / 2);
        this.#container.addChild(this.#player2Label);

        for (let i = 0; i < numberOfFrames; i++) {
            const x = frameWidth * (i + 1);
            const frameNumberText = new PIXI.Text({ 
                text: (i + 1).toString(), 
                style: frameNumberStyle 
            });
            frameNumberText.anchor.set(0.5);
            frameNumberText.position.set(x + frameWidth / 2, headerHeight / 2);
            this.#container.addChild(frameNumberText);
        }

        for (let i = 0; i < numberOfFrames; i++) {
            const x = frameWidth * (i + 1);
            const result = this.#createFrameContainer(
                i, x, frameWidth, headerHeight, playerRowHeight, cellHeight, 
                scale, throwStyle, scoreStyle
            );
            this.#player1FrameContainers.push(result.container);
            this.#player1FrameTexts.push(result.texts);
            this.#container.addChild(result.container);
        }

        for (let i = 0; i < numberOfFrames; i++) {
            const x = frameWidth * (i + 1);
            const result = this.#createFrameContainer(
                i, x, frameWidth, headerHeight + playerRowHeight, playerRowHeight, cellHeight,
                scale, throwStyle, scoreStyle
            );
            this.#player2FrameContainers.push(result.container);
            this.#player2FrameTexts.push(result.texts);
            this.#container.addChild(result.container);
        }

        const totalX = frameWidth * 11;
        this.#player1TotalScore = new PIXI.Text({ text: '0', style: totalScoreStyle });
        this.#player1TotalScore.anchor.set(0.5);
        this.#player1TotalScore.position.set(totalX + frameWidth / 2, headerHeight + playerRowHeight / 2);
        this.#container.addChild(this.#player1TotalScore);

        this.#player2TotalScore = new PIXI.Text({ text: '0', style: totalScoreStyle });
        this.#player2TotalScore.anchor.set(0.5);
        this.#player2TotalScore.position.set(totalX + frameWidth / 2, headerHeight + playerRowHeight + playerRowHeight / 2);
        this.#container.addChild(this.#player2TotalScore);

        this.#container.position.y = y;
        this.#container.visible = false;
        this.#scene.addChild(this.#container);
    }

    #createFrameContainer(
        index: number, x: number, frameWidth: number, yOffset: number, 
        rowHeight: number, cellHeight: number, scale: number,
        throwStyle: PIXI.TextStyle, scoreStyle: PIXI.TextStyle
    ): { container: PIXI.Container; texts: { throw1: PIXI.Text; throw2: PIXI.Text; throw3: PIXI.Text | null; score: PIXI.Text } } {
        const frameContainer = new PIXI.Container();
        
        const line = new PIXI.Graphics();
        line.moveTo(0, 0);
        line.lineTo(0, rowHeight);
        line.stroke({ color: 0x444444, width: 1 });
        frameContainer.addChild(line);

        const throwOffset = frameWidth / 4;

        const throw1 = new PIXI.Text({ text: '', style: throwStyle });
        throw1.anchor.set(0.5);
        throw1.position.set(frameWidth / 2 - throwOffset, yOffset + cellHeight / 2);
        frameContainer.addChild(throw1);

        const throw2 = new PIXI.Text({ text: '', style: throwStyle });
        throw2.anchor.set(0.5);
        throw2.position.set(frameWidth / 2 + throwOffset, yOffset + cellHeight / 2);
        frameContainer.addChild(throw2);

        let throw3: PIXI.Text | null = null;
        if (index === this.#numberOfFrames - 1) {
            throw2.position.set(frameWidth / 2, yOffset + cellHeight / 2);
            
            throw3 = new PIXI.Text({ text: '', style: throwStyle });
            throw3.anchor.set(0.5);
            throw3.position.set(frameWidth / 2 + throwOffset, yOffset + cellHeight / 2);
            frameContainer.addChild(throw3);
        }

        const score = new PIXI.Text({ text: '', style: scoreStyle });
        score.anchor.set(0.5);
        score.position.set(frameWidth / 2, yOffset + rowHeight - 15 * scale);
        frameContainer.addChild(score);

        frameContainer.position.x = x;
        
        return {
            container: frameContainer,
            texts: {
                throw1,
                throw2,
                throw3,
                score
            }
        };
    }

    show(): void {
        if (this.#container) {
            this.#container.visible = true;
        }
    }

    hide(): void {
        if (this.#container) {
            this.#container.visible = false;
        }
    }

    setScore(playerScore: number, opponentScore: number): void {
        if (this.#player1TotalScore) {
            this.#player1TotalScore.text = playerScore.toString();
        }
        if (this.#player2TotalScore) {
            this.#player2TotalScore.text = opponentScore.toString();
        }
    }

    updateScoreboard(data: ScoreboardData): void {
        data.player1Frames.forEach((frame, index) => {
            const texts = this.#player1FrameTexts[index];
            if (texts) {
                const isCurrentFrame = data.currentPlayer === 1 && index === data.currentFrame;
                const hasData = frame.throw1 !== null || frame.throw2 !== null || frame.throw3 !== null;
                
                if (texts.throw1) {
                    if (hasData || isCurrentFrame) {
                        texts.throw1.text = this.#formatThrow(frame.throw1, frame.isStrike, false);
                    } else {
                        texts.throw1.text = '';
                    }
                }
                if (texts.throw2) {
                    if (hasData || isCurrentFrame) {
                        const isLastFrame = index === this.#numberOfFrames - 1;
                        
                        if (isLastFrame) {
                            const isStrikeOnThrow2 = frame.throw1 === 10 && frame.throw2 === 10;
                            const isSpareOnThrow2 = frame.throw1 !== null && frame.throw1 !== 10 && 
                                                   frame.throw2 !== null && (frame.throw1 + frame.throw2 === 10);
                            texts.throw2.text = this.#formatThrow(frame.throw2, isStrikeOnThrow2, isSpareOnThrow2);
                        } else {
                            texts.throw2.text = this.#formatThrow(frame.throw2, false, frame.isSpare && !frame.isStrike);
                        }
                    } else {
                        texts.throw2.text = '';
                    }
                }
                
                if (texts.throw3 && index === this.#numberOfFrames - 1) {
                    const isStrikeOnThrow3 = frame.throw3 === 10;
                    texts.throw3.text = this.#formatThrow(frame.throw3, isStrikeOnThrow3, false);
                }

                if (texts.score) {
                    if (frame.frameScore !== null) {
                        texts.score.text = frame.frameScore.toString();
                    } else {
                        texts.score.text = '';
                    }
                }
            }
        });

        data.player2Frames.forEach((frame, index) => {
            const texts = this.#player2FrameTexts[index];
            if (texts) {
                const isCurrentFrame = data.currentPlayer === 2 && index === data.currentFrame;
                const hasData = frame.throw1 !== null || frame.throw2 !== null || frame.throw3 !== null;
                
                if (texts.throw1) {
                    if (hasData || isCurrentFrame) {
                        texts.throw1.text = this.#formatThrow(frame.throw1, frame.isStrike, false);
                    } else {
                        texts.throw1.text = '';
                    }
                }
                if (texts.throw2) {
                    if (hasData || isCurrentFrame) {
                        const isLastFrame = index === this.#numberOfFrames - 1;
                        
                        if (isLastFrame) {
                            const isStrikeOnThrow2 = frame.throw1 === 10 && frame.throw2 === 10;
                            const isSpareOnThrow2 = frame.throw1 !== null && frame.throw1 !== 10 && 
                                                   frame.throw2 !== null && (frame.throw1 + frame.throw2 === 10);
                            texts.throw2.text = this.#formatThrow(frame.throw2, isStrikeOnThrow2, isSpareOnThrow2);
                        } else {
                            texts.throw2.text = this.#formatThrow(frame.throw2, false, frame.isSpare && !frame.isStrike);
                        }
                    } else {
                        texts.throw2.text = '';
                    }
                }
                
                if (texts.throw3 && index === this.#numberOfFrames - 1) {
                    const isStrikeOnThrow3 = frame.throw3 === 10;
                    texts.throw3.text = this.#formatThrow(frame.throw3, isStrikeOnThrow3, false);
                }

                if (texts.score) {
                    if (frame.frameScore !== null) {
                        texts.score.text = frame.frameScore.toString();
                    } else {
                        texts.score.text = '';
                    }
                }
            }
        });

        if (this.#player1TotalScore) {
            this.#player1TotalScore.text = data.player1TotalScore.toString();
        }
        if (this.#player2TotalScore) {
            this.#player2TotalScore.text = data.player2TotalScore.toString();
        }

        const currentPlayerFrames = data.currentPlayer === 1 ? this.#player1FrameContainers : this.#player2FrameContainers;
        const otherPlayerFrames = data.currentPlayer === 1 ? this.#player2FrameContainers : this.#player1FrameContainers;
        
        if (currentPlayerFrames[data.currentFrame]) {
            this.#highlightFrame(currentPlayerFrames[data.currentFrame], true);
        }
        
        currentPlayerFrames.forEach((container, index) => {
            if (index !== data.currentFrame) {
                this.#highlightFrame(container, false);
            }
        });
        
        otherPlayerFrames.forEach(container => {
            this.#highlightFrame(container, false);
        });

        if (this.#player1Label) {
            this.#player1Label.style.fill = data.currentPlayer === 1 ? '#ffff00' : '#ffffff';
        }
        if (this.#player2Label) {
            this.#player2Label.style.fill = data.currentPlayer === 2 ? '#ffff00' : '#ffffff';
        }
    }

    #formatThrow(value: number | null, isStrike: boolean = false, isSpare: boolean = false): string {
        if (value === null) return '';
        if (isStrike && value === 10) {
            return 'X';
        }
        if (isSpare) {
            return '/';
        }
        if (value === 0) return '0';
        return value.toString();
    }

    #highlightFrame(container: PIXI.Container, highlight: boolean): void {
        if (!container) return;

        const existingHighlight = container.children.find(child => 
            child instanceof PIXI.Graphics && (child as any).isHighlight
        );
        if (existingHighlight) {
            container.removeChild(existingHighlight);
        }

        if (highlight) {
            const highlightRect = new PIXI.Graphics();
            highlightRect.rect(0, 0, this.#scene.app.renderer.width / 12, 200 * this.#scene.gameScale)
                .fill({ color: 0xffff00, alpha: 0.2 });
            (highlightRect as any).isHighlight = true;
            container.addChildAt(highlightRect, 0);
        }
    }

    destroy(): void {
        if (this.#container) {
            this.#scene.removeChild(this.#container);
            this.#container.destroy();
        }
    }
}