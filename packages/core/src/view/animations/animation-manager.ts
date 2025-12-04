import type { GameAnimation } from './types.js';

export class AnimationManager {
    #currentAnimation: GameAnimation | null = null;
    #allAnimations: Set<GameAnimation> = new Set();

    registerAnimation(animation: GameAnimation): void {
        this.#allAnimations.add(animation);
    }

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

    destroy(): void {
        this.reset();
        
        for (const animation of this.#allAnimations) {
            if (animation.destroy) {
                animation.destroy();
            }
        }
        this.#allAnimations.clear();
    }
}