import { GameAnimation, GameEvents } from '@parity-games/core';
import gsap from 'gsap';
import RpsScene from '../rps-scene';
import * as PIXI from 'pixi.js';

export class StartScreenAnimation implements GameAnimation {
	#scene: RpsScene;
    #startPanelBack?: PIXI.Graphics;
	#startText?: PIXI.Text;
	#start?: PIXI.Container;
	#startTween?: gsap.core.Tween;

	constructor(scene: RpsScene) {
		this.#scene = scene;
	}

	create(scale: number): void {
        this.#startPanelBack = new PIXI.Graphics();
        this.#startPanelBack.rect(0, 0, this.#scene.app.renderer.width, this.#scene.app.renderer.height)
            .fill({ color: 0x000000, alpha: 0.8 });
        this.#startPanelBack.visible = false;
        this.#startPanelBack.eventMode = 'static';
        this.#startPanelBack.cursor = 'pointer';
        this.#startPanelBack.on('pointerdown', () => {
            this.reset();
            this.#scene.app.stage.emit(GameEvents.GAME_STARTED);
        });
        this.#scene.addChild(this.#startPanelBack);

		this.#start = new PIXI.Container();

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

		this.#startText = new PIXI.Text({text: '', style: textStyle});
		this.#startText.anchor.set(0.5);
		this.#startText.scale.set(0.8 / scale);

        this.#start.scale.set(scale);
        this.#start.position.set(this.#scene.app.renderer.width / 2, this.#scene.app.renderer.height / 2);
		this.#start.addChild(this.#startText);	
	}

	display(): void {
        this.#startPanelBack && (this.#startPanelBack.visible = true);
		if (this.#start && !this.#scene.children.includes(this.#start)) {
			this.#scene.addChild(this.#start);
		}
	}

	reset(): void {
        this.#startPanelBack && (this.#startPanelBack.visible = false);
		if (this.#start && this.#scene.children.includes(this.#start)) {
			this.#scene.removeChild(this.#start);
			this.#start.visible = false;
		}

		if (this.#startTween) {
			this.#startTween.kill();
			this.#startTween = undefined;
		}
	}

	show(text: string): void {
		this.reset();
		this.display();

        if (!this.#start || !this.#startText) return;

		this.#start.visible = true;
		this.#startText.text = text;	

		this.#start.scale.set(1);
		this.#start.alpha = 1;

		if (this.#startTween) {
			this.#startTween.kill();
		}

		this.#startTween = gsap.to(this.#start.scale, {
			x: 1.2,
			y: 1.2,
			duration: 0.8,
			ease: "power1.inOut",
			yoyo: true,
			repeat: -1
		});
	}

}