import type { GameAnimation } from './types.js';

export class AnimationManager {
    #currentAnimation: GameAnimation | null = null;

    show<T extends GameAnimation>(animation: T, ...args: Parameters<T['show']>): void {
        if (this.#currentAnimation) {
            this.#currentAnimation.reset();
        }

        this.#currentAnimation = animation;
        this.#currentAnimation.show(...args);
    }

    reset(): void {
        if (this.#currentAnimation) {
            this.#currentAnimation.reset();
            this.#currentAnimation = null;
        }
    }
}
