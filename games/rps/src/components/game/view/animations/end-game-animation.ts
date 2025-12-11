import { GameAnimation, GameEvents } from '@parity-games/core';
import gsap from 'gsap';
import RpsScene from '../rps-scene';
import * as PIXI from 'pixi.js';
import { playEndGameSound } from '../../sounds';
import { isGameResult } from '../../utils/guards';

export class EndGameAnimation implements GameAnimation {
	#scene: RpsScene;
    #endPanelBack?: PIXI.Graphics;
	#endText?: PIXI.Text;
	#end?: PIXI.Container;
	#endTween?: gsap.core.Tween;
	#autoRestartTimeout?: any;

	constructor(scene: RpsScene) {
		this.#scene = scene;
	}

	create(scale: number): void {
        this.#endPanelBack = new PIXI.Graphics();
        this.#endPanelBack.rect(0, 0, this.#scene.app.renderer.width, this.#scene.app.renderer.height)
            .fill({ color: 0x000000, alpha: 0.8 });
        this.#endPanelBack.visible = false;
        this.#scene.addChild(this.#endPanelBack);

		this.#end = new PIXI.Container();

		const textStyle = new PIXI.TextStyle({
			fontFamily: 'Arial',
			fontSize: 60 * scale,
			fill: 'white',
			align: 'center',
			stroke: {
                color: '#050b2c',
                width: 4
            }
		});

		this.#endText = new PIXI.Text({text: '', style: textStyle});
		this.#endText.anchor.set(0.5);
		this.#endText.scale.set(0.8 / scale);

        this.#end.scale.set(scale);
        this.#end.position.set(this.#scene.app.renderer.width / 2, this.#scene.app.renderer.height / 2);
		this.#end.addChild(this.#endText);	
	}

	display(): void {
        this.#endPanelBack && (this.#endPanelBack.visible = true);
		if (this.#end && !this.#scene.children.includes(this.#end)) {
			this.#scene.addChild(this.#end);
		}
	}

	reset(): void {
        this.#endPanelBack && (this.#endPanelBack.visible = false);
		if (this.#end && this.#scene.children.includes(this.#end)) {
			this.#scene.removeChild(this.#end);
			this.#end.visible = false;
		}

		if (this.#endTween) {
			this.#endTween.kill();
			this.#endTween = undefined;
		}

		if (this.#autoRestartTimeout) {
			clearTimeout(this.#autoRestartTimeout);
			this.#autoRestartTimeout = undefined;
		}
	}

	show(text: string): void {
		this.reset();
		this.display();

        if (!this.#end || !this.#endText || !isGameResult(text)) return;

		playEndGameSound(this.#scene.soundService, text);

		this.#end.visible = true;
		this.#endText.text = `${text}`;

		this.#end.scale.set(1);
		this.#end.alpha = 1;

		if (this.#endTween) {
			this.#endTween.kill();
		}

		this.#endTween = gsap.to(this.#end.scale, {
			x: 1.2,
			y: 1.2,
			duration: 0.8,
			ease: "power1.inOut",
			yoyo: true,
			repeat: -1
		});

		this.#autoRestartTimeout = setTimeout(() => {
			this.reset();
			this.#scene.getEventEmitter().emit(GameEvents.GAME_RESTARTED);
		}, 5000);
	}

	destroy(): void {
		this.reset();
	}
}