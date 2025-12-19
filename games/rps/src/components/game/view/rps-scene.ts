import { GameEvents, Scene, SoundService } from '@parity-games/core';
import * as PIXI from 'pixi.js';
import { Score } from './hud/score';
import { ChoicePanel } from './hud/choice-panel';
import { Round } from './hud/round';
import { RoundAnimation } from './animations/round-animation';
import { StartScreenAnimation } from './animations/start-screen-animation';
import { RoundResultData } from '../data/types';
import { EndGameAnimation } from './animations/end-game-animation';

export default class RpsScene extends Scene {
    #bg?: PIXI.Sprite;
    #score: Score;
    #choicePanel: ChoicePanel;
    #round: Round;
    #startScreenAnimation: StartScreenAnimation;
    #roundAnimation: RoundAnimation;
    #endGameAnimation: EndGameAnimation;
    #choicePanelTimeout?: ReturnType<typeof setTimeout>;

    constructor(app: PIXI.Application, soundService: SoundService, scale: number) {
        super(app, soundService, scale);

        this.#score = new Score(this);
        this.hud.addComponent(this.#score);

        this.#choicePanel = new ChoicePanel(this);
        this.hud.addComponent(this.#choicePanel);

        this.#round = new Round(this);
        this.hud.addComponent(this.#round);

        this.#startScreenAnimation = new StartScreenAnimation(this);
        this.#roundAnimation = new RoundAnimation(this);
        this.#endGameAnimation = new EndGameAnimation(this);

        this.animationManager.registerAnimation(this.#startScreenAnimation);
        this.animationManager.registerAnimation(this.#roundAnimation);
        this.animationManager.registerAnimation(this.#endGameAnimation);
    }

    override async create(): Promise<void> {
        this.app.renderer.background.color = 0x181818;

        this.#bg = PIXI.Sprite.from('background');
        this.#bg.anchor.set(0.5);
		this.#updateBackgroundSize();
        this.addChild(this.#bg);

        this.#startScreenAnimation.create(this.gameScale);
        this.#roundAnimation.create(this.gameScale);
        this.#endGameAnimation.create(this.gameScale);

        this.hud.create(this.gameScale);

        this.onResize(this.gameScale, this.app.renderer.width, this.app.renderer.height);
    }

    #updateBackgroundSize(): void {
        if (!this.#bg) return;

        const bgHeight = this.#bg.texture.height;
        const screenWidth = this.app.renderer.width;
        const screenHeight = this.app.renderer.height;

        const scaleY = screenHeight / bgHeight;

        this.#bg.scale.set(scaleY);

        this.#bg.position.set(screenWidth / 2, screenHeight / 2);
    }

    override onResize(scale: number, width: number, height: number): void {
        this.#updateBackgroundSize();
    }

    override showStartScreen(): void {
        this.animationManager.show(this.#startScreenAnimation, 'Choose number of rounds\n and start the game!');
    }

    override initHUD(playerScore: number, opponentScore: number): void {
        this.#score.setScore(playerScore, opponentScore);
        this.#score.show();
    }

    override showStartGame(): void {
        this.animationManager.reset();
        this.getEventEmitter().emit(GameEvents.ROUND_STARTED);
    }

    override showRound(roundNumber: number): void {
        this.#round.setRound(roundNumber);
        this.#round.show();

        this.#score.show();

        this.#choicePanelTimeout = setTimeout(() => {
            this.#choicePanel.show();
            this.#choicePanelTimeout = undefined;
        }, 2000);
    }

    override showRoundResult(roundResultData: RoundResultData): void {
        this.#clearChoicePanelTimeout();

        this.#score.hide();
        this.animationManager.show(this.#roundAnimation, roundResultData);
    }

    override showEndGame(result: string): void {
        this.hud.hide();
        this.animationManager.show(this.#endGameAnimation, result);
    }

    override restartGame(): void {
        this.getEventEmitter().emit(GameEvents.GAME_INIT);
    }

    #clearChoicePanelTimeout(): void {
        if (this.#choicePanelTimeout) {
            clearTimeout(this.#choicePanelTimeout);
            this.#choicePanelTimeout = undefined;
        }
    }

    override destroy(): void {
        this.#clearChoicePanelTimeout();

        super.destroy();
    }
}