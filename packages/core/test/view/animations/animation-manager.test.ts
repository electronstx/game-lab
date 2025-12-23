import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AnimationManager } from '../../../src/view/animations/animation-manager.js';
import type { GameAnimation } from '../../../src/view/animations/types.js';

describe('AnimationManager', () => {
    let animationManager: AnimationManager;
    let mockAnimation1: GameAnimation;
    let mockAnimation2: GameAnimation;

    beforeEach(() => {
        animationManager = new AnimationManager();

        mockAnimation1 = {
            create: vi.fn(),
            reset: vi.fn(),
            show: vi.fn(),
            destroy: vi.fn(),
        };

        mockAnimation2 = {
            create: vi.fn(),
            reset: vi.fn(),
            show: vi.fn(),
        };
    });

    describe('registerAnimation', () => {
        it('should register an animation', () => {
            animationManager.registerAnimation(mockAnimation1);
            animationManager.show(mockAnimation1);
            expect(mockAnimation1.show).toHaveBeenCalled();
        });

        it('should allow registering multiple animations', () => {
            animationManager.registerAnimation(mockAnimation1);
            animationManager.registerAnimation(mockAnimation2);

            animationManager.show(mockAnimation1);
            expect(mockAnimation1.show).toHaveBeenCalled();

            animationManager.show(mockAnimation2);
            expect(mockAnimation2.show).toHaveBeenCalled();
        });
    });

    describe('show', () => {
        it('should show an animation', () => {
            animationManager.show(mockAnimation1, 'arg1', 'arg2');
            expect(mockAnimation1.show).toHaveBeenCalledWith('arg1', 'arg2');
        });

        it('should set the animation as current', () => {
            animationManager.show(mockAnimation1);
            animationManager.show(mockAnimation2);

            expect(mockAnimation1.reset).toHaveBeenCalled();
        });

        it('should reset previous animation when showing new one', () => {
            animationManager.show(mockAnimation1);
            expect(mockAnimation1.reset).not.toHaveBeenCalled();

            animationManager.show(mockAnimation2);
            expect(mockAnimation1.reset).toHaveBeenCalled();
            expect(mockAnimation2.show).toHaveBeenCalled();
        });

        it('should handle showing animation with no previous animation', () => {
            animationManager.show(mockAnimation1);
            expect(mockAnimation1.show).toHaveBeenCalled();
            expect(mockAnimation1.reset).not.toHaveBeenCalled();
        });

        it('should pass multiple arguments to show method', () => {
            animationManager.show(mockAnimation1, 'arg1', 123, { data: 'test' });
            expect(mockAnimation1.show).toHaveBeenCalledWith('arg1', 123, { data: 'test' });
        });
    });

    describe('reset', () => {
        it('should reset current animation', () => {
            animationManager.show(mockAnimation1);
            animationManager.reset();

            expect(mockAnimation1.reset).toHaveBeenCalled();
        });

        it('should clear current animation after reset', () => {
            animationManager.show(mockAnimation1);
            animationManager.reset();

            animationManager.show(mockAnimation2);
            expect(mockAnimation1.reset).toHaveBeenCalledTimes(1);
        });

        it('should handle reset when no animation is current', () => {
            expect(() => animationManager.reset()).not.toThrow();
        });

        it('should handle reset after already resetting', () => {
            animationManager.show(mockAnimation1);
            animationManager.reset();
            animationManager.reset();

            expect(mockAnimation1.reset).toHaveBeenCalledTimes(1);
        });
    });

    describe('destroy', () => {
        it('should reset current animation on destroy', () => {
            animationManager.show(mockAnimation1);
            animationManager.destroy();

            expect(mockAnimation1.reset).toHaveBeenCalled();
        });

        it('should destroy all registered animations', () => {
            animationManager.registerAnimation(mockAnimation1);
            animationManager.registerAnimation(mockAnimation2);

            animationManager.destroy();

            expect(mockAnimation1.destroy).toHaveBeenCalled();
            expect(mockAnimation2.destroy).toBeUndefined();
        });

        it('should clear all animations after destroy', () => {
            animationManager.registerAnimation(mockAnimation1);
            animationManager.destroy();

            animationManager.show(mockAnimation2);
            expect(mockAnimation1.reset).not.toHaveBeenCalled();
        });

        it('should handle destroy when no animations are registered', () => {
            expect(() => animationManager.destroy()).not.toThrow();
        });

        it('should handle destroy when animation has no destroy method', () => {
            animationManager.registerAnimation(mockAnimation2);
            expect(() => animationManager.destroy()).not.toThrow();
        });

        it('should handle destroy multiple times', () => {
            animationManager.registerAnimation(mockAnimation1);
            animationManager.destroy();
            animationManager.destroy();

            expect(mockAnimation1.destroy).toHaveBeenCalledTimes(1);
        });
    });

    describe('integration', () => {
        it('should handle complete lifecycle: register, show, reset, destroy', () => {
            animationManager.registerAnimation(mockAnimation1);
            animationManager.show(mockAnimation1, 'test');
            expect(mockAnimation1.show).toHaveBeenCalledWith('test');

            animationManager.reset();
            expect(mockAnimation1.reset).toHaveBeenCalled();

            animationManager.destroy();
            expect(mockAnimation1.destroy).toHaveBeenCalled();
        });

        it('should handle switching between multiple animations', () => {
            animationManager.registerAnimation(mockAnimation1);
            animationManager.registerAnimation(mockAnimation2);

            animationManager.show(mockAnimation1);
            animationManager.show(mockAnimation2);
            expect(mockAnimation1.reset).toHaveBeenCalled();

            animationManager.show(mockAnimation1);
            expect(mockAnimation2.reset).toHaveBeenCalled();
        });
    });
});
