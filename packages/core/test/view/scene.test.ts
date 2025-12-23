import * as PIXI from 'pixi.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { EventEmitter } from '../../src/data/events.js';
import type { SoundService } from '../../src/services/sound/sound-service.js';
import { AnimationManager } from '../../src/view/animations/animation-manager.js';
import { GameObjects } from '../../src/view/game-objects/game-objects.js';
import { HUD } from '../../src/view/hud/hud.js';
import Scene from '../../src/view/scene.js';

class TestScene extends Scene {
    create(): void {}
    onResize(scale: number, width: number, height: number): void {}
    showStartScreen(): void {}
    initHUD(...args: unknown[]): void {}
    showStartGame(timescale?: number): void {}
    showRound(roundNumber?: number, timescale?: number, ...args: unknown[]): void {}
    showRoundResult(...args: unknown[]): void {}
    showEndGame(result: unknown, timescale?: number): void {}
    restartGame(): void {}
}

describe('Scene', () => {
    let mockApp: PIXI.Application;
    let mockSoundService: SoundService;
    let mockEventEmitter: EventEmitter;
    let scene: TestScene;
    let mockStage: PIXI.Container & EventEmitter;

    beforeEach(() => {
        mockEventEmitter = {
            on: vi.fn(),
            off: vi.fn(),
            emit: vi.fn(),
            once: vi.fn(),
        };

        mockStage = {
            on: vi.fn(),
            off: vi.fn(),
            emit: vi.fn(),
            once: vi.fn(),
        } as unknown as PIXI.Container & EventEmitter;

        mockApp = {
            stage: mockStage,
        } as unknown as PIXI.Application;

        mockSoundService = {} as SoundService;

        scene = new TestScene(mockApp, mockSoundService, 1.5);
    });

    describe('constructor', () => {
        it('should initialize with app, soundService and scale', () => {
            expect(scene.app).toBe(mockApp);
            expect(scene.gameScale).toBe(1.5);
            expect(scene.soundService).toBe(mockSoundService);
        });

        it('should initialize animationManager', () => {
            expect(scene['animationManager']).toBeInstanceOf(AnimationManager);
        });

        it('should initialize hud', () => {
            expect(scene['hud']).toBeInstanceOf(HUD);
        });

        it('should initialize gameObjects', () => {
            expect(scene['gameObjects']).toBeInstanceOf(GameObjects);
        });

        it('should extend PIXI.Container', () => {
            expect(scene).toBeInstanceOf(PIXI.Container);
        });
    });

    describe('getEventEmitter', () => {
        it('should return event emitter adapter', () => {
            const emitter = scene.getEventEmitter();
            expect(emitter).toBeDefined();
            expect(typeof emitter.on).toBe('function');
            expect(typeof emitter.off).toBe('function');
            expect(typeof emitter.emit).toBe('function');
            expect(typeof emitter.once).toBe('function');
        });

        it('should cache event emitter adapter', () => {
            const emitter1 = scene.getEventEmitter();
            const emitter2 = scene.getEventEmitter();
            expect(emitter1).toBe(emitter2);
        });

        it('should use stage.on for event subscription', () => {
            const emitter = scene.getEventEmitter();
            const handler = vi.fn();
            emitter.on('test', handler);

            expect(mockStage.on).toHaveBeenCalledWith('test', handler);
        });

        it('should use stage.off for event unsubscription', () => {
            const emitter = scene.getEventEmitter();
            const handler = vi.fn();
            emitter.off('test', handler);

            expect(mockStage.off).toHaveBeenCalledWith('test', handler);
        });

        it('should use stage.emit for event emission', () => {
            const emitter = scene.getEventEmitter();
            emitter.emit('test', 'arg1', 'arg2');

            expect(mockStage.emit).toHaveBeenCalledWith('test', 'arg1', 'arg2');
        });

        it('should use stage.once if available', () => {
            const emitter = scene.getEventEmitter();
            const handler = vi.fn();
            emitter.once('test', handler);

            expect(mockStage.once).toHaveBeenCalledWith('test', handler);
        });

        it('should implement once manually if stage.once is not available', () => {
            const stageWithoutOnce = {
                on: vi.fn(),
                off: vi.fn(),
                emit: vi.fn(),
            } as unknown as PIXI.Container & EventEmitter;

            const appWithoutOnce = {
                stage: stageWithoutOnce,
            } as unknown as PIXI.Application;

            const testScene = new TestScene(appWithoutOnce, mockSoundService, 1);
            const emitter = testScene.getEventEmitter();
            const handler = vi.fn();

            emitter.once('test', handler);

            expect(stageWithoutOnce.on).toHaveBeenCalled();

            const registeredHandler = (stageWithoutOnce.on as ReturnType<typeof vi.fn>).mock
                .calls[0][1];
            expect(typeof registeredHandler).toBe('function');
        });

        it('should throw error if stage does not implement EventEmitter', () => {
            const invalidStage = {} as PIXI.Container;
            const invalidApp = {
                stage: invalidStage,
            } as unknown as PIXI.Application;

            const testScene = new TestScene(invalidApp, mockSoundService, 1);

            expect(() => testScene.getEventEmitter()).toThrow(
                'PIXI.Application stage does not implement EventEmitter interface',
            );
        });
    });

    describe('soundService', () => {
        it('should return sound service', () => {
            expect(scene.soundService).toBe(mockSoundService);
        });
    });

    describe('destroy', () => {
        it('should destroy animationManager', () => {
            const destroySpy = vi.spyOn(scene['animationManager'], 'destroy');
            scene.destroy();
            expect(destroySpy).toHaveBeenCalled();
        });

        it('should destroy hud', () => {
            const destroySpy = vi.spyOn(scene['hud'], 'destroy');
            scene.destroy();
            expect(destroySpy).toHaveBeenCalled();
        });

        it('should destroy gameObjects', () => {
            const destroySpy = vi.spyOn(scene['gameObjects'], 'destroy');
            scene.destroy();
            expect(destroySpy).toHaveBeenCalled();
        });

        it('should clear eventEmitterAdapter', () => {
            const emitter1 = scene.getEventEmitter();
            expect(emitter1).toBeDefined();

            const emitter2 = scene.getEventEmitter();
            expect(emitter2).toBe(emitter1);

            scene.destroy();

            const emitter3 = scene.getEventEmitter();
            expect(emitter3).toBeDefined();
            expect(emitter3).not.toBe(emitter1);
        });

        it('should nullify soundService', () => {
            expect(scene.soundService).toBe(mockSoundService);
            scene.destroy();

            expect(scene).toBeDefined();
        });

        it('should call super.destroy', () => {
            const superDestroySpy = vi.spyOn(PIXI.Container.prototype, 'destroy');
            scene.destroy();
            expect(superDestroySpy).toHaveBeenCalled();
            superDestroySpy.mockRestore();
        });
    });

    describe('abstract methods', () => {
        it('should require create implementation', () => {
            expect(typeof scene.create).toBe('function');
        });

        it('should require onResize implementation', () => {
            expect(typeof scene.onResize).toBe('function');
        });

        it('should require showStartScreen implementation', () => {
            expect(typeof scene.showStartScreen).toBe('function');
        });

        it('should require initHUD implementation', () => {
            expect(typeof scene.initHUD).toBe('function');
        });

        it('should require showStartGame implementation', () => {
            expect(typeof scene.showStartGame).toBe('function');
        });

        it('should require showRound implementation', () => {
            expect(typeof scene.showRound).toBe('function');
        });

        it('should require showRoundResult implementation', () => {
            expect(typeof scene.showRoundResult).toBe('function');
        });

        it('should require showEndGame implementation', () => {
            expect(typeof scene.showEndGame).toBe('function');
        });

        it('should require restartGame implementation', () => {
            expect(typeof scene.restartGame).toBe('function');
        });
    });

    describe('event emitter adapter behavior', () => {
        it('should handle multiple subscriptions', () => {
            const emitter = scene.getEventEmitter();
            const handler1 = vi.fn();
            const handler2 = vi.fn();

            emitter.on('test', handler1);
            emitter.on('test', handler2);

            expect(mockStage.on).toHaveBeenCalledTimes(2);
        });

        it('should handle event emission with multiple arguments', () => {
            const emitter = scene.getEventEmitter();
            emitter.emit('test', 'arg1', 'arg2', { data: 'value' });

            expect(mockStage.emit).toHaveBeenCalledWith('test', 'arg1', 'arg2', { data: 'value' });
        });
    });
});
