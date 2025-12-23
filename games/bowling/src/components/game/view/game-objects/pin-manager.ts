import type { GameObject, Scene } from '@game-lab/core';
import * as PIXI from 'pixi.js';
import type { Pin } from '../types.js';

export class PinManager implements GameObject {
    #pins: Pin[] = [];
    #pinSprites: PIXI.Graphics[] = [];
    #container: PIXI.Container;
    #pinRadius: number = 12;
    #width: number = 0;
    #height: number = 0;
    #initialPositions: { x: number; y: number }[] = [];

    constructor(scene: Scene) {
        this.#container = new PIXI.Container();
        scene.addChild(this.#container);
    }

    create(width: number, height: number): void {
        this.#width = width;
        this.#height = height;

        const centerX = 0.5;
        const centerY = 0.5;

        const pinPositions = [
            { x: centerX + 0.2, y: centerY },
            { x: centerX + 0.23, y: centerY - 0.03 },
            { x: centerX + 0.23, y: centerY + 0.03 },
            { x: centerX + 0.26, y: centerY - 0.06 },
            { x: centerX + 0.26, y: centerY },
            { x: centerX + 0.26, y: centerY + 0.06 },
            { x: centerX + 0.29, y: centerY - 0.09 },
            { x: centerX + 0.29, y: centerY - 0.03 },
            { x: centerX + 0.29, y: centerY + 0.03 },
            { x: centerX + 0.29, y: centerY + 0.09 },
        ];

        this.#pins = pinPositions.map((pos, index) => ({
            id: index,
            x: width * pos.x,
            y: height * pos.y,
            knockedDown: false,
            velocityX: 0,
            velocityY: 0,
        }));

        this.#initialPositions = this.#pins.map((pin) => ({ x: pin.x, y: pin.y }));

        this.#pinSprites = this.#pins.map((pin) => {
            const sprite = new PIXI.Graphics();
            sprite.rect(-8, -20, 16, 40);
            sprite.fill({ color: 0xff0000 });
            sprite.position.set(pin.x, pin.y);
            this.#container.addChild(sprite);
            return sprite;
        });

        this.hide();
    }

    update(): void {
        const friction = 0.995;
        const gravity = 0.2;

        this.#pins.forEach((pin, index) => {
            if (pin.knockedDown) {
                pin.x += pin.velocityX;
                pin.y += pin.velocityY;

                pin.velocityX *= friction;
                pin.velocityY *= friction;

                pin.velocityY += gravity;

                const sprite = this.#pinSprites[index];
                if (sprite) {
                    sprite.position.set(pin.x, pin.y);
                }
            }
        });

        this.#checkPinCollisions();
    }

    checkBallCollision(
        ballPosition: { x: number; y: number },
        ballRadius: number,
        ballVelocity: { x: number; y: number },
    ): void {
        this.#pins.forEach((pin, index) => {
            if (pin.knockedDown) return;

            const distance = Math.sqrt(
                (ballPosition.x - pin.x) ** 2 + (ballPosition.y - pin.y) ** 2,
            );

            if (distance < ballRadius + this.#pinRadius) {
                pin.knockedDown = true;
                const sprite = this.#pinSprites[index];
                if (sprite) {
                    sprite.alpha = 0.3;
                    sprite.rotation = Math.random() * Math.PI * 2;
                }

                const angle = Math.atan2(ballPosition.y - pin.y, ballPosition.x - pin.x);

                const ballSpeed = Math.sqrt(ballVelocity.x ** 2 + ballVelocity.y ** 2);
                const impulse = ballSpeed * 1.5;

                const spreadAngle = angle + Math.PI + (Math.random() - 0.5) * 0.2;
                pin.velocityX = Math.cos(spreadAngle) * impulse;
                pin.velocityY = Math.sin(spreadAngle) * impulse;

                pin.x += pin.velocityX;
                pin.y += pin.velocityY;

                if (sprite) {
                    sprite.position.set(pin.x, pin.y);
                }
            }
        });
    }

    #checkPinCollisions(): void {
        for (let i = 0; i < this.#pins.length; i++) {
            const pin1 = this.#pins[i];
            if (!pin1.knockedDown) continue;

            for (let j = i + 1; j < this.#pins.length; j++) {
                const pin2 = this.#pins[j];

                const distance = Math.sqrt((pin1.x - pin2.x) ** 2 + (pin1.y - pin2.y) ** 2);

                if (distance < this.#pinRadius * 2) {
                    const angle = Math.atan2(pin2.y - pin1.y, pin2.x - pin1.x);
                    const overlap = this.#pinRadius * 2 - distance;

                    const separationX = Math.cos(angle) * overlap * 0.5;
                    const separationY = Math.sin(angle) * overlap * 0.5;
                    pin1.x -= separationX;
                    pin1.y -= separationY;
                    pin2.x += separationX;
                    pin2.y += separationY;

                    if (pin2.knockedDown) {
                        const relativeVelocityX = pin2.velocityX - pin1.velocityX;
                        const relativeVelocityY = pin2.velocityY - pin1.velocityY;
                        const velocityAlongNormal =
                            relativeVelocityX * Math.cos(angle) +
                            relativeVelocityY * Math.sin(angle);

                        if (velocityAlongNormal > 0) {
                            const impulse = velocityAlongNormal * 0.8;
                            pin1.velocityX += Math.cos(angle) * impulse;
                            pin1.velocityY += Math.sin(angle) * impulse;
                            pin2.velocityX -= Math.cos(angle) * impulse;
                            pin2.velocityY -= Math.sin(angle) * impulse;
                        }
                    } else {
                        const pin1Speed = Math.sqrt(pin1.velocityX ** 2 + pin1.velocityY ** 2);
                        if (pin1Speed > 0.3) {
                            pin2.knockedDown = true;
                            const sprite2 = this.#pinSprites[j];
                            if (sprite2) {
                                sprite2.alpha = 0.3;
                                sprite2.rotation = Math.random() * Math.PI * 2;
                            }

                            pin2.velocityX = Math.cos(angle + Math.PI) * pin1Speed * 0.8;
                            pin2.velocityY = Math.sin(angle + Math.PI) * pin1Speed * 0.8;

                            pin1.velocityX += Math.cos(angle) * pin1Speed * 0.2;
                            pin1.velocityY += Math.sin(angle) * pin1Speed * 0.2;
                        }
                    }
                }
            }
        }
    }

    reset(): void {
        this.#pins.forEach((pin, index) => {
            const initialPos = this.#initialPositions[index];

            if (initialPos) {
                pin.x = initialPos.x;
                pin.y = initialPos.y;
            }

            pin.knockedDown = false;
            pin.velocityX = 0;
            pin.velocityY = 0;

            const sprite = this.#pinSprites[index];

            if (sprite) {
                sprite.alpha = 1;
                sprite.rotation = 0;
                sprite.position.set(pin.x, pin.y);
            }
        });
    }

    resetStandingPins(): void {
        this.#pins.forEach((pin, index) => {
            if (!pin.knockedDown) {
                const initialPos = this.#initialPositions[index];

                if (initialPos) {
                    pin.x = initialPos.x;
                    pin.y = initialPos.y;
                }

                pin.velocityX = 0;
                pin.velocityY = 0;

                const sprite = this.#pinSprites[index];
                if (sprite) {
                    sprite.position.set(pin.x, pin.y);
                }
            }
        });
    }

    getKnockedDownCount(): number {
        return this.#pins.filter((p) => p.knockedDown).length;
    }

    getPinRadius(): number {
        return this.#pinRadius;
    }

    show(): void {
        this.#container.visible = true;
    }

    hide(): void {
        this.#container.visible = false;
    }

    destroy(): void {
        this.#container.destroy();
    }
}
