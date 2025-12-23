import type { GameAnimation } from '@game-lab/core';
import gsap from 'gsap';
import * as PIXI from 'pixi.js';
import type { RoundResultData } from '../../data/types';
import { playFlashSound } from '../../sounds';
import { isRoundResultData } from '../../utils/guards';
import type RpsScene from '../rps-scene';

export class RoundAnimation implements GameAnimation {
    #scene: RpsScene;
    #scale?: number;
    #playerCard?: PIXI.Sprite;
    #opponentCard?: PIXI.Sprite;
    #screenFlash?: PIXI.Graphics;
    #shakeTweens?: gsap.core.Timeline[];
    #flashTimeline?: gsap.core.Timeline;
    #victoryTimeline?: gsap.core.Timeline;
    #timeouts?: ReturnType<typeof setTimeout>[];

    constructor(scene: RpsScene) {
        this.#scene = scene;
    }

    create(scale: number): void {
        this.#scale = scale;

        const halfH = this.#scene.app.renderer.height / 2;
        const offsetX = 200 * scale;

        this.#playerCard = PIXI.Sprite.from('cardBack');
        this.#playerCard.anchor.set(0.5);
        this.#playerCard.scale.set(0.5 * scale);
        this.#playerCard.position.set(offsetX, halfH);
        this.#playerCard.visible = false;
        this.#scene.addChild(this.#playerCard);

        this.#opponentCard = PIXI.Sprite.from('cardBack');
        this.#opponentCard.anchor.set(0.5);
        this.#opponentCard.scale.set(0.5 * scale);
        this.#opponentCard.position.set(this.#scene.app.renderer.width - offsetX, halfH);
        this.#opponentCard.visible = false;
        this.#scene.addChild(this.#opponentCard);

        this.#screenFlash = new PIXI.Graphics();
        this.#screenFlash
            .rect(0, 0, this.#scene.app.renderer.width, this.#scene.app.renderer.height)
            .fill({ color: 0xffffff, alpha: 1 });
        this.#screenFlash.alpha = 0;
        this.#screenFlash.visible = false;
        this.#scene.addChild(this.#screenFlash);
    }

    display(): void {
        this.#playerCard && (this.#playerCard.visible = true);
        this.#opponentCard && (this.#opponentCard.visible = true);
    }

    reset(): void {
        if (!this.#playerCard || !this.#opponentCard) return;
        if (!this.#scale) return;

        this.#cleanupAllAnimations();

        this.#playerCard.tint = 0xffffff;
        this.#opponentCard.tint = 0xffffff;

        this.#playerCard.alpha = 1;
        this.#opponentCard.alpha = 1;

        this.#playerCard.texture = PIXI.Texture.from('cardBack');
        this.#opponentCard.texture = PIXI.Texture.from('cardBack');

        this.#playerCard.scale.set(0.5 * this.#scale);
        this.#opponentCard.scale.set(0.5 * this.#scale);

        const halfH = this.#scene.app.renderer.height / 2;
        const offsetX = 200 * this.#scale;
        this.#playerCard.position.set(offsetX, halfH);
        this.#opponentCard.position.set(this.#scene.app.renderer.width - offsetX, halfH);

        this.#playerCard.visible = false;
        this.#opponentCard.visible = false;

        if (this.#screenFlash) {
            this.#screenFlash.visible = false;
            this.#screenFlash.alpha = 0;
        }

        if (this.#timeouts) {
            this.#timeouts.forEach((timeout) => clearTimeout(timeout));
            this.#timeouts = undefined;
        }
    }

    #cleanupAllAnimations(): void {
        if (this.#shakeTweens) {
            this.#shakeTweens.forEach((tween) => tween.kill());
            this.#shakeTweens = undefined;
        }

        if (this.#flashTimeline) {
            this.#flashTimeline.kill();
            this.#flashTimeline = undefined;
        }

        if (this.#victoryTimeline) {
            this.#victoryTimeline.kill();
            this.#victoryTimeline = undefined;
        }
    }

    #playShakeAnimation(card: PIXI.Sprite, duration: number = 0.5): void {
        if (!card) return;

        const originalX = card.x;
        const originalY = card.y;
        const shakeIntensity = 10;
        const shakeDuration = duration;
        const shakeCount = Math.round(16 * duration);

        const shakeTimeline = gsap.timeline();

        for (let i = 0; i < shakeCount; i++) {
            const randomX = originalX + (Math.random() - 0.5) * shakeIntensity * 2;
            const randomY = originalY + (Math.random() - 0.5) * shakeIntensity * 2;

            shakeTimeline.to(card.position, {
                x: randomX,
                y: randomY,
                duration: shakeDuration / shakeCount,
                ease: 'power1.out',
            });
        }

        shakeTimeline.to(card.position, {
            x: originalX,
            y: originalY,
            duration: 0.1,
            ease: 'power1.out',
        });

        if (!this.#shakeTweens) {
            this.#shakeTweens = [];
        }
        this.#shakeTweens.push(shakeTimeline);
    }

    #playFlashAnimation(delay: number = 0): void {
        if (!this.#screenFlash) return;

        if (this.#flashTimeline) {
            this.#flashTimeline.kill();
        }

        this.#flashTimeline = gsap.timeline({ delay });

        this.#flashTimeline.call(() => {
            if (this.#screenFlash) {
                this.#screenFlash.visible = true;
                this.#screenFlash.alpha = 0;
                playFlashSound(this.#scene.soundService);
            }
        });

        this.#flashTimeline.to(this.#screenFlash, {
            alpha: 0.8,
            duration: 0.1,
            ease: 'power2.out',
        });

        this.#flashTimeline.to(this.#screenFlash, {
            alpha: 0,
            duration: 0.2,
            ease: 'power2.in',
            onComplete: () => {
                if (this.#screenFlash) {
                    this.#screenFlash.visible = false;
                }
            },
        });
    }

    #playVictoryAnimation(winner: 'player' | 'opponent' | 'tie'): void {
        if (!this.#playerCard || !this.#opponentCard || !this.#scale) return;

        if (this.#victoryTimeline) {
            this.#victoryTimeline.kill();
        }

        const centerX = this.#scene.app.renderer.width / 2;
        const offsetX = 200 * this.#scale;

        this.#victoryTimeline = gsap.timeline({ delay: 0.3 });

        if (winner === 'player') {
            this.#victoryTimeline.to(
                this.#playerCard,
                {
                    scale: 1.2 * this.#scale,
                    x: centerX,
                    alpha: 1,
                    duration: 0.5,
                    ease: 'back.out(1.7)',
                },
                0,
            );

            this.#victoryTimeline.to(
                this.#opponentCard,
                {
                    scale: 0.4 * this.#scale,
                    alpha: 0.5,
                    x: this.#scene.app.renderer.width - offsetX,
                    duration: 0.5,
                    ease: 'power2.in',
                },
                0,
            );

            this.#opponentCard.tint = 0xcccccc;
        } else if (winner === 'opponent') {
            this.#victoryTimeline.to(
                this.#opponentCard,
                {
                    scale: 1.2 * this.#scale,
                    x: centerX,
                    alpha: 1,
                    duration: 0.5,
                    ease: 'back.out(1.7)',
                },
                0,
            );

            this.#victoryTimeline.to(
                this.#playerCard,
                {
                    scale: 0.4 * this.#scale,
                    alpha: 0.5,
                    x: offsetX,
                    duration: 0.5,
                    ease: 'power2.in',
                },
                0,
            );

            this.#playerCard.tint = 0xcccccc;
        }
    }

    show(roundResultData: RoundResultData): void {
        this.reset();
        this.display();

        if (!isRoundResultData(roundResultData)) return;

        if (!this.#playerCard || !this.#opponentCard || !this.#screenFlash) return;

        this.#playShakeAnimation(this.#playerCard, 1.5);
        this.#playShakeAnimation(this.#opponentCard, 1.5);

        this.#playFlashAnimation(1.5);

        if (!this.#timeouts) {
            this.#timeouts = [];
        }

        const timeout1 = setTimeout(() => {
            if (!this.#playerCard || !this.#opponentCard) return;

            this.#playerCard.texture = PIXI.Texture.from(roundResultData.playerMove);
            this.#opponentCard.texture = PIXI.Texture.from(roundResultData.opponentMove);

            if (!this.#scale) return;

            this.#playerCard.scale.set(0.8 * this.#scale);
            this.#opponentCard.scale.set(0.8 * this.#scale);

            this.#playVictoryAnimation(roundResultData.roundWinner);
        }, 1500);
        this.#timeouts.push(timeout1);

        const timeout2 = setTimeout(() => {
            this.#scene.getEventEmitter().emit('ANIMATION_COMPLETED', roundResultData);
            this.reset();
        }, 5000);
        this.#timeouts.push(timeout2);
    }

    destroy(): void {
        this.#cleanupAllAnimations();

        if (this.#timeouts) {
            this.#timeouts.forEach((timeout) => clearTimeout(timeout));
            this.#timeouts = undefined;
        }

        this.reset();
    }
}
