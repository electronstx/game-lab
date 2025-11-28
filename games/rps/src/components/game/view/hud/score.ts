import { HUDComponent } from "@parity-games/core";
import RpsScene from "../rps-scene";
import * as PIXI from 'pixi.js';
import { RoundResultData } from "../../data/types";

export class Score implements HUDComponent {
    #scene: RpsScene;
    #playerScoreBack?: PIXI.Sprite;
    #playerScore?: PIXI.Text;
    #opponentScoreBack?: PIXI.Sprite;
    #opponentScore?: PIXI.Text;

    constructor(scene: RpsScene) {
        this.#scene = scene;
    }

    create(scale: number): void {
		const halfH = this.#scene.app.renderer.height / 2;
		const offsetX = 200 * scale;
        const offsetY = 50 * scale;

        const textStyle = new PIXI.TextStyle({
			fontFamily: 'Arial',
			fontSize: 80 * scale,
			fill: 'white',
			align: 'center',
			stroke: {
                color: '#050b2c',
                width: 4
            }
		});

        this.#playerScoreBack = PIXI.Sprite.from('playerScore');
        this.#playerScoreBack.anchor.set(0.5);
        this.#playerScoreBack.scale.set(0.7 * scale);
        this.#playerScoreBack.position.set(offsetX, halfH);
        this.#playerScoreBack.visible = false;
        this.#scene.addChild(this.#playerScoreBack);

        this.#playerScore = new PIXI.Text({ text: '', style: textStyle });
        this.#playerScore.anchor.set(0.5);
        this.#playerScore.position.set(offsetX, halfH + offsetY);
        this.#playerScore.visible = false;
        this.#scene.addChild(this.#playerScore);

        this.#opponentScoreBack = PIXI.Sprite.from('opponentScore');
        this.#opponentScoreBack.anchor.set(0.5);
        this.#opponentScoreBack.scale.set(0.7 * scale);
        this.#opponentScoreBack.position.set(this.#scene.app.renderer.width - offsetX, halfH);
        this.#opponentScoreBack.visible = false;
        this.#scene.addChild(this.#opponentScoreBack);

        this.#opponentScore = new PIXI.Text({ text: '', style: textStyle });
        this.#opponentScore.anchor.set(0.5);
        this.#opponentScore.position.set(this.#scene.app.renderer.width - offsetX, halfH + offsetY);
        this.#opponentScore.visible = false;
        this.#scene.addChild(this.#opponentScore);

        this.#scene.app.stage.on('ANIMATION_COMPLETED', this.updateScores.bind(this));
    }

    show(): void {
        this.#playerScoreBack && (this.#playerScoreBack.visible = true);
        this.#playerScore && (this.#playerScore.visible = true);
        this.#opponentScoreBack && (this.#opponentScoreBack.visible = true);
        this.#opponentScore && (this.#opponentScore.visible = true);
    }

    hide(): void {
        this.#playerScoreBack && (this.#playerScoreBack.visible = false);
        this.#playerScore && (this.#playerScore.visible = false);
        this.#opponentScoreBack && (this.#opponentScoreBack.visible = false);
        this.#opponentScore && (this.#opponentScore.visible = false);
    }

    updateScores(roundResultData: RoundResultData): void {
		this.#playerScore && (this.#playerScore.text = `${roundResultData.playerScore}`);
        this.#opponentScore && (this.#opponentScore.text = `${roundResultData.opponentScore}`);
	}

    setScore(playerScore: number, opponentScore: number): void{
		this.#playerScore && (this.#playerScore.text = `${playerScore}`);
		this.#opponentScore && (this.#opponentScore.text = `${opponentScore}`);
	}

	resetScore(): void {
		this.#playerScore && (this.#playerScore.text = '0');
		this.#opponentScore && (this.#opponentScore.text = '0');
	}
}